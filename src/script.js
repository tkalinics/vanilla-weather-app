// setting up global variables
let apiKey = "be57da8424d4105454efb5bd01e7bef2";

let temperature = 0;
let weeklyMins = [];
let weeklyMaxs = [];
let activeUnit = "celsius";

let tempElement = document.querySelector("#main-temperature");
let city = document.querySelector("input");

let country = "";
let langState = true; // true for English, false for local language

// display time
function formatDay(timestamp) {
  let date = new Date(timestamp);
  let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[date.getDay()];
}

function formatDate(timestamp) {
  let date = new Date(timestamp);
  let hours = date.getHours();
  let minutes = date.getMinutes();

  if (hours.toString().length === 1) {
    hours = `0${hours}`;
  }
  if (minutes.toString().length === 1) {
    minutes = `0${minutes}`;
  }

  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  let dateTimeElement = document.querySelector("#time");
  dateTimeElement.innerHTML = `${days[date.getDay()]} ${hours}:${minutes}`;
}

// weather functions
function displayForecast(response) {
  let forecast = response.data.daily;
  let forecastElement = document.querySelector("#forecast");

  weeklyMins = [];
  weeklyMaxs = [];
  let forecastHTML = "";

  forecast.forEach(function (forecastDay, index) {
    if (index < 6) {
      forecastHTML =
        forecastHTML +
        `
        <div class="col forecast-day">
            <span class="forecast-day-name">${formatDay(
              forecastDay.dt * 1000
            )}</span>
            <div>
            <img
              src="assets/${forecastDay.weather[0].icon}.svg"
              title="${forecastDay.weather[0].description}"
              alt="${forecastDay.weather[0].description}"
              class="weather-icon-day"
            />
            </div>
              <span class="min"></span>
              <span class="max"></span>
          </div>`;

      weeklyMins.push(forecastDay.temp.min);
      weeklyMaxs.push(forecastDay.temp.max);
    }
  });

  forecastElement.innerHTML = forecastHTML;

  let minElements = document.querySelectorAll(".min");
  minElements.forEach(function (element, index) {
    if (activeUnit === "celsius") {
      element.innerHTML = Math.round(weeklyMins[index]) + "°";
    } else if (activeUnit === "fahrenheit") {
      element.innerHTML = Math.round((weeklyMins[index] * 9) / 5 + 32) + "°";
    }
  });

  let maxElements = document.querySelectorAll(".max");
  maxElements.forEach(function (element, index) {
    if (activeUnit === "celsius") {
      element.innerHTML = Math.round(weeklyMaxs[index]) + "°";
    } else if (activeUnit === "fahrenheit") {
      element.innerHTML = Math.round((weeklyMaxs[index] * 9) / 5 + 32) + "°";
    }
  });

  let todayElement = document.querySelector(".forecast-day");
  todayElement.classList.add("today");
  let todayText = document.querySelector(".forecast-day-name");
  todayText.innerHTML = "Today";
}

