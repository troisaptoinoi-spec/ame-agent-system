/**
 * Game Module - Game Engine chính
 * Quản lý game loop, input, state và render
 */
const Game = (() => {
    // Constants
    const GRID_SIZE = 20;
    const CANVAS_SIZE = 400;
    const INITIAL_SPEED = 120; // ms per frame
    const MIN_SPEED = 60;
    const SPEED_INCREMENT = 2;

    // DOM Elements
    let canvas, ctx;
    let currentScoreEl, highScoreEl, finalScoreEl;
    let startScreen, pauseScreen, gameOverScreen;
    let newRecordEl, soundToggleBtn;

    // Game State
    let state = 'start'; // start, playing, paused, gameover
    let score = 0;
    let highScore = 0;
    let speed = INITIAL_SPEED;
    let lastTime = 0;
    let accumulator = 0;
    let animationId = null;
    let gridPattern = null;

    // Input
    let touchStartX = 0;
    let touchStartY = 0;

    function init() {
        // Get DOM elements
        canvas = document.getElementById('gameCanvas');
        ctx = canvas.getContext('2d');
        currentScoreEl = document.getElementById('currentScore');
        highScoreEl = document.getElementById('highScore');
        finalScoreEl = document.getElementById('finalScore');
        startScreen = document.getElementById('startScreen');
        pauseScreen = document.getElementById('pauseScreen');
        gameOverScreen = document.getElementById('gameOverScreen');
        newRecordEl = document.getElementById('newRecord');
        soundToggleBtn = document.getElementById('soundToggle');

        // Setup canvas
        canvas.width = CANVAS_SIZE;
        canvas.height = CANVAS_SIZE;

        // Create grid pattern
        createGridPattern();

        // Init modules
        Sound.init();
        Snake.init(GRID_SIZE, CANVAS_SIZE);
        Food.init(GRID_SIZE, CANVAS_SIZE);

        // Load high score
        highScore = Storage.getHighScore();
        highScoreEl.textContent = highScore;
        updateSoundButton();

        // Setup input
        setupKeyboard();
        setupTouch();
        setupMobileControls();
        setupSoundToggle();

        // Start render loop
        lastTime = performance.now();
        gameLoop(lastTime);
    }

    function createGridPattern() {
        const patternCanvas = document.createElement('canvas');
        patternCanvas.width = GRID_SIZE;
        patternCanvas.height = GRID_SIZE;
        const pCtx = patternCanvas.getContext('2d');

        pCtx.fillStyle = '#12122a';
        pCtx.fillRect(0, 0, GRID_SIZE, GRID_SIZE);

        pCtx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        pCtx.fillRect(0, 0, 1, 1);

        gridPattern = ctx.createPattern(patternCanvas, 'repeat');
    }

    function setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    handleDirection(0, -1);
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    handleDirection(0, 1);
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    handleDirection(-1, 0);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    handleDirection(1, 0);
                    break;
                case ' ':
                    e.preventDefault();
                    handleAction();
                    break;
                case 'p':
                case 'P':
                    e.preventDefault();
                    if (state === 'playing' || state === 'paused') togglePause();
                    break;
            }
        });
    }

    function setupTouch() {
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }, { passive: false });

        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (state === 'start' || state === 'gameover') {
                handleAction();
                return;
            }

            const touch = e.changedTouches[0];
            const dx = touch.clientX - touchStartX;
            const dy = touch.clientY - touchStartY;
            const minSwipe = 30;

            if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;

            if (Math.abs(dx) > Math.abs(dy)) {
                handleDirection(dx > 0 ? 1 : -1, 0);
            } else {
                handleDirection(0, dy > 0 ? 1 : -1);
            }
        }, { passive: false });

        // Overlay touch
        [startScreen, pauseScreen, gameOverScreen].forEach(screen => {
            screen.addEventListener('click', handleAction);
            screen.addEventListener('touchend', (e) => {
                e.preventDefault();
                handleAction();
            });
        });
    }

    function setupMobileControls() {
        const buttons = document.querySelectorAll('.control-btn');
        buttons.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const dir = btn.dataset.direction;
                switch (dir) {
                    case 'up': handleDirection(0, -1); break;
                    case 'down': handleDirection(0, 1); break;
                    case 'left': handleDirection(-1, 0); break;
                    case 'right': handleDirection(1, 0); break;
                }
            }, { passive: false });

            btn.addEventListener('click', () => {
                const dir = btn.dataset.direction;
                switch (dir) {
                    case 'up': handleDirection(0, -1); break;
                    case 'down': handleDirection(0, 1); break;
                    case 'left': handleDirection(-1, 0); break;
                    case 'right': handleDirection(1, 0); break;
                }
            });
        });
    }

    function setupSoundToggle() {
        soundToggleBtn.addEventListener('click', () => {
            Sound.toggle();
            updateSoundButton();
        });
    }

    function updateSoundButton() {
        soundToggleBtn.textContent = Sound.isEnabled() ? '🔊' : '🔇';
        soundToggleBtn.classList.toggle('muted', !Sound.isEnabled());
    }

    function handleDirection(dx, dy) {
        if (state === 'playing') {
            Snake.setDirection(dx, dy);
        }
    }

    function handleAction() {
        switch (state) {
            case 'start':
                startGame();
                break;
            case 'gameover':
                resetGame();
                break;
        }
    }

    function togglePause() {
        if (state === 'playing') {
            state = 'paused';
            pauseScreen.classList.remove('hidden');
        } else if (state === 'paused') {
            state = 'playing';
            pauseScreen.classList.add('hidden');
            lastTime = performance.now();
            accumulator = 0;
        }
    }

    function startGame() {
        state = 'playing';
        startScreen.classList.add('hidden');
        Sound.playStart();
        lastTime = performance.now();
        accumulator = 0;
    }

    function resetGame() {
        score = 0;
        speed = INITIAL_SPEED;
        currentScoreEl.textContent = '0';
        Snake.reset();
        Food.spawn(Snake.getSegments());
        Particles.clear();

        state = 'playing';
        gameOverScreen.classList.add('hidden');
        Sound.playStart();
        lastTime = performance.now();
        accumulator = 0;
    }

    function gameLoop(currentTime) {
        animationId = requestAnimationFrame(gameLoop);

        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        // Update particles always (for visual smoothness)
        Particles.update();
        Food.update();

        if (state === 'playing') {
            accumulator += deltaTime;

            while (accumulator >= speed) {
                accumulator -= speed;
                updateGame();
            }
        }

        render();
    }

    function updateGame() {
        const success = Snake.update();

        if (!success) {
            // Game Over
            onGameOver();
            return;
        }

        // Kiểm tra ăn thức ăn
        const head = Snake.getHead();
        const foodPos = Food.getPosition();

        if (head.x === foodPos.x && head.y === foodPos.y) {
            onEatFood();
        }
    }

    function onEatFood() {
        const points = Food.getPoints();
        score += points;
        Snake.grow(points);

        // Cập nhật UI
        currentScoreEl.textContent = score;
        currentScoreEl.classList.add('score-pop');
        setTimeout(() => currentScoreEl.classList.remove('score-pop'), 300);

        // Tăng tốc độ
        speed = Math.max(MIN_SPEED, speed - SPEED_INCREMENT);

        // Particles
        const head = Snake.getHead();
        const px = head.x * GRID_SIZE + GRID_SIZE / 2;
        const py = head.y * GRID_SIZE + GRID_SIZE / 2;
        Particles.emitEat(px, py);

        // Âm thanh
        Sound.playEat();

        // Spawn thức ăn mới
        Food.spawn(Snake.getSegments());
    }

    function onGameOver() {
        state = 'gameover';

        // Particles
        const head = Snake.getHead();
        const px = head.x * GRID_SIZE + GRID_SIZE / 2;
        const py = head.y * GRID_SIZE + GRID_SIZE / 2;
        Particles.emitGameOver(px, py);

        // Âm thanh
        Sound.playGameOver();

        // Kiểm tra kỷ lục
        const isNewRecord = score > highScore;
        if (isNewRecord) {
            highScore = score;
            highScoreEl.textContent = highScore;
            Storage.setHighScore(highScore);
            Sound.playNewRecord();
            newRecordEl.classList.remove('hidden');
        } else {
            newRecordEl.classList.add('hidden');
        }

        // Hiển thị game over
        finalScoreEl.textContent = score;
        setTimeout(() => {
            gameOverScreen.classList.remove('hidden');
        }, 500);
    }

    function render() {
        // Clear canvas
        ctx.fillStyle = '#12122a';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Draw grid
        if (gridPattern) {
            ctx.fillStyle = gridPattern;
            ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        }

        // Draw border glow
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.1)';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, CANVAS_SIZE - 2, CANVAS_SIZE - 2);

        // Draw game objects
        if (state !== 'start') {
            Food.draw(ctx);
            Snake.draw(ctx);
        }

        // Draw particles (on top)
        Particles.draw(ctx);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        getState: () => state,
        getScore: () => score,
        getHighScore: () => highScore
    };
})();
