const gameBoard = document.querySelector("#gameBoard");
const ctx = gameBoard.getContext("2d");
const resetBtn = document.querySelector("#resetBtn");
const gameWidth = gameBoard.width;
const gameHeight = gameBoard.height;
const boardBackground = "white";
const snakeColor = "lightgreen";
const snakeBorder = "black";
const foodColor = "red";
const wallColor = "darkblue";
const wallBorderColor = "black"; // Border color for the walls
const unitSize = 25;
const numberOfWalls = 15; // Number of walls to be placed
const minWallLength = 2; // Minimum length of a wall in units
const maxWallLength = 7; // Maximum length of a wall in units

let running = false;
let xVelocity = unitSize;
let yVelocity = 0;
let foodX;
let foodY;
let score = 0;
let snake = [
    { x: unitSize * 4, y: 0 },
    { x: unitSize * 3, y: 0 },
    { x: unitSize * 2, y: 0 },
    { x: unitSize, y: 0 },
    { x: 0, y: 0 }
];
let walls = [];

window.addEventListener("keydown", changeDirection);
resetBtn.addEventListener("click", resetGame);

function gameStart() {
    running = true;
    score = 0;
    walls = []; // Reset the walls when the game starts
    createFood();
    createWalls(); // Generate the walls
    drawFood();
    nextTick();
}

function nextTick() {
    if (running) {
        setTimeout(() => {
            clearBoard();
            drawFood();
            drawSnake();
            drawWalls(); // Draw walls in each tick
            moveSnake();
            checkGameOver();
            nextTick();
        }, 100); // tick speed fixed to 100ms
    } else {
        displayGameOver();
    }
}

function clearBoard() {
    ctx.fillStyle = boardBackground;
    ctx.fillRect(0, 0, gameWidth, gameHeight);
}

function randomFood(min, max) {
    const randNum = Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize;
    return randNum;
}

function createFood() {
    foodX = randomFood(0, gameWidth - unitSize);
    foodY = randomFood(0, gameHeight - unitSize);
}

function drawFood() {
    ctx.fillStyle = foodColor;
    ctx.fillRect(foodX, foodY, unitSize, unitSize);
}

function createWalls() {
    // Randomly place longer walls on the game board
    for (let i = 0; i < numberOfWalls; i++) {
        let wallX, wallY, wallLength, orientation;
        do {
            wallX = randomFood(0, gameWidth - unitSize);
            wallY = randomFood(0, gameHeight - unitSize);
            wallLength = Math.floor(Math.random() * (maxWallLength - minWallLength + 1)) + minWallLength;
            orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        } while (isCollisionWithSnakeOrFood(wallX, wallY, wallLength, orientation));
        walls.push({ x: wallX, y: wallY, length: wallLength, orientation });
    }
}

function drawWalls() {
    ctx.fillStyle = wallColor;
    ctx.strokeStyle = wallBorderColor;
    walls.forEach(wall => {
        ctx.beginPath();
        if (wall.orientation === 'horizontal') {
            ctx.fillRect(wall.x, wall.y, wall.length * unitSize, unitSize);
            ctx.strokeRect(wall.x, wall.y, wall.length * unitSize, unitSize);
        } else {
            ctx.fillRect(wall.x, wall.y, unitSize, wall.length * unitSize);
            ctx.strokeRect(wall.x, wall.y, unitSize, wall.length * unitSize);
        }
        ctx.closePath();
    });
}

function isCollisionWithSnakeOrFood(x, y, length, orientation) {
    // Check if a wall collides with the snake or the food
    for (let i = 0; i < length; i++) {
        const checkX = orientation === 'horizontal' ? x + i * unitSize : x;
        const checkY = orientation === 'vertical' ? y + i * unitSize : y;
        if (snake.some(snakePart => snakePart.x === checkX && snakePart.y === checkY) || 
            (checkX === foodX && checkY === foodY)) {
            return true;
        }
    }
    return false;
}

function moveSnake() {
    const head = { x: snake[0].x + xVelocity, y: snake[0].y + yVelocity };
    snake.unshift(head);

    // If food is eaten
    if (snake[0].x === foodX && snake[0].y === foodY) {
        score += 1;
        createFood();
        // No poison logic
    } else {
        snake.pop();
    }
}

