(function () {
    var plate = document.getElementById("plate");
    var greeting = document.getElementById("greeting");
    var lede = document.getElementById("lede");

    var parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Zurich",
        hour: "numeric",
        hourCycle: "h23"
    }).formatToParts(new Date());
    var hour = 0;
    parts.forEach(function (part) {
        if (part.type === "hour") hour = Number(part.value);
    });

    var time = "night";
    var g = "Gute Nacht";
    var l = "Ich mag guten Code, Raketen und Kaffee. Schlaf gut.";

    if (hour >= 5 && hour < 10) {
        time = "morning";
        g = "Guten Morgen";
        l = "Ich mag guten Code, Raketen und den ersten Kaffee des Tages.";
    } else if (hour >= 10 && hour < 17) {
        time = "day";
        g = "Guten Tag";
        l = "Ich mag guten Code, Raketen und Kaffee. Willkommen.";
    } else if (hour >= 17 && hour < 21) {
        time = "evening";
        g = "Guten Abend";
        l = "Ich mag guten Code, Raketen und den Abend in den Bergen.";
    }

    if (plate) {
        var files = {
            morning: "images/morning.jpg?v=4",
            day: "images/day.jpg?v=4",
            evening: "images/evening.jpg?v=4",
            night: "images/night.jpg?v=4"
        };
        plate.src = files[time] || "images/day.jpg?v=4";
    }

    if (greeting) greeting.textContent = g + ", ich bin Luca.";
    if (lede) lede.textContent = l;

    document.documentElement.setAttribute("data-time", time);
})();
