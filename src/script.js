// setting up global variables
let apiKey = "be57da8424d4105454efb5bd01e7bef2";

let temperature = 0;
let weeklyMins = [];
let weeklyMaxs = [];
let activeUnit = "celsius";

let tempElement = document.querySelector("#main-temperature");
let city = document.querySelector("input");

let country = "";
let lang = "en";
let langState = true; // true for English, false for local language

// display time
function formatDay(timestamp) {
  let date = new Date(timestamp);
  return dictionary[lang].abbr[date.getDay()];
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

  let dateTimeElement = document.querySelector("#time");
  dateTimeElement.innerHTML = `${
    dictionary[lang].days[date.getDay()]
  } ${hours}:${minutes}`;
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
      element.innerHTML = Math.round(weeklyMins[index]) + "??";
    } else if (activeUnit === "fahrenheit") {
      element.innerHTML = Math.round((weeklyMins[index] * 9) / 5 + 32) + "??";
    }
  });

  let maxElements = document.querySelectorAll(".max");
  maxElements.forEach(function (element, index) {
    if (activeUnit === "celsius") {
      element.innerHTML = Math.round(weeklyMaxs[index]) + "??";
    } else if (activeUnit === "fahrenheit") {
      element.innerHTML = Math.round((weeklyMaxs[index] * 9) / 5 + 32) + "??";
    }
  });

  let todayElement = document.querySelector(".forecast-day");
  todayElement.classList.add("today");
  let todayText = document.querySelector(".forecast-day-name");
  todayText.innerHTML = dictionary[lang].today;
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

  let humidityWord = document.querySelector("#humidity-word");
  let humidityElement = document.querySelector("#humidity-value");
  let windWord = document.querySelector("#wind-word");
  let windElement = document.querySelector("#wind-value");
  let windUnit = document.querySelector("#wind-unit");
  let descriptionElement = document.querySelector("#description");
  let icon = document.querySelector(".weather-icon");

  humidityWord.innerHTML = dictionary[lang].humidity;
  humidityElement.innerHTML = response.data.main.humidity;
  windWord.innerHTML = dictionary[lang].wind;
  windElement.innerHTML = Math.round(response.data.wind.speed);
  windUnit.innerHTML = dictionary[lang].windUnit;
  descriptionElement.innerHTML = response.data.weather[0].description;
  icon.setAttribute("src", `assets/${response.data.weather[0].icon}.svg`);

  city.value = response.data.name;
  formatDate(response.data.dt * 1000);

  getForecast(response.data.coord);

  country = response.data.sys.country;

  if (countryList[country]) {
    langButton.classList.remove("inactive");
  } else {
    langButton.classList.add("inactive");
  }
}

