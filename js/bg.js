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
    var l = "Guten Code. Raketen. Kaffee. Ruhig schlafen.";

    if (hour >= 5 && hour < 10) {
        time = "morning";
        g = "Guten Morgen";
        l = "Guten Code. Raketen. Erster Kaffee.";
    } else if (hour >= 10 && hour < 17) {
        time = "day";
        g = "Guten Tag";
        l = "Guten Code. Raketen. Kaffee.";
    } else if (hour >= 17 && hour < 21) {
        time = "evening";
        g = "Guten Abend";
        l = "Guten Code. Raketen. Abend in den Bergen.";
    }

    document.documentElement.setAttribute("data-time", time);

    if (plate) {
        var files = {
            morning: "images/morning.jpg?v=5",
            day: "images/day.jpg?v=5",
            evening: "images/evening.jpg?v=5",
            night: "images/night.jpg?v=5"
        };
        plate.src = files[time] || "images/day.jpg?v=5";
    }

    if (greeting) greeting.textContent = g + ", ich bin Luca.";
    if (lede) lede.textContent = l;

    var colors = { morning: "#0d1520", day: "#0a1218", evening: "#1a100c", night: "#050508" };
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = colors[time] || "#0a0a0a";
})();
