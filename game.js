const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const backgroundMusic = document.getElementById('backgroundMusic');
const menuMusic = document.getElementById('menuMusic');
const collectSound = document.getElementById('collectSound');
const gameOverSound = document.getElementById('gameOverSound');
const nextLevelSound = document.getElementById('nextLevelSound');

let player;
let platforms;
let collectables;
let enemies;
let jumpCount;

document.getElementById('newGameButton').addEventListener('click', startGame);

function startGame() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('scoreBoard').style.display = 'block';
    canvas.style.display = 'block';
    document.getElementById('mobileControls').style.display = 'flex';
    menuMusic.pause();
    backgroundMusic.play();
    initializeGame();
    update();
}

function initializeGame() {
    player = {
        x: 50,
        y: 300,
        width: 50,
        height: 50,
        color: 'red',
        speed: 5,
        dx: 0,
        dy: 0,
        gravity: 0.5,
        jumpStrength: -12,
        onGround: false,
        score: 0
    };

    jumpCount = 0;

    generateNewMap();

    document.getElementById('score').textContent = player.score;
}

function generateNewMap() {
    platforms = generatePlatforms();
    collectables = generateCollectables();
    enemies = generateEnemies();
}

function generatePlatforms() {
    const numPlatforms = getRandomInt(3, 10);
    const platforms = [];

    for (let i = 0; i < numPlatforms; i++) {
        platforms.push({
            x: getRandomInt(0, canvas.width - 100),
            y: getRandomInt(50, canvas.height - 50),
            width: getRandomInt(80, 150),
            height: 20,
            color: 'green'
        });
    }

    platforms.push({
        x: 0,
        y: 350,
        width: 800,
        height: 50,
        color: 'green'
    });

    return platforms;
}

function generateCollectables() {
    const collectables = [];

    platforms.forEach(platform => {
        if (platform.y < canvas.height - 50) {
            collectables.push({
                x: platform.x + platform.width / 2 - 10,
                y: platform.y - 20,
                width: 20,
                height: 20,
                color: 'yellow'
            });
        }
    });

    return collectables;
}

function generateEnemies() {
    const numEnemies = getRandomInt(1, 5);
    const enemies = [];

    for (let i = 0; i < numEnemies; i++) {
        enemies.push({
            x: getRandomInt(0, canvas.width - 40),
            y: getRandomInt(50, canvas.height - 90),
            width: 40,
            height: 40,
            color: 'blue',
            dx: getRandomInt(1, 3) * (Math.random() < 0.5 ? 1 : -1)
        });
    }

    return enemies;
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawPlatforms() {
    platforms.forEach(platform => {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
}

function drawCollectables() {
    collectables.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.fillRect(item.x, item.y, item.width, item.height);
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        enemy.x += enemy.dx;
        if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
            enemy.dx *= -1;
        }
    });
}

function updatePlayerPosition() {
    player.x += player.dx;
    player.y += player.dy;
    player.dy += player.gravity;
    player.onGround = false;

    platforms.forEach(platform => {
        if (player.y + player.height > platform.y &&
            player.y + player.height <= platform.y + platform.height &&
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width) {
            player.dy = 0;
            player.onGround = true;
            player.y = platform.y - player.height;
            jumpCount = 0;
        }
    });

    if (player.y + player.height >= canvas.height) {
        player.y = canvas.height - player.height;
        player.dy = 0;
        player.onGround = true;
        jumpCount = 0;
    }
}

function handleCollectables() {
    collectables.forEach((item, index) => {
        if (player.x < item.x + item.width &&
            player.x + player.width > item.x &&
            player.y < item.y + item.height &&
            player.y + player.height > item.y) {
            collectables.splice(index, 1);
            player.score += 10;
            document.getElementById('score').textContent = player.score;
            collectSound.play();
        }
    });

    if (collectables.length === 0) {
        nextLevelSound.play();
        generateNewMap();
    }
}

function handleEnemies() {
    enemies.forEach(enemy => {
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            gameOver();
        }
    });
}

function gameOver() {
    document.getElementById('gameOver').style.display = 'block';
    gameOverSound.play();
    setTimeout(() => {
        document.getElementById('gameOver').style.display = 'none';
        initializeGame();
    }, 2000);
}

function moveRight() {
    player.dx = player.speed;
}

function moveLeft() {
    player.dx = -player.speed;
}

function jump() {
    if (player.onGround || jumpCount < 2) {
        player.dy = player.jumpStrength;
        player.onGround = false;
        jumpCount++;
    }
}

function stopMove() {
    player.dx = 0;
}

function update() {
    clear();
    drawPlayer();
    drawPlatforms();
    drawCollectables();
    drawEnemies();
    updatePlayerPosition();
    handleCollectables();
    handleEnemies();
    requestAnimationFrame(update);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd') {
        moveRight();
    } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        moveLeft();
    } else if (e.key === 'ArrowUp' || e.key === 'w') {
        jump();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'ArrowLeft' || e.key === 'a') {
        stopMove();
    }
});

// Controles para dispositivos móveis
document.getElementById('leftButton').addEventListener('touchstart', moveLeft);
document.getElementById('leftButton').addEventListener('touchend', stopMove);
document.getElementById('rightButton').addEventListener('touchstart', moveRight);
document.getElementById('rightButton').addEventListener('touchend', stopMove);
document.getElementById('jumpButton').addEventListener('touchstart', jump);

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

menuMusic.play();
initializeGame();
