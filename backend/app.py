# backend/app.py
from flask import Flask, request, jsonify
from datetime import datetime
import sqlite3
import math
import uuid
import os

app = Flask(__name__)

# store DB next to this file (safer than relative cwd)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, "gems.db")


# --- Database helpers ---
def get_db():
    """Return a new sqlite3 connection with Row factory."""
    conn = sqlite3.connect(DATABASE, detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create the table if it doesn't exist."""
    conn = get_db()
    with conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS hidden_gems (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                uploadedBy TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                status TEXT NOT NULL
            )
            """
        )
    conn.close()


# --- Utility functions ---
def haversine(lat1, lon1, lat2, lon2):
    """Return distance in meters between two lat/lon points (Haversine)."""
    R = 6371000  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def find_duplicate(name: str, lat: float, lon: float, max_distance_m: float = 100.0):
    """
    Look for an existing gem with the same/similar name or within max_distance_m.
    Returns the existing gem name if a duplicate is found, otherwise None.
    """
    conn = get_db()
    try:
        cur = conn.execute("SELECT latitude, longitude, name FROM hidden_gems")
        for row in cur.fetchall():
            try:
                existing_lat = float(row["latitude"])
                existing_lon = float(row["longitude"])
            except (TypeError, ValueError):
                # skip malformed rows
                continue

            # location-based duplicate
            if haversine(lat, lon, existing_lat, existing_lon) <= max_distance_m:
                return row["name"]

            # name-based duplicate (case-insensitive, substring check both ways)
            existing_name = row["name"] or ""
            if existing_name and name:
                if existing_name.lower() in name.lower() or name.lower() in existing_name.lower():
                    return existing_name
    finally:
        conn.close()

    return None


# --- Routes ---
@app.route("/gems", methods=["POST", "GET"])
def manage_gems():
    if request.method == "POST":
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "Invalid or missing JSON body"}), 400

        # Accept both snake_case and camelCase for client convenience
        name = data.get("name")
        description = data.get("description")
        latitude_raw = data.get("latitude", data.get("lat"))
        longitude_raw = data.get("longitude", data.get("lon"))
        uploaded_by = data.get("uploaded_by", data.get("uploadedBy", "anonymous"))

        # required fields
        if not all([name, description, latitude_raw, longitude_raw]):
            return jsonify({"error": "Missing required fields: name, description, latitude, longitude"}), 400

        # convert lat/lon to floats
        try:
            latitude = float(latitude_raw)
            longitude = float(longitude_raw)
        except (TypeError, ValueError):
            return jsonify({"error": "latitude and longitude must be numeric"}), 400

        # duplicate check
        duplicate = find_duplicate(name, latitude, longitude)
        if duplicate:
            return jsonify({"error": f"This location/name is too similar to an existing gem: '{duplicate}'"}), 409

        gem_id = str(uuid.uuid4())
        # use UTC ISO format with 'Z' suffix
        timestamp = datetime.utcnow().isoformat() + "Z"
        status = "pending"

        try:
            conn = get_db()
            with conn:
                conn.execute(
                    """
                    INSERT INTO hidden_gems (id, name, description, latitude, longitude, uploadedBy, timestamp, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (gem_id, name, description, latitude, longitude, uploaded_by, timestamp, status),
                )
            return jsonify({"message": "Hidden gem submitted successfully", "gem_id": gem_id}), 201
        except sqlite3.Error as e:
            return jsonify({"error": f"Database error: {str(e)}"}), 500
        finally:
            try:
                conn.close()
            except Exception:
                pass

    # GET -> return all gems
    conn = get_db()
    try:
        cur = conn.execute(
            "SELECT id, name, description, latitude, longitude, uploadedBy, timestamp, status FROM hidden_gems"
        )
        gems_list = []
        for row in cur.fetchall():
            gems_list.append(
                {
                    "id": row["id"],
                    "name": row["name"],
                    "description": row["description"],
                    "latitude": float(row["latitude"]) if row["latitude"] is not None else None,
                    "longitude": float(row["longitude"]) if row["longitude"] is not None else None,
                    "uploaded_by": row["uploadedBy"],  # returned in snake_case for API
                    "timestamp": row["timestamp"],
                    "status": row["status"],
                }
            )
        return jsonify(gems_list), 200
    except sqlite3.Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        conn.close()


# --- Run ---
if __name__ == "__main__":
    init_db()
    # debug=True is OK for local development; remove in production
    app.run(debug=True, host="0.0.0.0", port=5000)
