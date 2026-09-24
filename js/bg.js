(function () {
    var canvas = document.getElementById("scene");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var w = 0, h = 0, dpr = 1;

    function zurichHour() {
        var parts = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Europe/Zurich",
            hour: "numeric",
            minute: "numeric",
            hourCycle: "h23"
        }).formatToParts(new Date());
        var hour = 0, minute = 0;
        parts.forEach(function (p) {
            if (p.type === "hour") hour = Number(p.value);
            if (p.type === "minute") minute = Number(p.value);
        });
        return hour + minute / 60;
    }

    function mix(a, b, t) {
        return a + (b - a) * t;
    }
    function hex(r, g, b) {
        return "rgb(" + (r | 0) + "," + (g | 0) + "," + (b | 0) + ")";
    }
    function lerpColor(a, b, t) {
        return [
            mix(a[0], b[0], t),
            mix(a[1], b[1], t),
            mix(a[2], b[2], t)
        ];
    }

    var stops = [
        { h: 0, sky: [8, 12, 28], horizon: [28, 42, 74], water: [10, 22, 40], land: [16, 22, 34] },
        { h: 5, sky: [92, 118, 158], horizon: [242, 196, 164], water: [92, 124, 150], land: [78, 96, 118] },
        { h: 10, sky: [110, 176, 214], horizon: [214, 232, 242], water: [58, 132, 176], land: [96, 122, 138] },
        { h: 17, sky: [48, 72, 118], horizon: [228, 150, 96], water: [92, 86, 104], land: [58, 66, 84] },
        { h: 21, sky: [8, 12, 28], horizon: [28, 42, 74], water: [10, 22, 40], land: [16, 22, 34] },
        { h: 24, sky: [8, 12, 28], horizon: [28, 42, 74], water: [10, 22, 40], land: [16, 22, 34] }
    ];

    function palette(hour) {
        var i = 0;
        while (i < stops.length - 1 && hour >= stops[i + 1].h) i++;
        var a = stops[i], b = stops[Math.min(i + 1, stops.length - 1)];
        var t = (hour - a.h) / (b.h - a.h || 1);
        return {
            sky: lerpColor(a.sky, b.sky, t),
            horizon: lerpColor(a.horizon, b.horizon, t),
            water: lerpColor(a.water, b.water, t),
            land: lerpColor(a.land, b.land, t),
            night: hour < 5 || hour >= 21
        };
    }

    var birds = [
        { s: 0.018, y: 0.18, p: 0.2, a: 18 },
        { s: 0.012, y: 0.24, p: 1.4, a: 12 },
        { s: 0.022, y: 0.14, p: 2.2, a: 16 },
        { s: 0.015, y: 0.30, p: 3.1, a: 10 }
    ];

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function mountain(color, peaks, base) {
        ctx.beginPath();
        ctx.moveTo(0, h * base);
        peaks.forEach(function (pk) { ctx.lineTo(w * pk[0], h * pk[1]); });
        ctx.lineTo(w, h * base);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }

    function bird(x, y, flap) {
        ctx.beginPath();
        ctx.moveTo(x - 10, y);
        ctx.quadraticCurveTo(x - 4, y - 6 * flap, x, y);
        ctx.quadraticCurveTo(x + 4, y - 6 * flap, x + 10, y);
        ctx.stroke();
    }

    function person(x, y, t) {
        var breath = Math.sin(t * 1.3) * 1.4;
        ctx.save();
        ctx.translate(x, y + breath);
        ctx.fillStyle = "#6b4a32";
        roundRect(-46, 18, 14, 46, 3);
        roundRect(34, 18, 14, 46, 3);
        ctx.fillStyle = "#8d6244";
        roundRect(-78, 36, 156, 12, 3);
        ctx.fillStyle = "#c4a882";
        roundRect(-34, 8, 70, 46, 10);
        ctx.fillStyle = "#f0c9a0";
        ctx.beginPath();
        ctx.arc(2, -18, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#6b4428";
        ctx.beginPath();
        ctx.arc(2, -24, 22, Math.PI, 0);
        ctx.fill();
        var blink = Math.sin(t * 0.7) > 0.97 ? 0.2 : 1;
        ctx.fillStyle = "#3a2a22";
        ctx.beginPath();
        ctx.ellipse(-7, -18, 2.1, 2.4 * blink, 0, 0, Math.PI * 2);
        ctx.ellipse(8, -18, 2.1, 2.4 * blink, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#a87858";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(1, -12, 5, 0.2, Math.PI - 0.2);
        ctx.stroke();
        ctx.fillStyle = "#d7dde3";
        ctx.beginPath();
        ctx.moveTo(28, 18);
        ctx.lineTo(78, -8);
        ctx.lineTo(86, 8);
        ctx.lineTo(36, 30);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#b7c0c8";
        roundRect(24, 28, 58, 8, 2);
        ctx.fillStyle = "#f4f1ea";
        ctx.beginPath();
        ctx.ellipse(-40, 24, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.55)";
        ctx.lineWidth = 1.2;
        var steam = (t * 18) % 26;
        ctx.beginPath();
        ctx.moveTo(-40, 16 - steam);
        ctx.quadraticCurveTo(-34, 8 - steam, -40, 0 - steam);
        ctx.stroke();
        ctx.restore();
    }

    function roundRect(x, y, rw, rh, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + rw, y, x + rw, y + rh, r);
        ctx.arcTo(x + rw, y + rh, x, y + rh, r);
        ctx.arcTo(x, y + rh, x, y, r);
        ctx.arcTo(x, y, x + rw, y, r);
        ctx.closePath();
        ctx.fill();
    }

    function frame(now) {
        var t = reduce ? 0 : now / 1000;
        var hour = zurichHour();
        var pal = palette(hour);
        var g = ctx.createLinearGradient(0, 0, 0, h * 0.62);
        g.addColorStop(0, hex(pal.sky[0], pal.sky[1], pal.sky[2]));
        g.addColorStop(1, hex(pal.horizon[0], pal.horizon[1], pal.horizon[2]));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);

        if (pal.night) {
            ctx.fillStyle = "rgba(255,255,255,0.8)";
            for (var i = 0; i < 40; i++) {
                var sx = (i * 97) % w;
                var sy = (i * 53) % (h * 0.42);
                var tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 1.5 + i));
                ctx.globalAlpha = tw;
                ctx.fillRect(sx, sy, 1.4, 1.4);
            }
            ctx.globalAlpha = 1;
        }

        var sunX = w * (0.12 + (hour / 24) * 0.76);
        var sunY = h * (0.42 - Math.sin((hour / 24) * Math.PI) * 0.28);
        var glow = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, 70);
        glow.addColorStop(0, pal.night ? "rgba(232,236,245,0.95)" : "rgba(255,244,220,0.95)");
        glow.addColorStop(1, "rgba(255,244,220,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 70, 0, Math.PI * 2);
        ctx.fill();

        var land = hex(pal.land[0], pal.land[1], pal.land[2]);
        mountain(land, [[0, 0.50], [0.16, 0.36], [0.28, 0.46], [0.42, 0.30], [0.58, 0.44], [0.74, 0.32], [0.88, 0.42], [1, 0.36]], 0.58);
        ctx.globalAlpha = 0.72;
        mountain(land, [[0, 0.56], [0.2, 0.46], [0.38, 0.54], [0.55, 0.42], [0.72, 0.52], [0.9, 0.44], [1, 0.52]], 0.62);
        ctx.globalAlpha = 1;

        var shipX = w * 0.72;
        var shipY = h * 0.16 + Math.sin(t * 0.35) * 6;
        ctx.fillStyle = "#e7ebef";
        ctx.beginPath();
        ctx.moveTo(shipX, shipY - 26);
        ctx.lineTo(shipX + 7, shipY + 10);
        ctx.lineTo(shipX - 7, shipY + 10);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(shipX - 10, shipY + 6, 20, 4);
        var flame = ctx.createLinearGradient(shipX, shipY + 12, shipX, shipY + 28);
        flame.addColorStop(0, "rgba(255,176,92," + (0.45 + 0.35 * Math.sin(t * 14)) + ")");
        flame.addColorStop(1, "rgba(255,120,40,0)");
        ctx.fillStyle = flame;
        ctx.beginPath();
        ctx.moveTo(shipX - 3, shipY + 12);
        ctx.lineTo(shipX + 3, shipY + 12);
        ctx.lineTo(shipX, shipY + 30);
        ctx.fill();

        ctx.strokeStyle = "rgba(40,40,40,0.75)";
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        birds.forEach(function (b) {
            var x = ((t * b.s * w + b.p * 200) % (w + 80)) - 40;
            var y = h * b.y + Math.sin(t * 0.8 + b.p) * b.a;
            var flap = 0.4 + 0.6 * Math.abs(Math.sin(t * 3 + b.p));
            bird(x, y, flap);
        });

        var waterTop = h * 0.58;
        var wg = ctx.createLinearGradient(0, waterTop, 0, h);
        wg.addColorStop(0, hex(pal.water[0], pal.water[1], pal.water[2]));
        wg.addColorStop(1, hex(pal.water[0] * 0.55, pal.water[1] * 0.6, pal.water[2] * 0.7));
        ctx.fillStyle = wg;
        ctx.fillRect(0, waterTop, w, h - waterTop);
        ctx.strokeStyle = "rgba(255,255,255,0.18)";
        ctx.lineWidth = 1.2;
        for (var k = 0; k < 5; k++) {
            ctx.beginPath();
            for (var x = 0; x <= w; x += 8) {
                var y = waterTop + 18 + k * 16 + Math.sin(x * 0.02 + t * 0.8 + k) * 3;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        person(w * 0.78, h * 0.62, t);
        if (!reduce) requestAnimationFrame(frame);
    }

    resize();
    requestAnimationFrame(frame);
    if (reduce) frame(0);
    window.addEventListener("resize", resize);
})();
