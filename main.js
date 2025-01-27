const map = L.map("map").setView([0, 0], 2);

// Basemap
const tileLayer = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
}).addTo(map);

// create control and add to map
let lc = L.control
  .locate({
    locateOptions: {
      enableHighAccuracy: true,
      maxZoom: 15,
    },
  })
  .addTo(map);

lc.start();

// Location found event listener
map.on("locationfound", function (event) {
  let lat = event.latlng.lat;
  let lng = event.latlng.lng;

  // Call searchCoordinates with the latitude and longitude
  searchCoordinates(lat, lng);
});

async function searchCoordinates(lat, lng) {
  let apikey = "at3ed3515b1db0o17a4ba56a0d11851f";
  await fetch(
    `https://api.shecodes.io/weather/v1/current?lon=${lng}&lat=${lat}&key=${apikey}`
  )
    .then(function (response) {
      if (response.status === 200) {
        return response.json(response);
      } else {
        throw new Error("fetch API could not fetch the data");
      }
    })
    .then(refreshWeatherCoor);
}

async function searchCity(city) {
  let key = "at3ed3515b1db0o17a4ba56a0d11851f";

  await fetch(
    `https://api.shecodes.io/weather/v1/current?query=${city}&key=${key}`
  )
    .then(function (response) {
      if (response.status === 200) {
        return response.json(response);
      } else {
        throw new Error("fetch API could not fetch the data");
      }
    })
    .then(currentWeatherByCity);
}

function currentWeatherByCity(response) {
  let cityElement = document.querySelector("#city");
  let temperatureElement = document.querySelector("#temperature");
  let temperature = response.temperature.current;
  let descriptionElement = document.querySelector("#description");
  let humidityElement = document.querySelector("#humidity");
  let windSpeedElement = document.querySelector("#wind-speed");
  let timeElement = document.querySelector("#time");
  let date = new Date(response.time * 1000);
  let icon = document.querySelector("#icon");

  cityElement.innerHTML = response.city;
  temperatureElement.innerHTML = Math.round(temperature);
  descriptionElement.innerHTML = response.condition.description;
  humidityElement.innerHTML = ` ${response.temperature.humidity}%`;
  windSpeedElement.innerHTML = `${response.wind.speed}Km/h`;
  timeElement.innerHTML = formatDate(date);
  icon.innerHTML = `<img src="${response.condition.icon_url}"class= "weather-icon" />`;

  let geoJsonData = {
    type: "FeatureCollection",
    features: [],
  };

  //for (let i = 0; i < data.length; ++i){
  geoJsonData.features.push({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [
        response.coordinates.longitude,
        response.coordinates.latitude,
      ],
    },
    properties: {
      city: response.city,
      country: response.country,
    },
  });

  L.geoJSON(geoJsonData);
  map.setView(
    [response.coordinates.latitude, response.coordinates.longitude],
    11
  );
  getForecast(response.city);
}

function refreshWeatherCoor(response) {
  let cityElement = document.querySelector("#city");
  let temperatureElement = document.querySelector("#temperature");
  let temperature = response.temperature.current;
  let descriptionElement = document.querySelector("#description");
  let humidityElement = document.querySelector("#humidity");
  let windSpeedElement = document.querySelector("#wind-speed");
  let timeElement = document.querySelector("#time");
  let date = new Date(response.time * 1000);
  let icon = document.querySelector("#icon");

  cityElement.innerHTML = response.city;
  temperatureElement.innerHTML = Math.round(temperature);
  descriptionElement.innerHTML = response.condition.description;
  humidityElement.innerHTML = `${response.temperature.humidity}%`;
  windSpeedElement.innerHTML = `${response.wind.speed}Km/h`;
  timeElement.innerHTML = formatDate(date);
  icon.innerHTML = `<img src="${response.condition.icon_url}"class= "weather-icon" />`;

  getForecast(response.city);
}

function formatDate(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thurday",
    "Friday",
    "Saturday",
  ];
  let day = days[date.getDay()];

  if (minutes < 10) {
    minutes = `0${minutes}`;
  }

  return ` ${day} ${hours}:${minutes}`;
}

function handleSearchSubmit(event) {
  event.preventDefault();
  let searchInput = document.querySelector("#search-form-input");
  searchCity(searchInput.value);
}

function formatDay(timestamp) {
  let date = new Date(timestamp * 1000);
  let days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
  return days[date.getDay()];
}

async function getForecast(city) {
  let apikey = "at3ed3515b1db0o17a4ba56a0d11851f";
  await fetch(
    `https://api.shecodes.io/weather/v1/forecast?query=${city}&key=${apikey}&units=metric`
  )
    .then(function (response) {
      if (response.status === 200) {
        return response.json(response);
      } else {
        throw new Error("fetch API could not fetch the data");
      }
    })
    .then(displayForecast);
}

function displayForecast(response) {
  let forecastHtml = "";

  response.daily.forEach(function (day, index) {
    if (index < 5) {
      forecastHtml =
        forecastHtml +
        `
        <div class="weather-forecast-day"> 
          <div class="weather-forecast-date">${formatDay(day.time)}</div>
                <img src="${
                  day.condition.icon_url
                }" class="weather-forecast-icon" />
                <div class="weather-forecast-temperatures">
                    <div class="weather-forecast-temperature">
                        <strong>${Math.round(day.temperature.maximum)}°</strong>
                    </div>                  
                <div class="weather-forecast-temperature">${Math.round(
                  day.temperature.minimum
                )}°</div>
                </div>
             </div>`;
    }
  });

  let forecastElement = document.querySelector("#forecast");
  forecastElement.innerHTML = forecastHtml;
}

let searchFormElement = document.querySelector("#search-form");
searchFormElement.addEventListener("submit", handleSearchSubmit);
