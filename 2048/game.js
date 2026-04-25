const gridContainer = document.getElementById('grid-container');
const scoreEl = document.getElementById('score-val');
const bestEl = document.getElementById('best-val');
const gameOverEl = document.getElementById('game-over');
const overTitle = document.getElementById('over-title');

let grid = Array(4).fill().map(() => Array(4).fill(0));
let score = 0;
let bestScore = localStorage.getItem('2048BestScore') || 0;

function init() {
    bestEl.textContent = bestScore;
    setupGrid();
    addRandomTile();
    addRandomTile();
    updateUI();
}

function setupGrid() {
    gridContainer.innerHTML = '';
    for (let i = 0; i < 16; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        gridContainer.appendChild(cell);
    }
}

function addRandomTile() {
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (grid[r][c] === 0) emptyCells.push({ r, c });
        }
    }
    if (emptyCells.length > 0) {
        const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
}

function updateUI() {
    // Remove all current tiles
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(t => t.remove());

    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (grid[r][c] !== 0) {
                const tile = document.createElement('div');
                tile.className = `tile tile-${grid[r][c]}`;
                tile.textContent = grid[r][c];
                
                // Use percentages for robust positioning
                tile.style.left = `${c * 25}%`;
                tile.style.top = `${r * 25}%`;
                
                // Adjust for padding inside the tile if needed, but the gap is handled by the 25% grid
                // To account for the 10px gap in CSS, we use a slightly smaller tile size in CSS and calc here
                tile.style.width = `calc(25% - 10px)`;
                tile.style.height = `calc(25% - 10px)`;
                tile.style.margin = `5px`;

                gridContainer.appendChild(tile);
            }
        }
    }
    scoreEl.textContent = score;
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('2048BestScore', bestScore);
        bestEl.textContent = bestScore;
    }
}

function slide(row) {
    let arr = row.filter(val => val !== 0);
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
            arr[i] *= 2;
            score += arr[i];
            arr[i + 1] = 0;
        }
    }
    arr = arr.filter(val => val !== 0);
    while (arr.length < 4) arr.push(0);
    return arr;
}

function move(direction) {
    let oldGrid = JSON.stringify(grid);
    
    if (direction === 'left') {
        for (let r = 0; r < 4; r++) grid[r] = slide(grid[r]);
    } else if (direction === 'right') {
        for (let r = 0; r < 4; r++) grid[r] = slide(grid[r].reverse()).reverse();
    } else if (direction === 'up') {
        for (let c = 0; c < 4; c++) {
            let col = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
            col = slide(col);
            for (let r = 0; r < 4; r++) grid[r][c] = col[r];
        }
    } else if (direction === 'down') {
        for (let c = 0; c < 4; c++) {
            let col = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
            col = slide(col.reverse()).reverse();
            for (let r = 0; r < 4; r++) grid[r][c] = col[r];
        }
    }

    if (oldGrid !== JSON.stringify(grid)) {
        addRandomTile();
        updateUI();
        if (checkGameOver()) {
            overTitle.textContent = "GAME OVER";
            gameOverEl.classList.remove('hidden');
        }
    }
}

function checkGameOver() {
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (grid[r][c] === 0) return false;
            if (r < 3 && grid[r][c] === grid[r + 1][c]) return false;
            if (c < 3 && grid[r][c] === grid[r][c + 1]) return false;
        }
    }
    return true;
}

function resetGame() {
    grid = Array(4).fill().map(() => Array(4).fill(0));
    score = 0;
    gameOverEl.classList.add('hidden');
    addRandomTile();
    addRandomTile();
    updateUI();
}

// Controls
window.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') move('up');
    if (e.key === 'ArrowDown') move('down');
    if (e.key === 'ArrowLeft') move('left');
    if (e.key === 'ArrowRight') move('right');
});

// Swipe Detection
let touchStartX = 0;
let touchStartY = 0;

window.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

window.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > 30) move(dx > 0 ? 'right' : 'left');
    } else {
        if (Math.abs(dy) > 30) move(dy > 0 ? 'down' : 'up');
    }
});

window.addEventListener('resize', updateUI);

init();
