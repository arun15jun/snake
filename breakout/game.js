import { saveHighScore } from '../shared/leaderboard.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score-val');
const bestEl = document.getElementById('best-score');
const startBtn = document.getElementById('start-btn');
const startScreen = document.getElementById('start-screen');

// Resize
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Game State
let ball = { x: 0, y: 0, dx: 4, dy: -4, radius: 8 };
let paddle = { h: 12, w: 100, x: 0 };
let bricks = [];
let score = 0;
let bestScore = localStorage.getItem('breakoutBestScore') || 0;
let isGameOver = true;

const BRICK_ROWS = 5;
const BRICK_COLS = 6;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 100;

function initBricks() {
    bricks = [];
    const brickWidth = (canvas.width - (BRICK_PADDING * (BRICK_COLS + 1))) / BRICK_COLS;
    for (let c = 0; c < BRICK_COLS; c++) {
        bricks[c] = [];
        for (let r = 0; r < BRICK_ROWS; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

function resetGame() {
    initBricks();
    score = 0;
    scoreEl.textContent = score;
    bestEl.textContent = `Best: ${bestScore}`;
    paddle.x = (canvas.width - paddle.w) / 2;
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 50;
    ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = -4;
    isGameOver = false;
}

function movePaddle(e) {
    let relativeX = e.touches ? e.touches[0].clientX : e.clientX;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.w / 2;
    }
}

document.addEventListener("mousemove", movePaddle);
document.addEventListener("touchmove", (e) => {
    movePaddle(e);
    e.preventDefault();
}, { passive: false });

function collisionDetection() {
    const brickWidth = (canvas.width - (BRICK_PADDING * (BRICK_COLS + 1))) / BRICK_COLS;
    for (let c = 0; c < BRICK_COLS; c++) {
        for (let r = 0; r < BRICK_ROWS; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + BRICK_HEIGHT) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score++;
                    scoreEl.textContent = score;
                    if (score > bestScore) {
                        bestScore = score;
                        localStorage.setItem('breakoutBestScore', bestScore);
                        saveHighScore('breakout', score);
                    }
                    if (score === BRICK_ROWS * BRICK_COLS) {
                        alert("LEVEL CLEARED!");
                        resetGame();
                    }
                }
            }
        }
    }
}

function drawBall() {
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#fff";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
}

function drawPaddle() {
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ff00ff";
    ctx.beginPath();
    ctx.rect(paddle.x, canvas.height - paddle.h - 20, paddle.w, paddle.h);
    ctx.fillStyle = "#ff00ff";
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
}

function drawBricks() {
    const brickWidth = (canvas.width - (BRICK_PADDING * (BRICK_COLS + 1))) / BRICK_COLS;
    for (let c = 0; c < BRICK_COLS; c++) {
        for (let r = 0; r < BRICK_ROWS; r++) {
            if (bricks[c][r].status === 1) {
                let brickX = (c * (brickWidth + BRICK_PADDING)) + BRICK_PADDING;
                let brickY = (r * (BRICK_HEIGHT + BRICK_PADDING)) + BRICK_OFFSET_TOP;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                
                // Brown Textured Look
                const baseColor = "#8B4513"; // Saddle Brown
                const lightColor = "#A0522D"; // Sienna
                const darkColor = "#5D2E0C"; // Dark Brown
                
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, BRICK_HEIGHT);
                ctx.fillStyle = baseColor;
                ctx.fill();
                
                // Add texture (Bevel effect)
                ctx.strokeStyle = lightColor;
                ctx.lineWidth = 2;
                ctx.strokeRect(brickX + 1, brickY + 1, brickWidth - 2, BRICK_HEIGHT - 2);
                
                ctx.strokeStyle = darkColor;
                ctx.beginPath();
                ctx.moveTo(brickX, brickY + BRICK_HEIGHT);
                ctx.lineTo(brickX + brickWidth, brickY + BRICK_HEIGHT);
                ctx.lineTo(brickX + brickWidth, brickY);
                ctx.stroke();

                // Add small brick lines for "texture"
                ctx.strokeStyle = "rgba(0,0,0,0.2)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(brickX + brickWidth/2, brickY);
                ctx.lineTo(brickX + brickWidth/2, brickY + BRICK_HEIGHT);
                ctx.stroke();

                ctx.closePath();
            }
        }
    }
}

function update() {
    if (isGameOver) return;

    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collisions
    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
    } else if (ball.y + ball.dy > canvas.height - ball.radius - 20) {
        // Paddle collision
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.w) {
            ball.dy = -ball.dy;
            // Add slight angle based on where it hit the paddle
            let hitPos = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
            ball.dx = hitPos * 5;
        } else if (ball.y + ball.dy > canvas.height - ball.radius) {
            gameOver();
        }
    }

    collisionDetection();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();

    if (!isGameOver) {
        update();
    }
    requestAnimationFrame(draw);
}

function gameOver() {
    isGameOver = true;
    startScreen.classList.remove('hidden');
    startBtn.textContent = 'RETRY';
}

startBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    resetGame();
});

bestEl.textContent = `Best: ${bestScore}`;
draw();
