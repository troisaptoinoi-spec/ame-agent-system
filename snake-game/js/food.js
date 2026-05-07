/**
 * Food Module - Logic thức ăn
 */
const Food = (() => {
    let position = { x: 0, y: 0 };
    let gridSize = 20;
    let canvasSize = 400;
    let pulsePhase = 0;
    let type = 'normal'; // normal, bonus

    function init(grid, canvas) {
        gridSize = grid;
        canvasSize = canvas;
    }

    function spawn(snakeSegments) {
        const maxCells = canvasSize / gridSize;
        let newPos;
        let onSnake;

        do {
            onSnake = false;
            newPos = {
                x: Math.floor(Math.random() * maxCells),
                y: Math.floor(Math.random() * maxCells)
            };

            for (const seg of snakeSegments) {
                if (seg.x === newPos.x && seg.y === newPos.y) {
                    onSnake = true;
                    break;
                }
            }
        } while (onSnake);

        position = newPos;
        pulsePhase = 0;

        // 20% cơ hội là thức ăn bonus
        type = Math.random() < 0.2 ? 'bonus' : 'normal';
    }

    function getPosition() {
        return position;
    }

    function getType() {
        return type;
    }

    function getPoints() {
        return type === 'bonus' ? 3 : 1;
    }

    function update() {
        pulsePhase += 0.08;
    }

    function draw(ctx) {
        const cellSize = gridSize - 2;
        const x = position.x * gridSize + 1;
        const y = position.y * gridSize + 1;
        const centerX = x + cellSize / 2;
        const centerY = y + cellSize / 2;

        // Hiệu ứng pulse
        const pulse = Math.sin(pulsePhase) * 0.15 + 1;
        const glowSize = cellSize * pulse;

        ctx.save();

        if (type === 'bonus') {
            // Bonus food - màu vàng gold với glow
            const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowSize * 1.2);
            glow.addColorStop(0, 'rgba(255, 215, 0, 0.4)');
            glow.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(centerX, centerY, glowSize * 1.2, 0, Math.PI * 2);
            ctx.fill();

            // Thân bonus
            const gradient = ctx.createRadialGradient(centerX - 2, centerY - 2, 0, centerX, centerY, cellSize / 2);
            gradient.addColorStop(0, '#ffe066');
            gradient.addColorStop(0.6, '#ffd700');
            gradient.addColorStop(1, '#ffaa00');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, cellSize / 2 * pulse, 0, Math.PI * 2);
            ctx.fill();

            // Ngôi sao nhỏ
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.6 + Math.sin(pulsePhase * 2) * 0.3;
            ctx.font = `${cellSize * 0.5}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⭐', centerX, centerY);
        } else {
            // Normal food - màu đỏ với glow
            const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowSize);
            glow.addColorStop(0, 'rgba(255, 107, 107, 0.3)');
            glow.addColorStop(1, 'rgba(255, 107, 107, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(centerX, centerY, glowSize, 0, Math.PI * 2);
            ctx.fill();

            // Thân thức ăn
            const gradient = ctx.createRadialGradient(centerX - 2, centerY - 2, 0, centerX, centerY, cellSize / 2);
            gradient.addColorStop(0, '#ff8e8e');
            gradient.addColorStop(0.6, '#ff6b6b');
            gradient.addColorStop(1, '#ff4757');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, cellSize / 2 * pulse, 0, Math.PI * 2);
            ctx.fill();

            // Highlight nhỏ
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(centerX - cellSize * 0.15, centerY - cellSize * 0.15, cellSize * 0.12, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    return {
        init,
        spawn,
        getPosition,
        getType,
        getPoints,
        update,
        draw
    };
})();
