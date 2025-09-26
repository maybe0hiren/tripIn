// Game Configuration and State
const API_KEY = 'AIzaSyD2B_0e9Y9FDBibYZZxLmi22qb6v0OBpDE';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

// Embedded location data
const locations = [
    {id: 1, name: "Munnar Hills", lat: 10.0892, lon: 77.0595, radius_m: 1000, points: 50},
    {id: 2, name: "Alleppey Backwaters", lat: 9.4981, lon: 76.3388, radius_m: 1200, points: 40},
    {id: 3, name: "Fort Kochi", lat: 9.9669, lon: 76.2406, radius_m: 800, points: 30},
    {id: 4, name: "Wayanad Wildlife Sanctuary", lat: 11.6054, lon: 76.1320, radius_m: 1500, points: 60},
    {id: 5, name: "Kovalam Beach", lat: 8.4004, lon: 76.9787, radius_m: 500, points: 25},
    {id: 6, name: "Thekkady", lat: 9.5939, lon: 77.1025, radius_m: 1000, points: 45}
];

// Game state
let currentLocation = null;
let visitedLocations = new Set();
let userPoints = 0;
let userLocation = null;

// DOM Elements
let pointsValueEl, locationTitleEl, locationPointsEl, aiMessageEl, locationCoordsEl;
let locationRadiusEl, getLocationBtn, checkInBtn, latInputEl, lonInputEl;
let currentLocationDisplayEl, currentCoordsEl, notificationEl, notificationMessageEl;
let gameCompleteEl, finalScoreEl, restartBtn, visitedCountEl, totalCountEl, progressFillEl;
let loadingScreenEl, locationCardEl, controlsSectionEl, progressSectionEl;

// Initialize DOM elements after page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeDOM();
    initializeGame();
});

function initializeDOM() {
    pointsValueEl = document.getElementById('pointsValue');
    locationTitleEl = document.getElementById('locationTitle');
    locationPointsEl = document.getElementById('locationPoints');
    aiMessageEl = document.getElementById('aiMessage');
    locationCoordsEl = document.getElementById('locationCoords');
    locationRadiusEl = document.getElementById('locationRadius');
    getLocationBtn = document.getElementById('getLocationBtn');
    checkInBtn = document.getElementById('checkInBtn');
    latInputEl = document.getElementById('latInput');
    lonInputEl = document.getElementById('lonInput');
    currentLocationDisplayEl = document.getElementById('currentLocationDisplay');
    currentCoordsEl = document.getElementById('currentCoords');
    notificationEl = document.getElementById('notification');
    notificationMessageEl = document.getElementById('notificationMessage');
    gameCompleteEl = document.getElementById('gameComplete');
    finalScoreEl = document.getElementById('finalScore');
    restartBtn = document.getElementById('restartBtn');
    visitedCountEl = document.getElementById('visitedCount');
    totalCountEl = document.getElementById('totalCount');
    progressFillEl = document.getElementById('progressFill');
    loadingScreenEl = document.getElementById('loadingScreen');
    locationCardEl = document.getElementById('locationCard');
    controlsSectionEl = document.getElementById('controlsSection');
    progressSectionEl = document.getElementById('progressSection');

    // Set total count
    totalCountEl.textContent = locations.length;

    // Event listeners
    getLocationBtn.addEventListener('click', getUserLocation);
    checkInBtn.addEventListener('click', checkIn);
    restartBtn.addEventListener('click', restartGame);
    
    // Input listeners for manual coordinates
    latInputEl.addEventListener('input', updateCheckInButton);
    lonInputEl.addEventListener('input', updateCheckInButton);
}

/**
 * Calculates the distance between two geographical points using the Haversine formula.
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
 * Calls the Gemini API to get a custom message for the location.
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
        return "A new adventure awaits! Get ready to explore this amazing spot and discover the beauty of Kerala! 🌟";
    }
}

/**
 * Recommends a new, unvisited location to the user.
 */
async function recommendNewLocation() {
    const unvisitedLocations = locations.filter(loc => !visitedLocations.has(loc.id));
    
    if (unvisitedLocations.length === 0) {
        showGameComplete();
        return null;
    }

    // Show loading screen
    showLoadingScreen();

    const randomIndex = Math.floor(Math.random() * unvisitedLocations.length);
    currentLocation = unvisitedLocations[randomIndex];

    // Get AI message
    const message = await getGeminiMessage(currentLocation.name);
    
    // Update UI
    updateLocationCard(currentLocation, message);
    hideLoadingScreen();
    
    return currentLocation;
}

function showLoadingScreen() {
    loadingScreenEl.style.display = 'flex';
    locationCardEl.style.display = 'none';
    controlsSectionEl.style.display = 'none';
}

function hideLoadingScreen() {
    loadingScreenEl.style.display = 'none';
    locationCardEl.style.display = 'block';
    controlsSectionEl.style.display = 'block';
    progressSectionEl.style.display = 'block';
}

function updateLocationCard(location, message) {
    locationTitleEl.textContent = location.name;
    locationPointsEl.textContent = location.points;
    aiMessageEl.textContent = message;
    locationCoordsEl.textContent = `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`;
    locationRadiusEl.textContent = `${location.radius_m}m`;
}

