// Add an event listener to the "Get Weather" button
document.getElementById("getWeather").addEventListener("click", () => {

  // Get the value entered in the city input field and trim whitespace
  const city = document.getElementById("city").value.trim();

  // Get the result display area
  const resultDiv = document.getElementById("weatherResult");

  // Get the background display container
  const backgroundDiv = document.getElementById("background");

  // If city input is empty, show a warning message and stop the function
  if (city === "") {
    resultDiv.textContent = "⚠️ Please enter a city name.";
    return;
  }

  // Show a loading message while fetching data
  resultDiv.textContent = "⏳ Loading weather data...";

  // Your API key for OpenWeather
  const apiKey = "39d276b81c5d27bd726c7ef1f335e224";

  // Your Unsplash API key to get background images
  const unsplashAccessKey = "atoj1HwjSRqQuKVlmDo94b-kaf6rbobwg4r2YtmgstY";

  // === Fetch background image from Unsplash ===
  fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(city)}&client_id=${unsplashAccessKey}&orientation=landscape&per_page=1`)
    .then(res => res.json()) // Convert response to JSON
    .then(data => {
      // If image results are found
      if (data.results && data.results.length > 0) {
        // Use the first image URL as the background
        const imageUrl = data.results[0].urls.regular;
        backgroundDiv.style.backgroundImage = `url(${imageUrl})`;
      } else {
        // If no images found, clear background
        backgroundDiv.style.backgroundImage = "";
      }
    })
    .catch(() => {
      // If image fetch fails, clear background
      backgroundDiv.style.backgroundImage = "";
    });

  // === Fetch current weather from OpenWeather ===
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
    .then(response => {
      // If the response isn't OK (e.g., city not found), throw an error
      if (!response.ok) throw new Error("City not found. Please check the city name.");
      return response.json(); // Convert response to JSON
    })
    .then(data => {
      // Extract weather data
      const tempC = data.main.temp; // Temperature in Celsius
      const tempF = (tempC * 9/5 + 32).toFixed(1); // Convert to Fahrenheit
      const description = data.weather[0].description; // Weather description
      const icon = data.weather[0].icon; // Weather icon code
      const humidity = data.main.humidity; // Humidity %
      const windSpeed = data.wind.speed; // Wind speed in m/s
      const localTime = new Date((data.dt + data.timezone) * 1000).toUTCString().replace("GMT", ""); // Local time

      // Build the output HTML string with current weather
      let output = `
        <h2>Current Weather for ${city}</h2>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" />
        <div>🌡️ Temperature: <strong>${tempC}°C / ${tempF}°F</strong></div>
        <div>☁️ Condition: <em>${description}</em></div>
        <div>💧 Humidity: ${humidity}%</div>
        <div>🌬️ Wind Speed: ${windSpeed} m/s</div>
        <div>🕒 Local Time: ${localTime}</div>
        <br>
      `;

      // === Fetch 5-day weather forecast ===
      return fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`)
        .then(response => {
          // If forecast fetch fails, throw error
          if (!response.ok) throw new Error("Could not fetch forecast.");
          return response.json(); // Convert to JSON
        })
        .then(forecastData => {
          const dailyForecasts = {}; // To store forecast data at 12:00 PM each day

          // Loop through forecast list (every 3 hours)
          forecastData.list.forEach(item => {
            const date = item.dt_txt.split(' ')[0]; // Get the date part
            const time = item.dt_txt.split(' ')[1]; // Get the time part

            // Only take data at 12:00 PM
            if (time === "12:00:00") {
              dailyForecasts[date] = item; // Save one entry per day
            }
          });

          // Start building forecast section
          output += `<h3>5-Day Forecast</h3>`;

          let count = 0; // Limit to 5 days
          for (const date in dailyForecasts) {
            if (count >= 5) break; // Stop after 5 entries
            const day = dailyForecasts[date]; // Get the forecast data for that day
            const tempC = day.main.temp;
            const tempF = (tempC * 9/5 + 32).toFixed(1);
            const desc = day.weather[0].description;
            const icon = day.weather[0].icon;

            // Format date as MM/DD
            const dateParts = date.split("-");
            const formattedDate = `${dateParts[1]}/${dateParts[2]}`;

            // Add forecast block
            output += `
              <div style="margin-bottom: 8px;">
                <strong>${formattedDate}</strong> 
                <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}" />
                : ${tempC}°C / ${tempF}°F, <em>${desc}</em>
              </div>
            `;
            count++;
          }

          // Add "Clear" button
          output += `<br><button id="clearWeather">Clear</button>`;

          // Insert the complete weather and forecast info into the page
          resultDiv.innerHTML = output;

          // Add event listener for the "Clear" button
          document.getElementById("clearWeather").addEventListener("click", () => {
            document.getElementById("city").value = ""; // Clear input field
            resultDiv.textContent = ""; // Clear weather display
            backgroundDiv.style.backgroundImage = ""; // Clear background
          });
        });
    })
    .catch(error => {
      // Display error message if any fetch fails
      resultDiv.textContent = `❌ Error: ${error.message}`;
    });
});

