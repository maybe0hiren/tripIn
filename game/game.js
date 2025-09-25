// Import the 'fs' (File System) and 'path' modules, which are built into Node.js.
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// --- Configuration and State ---
// In a real application, the API key would be loaded securely from environment variables.
const API_KEY = typeof __api_key !== 'undefined' ? __api_key : 'AIzaSyD2B_0e9Y9FDBibYZZxLmi22qb6v0OBpDE';
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=" + API_KEY;
const CSV_FILENAME = 'kerala_tourist_spots.csv';

let locations = [];
let currentLocation = null;
let visitedLocations = new Set();
let userPoints = 0;


// --- Core Utility Functions ---

/**
 * Calculates the distance between two geographical points using the Haversine formula.
 * @param {number} lat1 Latitude of the first point.
 * @param {number} lon1 Longitude of the first point.
 * @param {number} lat2 Latitude of the second point.
 * @param {number} lon2 Longitude of the second point.
 * @returns {number} The distance in meters.
 */
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radius of Earth in meters
    const phi_1 = lat1 * Math.PI / 180;
    const phi_2 = lat2 * Math.PI / 180;
    const delta_phi = (lat2 - lat1) * Math.PI / 180;
    const delta_lambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(delta_phi / 2)**2 + Math.cos(phi_1) * Math.cos(phi_2) * Math.sin(delta_lambda / 2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
}

/**
 * Loads and parses location data from the CSV file.
 * @param {string} filename The path to the CSV file.
 * @returns {Array<Object>} An array of location objects.
 */
function loadLocations(filename) {
    try {
        console.log('Reading location data from local CSV file...');
        const filePath = path.join(__dirname, filename);
        const text = fs.readFileSync(filePath, 'utf-8');
        
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(header => header.trim());
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '') continue;
            const values = line.split(',');
            const obj = {};
            
            for (let j = 0; j < headers.length; j++) {
                const header = headers[j];
                const value = values[j].trim();
                
                if (['lat', 'lon', 'radius_m', 'points'].includes(header)) {
                    obj[header] = parseFloat(value);
                } else if (header === 'id') {
                    obj[header] = parseInt(value, 10);
                } else {
                    obj[header] = value;
                }
            }
            data.push(obj);
        }
        console.log(`Successfully loaded ${data.length} locations from ${filename}.`);
        return data;
    } catch (error) {
        console.error('Error loading or parsing CSV:', error.message);
        return [];
    }
}

/**
 * Calls the Gemini API to get a custom message for the location.
 * @param {string} locationName The name of the location to prompt the model with.
 * @returns {Promise<string>} A promise that resolves to the generated message.
 */
async function getGeminiMessage(locationName) {
    const systemPrompt = "You are a friendly and simple travel guide. Write a very short, fun message that's easy to understand.";
    const userQuery = `Write a simple, friendly message about visiting the location named "${locationName}".`;

    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
    };
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }

        const result = await response.json();
        const generatedMessage = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (generatedMessage) {
            return generatedMessage;
        } else {
            throw new Error("Invalid API response format or no text generated.");
        }
    } catch (error) {
        console.error('Error generating message:', error.message);
        // Fallback message
        return "A new adventure awaits! Get ready to explore this amazing spot.";
    }
}


// --- Game Logic Functions ---

/**
 * Recommends a new, unvisited location to the user.
 */
async function recommendNewLocation() {
    const unvisitedLocations = locations.filter(loc => !visitedLocations.has(loc.id));
    
    if (unvisitedLocations.length === 0) {
        console.log("CONGRATULATIONS! You've visited all the places! Game over.");
        return null;
    }

    const randomIndex = Math.floor(Math.random() * unvisitedLocations.length);
    currentLocation = unvisitedLocations[randomIndex];

    const message = await getGeminiMessage(currentLocation.name);
    
    console.log(message);
    
    return currentLocation;
}

/**
 * Checks if the user's coordinates are within the radius of the current location.
 * @param {number} userLat The user's current latitude.
 * @param {number} userLon The user's current longitude.
 */
async function checkIn(userLat, userLon) {
    if (!currentLocation) {
        console.error('\nError: No location has been recommended yet to check into. Please start the app again to get a new recommendation.');
        return;
    }

    const distance = haversine(userLat, userLon, currentLocation.lat, currentLocation.lon);
    
    if (distance <= currentLocation.radius_m) {
        const pointsAwarded = currentLocation.points;
        userPoints += pointsAwarded;
        visitedLocations.add(currentLocation.id);
        console.log(`\nSuccess! You earned ${pointsAwarded} points for visiting ${currentLocation.name}.`);
    } else {
        console.log(`\nToo far. You are ${distance.toFixed(2)} meters away from ${currentLocation.name}. Try again!`);
    }
}

// --- Main Execution Block (Interactive Mode) ---

/**
 * The main game loop that handles location recommendations and check-ins.
 */
async function mainLoop() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    locations = loadLocations(CSV_FILENAME);
    
    if (!locations || locations.length === 0) {
        rl.close();
        return;
    }
        
    await recommendNewLocation();
    
    while (true) {
        console.log('\n==========================================');
        console.log(`Current Total Points: ${userPoints}`);
        
        // This promise handles the interactive user input
        const coords = await new Promise(resolve => {
            rl.question('Enter your latitude (or "exit" to quit): ', (lat) => {
                if (lat.toLowerCase() === 'exit') {
                    rl.close();
                    process.exit();
                }
                rl.question('Enter your longitude: ', (lon) => {
                    resolve({ lat, lon });
                });
            });
        });

        const userLat = parseFloat(coords.lat);
        const userLon = parseFloat(coords.lon);

        if (isNaN(userLat) || isNaN(userLon)) {
            console.error('\nInvalid coordinates. Please enter numbers.');
            continue;
        }

        await checkIn(userLat, userLon);

        // Check if the location was successfully checked in
        const isSuccessfulCheckIn = visitedLocations.has(currentLocation.id);
        if (isSuccessfulCheckIn) {
            await recommendNewLocation();
        }
    }
}

// Execute the main initialization function
mainLoop();

// --- START HIDDEN MAIN APP INTEGRATION BLOCK ---
/**
 * @section Special Code Block for Main App Integration
 * This function is intended to be used by a separate, main application to access the user's real-time
 * location without any console output, directly linking it to the check-in logic.
 * In a web browser environment, this would use the Geolocation API.
 * This function should remain untouched for future integration into your frontend.
 */
async function accessUserLocation() {
    return new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    resolve({ lat, lon });
                },
                (error) => {
                    reject(error);
                }
            );
        } else {
            reject(new Error("Geolocation is not supported by your browser."));
        }
    });
}
// --- END HIDDEN MAIN APP INTEGRATION BLOCK ---