function drawSnake() {
    ctx.fillStyle = snakeColor;
    ctx.strokeStyle = snakeBorder;
    snake.forEach((snakePart) => {
        ctx.fillRect(snakePart.x, snakePart.y, unitSize, unitSize);
        ctx.strokeRect(snakePart.x, snakePart.y, unitSize, unitSize);
    });
    
    // Draw the directional arrow on the head of the snake
    drawArrow(snake[0].x, snake[0].y);
}

function drawArrow(x, y) {
    ctx.fillStyle = "black";
    ctx.beginPath();

    if (xVelocity > 0) { // Moving right
        ctx.moveTo(x + unitSize / 2, y + unitSize / 4);  // Start point
        ctx.lineTo(x + unitSize, y + unitSize / 2);      // Right point
        ctx.lineTo(x + unitSize / 2, y + 3 * unitSize / 4); // Bottom point
    } else if (xVelocity < 0) { // Moving left
        ctx.moveTo(x + unitSize / 2, y + unitSize / 4);  // Start point
        ctx.lineTo(x, y + unitSize / 2);                // Left point
        ctx.lineTo(x + unitSize / 2, y + 3 * unitSize / 4); // Bottom point
    } else if (yVelocity > 0) { // Moving down
        ctx.moveTo(x + unitSize / 4, y + unitSize / 2);  // Start point
        ctx.lineTo(x + unitSize / 2, y + unitSize);      // Bottom point
        ctx.lineTo(x + 3 * unitSize / 4, y + unitSize / 2); // Right point
    } else if (yVelocity < 0) { // Moving up
        ctx.moveTo(x + unitSize / 4, y + unitSize / 2);  // Start point
        ctx.lineTo(x + unitSize / 2, y);                // Top point
        ctx.lineTo(x + 3 * unitSize / 4, y + unitSize / 2); // Right point
    }

    ctx.closePath();
    ctx.fill();
}

function changeDirection(event) {
    const keyPressed = event.keyCode;
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;

    const goingUp = (yVelocity === -unitSize);
    const goingDown = (yVelocity === unitSize);
    const goingRight = (xVelocity === unitSize);
    const goingLeft = (xVelocity === -unitSize);

    switch (true) {
        case (keyPressed === LEFT && !goingRight):
            xVelocity = -unitSize;
            yVelocity = 0;
            break;
        case (keyPressed === UP && !goingDown):
            xVelocity = 0;
            yVelocity = -unitSize;
            break;
        case (keyPressed === RIGHT && !goingLeft):
            xVelocity = unitSize;
            yVelocity = 0;
            break;
        case (keyPressed === DOWN && !goingUp):
            xVelocity = 0;
            yVelocity = unitSize;
            break;
    }
}

function checkGameOver() {
    // Check collision with walls
    if (walls.some(wall => {
        for (let i = 0; i < wall.length; i++) {
            const checkX = wall.orientation === 'horizontal' ? wall.x + i * unitSize : wall.x;
            const checkY = wall.orientation === 'vertical' ? wall.y + i * unitSize : wall.y;
            if (snake[0].x === checkX && snake[0].y === checkY) {
                return true;
            }
        }
        return false;
    })) {
        running = false;
    }

    // Check collision with self
    if (snake.slice(1).some(snakePart => snakePart.x === snake[0].x && snakePart.y === snake[0].y)) {
        running = false;
    }

    // Check collision with walls
    if (snake[0].x < 0 || snake[0].x >= gameWidth || snake[0].y < 0 || snake[0].y >= gameHeight) {
        running = false;
    }
}

function displayGameOver() {
    ctx.fillStyle = "black";
    ctx.font = "50px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over Score: " + score , gameWidth / 2, gameHeight / 2);
}

function resetGame() {
    score = 0;
    xVelocity = unitSize;
    yVelocity = 0;
    snake = [
        { x: unitSize * 4, y: 0 },
        { x: unitSize * 3, y: 0 },
        { x: unitSize * 2, y: 0 },
        { x: unitSize, y: 0 },
        { x: 0, y: 0 }
    ];
    walls = []; // Reset walls
    gameStart();
}