/**
 * Get user's current location using Geolocation API
 */
function getUserLocation() {
    if (!navigator.geolocation) {
        showNotification('Geolocation is not supported by your browser. Please enter coordinates manually.', 'error');
        return;
    }

    getLocationBtn.disabled = true;
    getLocationBtn.textContent = '📍 Getting Location...';

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            userLocation = { lat, lon };
            
            // Update UI
            currentCoordsEl.textContent = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
            currentLocationDisplayEl.style.display = 'block';
            
            // Clear manual inputs
            latInputEl.value = '';
            lonInputEl.value = '';
            
            // Enable check-in
            checkInBtn.disabled = false;
            
            getLocationBtn.disabled = false;
            getLocationBtn.textContent = '📱 Get My Location';
            
            showNotification('Location obtained successfully!', 'success');
        },
        (error) => {
            getLocationBtn.disabled = false;
            getLocationBtn.textContent = '📱 Get My Location';
            
            let errorMessage = 'Unable to get your location. ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += 'Please allow location access and try again.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Location information is unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMessage += 'Location request timed out.';
                    break;
                default:
                    errorMessage += 'An unknown error occurred.';
                    break;
            }
            
            showNotification(errorMessage + ' Please enter coordinates manually.', 'error');
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }
    );
}

/**
 * Update check-in button state based on available location data
 */
function updateCheckInButton() {
    const hasManualCoords = latInputEl.value.trim() !== '' && lonInputEl.value.trim() !== '';
    const hasGeoLocation = userLocation !== null;
    
    checkInBtn.disabled = !hasManualCoords && !hasGeoLocation;
}

/**
 * Check if user is at the current location
 */
async function checkIn() {
    if (!currentLocation) {
        showNotification('No location available to check in to.', 'error');
        return;
    }

    let lat, lon;

    // Use manual input if available, otherwise use geolocation
    if (latInputEl.value.trim() !== '' && lonInputEl.value.trim() !== '') {
        lat = parseFloat(latInputEl.value);
        lon = parseFloat(lonInputEl.value);
        
        if (isNaN(lat) || isNaN(lon)) {
            showNotification('Please enter valid coordinates.', 'error');
            return;
        }
    } else if (userLocation) {
        lat = userLocation.lat;
        lon = userLocation.lon;
    } else {
        showNotification('Please get your location or enter coordinates manually.', 'error');
        return;
    }

    checkInBtn.disabled = true;
    checkInBtn.textContent = '🔍 Checking...';

    // Calculate distance
    const distance = haversine(lat, lon, currentLocation.lat, currentLocation.lon);
    
    setTimeout(() => {
        if (distance <= currentLocation.radius_m) {
            // Successful check-in
            const pointsAwarded = currentLocation.points;
            userPoints += pointsAwarded;
            visitedLocations.add(currentLocation.id);
            
            // Update UI
            updatePointsDisplay();
            updateProgress();
            
            showNotification(
                `🎉 Success! You earned ${pointsAwarded} points for visiting ${currentLocation.name}!`, 
                'success'
            );
            
            // Clear location data and recommend next
            userLocation = null;
            currentLocationDisplayEl.style.display = 'none';
            latInputEl.value = '';
            lonInputEl.value = '';
            
            // Wait a bit before recommending next location
            setTimeout(() => {
                recommendNewLocation();
            }, 2000);
            
        } else {
            showNotification(
                `📍 Too far! You are ${Math.round(distance)} meters away from ${currentLocation.name}. Get closer and try again!`, 
                'error'
            );
        }
        
        checkInBtn.disabled = false;
        checkInBtn.textContent = '✅ Check In';
    }, 1000);
}

function updatePointsDisplay() {
    pointsValueEl.textContent = userPoints;
}

function updateProgress() {
    const visitedCount = visitedLocations.size;
    visitedCountEl.textContent = visitedCount;
    
    const progressPercentage = (visitedCount / locations.length) * 100;
    progressFillEl.style.width = `${progressPercentage}%`;
}

function showNotification(message, type = 'info') {
    notificationMessageEl.textContent = message;
    notificationEl.className = `notification ${type}`;
    notificationEl.style.display = 'block';
    
    // Hide after 5 seconds
    setTimeout(() => {
        notificationEl.style.display = 'none';
    }, 5000);
}

function showGameComplete() {
    finalScoreEl.textContent = userPoints;
    gameCompleteEl.style.display = 'block';
    locationCardEl.style.display = 'none';
    controlsSectionEl.style.display = 'none';
    loadingScreenEl.style.display = 'none';
}

function restartGame() {
    // Reset game state
    currentLocation = null;
    visitedLocations.clear();
    userPoints = 0;
    userLocation = null;
    
    // Reset UI
    updatePointsDisplay();
    updateProgress();
    gameCompleteEl.style.display = 'none';
    notificationEl.style.display = 'none';
    currentLocationDisplayEl.style.display = 'none';
    latInputEl.value = '';
    lonInputEl.value = '';
    checkInBtn.disabled = true;
    
    // Start new game
    initializeGame();
}

async function initializeGame() {
    await recommendNewLocation();
}