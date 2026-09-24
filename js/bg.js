(function () {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let hovering = false;

    window.addEventListener("pointermove", function (e) {
        mx = e.clientX;
        my = e.clientY;
        root.style.setProperty("--mx", mx + "px");
        root.style.setProperty("--my", my + "px");
        hovering = true;
    }, { passive: true });

    window.addEventListener("pointerleave", function () {
        hovering = false;
    });

    if (reduce) return;

    const canvas = document.getElementById("net");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let points = [];
    let raf;

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = Math.round(Math.min(48, window.innerWidth / 22));
        points = Array.from({ length: count }, function () {
            return {
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.28,
                vy: (Math.random() - 0.5) * 0.28
            };
        });
    }

    function tick() {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        const max = window.innerWidth < 640 ? 100 : 150;
        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            if (hovering) {
                const dx = mx - p.x;
                const dy = my - p.y;
                const d = Math.hypot(dx, dy) || 1;
                if (d < 240) {
                    p.vx += dx / d * 0.014;
                    p.vy += dy / d * 0.014;
                }
            }
            p.vx *= 0.992;
            p.vy *= 0.992;
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
            if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;
            const near = hovering ? Math.max(0, 1 - Math.hypot(p.x - mx, p.y - my) / 260) : 0;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.1 + near, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(243,225,196," + (0.35 + near * 0.4) + ")";
            ctx.fill();
            for (let j = i + 1; j < points.length; j++) {
                const q = points[j];
                const dist = Math.hypot(p.x - q.x, p.y - q.y);
                if (dist < max) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.strokeStyle = "rgba(232,196,140," + ((0.14 + near * 0.16) * (1 - dist / max)) + ")";
                    ctx.stroke();
                }
            }
        }
        raf = requestAnimationFrame(tick);
    }

    resize();
    tick();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", function () {
        if (document.hidden) cancelAnimationFrame(raf);
        else tick();
    });
})();
