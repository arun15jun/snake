const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score-val');
const bestEl = document.getElementById('best-val');
const startBtn = document.getElementById('start-btn');
const startScreen = document.getElementById('start-screen');

// Game constants
const GRID_SIZE = 20;
let TILE_COUNT;
let TILE_SIZE;

// Game state
let snake = [];
let food = { x: 5, y: 5 };
let dx = 0;
let dy = 0;
let nextDx = 0;
let nextDy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop;
let isPaused = true;
let speed = 150;

function init() {
    resize();
    resetGame();
    bestEl.textContent = highScore;
}

function resize() {
    const size = Math.min(window.innerWidth * 0.9, 400);
    canvas.width = size;
    canvas.height = size;
    TILE_SIZE = size / GRID_SIZE;
    TILE_COUNT = GRID_SIZE;
}

function resetGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 10, y: 11 },
        { x: 10, y: 12 }
    ];
    dx = 0;
    dy = -1;
    nextDx = 0;
    nextDy = -1;
    score = 0;
    scoreEl.textContent = score;
    speed = 150;
    placeFood();
}

function placeFood() {
    food.x = Math.floor(Math.random() * TILE_COUNT);
    food.y = Math.floor(Math.random() * TILE_COUNT);
    
    // Don't place food on snake
    if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        placeFood();
    }
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    snake.forEach((segment, index) => {
        const isHead = index === 0;
        ctx.fillStyle = isHead ? '#00ff88' : 'rgba(0, 255, 136, 0.6)';
        
        // Draw rounded rectangles for snake body
        const x = segment.x * TILE_SIZE;
        const y = segment.y * TILE_SIZE;
        const r = TILE_SIZE / 4;
        
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2, r);
        ctx.fill();

        // Head glow
        if (isHead) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ff88';
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    });

    // Draw food
    ctx.fillStyle = '#ff0055';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff0055';
    ctx.beginPath();
    ctx.arc(
        food.x * TILE_SIZE + TILE_SIZE / 2,
        food.y * TILE_SIZE + TILE_SIZE / 2,
        TILE_SIZE / 2 - 2,
        0, Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;
}

function move() {
    dx = nextDx;
    dy = nextDy;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Wall collision (Wrap around)
    if (head.x < 0) head.x = TILE_COUNT - 1;
    if (head.x >= TILE_COUNT) head.x = 0;
    if (head.y < 0) head.y = TILE_COUNT - 1;
    if (head.y >= TILE_COUNT) head.y = 0;

    // Self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreEl.textContent = score;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            bestEl.textContent = highScore;
        }
        placeFood();
        vibrate(50);
        
        // Increase speed slightly
        if (speed > 70) speed -= 2;
    } else {
        snake.pop();
    }
}

function gameOver() {
    isPaused = true;
    vibrate([100, 50, 100]);
    startScreen.classList.remove('hidden');
    startBtn.textContent = 'RETRY';
}

function update() {
    if (isPaused) return;
    move();
    draw();
    setTimeout(update, speed);
}

function vibrate(pattern) {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
}

// Controls
window.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp': if (dy !== 1) { nextDx = 0; nextDy = -1; } break;
        case 'ArrowDown': if (dy !== -1) { nextDx = 0; nextDy = 1; } break;
        case 'ArrowLeft': if (dx !== 1) { nextDx = -1; nextDy = 0; } break;
        case 'ArrowRight': if (dx !== -1) { nextDx = 1; nextDy = 0; } break;
    }
});

// Swipe Detection
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchmove', e => {
    e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > 30) {
            if (deltaX > 0 && dx !== -1) { nextDx = 1; nextDy = 0; }
            else if (deltaX < 0 && dx !== 1) { nextDx = -1; nextDy = 0; }
        }
    } else {
        // Vertical swipe
        if (Math.abs(deltaY) > 30) {
            if (deltaY > 0 && dy !== -1) { nextDx = 0; nextDy = 1; }
            else if (deltaY < 0 && dy !== 1) { nextDx = 0; nextDy = -1; }
        }
    }
    e.preventDefault();
}, { passive: false });

startBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    isPaused = false;
    resetGame();
    update();
});

window.addEventListener('resize', resize);

init();
draw();
