/**
 * Snake Module - Logic con rắn
 */
const Snake = (() => {
    let segments = [];
    let direction = { x: 1, y: 0 };
    let nextDirection = { x: 1, y: 0 };
    let gridSize = 20;
    let canvasSize = 400;
    let growing = 0;
    let alive = true;

    function init(grid, canvas) {
        gridSize = grid;
        canvasSize = canvas;
        reset();
    }

    function reset() {
        const centerX = Math.floor(canvasSize / gridSize / 2);
        const centerY = Math.floor(canvasSize / gridSize / 2);
        segments = [
            { x: centerX, y: centerY },
            { x: centerX - 1, y: centerY },
            { x: centerX - 2, y: centerY }
        ];
        direction = { x: 1, y: 0 };
        nextDirection = { x: 1, y: 0 };
        growing = 0;
        alive = true;
    }

    function setDirection(dx, dy) {
        // Ngăn đi ngược chiều
        if (direction.x === -dx && direction.y === -dy) return;
        if (dx === 0 && dy === 0) return;
        nextDirection = { x: dx, y: dy };
    }

    function update() {
        if (!alive) return false;

        direction = { ...nextDirection };
        const head = segments[0];
        const newHead = {
            x: head.x + direction.x,
            y: head.y + direction.y
        };

        // Kiểm tra va chạm tường
        const maxCells = canvasSize / gridSize;
        if (newHead.x < 0 || newHead.x >= maxCells || newHead.y < 0 || newHead.y >= maxCells) {
            alive = false;
            return false;
        }

        // Kiểm tra va chạm thân
        for (let i = 0; i < segments.length; i++) {
            if (segments[i].x === newHead.x && segments[i].y === newHead.y) {
                alive = false;
                return false;
            }
        }

        segments.unshift(newHead);

        if (growing > 0) {
            growing--;
        } else {
            segments.pop();
        }

        return true;
    }

    function grow(amount = 1) {
        growing += amount;
    }

    function getHead() {
        return segments[0];
    }

    function getSegments() {
        return segments;
    }

    function getDirection() {
        return direction;
    }

    function isAlive() {
        return alive;
    }

    function getLength() {
        return segments.length;
    }

    function draw(ctx) {
        const cellSize = gridSize - 2; // Giảm 2px để có khoảng cách

        segments.forEach((seg, index) => {
            const x = seg.x * gridSize + 1;
            const y = seg.y * gridSize + 1;

            if (index === 0) {
                // Đầu rắn - gradient sáng hơn
                const gradient = ctx.createRadialGradient(
                    x + cellSize / 2, y + cellSize / 2, 0,
                    x + cellSize / 2, y + cellSize / 2, cellSize
                );
                gradient.addColorStop(0, '#00ffcc');
                gradient.addColorStop(1, '#00ff88');
                ctx.fillStyle = gradient;

                // Vẽ đầu tròn hơn
                ctx.beginPath();
                ctx.roundRect(x, y, cellSize, cellSize, 6);
                ctx.fill();

                // Mắt rắn
                drawEyes(ctx, x, y, cellSize);
            } else {
                // Thân rắn - gradient từ sáng đến tối
                const ratio = index / segments.length;
                const r = Math.floor(0 + ratio * 0);
                const g = Math.floor(255 - ratio * 80);
                const b = Math.floor(136 - ratio * 50);
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

                ctx.beginPath();
                ctx.roundRect(x, y, cellSize, cellSize, 4);
                ctx.fill();
            }
        });
    }

    function drawEyes(ctx, x, y, size) {
        const eyeSize = size * 0.2;
        const eyeOffset = size * 0.25;

        ctx.fillStyle = '#ffffff';

        // Mắt trái
        let ex, ey;
        if (direction.x === 1) { // Phải
            ex = x + size - eyeOffset - eyeSize;
            ey = y + eyeOffset;
        } else if (direction.x === -1) { // Trái
            ex = x + eyeOffset;
            ey = y + eyeOffset;
        } else if (direction.y === -1) { // Lên
            ex = x + eyeOffset;
            ey = y + eyeOffset;
        } else { // Xuống
            ex = x + eyeOffset;
            ey = y + size - eyeOffset - eyeSize;
        }

        ctx.beginPath();
        ctx.arc(ex + eyeSize / 2, ey + eyeSize / 2, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Con ngươi
        ctx.fillStyle = '#0a0a1a';
        ctx.beginPath();
        ctx.arc(ex + eyeSize / 2, ey + eyeSize / 2, eyeSize * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Mắt phải
        if (direction.x === 1 || direction.x === -1) {
            ey = y + size - eyeOffset - eyeSize;
        } else {
            ex = x + size - eyeOffset - eyeSize;
        }

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ex + eyeSize / 2, ey + eyeSize / 2, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0a0a1a';
        ctx.beginPath();
        ctx.arc(ex + eyeSize / 2, ey + eyeSize / 2, eyeSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }

    return {
        init,
        reset,
        setDirection,
        update,
        grow,
        getHead,
        getSegments,
        getDirection,
        isAlive,
        getLength,
        draw
    };
})();
