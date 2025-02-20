const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 320;
canvas.height = 480;

const GRAVITY = 0.2;
const FLAP = -5;
const SPAWN_RATE = 90;
const PIPE_WIDTH = 50;
const PIPE_SPACING = 150;
const MAX_FALL_SPEED = 5;
const MIN_PIPE_GAP = 100; // Minimum gap height between pipes
const MIN_PIPE_DISTANCE = 150; // Minimum horizontal distance between pipes

let bird = {
    x: 50,
    y: 150,
    width: 20,
    height: 20,
    velocity: 0,
    flapStrength: FLAP,
    canFlap: true,
    move() {
        this.velocity += GRAVITY;
        if (this.velocity > MAX_FALL_SPEED) {
            this.velocity = MAX_FALL_SPEED;
        }
        this.y += this.velocity;
        if (this.y > canvas.height - this.height) {
            this.y = canvas.height - this.height;
            this.velocity = 0;
        }
    },
    flap() {
        if (this.canFlap) {
            this.velocity = this.flapStrength;
            this.canFlap = false;
            setTimeout(() => {
                this.canFlap = true;
            }, 200);
        }
    },
    draw() {
        ctx.fillStyle = "#ff0";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },
};

let pipes = [];
let score = 0;
let isGameOver = false;

function createPipe() {
    // Ensure there is a minimum gap between pipes
    let lastPipe = pipes[pipes.length - 1];
    let xPosition = lastPipe ? lastPipe.x + PIPE_WIDTH + Math.random() * (MIN_PIPE_DISTANCE - PIPE_WIDTH) : canvas.width;

    const gapPosition = Math.random() * (canvas.height - PIPE_SPACING - MIN_PIPE_GAP) + MIN_PIPE_GAP;
    pipes.push({
        x: xPosition,
        topHeight: gapPosition,
        bottomHeight: canvas.height - gapPosition - PIPE_SPACING,
        scored: false,
    });
}

function drawPipes() {
    ctx.fillStyle = "#008000";
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.fillRect(pipe.x, pipe.topHeight + PIPE_SPACING, PIPE_WIDTH, pipe.bottomHeight);
    });
}

function movePipes() {
    pipes.forEach(pipe => {
        pipe.x -= 2;
    });
}

function removeOffScreenPipes() {
    pipes = pipes.filter(pipe => pipe.x + PIPE_WIDTH > 0);
}

function detectCollisions() {
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        isGameOver = true;
    }

    pipes.forEach(pipe => {
        if (
            bird.x + bird.width > pipe.x &&
            bird.x < pipe.x + PIPE_WIDTH &&
            (bird.y < pipe.topHeight || bird.y + bird.height > pipe.topHeight + PIPE_SPACING)
        ) {
            isGameOver = true;
        }
    });
}

function drawScore() {
    ctx.fillStyle = "#000";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isGameOver) {
        ctx.fillStyle = "#f00";
        ctx.font = "30px Arial";
        ctx.fillText("Game Over", canvas.width / 2 - 75, canvas.height / 2);
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2 - 90, canvas.height / 2 + 40);
        return;
    }

    bird.move();
    bird.draw();

    if (Math.random() < 1 / SPAWN_RATE) {
        createPipe(); 
    }

    drawPipes();
    movePipes();
    removeOffScreenPipes();

    detectCollisions();
    drawScore();

    pipes.forEach(pipe => {
        if (pipe.x + PIPE_WIDTH < bird.x && !pipe.scored) {
            pipe.scored = true;
            score++; 
        }
    });

    requestAnimationFrame(gameLoop);
}

document.addEventListener("click", () => {
    if (!isGameOver) {
        bird.flap();
    } else {
        bird.y = 150;
        bird.velocity = 0;
        pipes = [];
        score = 0;
        isGameOver = false;
        gameLoop();
    }
});

gameLoop();
