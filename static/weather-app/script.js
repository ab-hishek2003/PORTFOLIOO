const searchBtn = document.getElementById("searchBtn");

// 1. REUSABLE FUNCTION to update the UI
function displayWeather(data) {
    document.getElementById("weatherInfo").style.display = "block";
    document.getElementById("cityName").innerText = data.name;
    document.getElementById("temp").innerText = `${Math.round(data.main.temp)}°C`;
    
    // Accessing description from the first item in the weather array
    document.getElementById("description").innerText = data.weather[0].description;
    
    document.getElementById("humidity").innerText = `Humidity: ${data.main.humidity}%`;
    document.getElementById("wind").innerText = `Wind: ${data.wind.speed} km/h`;
}

// 2. SEARCH BUTTON LOGIC (Calls your Flask Backend)
searchBtn.addEventListener("click", () => {
    const city = document.getElementById("cityInput").value;
    if (!city) {
        alert("Please enter a city name");
        return;
    }
    
    // SECURE: We call our own API route, not OpenWeatherMap directly
    const url = `/api/weather?city=${city}`;

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("City not found or server error");
            return response.json();
        })
        .then(data => displayWeather(data))
        .catch(error => alert(error.message));
});

// 3. GEOLOCATION LOGIC (Runs automatically on page load)
window.onload = function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            // SECURE: Call your Flask backend with coordinates
            const url = `/api/weather?lat=${lat}&lon=${lon}`;
            
            fetch(url)
                .then(response => {
                    if (!response.ok) throw new Error("Could not find weather for your location");
                    return response.json();
                })
                .then(data => displayWeather(data))
                .catch(error => console.log("Geolocation error:", error.message));
        });
    }
};
