(function () {
    var canvas = document.getElementById("scene");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var w = 0, h = 0, dpr = 1;
    var plates = [
        { name: "morning", from: 5, to: 10, src: "images/morning.jpg", water: [{ x: 0, y: 0.50, w: 0.62, h: 0.48 }] },
        { name: "day", from: 10, to: 17, src: "images/day.jpg", water: [{ x: 0.55, y: 0.46, w: 0.45, h: 0.50 }, { x: 0, y: 0.40, w: 1, h: 0.10 }] },
        { name: "evening", from: 17, to: 21, src: "images/evening.jpg", water: [{ x: 0.42, y: 0.50, w: 0.58, h: 0.46 }] },
        { name: "night", from: 21, to: 29, src: "images/night.jpg", water: [{ x: 0, y: 0.58, w: 1, h: 0.12 }, { x: 0.62, y: 0.70, w: 0.38, h: 0.28 }] }
    ];
    var birds = [
        { s: 0.035, y: 0.12, p: 0.4, scale: 0.7 },
        { s: 0.022, y: 0.18, p: 1.7, scale: 1 },
        { s: 0.028, y: 0.22, p: 2.8, scale: 0.55 },
        { s: 0.018, y: 0.09, p: 4.1, scale: 0.85 }
    ];
    var buffers = {};
    var ready = {};

    function hourNow() {
        var parts = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Europe/Zurich", hour: "numeric", minute: "numeric", hourCycle: "h23"
        }).formatToParts(new Date());
        var hour = 0, minute = 0;
        parts.forEach(function (part) {
            if (part.type === "hour") hour = Number(part.value);
            if (part.type === "minute") minute = Number(part.value);
        });
        return hour + minute / 60;
    }

    function plateFor(hour) {
        var h = hour >= 21 || hour < 5 ? hour + (hour < 5 ? 24 : 0) : hour;
        for (var i = 0; i < plates.length; i++) {
            if (h >= plates[i].from && h < plates[i].to) return plates[i];
        }
        return plates[1];
    }

    plates.forEach(function (plate) {
        var img = new Image();
        img.onload = function () { ready[plate.name] = img; };
        img.src = plate.src;
    });

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = Math.max(1, w * dpr);
        canvas.height = Math.max(1, h * dpr);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        buffers = {};
    }

    function cover(img) {
        var key = img.src + ":" + w + "x" + h;
        if (buffers[key]) return buffers[key];
        var buffer = document.createElement("canvas");
        buffer.width = w;
        buffer.height = h;
        var bctx = buffer.getContext("2d");
        var ir = img.width / img.height;
        var cr = w / h;
        var dw = w, dh = h, dx = 0, dy = 0;
        if (ir > cr) {
            dh = h;
            dw = h * ir;
            dx = (w - dw) / 2;
        } else {
            dw = w;
            dh = w / ir;
            dy = (h - dh) / 2;
        }
        bctx.drawImage(img, dx, dy, dw, dh);
        buffers[key] = buffer;
        return buffer;
    }

    function bird(x, y, flap, scale) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.beginPath();
        ctx.moveTo(-14, 0);
        ctx.quadraticCurveTo(-7, -8 * flap, 0, 0);
        ctx.quadraticCurveTo(7, -8 * flap, 14, 0);
        ctx.stroke();
        ctx.restore();
    }

    function starship(x, y, t, night) {
        ctx.save();
        ctx.translate(x, y);
        var body = ctx.createLinearGradient(-8, 0, 8, 0);
        body.addColorStop(0, "#b7bec6");
        body.addColorStop(0.45, "#f4f7fa");
        body.addColorStop(1, "#8e979f");
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.moveTo(0, -34);
        ctx.lineTo(7, -8);
        ctx.lineTo(7, 16);
        ctx.lineTo(-7, 16);
        ctx.lineTo(-7, -8);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#d5dbe1";
        ctx.beginPath();
        ctx.moveTo(-11, 4);
        ctx.lineTo(-7, -2);
        ctx.lineTo(-7, 12);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(11, 4);
        ctx.lineTo(7, -2);
        ctx.lineTo(7, 12);
        ctx.closePath();
        ctx.fill();
        var glow = 0.35 + 0.25 * Math.sin(t * 11);
        var flame = ctx.createLinearGradient(0, 16, 0, 36);
        flame.addColorStop(0, night ? "rgba(255,186,120," + (glow + 0.3) + ")" : "rgba(255,214,170," + glow + ")");
        flame.addColorStop(1, "rgba(255,120,40,0)");
        ctx.fillStyle = flame;
        ctx.beginPath();
        ctx.moveTo(-3, 16);
        ctx.lineTo(3, 16);
        ctx.lineTo(0, 34 + Math.sin(t * 17) * 3);
        ctx.fill();
        ctx.restore();
    }

    function frame(now) {
        var t = reduce ? 0 : now / 1000;
        var plate = plateFor(hourNow());
        var img = ready[plate.name];
        ctx.clearRect(0, 0, w, h);
        if (!img) {
            ctx.fillStyle = "#102033";
            ctx.fillRect(0, 0, w, h);
            if (!reduce) requestAnimationFrame(frame);
            return;
        }
        var buffer = cover(img);
        ctx.drawImage(buffer, 0, 0);
        if (!reduce) {
            plate.water.forEach(function (zone) {
                var x0 = Math.round(zone.x * w);
                var y0 = Math.round(zone.y * h);
                var rw = Math.round(zone.w * w);
                var rh = Math.round(zone.h * h);
                for (var y = 0; y < rh; y += 2) {
                    var shift = Math.sin(y * 0.09 + t * 1.15 + zone.x * 4) * 2.4;
                    ctx.drawImage(buffer, x0, y0 + y, rw, 2, x0 + shift, y0 + y, rw, 2);
                }
            });
        }
        var night = plate.name === "night";
        ctx.strokeStyle = night ? "rgba(226,232,240,0.75)" : "rgba(28,34,40,0.72)";
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        birds.forEach(function (b) {
            var x = ((t * b.s * w + b.p * 240) % (w + 100)) - 50;
            var y = h * b.y + Math.sin(t * 0.7 + b.p) * 10;
            var flap = 0.35 + 0.65 * Math.abs(Math.sin(t * 2.4 + b.p));
            bird(x, y, flap, b.scale);
        });
        starship(w * 0.62, h * 0.11 + Math.sin(t * 0.4) * 5, t, night);
        if (!reduce) requestAnimationFrame(frame);
    }

    resize();
    requestAnimationFrame(frame);
    if (reduce) frame(0);
    window.addEventListener("resize", resize);
})();
