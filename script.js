var APIkey = "ecbf5f7a8dc3f4727368dedfb83cf5a6";
var date = dayjs().format("hh:mm A, MMMM D, YYYY");
var hour = dayjs().format("H");
var cityName = document.querySelector('#cityName');
var searchBtn = document.querySelector('#search-btn');
var userFormEl = document.querySelector('#user-form');
var currentCity = document.querySelector('#currentCity');
var currentDate = document.querySelector('#currentDate');
var tempEl = document.querySelector('#temp1');
var windEl = document.querySelector('#wind1');
var humidityEl = document.querySelector('#humidity1');
var headerImageEl = document.querySelector('#headerImage');
var containerEl = document.querySelector('#card-deck');
var buttons = document.querySelector('#buttons-list');
var weatherPanelEl = document.querySelector('#weather-panel');
var forecastEl = document.querySelector('#forecastTitle');

var formSubmitHandler = function(event) {
    event.preventDefault();
    var cityNameEl = cityName.value.trim();
    if (cityNameEl) {
        getWeatherInfo(cityNameEl);
        cityName.value = '';
    } else {
        alert('Please enter a city name!');
    }
};
renderCityName();

userFormEl.addEventListener('submit', formSubmitHandler);

function getWeatherInfo(city) {
    fetch('https://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + APIkey + '&units=imperial')
        .then(function(response) {
            if (response.ok) {
                response.json().then(function(data) {
                    saveCity(data.name);
                    displayCurrentWeather(data);
                    displayWeather(data.coord.lat, data.coord.lon);
                });
            }
        });
};

function displayCurrentWeather(data) {
    currentCity.textContent = data.name;
    currentDate.textContent = date;
    tempEl.textContent = data.main.temp + "°F";
    windEl.textContent = data.wind.speed + "mph";
    humidityEl.textContent = data.main.humidity + "%";
    
    var image = data.weather[0].icon;
    var newImage = parseInt(hour) > 9 && parseInt(hour) < 21 ? image.slice(0, -1) + 'd' : image.slice(0, -1) + 'n';
    var imgUrl = `http://openweathermap.org/img/wn/${newImage}.png`;

    headerImageEl.innerHTML = '';
    var imgElement = document.createElement('img');
    imgElement.src = imgUrl;
    headerImageEl.appendChild(imgElement);

    forecastEl.style.display = 'block';
    weatherPanelEl.style.display = 'block';
};

function displayWeather(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIkey}&units=imperial`)
        .then(response => response.json())
        .then(data => {
            containerEl.innerHTML = '';

            let dayCount = 0;
            let lastProcessedDay = null;
            for (let i = 0; i < data.list.length && dayCount < 5; i++) {
                let forecast = data.list[i];
                let forecastDay = new Date(forecast.dt * 1000).getDate();

                if (forecastDay !== lastProcessedDay) {
                    dayCount++;
                    lastProcessedDay = forecastDay;

                    let iconCode = forecast.weather[0].icon;
                    let iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
                    let dayOfWeek = dayjs.unix(forecast.dt).format('dddd');

                    let cardHTML = `
                        <div class="card" style="width: 18rem;">
                            <div class="card-body content-card">
                                <h5 class="card-title">${dayOfWeek}</h5>
                                <img src="${iconUrl}">
                                <p class="card-text">Temp: ${forecast.main.temp + "°F"}</p>
                                <p class="card-text">Wind: ${forecast.wind.speed + "mph"}</p>
                                <p class="card-text">Humidity: ${forecast.main.humidity + "%"}</p>
                            </div>
                        </div>`;
                    containerEl.insertAdjacentHTML('beforeend', cardHTML);
                }
            }
        })
        .catch(error => console.error('Error fetching forecast data:', error));
}



function saveCity(city) {
    var key = "cityName";
    var history = localStorage.getItem(key);
    if (!history) {
        history = [];
    } else {
        history = JSON.parse(history);
    }
    if (!history.includes(city)) {
        history.push(city);
        localStorage.setItem(key, JSON.stringify(history));
    }
    renderCityName();
}

function renderCityName() {
    var history = localStorage.getItem("cityName");
    if (history) {
        history = JSON.parse(history);
        buttons.innerHTML = '';
        history.forEach(function(city) {
            var button = document.createElement('button');
            button.textContent = city;
            button.classList.add('cityButton', 'btn', 'btn-outline-dark', 'btn-sm');
            button.setAttribute("id", city);
            button.addEventListener('click', historyClicked);
            buttons.appendChild(button);
        });
    }
}

function historyClicked(event) {
    event.preventDefault();
    var buttonClicked = event.target.id;
    getWeatherInfo(buttonClicked);
}
