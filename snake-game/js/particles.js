/**
 * Particles Module - Hiệu ứng hạt khi ăn thức ăn và game over
 */
const Particles = (() => {
    let particles = [];

    class Particle {
        constructor(x, y, color, options = {}) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.size = options.size || (Math.random() * 4 + 2);
            this.speedX = options.speedX || (Math.random() - 0.5) * 8;
            this.speedY = options.speedY || (Math.random() - 0.5) * 8;
            this.life = 1.0;
            this.decay = options.decay || (Math.random() * 0.02 + 0.02);
            this.gravity = options.gravity || 0.05;
            this.shape = options.shape || 'circle'; // circle, square, star
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.speedY += this.gravity;
            this.speedX *= 0.98;
            this.life -= this.decay;
            this.size *= 0.98;
        }

        draw(ctx) {
            if (this.life <= 0) return;

            ctx.save();
            ctx.globalAlpha = this.life;
            ctx.fillStyle = this.color;

            if (this.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.shape === 'square') {
                ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
            } else if (this.shape === 'star') {
                this.drawStar(ctx, this.x, this.y, 5, this.size, this.size / 2);
            }

            ctx.restore();
        }

        drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
            let rot = Math.PI / 2 * 3;
            let step = Math.PI / spikes;

            ctx.beginPath();
            ctx.moveTo(cx, cy - outerRadius);

            for (let i = 0; i < spikes; i++) {
                ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
                rot += step;
                ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
                rot += step;
            }

            ctx.lineTo(cx, cy - outerRadius);
            ctx.closePath();
            ctx.fill();
        }

        isDead() {
            return this.life <= 0;
        }
    }

    function emit(x, y, color, count = 12, options = {}) {
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(x, y, color, options));
        }
    }

    function emitEat(x, y) {
        // Particles khi ăn thức ăn
        const colors = ['#ff6b6b', '#ff8e8e', '#ffa8a8', '#ffd700', '#ff4757'];
        for (let i = 0; i < 15; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            particles.push(new Particle(x, y, color, {
                speedX: (Math.random() - 0.5) * 10,
                speedY: (Math.random() - 0.5) * 10,
                size: Math.random() * 5 + 2,
                decay: Math.random() * 0.02 + 0.015,
                gravity: 0.08,
                shape: Math.random() > 0.5 ? 'circle' : 'star'
            }));
        }
    }

    function emitGameOver(x, y) {
        // Particles khi game over
        const colors = ['#ff4757', '#ff6b6b', '#a855f7', '#6c5ce7', '#ffffff'];
        for (let i = 0; i < 40; i++) {
            const angle = (Math.PI * 2 / 40) * i;
            const speed = Math.random() * 6 + 2;
            const color = colors[Math.floor(Math.random() * colors.length)];
            particles.push(new Particle(x, y, color, {
                speedX: Math.cos(angle) * speed,
                speedY: Math.sin(angle) * speed,
                size: Math.random() * 4 + 1,
                decay: Math.random() * 0.015 + 0.01,
                gravity: 0.03,
                shape: 'circle'
            }));
        }
    }

    function emitTrail(x, y, color) {
        // Particles nhỏ khi rắn di chuyển
        if (Math.random() > 0.3) return; // Chỉ 30% cơ hội tạo particle
        particles.push(new Particle(x, y, color, {
            speedX: (Math.random() - 0.5) * 1,
            speedY: (Math.random() - 0.5) * 1,
            size: Math.random() * 2 + 0.5,
            decay: 0.05,
            gravity: 0
        }));
    }

    function update() {
        particles = particles.filter(p => !p.isDead());
        particles.forEach(p => p.update());
    }

    function draw(ctx) {
        particles.forEach(p => p.draw(ctx));
    }

    function clear() {
        particles = [];
    }

    function count() {
        return particles.length;
    }

    return {
        emit,
        emitEat,
        emitGameOver,
        emitTrail,
        update,
        draw,
        clear,
        count
    };
})();
