const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score-val');
const bestEl = document.getElementById('best-score');
const startBtn = document.getElementById('start-btn');
const startScreen = document.getElementById('start-screen');

const COLS = 10;
const ROWS = 20;
let BLOCK_SIZE;

function resize() {
    const h = window.innerHeight * 0.8;
    canvas.height = h;
    BLOCK_SIZE = h / ROWS;
    canvas.width = BLOCK_SIZE * COLS;
}
window.addEventListener('resize', resize);
resize();

// Tetriminos
const SHAPES = {
    'I': [[1, 1, 1, 1]],
    'J': [[1, 0, 0], [1, 1, 1]],
    'L': [[0, 0, 1], [1, 1, 1]],
    'O': [[1, 1], [1, 1]],
    'S': [[0, 1, 1], [1, 1, 0]],
    'T': [[0, 1, 0], [1, 1, 1]],
    'Z': [[1, 1, 0], [0, 1, 1]]
};

const COLORS = {
    'I': '#00f0f0',
    'J': '#0000f0',
    'L': '#f0a000',
    'O': '#f0f000',
    'S': '#00f000',
    'T': '#a000f0',
    'Z': '#f00000'
};

let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
let score = 0;
let bestScore = localStorage.getItem('tetrisBestScore') || 0;
let isGameOver = true;
let piece = null;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function createPiece(type) {
    return {
        pos: { x: 3, y: 0 },
        shape: SHAPES[type],
        type: type
    };
}

function drawBoard() {
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                drawBlock(x, y, COLORS[value]);
            }
        });
    });
}

function drawBlock(x, y, color) {
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE + 1, y * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
    ctx.shadowBlur = 0;
}

function drawPiece() {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                drawBlock(piece.pos.x + x, piece.pos.y + y, COLORS[piece.type]);
            }
        });
    });
}

function collide(board, piece) {
    const [m, o] = [piece.shape, piece.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (board[y + o.y] && board[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge(board, piece) {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[y + piece.pos.y][x + piece.pos.x] = piece.type;
            }
        });
    });
}

function rotate(matrix) {
    return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
}

function playerDrop() {
    piece.pos.y++;
    if (collide(board, piece)) {
        piece.pos.y--;
        merge(board, piece);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    piece.pos.x += dir;
    if (collide(board, piece)) {
        piece.pos.x -= dir;
    }
}

function playerRotate() {
    const pos = piece.pos.x;
    let offset = 1;
    piece.shape = rotate(piece.shape);
    while (collide(board, piece)) {
        piece.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > piece.shape[0].length) {
            piece.shape = rotate(rotate(rotate(piece.shape)));
            piece.pos.x = pos;
            return;
        }
    }
}

function playerReset() {
    const pieces = 'ILJOTSZ';
    piece = createPiece(pieces[pieces.length * Math.random() | 0]);
    if (collide(board, piece)) {
        isGameOver = true;
        startScreen.classList.remove('hidden');
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('tetrisBestScore', bestScore);
            bestEl.textContent = `Best: ${bestScore}`;
        }
    }
}

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = board.length - 1; y > 0; --y) {
        for (let x = 0; x < board[y].length; ++x) {
            if (board[y][x] === 0) {
                continue outer;
            }
        }
        const row = board.splice(y, 1)[0].fill(0);
        board.unshift(row);
        ++y;
        score += rowCount * 10;
        rowCount *= 2;
    }
}

function updateScore() {
    scoreEl.textContent = score;
}

function update(time = 0) {
    if (isGameOver) return;
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    drawPiece();

    requestAnimationFrame(update);
}

// Controls
window.addEventListener('keydown', e => {
    if (isGameOver) return;
    if (e.key === 'ArrowLeft') playerMove(-1);
    if (e.key === 'ArrowRight') playerMove(1);
    if (e.key === 'ArrowDown') playerDrop();
    if (e.key === 'ArrowUp') playerRotate();
});

// Touch Controls
let touchStartX = 0;
let touchStartY = 0;
let lastTouchTime = 0;

window.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    
    // Detect Tap (Rotate)
    const now = Date.now();
    if (now - lastTouchTime < 300) {
        // Double tap maybe? No, let's use single tap for rotate if no swipe.
    }
    lastTouchTime = now;
});

window.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;

    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
        playerRotate(); // Simple tap to rotate
    } else if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > 30) playerMove(dx > 0 ? 1 : -1);
    } else {
        if (dy > 30) playerDrop();
    }
});

startBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    score = 0;
    updateScore();
    isGameOver = false;
    playerReset();
    update();
});

bestEl.textContent = `Best: ${bestScore}`;
update();
