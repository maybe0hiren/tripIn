import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { ref, onValue } from "firebase/database";
import { database } from "./firebase";

const containerStyle = {
  width: "100vw", 
  height: "100vh",
};

const GROUP_CODE = "ABCDEF";

const MapPage = () => {
  const [locations, setLocations] = useState({});
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDij-2LFH3j67AEXazVp3gK_RqydtWCp-A",
  });

  useEffect(() => {
    const groupRef = ref(database, `groups/${GROUP_CODE}`);
    const unsubscribe = onValue(groupRef, (snapshot) => {
      const data = snapshot.val() || {};
      setLocations(data);
    });
    return () => unsubscribe();
  }, []);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <GoogleMap 
      mapContainerStyle={containerStyle} 
      center={{ lat: 19.076, lng: 72.8777 }} // Mumbai
      zoom={10}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
      }}
    >
      {/* Single test marker - should definitely be visible */}
      <Marker 
        position={{ lat: 19.076, lng: 72.8777 }}
        title="Test Marker - Mumbai"
      />
      
      {/* Dummy markers with explicit positioning */}
      <Marker position={{ lat: 18.5204, lng: 73.8567 }} title="Pune" />
      <Marker position={{ lat: 19.076, lng: 72.8777 }} title="Mumbai" />
      <Marker position={{ lat: 28.7041, lng: 77.1025 }} title="Delhi" />

      {/* Firebase markers */}
      {Object.entries(locations).map(([userId, userData]) => (
        <Marker
          key={userId}
          position={{ lat: userData.lat, lng: userData.lng }}
          title={`User: ${userId}`}
        />
      ))}
    </GoogleMap>
  );
};

export default MapPage;
