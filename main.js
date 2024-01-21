const API_ENDPOINT = "https://api.openweathermap.org/data/2.5/weather";
const API_KEY = "f87c71a9f2f4ff3a1913ca85ae54f2f7";

const fetchWeatherData = async (city) => {
    try {
        if (!city) {
            return Promise.reject(new Error("Please enter a city name."));
        }
        return fetch(
            `${API_ENDPOINT}?q=${city}&units=metric&appid=${API_KEY}`
        ).then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        });
    } catch (error) {
        console.error("Error fetching data:", error.message);
    }
};

const updateURL = (city) => {
    const urlObject = new URL(window.location.href);
    const params = new URLSearchParams(urlObject.search);

    params.set("city", city);

    urlObject.search = params.toString();

    // console.log(urlObject);
    window.history.pushState(
        { path: urlObject.pathname + urlObject.search },
        "",
        urlObject
    );
};

const getCityFromURL = () => {
    const URL = new URLSearchParams(window.location.search);
    const city = URL.get("city");

    return city;
};

document.addEventListener("DOMContentLoaded", () => {
    const cityInput = document.getElementById("cityInput");
    const searchBtn = document.querySelector(".search-btn");

    const temperature = document.getElementById("temp");
    const description = document.getElementById("description");
    const cityElement = document.getElementById("city");
    const humidity = document.getElementById("humidity");
    const wind = document.getElementById("wind");
    const weatherIcon = document.getElementById("weather-icon");

    const weatherStatsGuts = document.querySelectorAll(".weather-stats *");
    const errorLoadingWeather = document.getElementById("errorLoadingWeather");
    // console.log(weatherStatsGuts);

    const loader = document.getElementById("loader");
    const staticData = document.querySelectorAll(".hidden");
    let isDayTime = false;

    const updateWeatherUI = (data) => {
        temperature.textContent = `${Math.round(data.main.temp)}\u00B0C`;
        description.textContent = `${data.weather[0].main}`;
        cityElement.textContent = `${data.name}, ${data.sys.country}`;
        humidity.textContent = `${data.main.humidity}%`;
        wind.textContent = `${data.wind.speed} Km/h`;

        const icon = data.weather[0].icon;
        isDayTime = icon.includes("d");

        setWeatherIcon(data.weather[0].main.toLowerCase());
    };

    const weatherConditions = [
        "clear",
        "clouds",
        "drizzle",
        "rain",
        "thunderstorm",
    ];

    const iconMap = {
        day: {},
        night: {},
    };

    weatherConditions.forEach((condition) => {
        iconMap.day[condition] = `icons/day/${condition}.svg`;
        iconMap.night[condition] = `icons/night/${condition}.svg`;
    });

    const setWeatherIcon = (weatherCondition) => {
        const iconSource = isDayTime
            ? iconMap.day[weatherCondition]
            : iconMap.night[weatherCondition];

        if (iconSource) {
            weatherIcon.src = iconSource;
        } else {
            console.error(
                `No icon found for weather condition: ${weatherCondition}`
            );
        }
    };

    const showLoader = () => {
        loader.style.display = "block";
    };

    const hideLoader = () => {
        loader.style.display = "none";
    };

    const handleSearch = async (needToUpdateURL = true) => {
        try {
            showLoader();
            const city = cityInput.value.trim();
            const data = await fetchWeatherData(city);

            if (needToUpdateURL) updateURL(city);
            weatherStatsGuts.forEach((bro) => (bro.style.display = "flex"));
            errorLoadingWeather.style.display = "none";

            hideLoader();

            updateWeatherUI(data);

            staticData.forEach((hiddenElements) => {
                hiddenElements.classList.remove("hidden");
            });
        } catch (error) {
            hideLoader();
            weatherStatsGuts.forEach((bro) => (bro.style.display = "none"));
            errorLoadingWeather.style.display = "block";
            updateURL("");
            console.error("Error handling search:", error.message);
        }
    };

    const _city = getCityFromURL() ?? "";
    if (_city) {
        cityInput.value = _city;
        updateURL(_city);
        handleSearch(false);
    }

    searchBtn.addEventListener("click", handleSearch);
    cityInput.addEventListener("keydown", (key) => {
        if (key.key === "Enter") {
            handleSearch();
        }
    });
});