function getForecast(coordinates) {
  let apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${apiKey}&units=metric`;
  axios.get(apiUrl).then(displayForecast);
}

function displayTemp(response) {
  temperature = response.data.main.temp;

  if (activeUnit === "celsius") {
    tempElement.innerHTML = Math.round(temperature);
  } else if (activeUnit === "fahrenheit") {
    tempElement.innerHTML = Math.round((temperature * 9) / 5 + 32);
  }

  let humidityElement = document.querySelector("#humidity");
  let windElement = document.querySelector("#wind");
  let descriptionElement = document.querySelector("#description");
  let icon = document.querySelector(".weather-icon");

  humidityElement.innerHTML = response.data.main.humidity;
  windElement.innerHTML = Math.round(response.data.wind.speed);
  descriptionElement.innerHTML = response.data.weather[0].description;
  icon.setAttribute("src", `assets/${response.data.weather[0].icon}.svg`);

  city.value = response.data.name;
  formatDate(response.data.dt * 1000);

  getForecast(response.data.coord);

  country = response.data.sys.country;
}

function getTemp(query, input, lang) {
  let apiUrl = "";

  console.log(lang);

  if (lang === undefined) {
    lang = "en";
    langState = true;
  }

  if (query === "name") {
    apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${input}&appid=${apiKey}&units=metric&lang=${lang}`;
  } else if (query === "coord") {
    apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${input[0]}&lon=${input[1]}&appid=${apiKey}&units=metric&lang=${lang}`;
  }

  axios.get(apiUrl).then(displayTemp);
}

// unit conversion
function tempConvert(link) {
  if (celsius.classList.contains("selected-unit") && link === "f") {
    let minElements = document.querySelectorAll(".min");
    let maxElements = document.querySelectorAll(".max");

    tempElement.innerHTML = Math.round((temperature * 9) / 5 + 32);
    minElements.forEach(function (element, index) {
      element.innerHTML = Math.round((weeklyMins[index] * 9) / 5 + 32) + "°";
    });
    maxElements.forEach(function (element, index) {
      element.innerHTML = Math.round((weeklyMaxs[index] * 9) / 5 + 32) + "°";
    });

    activeUnit = "fahrenheit";
    celsius.classList.toggle("selected-unit");
    fahrenheit.classList.toggle("selected-unit");
  }

  if (fahrenheit.classList.contains("selected-unit") && link === "c") {
    let minElements = document.querySelectorAll(".min");
    let maxElements = document.querySelectorAll(".max");

    tempElement.innerHTML = Math.round(temperature);
    minElements.forEach(function (element, index) {
      element.innerHTML = Math.round(weeklyMins[index]) + "°";
    });
    maxElements.forEach(function (element, index) {
      element.innerHTML = Math.round(weeklyMaxs[index]) + "°";
    });

    activeUnit = "celsius";
    celsius.classList.toggle("selected-unit");
    fahrenheit.classList.toggle("selected-unit");
  }
}

let celsius = document.querySelector("#celsius");
let fahrenheit = document.querySelector("#fahrenheit");

celsius.addEventListener("click", function () {
  tempConvert("c");
});
fahrenheit.addEventListener("click", function () {
  tempConvert("f");
});

// search
function searchCity(event) {
  event.preventDefault();
  getTemp("name", city.value);
}

let form = document.querySelector("form");
form.addEventListener("submit", searchCity);

// geolocation
function geoLocation(position) {
  let coord = [position.coords.latitude, position.coords.longitude];
  getTemp("coord", coord);
}

let geoButton = document.querySelector("#geolocation-btn");
geoButton.addEventListener("click", function () {
  navigator.geolocation.getCurrentPosition(geoLocation);
});

// night mode
function nightMode() {
  let body = document.querySelector("body");
  body.classList.toggle("night-mode");
  nightModeButton.classList.toggle("far");
  nightModeButton.classList.toggle("fas");
}

let nightModeButton = document.querySelector("#night-mode-btn");
nightModeButton.addEventListener("click", nightMode);

// language toggle
function langToggle() {
  let countryList = {
    AE: "ar",
    AZ: "az",
    BG: "bg",
    BH: "ar",
    BR: "pt_br",
    CN: "zh_cn",
    CZ: "cz",
    DE: "de",
    DZ: "ar",
    EG: "ar",
    ES: "es",
    FI: "fi",
    FR: "fr",
    GR: "el",
    HR: "hr",
    HU: "hu",
    ID: "id",
    IL: "he",
    IN: "hi",
    IQ: "ar",
    IR: "fa",
    IT: "it",
    JO: "ar",
    JP: "ja",
    KR: "kr",
    KW: "ar",
    LB: "ar",
    LT: "lt",
    LV: "la",
    LY: "ar",
    MA: "ar",
    MK: "mk",
    MR: "ar",
    NO: "no",
    NL: "nl",
    OM: "ar",
    PL: "pl",
    PT: "pt",
    QA: "ar",
    RO: "ro",
    RS: "sr",
    RU: "ru",
    SA: "ar",
    SE: "se",
    SI: "sl",
    SK: "sk",
    SY: "ar",
    TH: "th",
    TN: "ar",
    TR: "tr",
    UA: "ua",
    VN: "vi",
    YE: "ar",
  };

  let lang = "en";

  if (langState) {
    if (countryList[country]) {
      lang = countryList[country];
    }
  }

  getTemp("name", city.value, lang);
  langState = !langState;
}

let langButton = document.querySelector("#lang-btn");
langButton.addEventListener("click", langToggle);

getTemp("name", "Helsinki");
