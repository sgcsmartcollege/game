const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 320;
canvas.height = 480;

const GRAVITY = 0.2; // Lower gravity for slower fall
const FLAP = -5; // Flap strength for a controlled jump
const SPAWN_RATE = 90;
const PIPE_WIDTH = 50;
const PIPE_SPACING = 150;
const MAX_FALL_SPEED = 5; // Maximum speed at which the bird can fall

let bird = {
    x: 50,
    y: 150,
    width: 20,
    height: 20,
    velocity: 0,
    flapStrength: FLAP,
    canFlap: true, // Control flapping frequency
    move() {
        this.velocity += GRAVITY;
        
        // Cap the fall speed to prevent the bird from falling too quickly
        if (this.velocity > MAX_FALL_SPEED) {
            this.velocity = MAX_FALL_SPEED;
        }

        this.y += this.velocity;

        // Stop the bird from going below the canvas
        if (this.y > canvas.height - this.height) {
            this.y = canvas.height - this.height;
            this.velocity = 0;
        }
    },
    flap() {
        if (this.canFlap) {
            this.velocity = this.flapStrength; // Apply flap strength
            this.canFlap = false;
            // Allow flapping again after a small delay
            setTimeout(() => {
                this.canFlap = true;
            }, 200); // 200ms delay to prevent multiple flaps too quickly
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
    const gapPosition = Math.random() * (canvas.height - PIPE_SPACING - 50) + 50; // Ensure gap is not too close to edges
    pipes.push({
        x: canvas.width,
        topHeight: gapPosition,
        bottomHeight: canvas.height - gapPosition - PIPE_SPACING,
        scored: false, // Prevents scoring multiple times for a single pipe
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
        pipe.x -= 2; // Move pipes left
    });
}

function removeOffScreenPipes() {
    pipes = pipes.filter(pipe => pipe.x + PIPE_WIDTH > 0); // Remove pipes that go off-screen
}

function detectCollisions() {
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        isGameOver = true; // Game over if bird hits ground or top
    }

    pipes.forEach(pipe => {
        if (
            bird.x + bird.width > pipe.x &&
            bird.x < pipe.x + PIPE_WIDTH &&
            (bird.y < pipe.topHeight || bird.y + bird.height > pipe.topHeight + PIPE_SPACING)
        ) {
            isGameOver = true; // Game over if bird collides with pipes
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
        createPipe(); // Spawn a new pipe periodically
    }

    drawPipes();
    movePipes();
    removeOffScreenPipes();

    detectCollisions();
    drawScore();

    pipes.forEach(pipe => {
        if (pipe.x + PIPE_WIDTH < bird.x && !pipe.scored) {
            pipe.scored = true;
            score++; // Increase score when the bird passes a pipe
        }
    });

    requestAnimationFrame(gameLoop); // Keep the game loop going
}

document.addEventListener("click", () => {
    if (!isGameOver) {
        bird.flap();
    } else {
        // Restart the game if it is over
        bird.y = 150;
        bird.velocity = 0;
        pipes = [];
        score = 0;
        isGameOver = false;
        gameLoop();
    }
});

gameLoop(); // Start the game loop
