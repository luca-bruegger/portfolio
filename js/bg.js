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
    var file = "images/night.jpg?v=3";
    var label = "Nacht";
    if (hour >= 5 && hour < 10) {
        file = "images/morning.jpg?v=3";
        label = "Morgen";
    } else if (hour >= 10 && hour < 17) {
        file = "images/day.jpg?v=3";
        label = "Tag";
    } else if (hour >= 17 && hour < 21) {
        file = "images/evening.jpg?v=3";
        label = "Abend";
    }
    plate.src = file;
    var phase = document.getElementById("phase");
    if (phase) phase.textContent = label;
})();
