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
let bird = { x: 50, y: 300, velocity: 0, radius: 15 };
let pipes = [];
let score = 0;
let bestScore = localStorage.getItem('flappyBestScore') || 0;
let isGameOver = true;
let frameCount = 0;

const GRAVITY = 0.4;
const JUMP = -8;
const PIPE_WIDTH = 60;
const PIPE_GAP = 180;
const PIPE_SPEED = 3;

function resetGame() {
    bird = { x: canvas.width / 4, y: canvas.height / 2, velocity: 0, radius: 15 };
    pipes = [];
    score = 0;
    scoreEl.textContent = score;
    bestEl.textContent = `Best: ${bestScore}`;
    isGameOver = false;
    frameCount = 0;
}

function spawnPipe() {
    const minHeight = 100;
    const maxHeight = canvas.height - PIPE_GAP - minHeight;
    const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    
    pipes.push({
        x: canvas.width,
        top: height,
        bottom: canvas.height - height - PIPE_GAP,
        passed: false
    });
}

function update() {
    if (isGameOver) return;

    // Bird Physics
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;

    // Boundary check
    if (bird.y + bird.radius > canvas.height || bird.y - bird.radius < 0) {
        gameOver();
    }

    // Pipes
    if (frameCount % 100 === 0) spawnPipe();

    pipes.forEach((pipe, index) => {
        pipe.x -= PIPE_SPEED;

        // Collision Check
        if (
            bird.x + bird.radius > pipe.x && 
            bird.x - bird.radius < pipe.x + PIPE_WIDTH
        ) {
            if (bird.y - bird.radius < pipe.top || bird.y + bird.radius > canvas.height - pipe.bottom) {
                gameOver();
            }
        }

        // Score check
        if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x) {
            score++;
            scoreEl.textContent = score;
            pipe.passed = true;
            if (score > bestScore) {
                bestScore = score;
                localStorage.setItem('flappyBestScore', bestScore);
                if (window.NeonArcade) window.NeonArcade.saveHighScore('flappy', score);
            }
        }

        // Remove off-screen pipes
        if (pipe.x + PIPE_WIDTH < 0) {
            pipes.splice(index, 1);
        }
    });

    frameCount++;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background particles (Neon vibe)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for(let i=0; i<10; i++) {
        ctx.beginPath();
        ctx.arc((frameCount + i*100) % canvas.width, (i*150) % canvas.height, 2, 0, Math.PI*2);
        ctx.fill();
    }

    // Draw Pipes
    pipes.forEach(pipe => {
        // Neon Blue Glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00d4ff';
        ctx.fillStyle = '#00d4ff';
        
        // Top pipe
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.top);
        // Bottom pipe
        ctx.fillRect(pipe.x, canvas.height - pipe.bottom, PIPE_WIDTH, pipe.bottom);
        
        ctx.shadowBlur = 0;
    });

    // Draw Bird
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#fff';
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    requestAnimationFrame(() => {
        update();
        draw();
    });
}

function gameOver() {
    isGameOver = true;
    startScreen.classList.remove('hidden');
    startBtn.textContent = 'RETRY';
}

function jump() {
    if (isGameOver) return;
    bird.velocity = JUMP;
}

// Controls
window.addEventListener('keydown', e => {
    if (e.code === 'Space') jump();
});

window.addEventListener('mousedown', jump);
window.addEventListener('touchstart', (e) => {
    jump();
    e.preventDefault();
}, { passive: false });

startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    startScreen.classList.add('hidden');
    resetGame();
});

bestEl.textContent = `Best: ${bestScore}`;
draw();