function getTemp(query, input) {
  let apiUrl = "";

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
      element.innerHTML = Math.round((weeklyMins[index] * 9) / 5 + 32) + "??";
    });
    maxElements.forEach(function (element, index) {
      element.innerHTML = Math.round((weeklyMaxs[index] * 9) / 5 + 32) + "??";
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
      element.innerHTML = Math.round(weeklyMins[index]) + "??";
    });
    maxElements.forEach(function (element, index) {
      element.innerHTML = Math.round(weeklyMaxs[index]) + "??";
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
  document.body.classList.toggle("night-mode");
  nightModeButton.classList.toggle("far");
  nightModeButton.classList.toggle("fas");
}

let nightModeButton = document.querySelector("#night-mode-btn");
nightModeButton.addEventListener("click", nightMode);

const prefersNightMode = window.matchMedia("(prefers-color-scheme: dark)");
if (prefersNightMode.matches) {
  nightMode();
}

// language toggle
function langToggle() {
  lang = "en";

  if (langState) {
    if (countryList[country]) {
      lang = countryList[country];
    }
  }

  getTemp("name", city.value);
  langState = !langState;
}

let langButton = document.querySelector("#lang-btn");
langButton.addEventListener("click", langToggle);

// dictionary
let countryList = {
  CZ: "cz",
  FI: "fi",
  GR: "el",
  HU: "hu",
  JP: "ja",
  KR: "kr",
  PH: "tl",
  RU: "ru",
  UA: "ua",
  VN: "vi",
};

let dictionary = {
  en: {
    today: "Today",
    days: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    abbr: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    humidity: "Humidity",
    wind: "Wind",
    windUnit: "km/h",
  },

  cz: {
    today: "Dnes",
    days: [
      "Ned??le",
      "Pond??l??",
      "??ter??",
      "St??eda",
      "??tvrtek",
      "P??tek",
      "Sobota",
    ],
    abbr: ["Ne", "Po", "??t", "St", "??t", "P??", "So"],
    humidity: "Vlhkost",
    wind: "V??tr",
    windUnit: "km/h",
  },

  el: {
    today: "????????????",
    days: [
      "??????????????",
      "??????????????",
      "??????????",
      "??????????????",
      "????????????",
      "??????????????????",
      "??????????????",
    ],
    abbr: ["??????.", "??????.", "????.", "??????.", "??????.", "??????.", "??????."],
    humidity: "??????????????",
    wind: "????????????",
    windUnit: "km/h",
  },

  fi: {
    today: "T??n????n",
    days: [
      "Sunnuntai",
      "Maanantai",
      "Tiistai",
      "Keskiviikko",
      "Torstai",
      "Perjantai",
      "Lauantai",
    ],
    abbr: ["Su", "Ma", "Ti", "Ke", "To", "Pe", "La"],
    humidity: "Kosteus",
    wind: "Tuuli",
    windUnit: "km/h",
  },

  hu: {
    today: "Ma",
    days: [
      "Vas??rnap",
      "H??tf??",
      "Kedd",
      "Szerda",
      "Cs??t??rt??k",
      "P??ntek",
      "Szombat",
    ],
    abbr: ["Vas.", "H.", "K.", "Sze.", "Cs??t.", "P.", "Szo."],
    humidity: "P??ratartalom",
    wind: "Sz??l",
    windUnit: "km/h",
  },

  ja: {
    today: "??????",
    days: [
      "?????????",
      "?????????",
      "?????????",
      "?????????",
      "?????????",
      "?????????",
      "?????????",
    ],
    abbr: ["???", "???", "???", "???", "???", "???", "???"],
    humidity: "??????",
    wind: "???",
    windUnit: "km/h",
  },

  kr: {
    today: "??????",
    days: [
      "?????????",
      "?????????",
      "?????????",
      "?????????",
      "?????????",
      "?????????",
      "?????????",
    ],
    abbr: ["???", "???", "???", "???", "???", "???", "???"],
    humidity: "??????",
    wind: "??????",
    windUnit: "km/h",
  },

  ru: {
    today: "??????????????",
    days: [
      "??????????????????????",
      "??????????????????????",
      "??????????????",
      "??????????",
      "??????????????",
      "??????????????",
      "??????????????",
    ],
    abbr: ["????.", "????.", "????.", "????.", "????.", "????.", "????."],
    humidity: "??????????????????",
    wind: "??????????",
    windUnit: "????/??",
  },

  tl: {
    today: "Ngayon",
    days: [
      "Linggo",
      "Lunes",
      "Martes",
      "Miyerkules",
      "Huwebes",
      "Biyernes",
      "Sabado",
    ],
    abbr: ["Lgo", "Lun", "Mar", "Miy", "Huw", "Biy", "Sab"],
    humidity: "Halumigmig",
    wind: "Hangin",
    windUnit: "km/h",
  },

  ua: {
    today: "????????????????",
    days: [
      "????????????",
      "??????????????????",
      "????????????????",
      "????????????",
      "????????????",
      "?????????????????",
      "????????????",
    ],
    abbr: ["????.", "????.", "????.", "????.", "????.", "????.", "????."],
    humidity: "??????????????????",
    wind: "??????????",
    windUnit: "????/??????",
  },

  vi: {
    today: "H??m nay",
    days: [
      "Ch??? nh???t",
      "Th??? hai",
      "Th??? ba",
      "Th??? t??",
      "Th??? n??m",
      "Th??? s??u",
      "Th??? b???y",
    ],
    abbr: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
    humidity: "????? ???m",
    wind: "Gi??",
    windUnit: "km/h",
  },
};

getTemp("name", "Helsinki");
