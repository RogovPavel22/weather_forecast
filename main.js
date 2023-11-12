const apiKey = '006ca0d8f09045df85a205653230711';

// Находим DOM элементы
const searchCity = document.querySelector('.search-city');
const cityAdd = document.querySelector('.search-city__add');
const cardNameCity = document.querySelector('.weather-card__head-city');
const cardTempCity = document.querySelector('.weather-card__info-temp-item');
const cardIconWeather = document.querySelector('.weather-card__info-img-item');
const cardHumidity = document.getElementById('Humidity');
const cardVisiblity = document.getElementById('Visiblity');
const cardPressure = document.getElementById('Pressure');
const cardWind = document.getElementById('Wind');
const time = document.querySelector('.header__time');
const cardDate = document.querySelector('.weather-card__head-date');
const cardWeaterDescr = document.querySelector('.weather-card__descr-weater');
const forecastWrapper = document.querySelector('.forecast');

// Создаю объект с даннным которые нужны будут для html
let weatherData = {
    name: "",
    temp: 0,
    icon: '',
    dayNight: 0,
    humidity: 0,
    visiblity: 0,
    pressure: 0,
    wind: 0,
    time: 0,
    date: '',
    text: '',
    forecastday: []
}

// Получаем геопозицию пользователя, если данные отсутствуют, то по умолчанию будет город Москва
let city = 'Москва';

const getPosition = function() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
};

await getPosition().then(pos => city = `${pos.coords.latitude},${pos.coords.longitude}`)
                   .catch(e => alert("Данные геопозиции не установлены, по умолчанию город Москва"));

await getWeather();


// Слушаем событие submit, меняем переменную city на тот город который указал пользователь 
searchCity.addEventListener('submit', async (e) => {
    e.preventDefault();
    city = cityAdd.value;

    await getWeather();

    cityAdd.value = '';
})


async function getWeather() {

    // Запрашиваем данные с сервера
    const URL = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&lang=ru&days=2&q=${city}`;
    const response = await fetch(URL);
    const data = await response.json();
    console.log(data)

    // Если пользователь ввел некорректное название города
    if (data.error) {
        document.querySelector('.search-city__wrapper').classList.add('error');
    } else {
        document.querySelector('.search-city__wrapper').classList.remove('error')
    };

    // Присваиваю значения необходимых данных в изнчальный объект
    const {
        current: {temp_c: temp, is_day: dayNight, humidity, vis_km: visiblity, pressure_mb: pressure, wind_kph: wind, last_updated, condition: {icon, text}},
        location: {name}, 
        forecast: {forecastday}
    } = data;

    weatherData = {
        name,
        temp,
        icon,
        dayNight,
        humidity,
        visiblity,
        pressure,
        wind,
        time: last_updated.split(' ')[1],
        date: last_updated.split(' ')[0],
        text,
        forecastday,
    }

    addWeatherHtml()
}

function addWeatherHtml() {
    // вносим в html данные о городе и погодных условиях
    cardNameCity.textContent = weatherData.name;
    cardTempCity.textContent = `${weatherData.temp}°C`;
    cardHumidity.textContent = `${weatherData.humidity}%`;
    cardVisiblity.textContent = `${weatherData.visiblity}км`;
    cardPressure.textContent = `${Math.floor(weatherData.pressure * 0.75)}мм.рт.ст`;
    cardWind.textContent = `${(weatherData.wind / 3.6).toFixed(1)}м/с`;
    time.textContent = weatherData.time;
    cardWeaterDescr.textContent = weatherData.text;

    // устанавливаем дату
    let date = new Date(weatherData.date)
    let options = {
        month: 'long',
        day: 'numeric',
        weekday: 'long',
    };
    cardDate.textContent = date.toLocaleString('ru', options);
    
    // определяем и устанавливаем иконку погоды
    let iconNumber = weatherData.icon.split('/').pop();
    let day = 'day'
    weatherData.dayNight == 0 ? day = 'night' : day = day;
    cardIconWeather.src = `./img/weather_icon/${day}/${iconNumber}`;

    // Создаем карточки прогноза погоды
    let indexTime = +weatherData.time.split(':')[0]
    let nextDay = 0
    forecastWrapper.innerHTML = '';

    // Так как необходимо 7 карочек с шагом в 2 часа, использую цикл
    for (let i = indexTime; i < indexTime + 14; i += 2) {
        let forecastHour = weatherData.forecastday[0].hour[i]
        
        if (!weatherData.forecastday[0].hour[i]) {
            forecastHour = weatherData.forecastday[1].hour[nextDay]
            nextDay += 2
        }
        
        forecastWrapper.insertAdjacentHTML("beforeend", `<div class="forecast__card">
                                                            <p class="forecast__card-time">${forecastHour.time.split(' ')[1]}</p>
                                                            <img class="forecast__card-img" src="./img/weather_icon/${day}/${forecastHour.condition.icon.split('/').pop()}" alt="weather">
                                                            <p class="forecast__card-temp">${forecastHour.temp_c}°</p>
                                                        </div>`)
    }
}
