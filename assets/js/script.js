var API_KEY = "8b8287d16134fee6a692daeb7d339a3f"

$("#search-form").on("submit", function (event) {
    event.preventDefault();
    var searchInput = $("#form1").val();

    searchWeather(searchInput);
});

$("#search-button").on("click", function (event) {
    event.preventDefault();
    var searchInput = $("#form1").val();

    searchWeather(searchInput);
});

function searchWeather(searchInput) {
    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchInput + "&appid=" + API_KEY + "&units=imperial",
        method: "GET"
    }).then(function (apiResponse) {
        console.log("todayForecastData", apiResponse);

        $("#today-weather").empty();

        if (searchHistory) {
            searchHistory.push(searchInput);
            window.localStorage.setItem("searchhistory", JSON.stringify(searchHistory));
            makeListItem(searchInput);
        }

        var city = $("<h4>").text(apiResponse.name + " (" + new Date().toLocaleDateString() + ")");
        var weatherCard = $("<div>").addClass("today-weather-card"); // use this to style card (Flexbox)
        var temperature = $("<div>").addClass("today-weather-stats").text("Temp: " + apiResponse.main.temp + "\u00B0F");
        var humidity = $("<div>").addClass("today-weather-stats").text("Humidity: " + apiResponse.main.humidity + "%");

        $("#today-weather").append(city, temperature, humidity)
        searchForecast(searchInput);
        searchUvIndex(apiResponse.coord.lat, apiResponse.coord.lon)

    })
}

function searchForecast(searchInput) {
    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searchInput + "&appid=" + API_KEY + "&units=imperial",
        method: "GET"
    }).then(function (data) {
        console.log("forecastData", data);

        $("#forecast").empty();

        for (var i = 0; i < data.list.length; i++) {
            if (data.list[i].dt_txt.indexOf("09:00:00") !== -1) {
                var cardCity = $("<h5>").text(data.city.name + " | " + new Date(data.list[i].dt_txt));
                var forecastTemp = $("<p>").text(data.list[i].main.temp + "\u00B0F");
                var forecastHumidity = $("<p>").text(data.list[i].main.humidity + "%");

                $("#forecast").append(cardCity, forecastTemp, forecastHumidity);
            }
        }
    })
}

function searchUvIndex(latitude, longitude) {
    $.ajax({
        url: 'https://api.openweathermap.org/data/2.5/onecall?lat=' + latitude + '&lon=' + longitude + '&exclude=hourly,daily&appid=' + API_KEY + '&units=imperial',
        method: "GET"
    }).then(function (uvResponse) {
        console.log("todayUvIndex", uvResponse);

        var uvCard = $("<h5>").text("UV Index: ");
        var uvStatus = $("<div>").addClass("btn btn-md").text(uvResponse.current.uvi)

        if (uvResponse.current.uvi <= 3) {
            uvStatus.addClass("safe");
        } else if (uvResponse.current.uvi < 7 && uvResponse.current.uvi > 3) {
            uvStatus.addClass("questionable");
        } else {
            uvStatus.addClass("dangerous");
        }

        $("#today-weather").append(uvStatus.append(uvCard));
    });
}

var searchHistory = JSON.parse(window.localStorage.getItem("searchhistory")) || [];

function makeListItem(city) {
    var listItem = $("<li>").text(city);
    $(".search-history").append(listItem);
}

$(".search-history").on("click", "li", function () {
    searchWeather($(this).text())
})

for (var i = 0; i < searchHistory.length; i++) {
    makeListItem(searchHistory[i]);
}