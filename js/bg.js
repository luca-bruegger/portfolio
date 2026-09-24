(function () {
    var plate = document.getElementById("plate");
    if (!plate) return;
    var parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Zurich",
        hour: "numeric",
        hourCycle: "h23"
    }).formatToParts(new Date());
    var hour = 0;
    parts.forEach(function (part) {
        if (part.type === "hour") hour = Number(part.value);
    });
    var file = "images/night.jpg";
    if (hour >= 5 && hour < 10) file = "images/morning.jpg";
    else if (hour >= 10 && hour < 17) file = "images/day.jpg";
    else if (hour >= 17 && hour < 21) file = "images/evening.jpg";
    plate.src = file;
})();
