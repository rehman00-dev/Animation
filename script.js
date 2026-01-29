const canvas = document.getElementById('gameCanvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

const gravity = 0.7;

// Set animated background via CSS
canvas.style.backgroundImage = "url('./background.gif')";
canvas.style.backgroundSize = "cover";
canvas.style.backgroundPosition = "center";

class Fighter {
    constructor({position, velocity, color, offset, name, imageSrc}) {
        this.position = position;
        this.velocity = velocity;
        this.width = 150;
        this.height = 300;
        this.lastKey;
        this.attackBox = {
            position: { x: this.position.x, y: this.position.y },
            offset: offset,
            width: 100,
            height: 50
        };
        this.color = color;
        this.isAttacking = false;
        this.health = 100;
        this.name = name;
        this.facing = 1; // 1 for Right, -1 for Left
        this.transformOffset = 0;
        
        // Create HTML Image Element for GIF support
        this.element = document.createElement('img');
        this.element.src = imageSrc;
        this.element.style.position = 'absolute';
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';
        document.querySelector('.game-container').appendChild(this.element);
    }

    draw() {
        // Update DOM element position
        this.element.style.left = this.position.x + 'px';
        this.element.style.top = this.position.y + 'px';
        this.element.style.transform = `scaleX(${this.facing}) translateX(${this.transformOffset}px)`;

        // Draw Attack Box (Visual Debug)
        if (this.isAttacking) {
            c.fillStyle = 'rgba(255, 255, 255, 0.5)';
            c.fillRect(
                this.attackBox.position.x, 
                this.attackBox.position.y, 
                this.attackBox.width, 
                this.attackBox.height
            );
        }
    }

    update() {
        this.draw();
        
        // Update Attack Box Position
        this.attackBox.position.y = this.position.y + 40; // Attack at chest height

        // Dynamic Attack Box based on facing direction
        if (this.facing === 1) {
            this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
        } else {
            this.attackBox.position.x = this.position.x + this.width - this.attackBox.offset.x - this.attackBox.width;
        }

        // Movement Physics
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Boundary Checks & Rotation
        if (this.position.x < 0) {
            this.position.x = 0;
        } else if (this.position.x + this.width > canvas.width) {
            this.position.x = canvas.width - this.width;
        }

        // Prevent going off-screen top (Ceiling)
        if (this.position.y < 0) {
            this.position.y = 0;
            this.velocity.y = 0;
        }

        // Gravity and Floor Collision
        if (this.position.y + this.height + this.velocity.y >= canvas.height) {
            this.velocity.y = 0;
            this.position.y = canvas.height - this.height;
        } else {
            this.velocity.y += gravity;
        }
    }

    attack() {
        this.isAttacking = true;
        
        // Visual Lunge Effect (Attack karte waqt aage badhna)
        this.transformOffset = 60;

        setTimeout(() => {
            this.isAttacking = false;
            this.transformOffset = 0;
        }, 100); // Attack lasts 100ms
    }

    takeHit() {
        this.health -= 10;
        
        // Visual Hit Effect (Laal rang aur jhatka)
        this.element.style.filter = 'brightness(0.5) sepia(1) hue-rotate(-50deg) saturate(5)';
        this.transformOffset = -20;

        setTimeout(() => {
            this.element.style.filter = 'none';
            this.transformOffset = 0;
        }, 200);
    }
}

// Create Players
const player = new Fighter({
    position: { x: 100, y: 0 },
    velocity: { x: 0, y: 0 },
    color: '#333', // Armor King (Dark Grey)
    offset: { x: 75, y: 0 },
    name: 'Tiger',
    imageSrc: './tiger.gif'
});

const enemy = new Fighter({
    position: { x: 800, y: 0 },
    velocity: { x: 0, y: 0 },
    color: '#b21414', // Azrael (Red)
    offset: { x: 75, y: 0 },
    name: 'Azrael',
    imageSrc: './azrael.gif' // Make sure you have an 'azrael.gif' file
});

const keys = {
    a: { pressed: false },
    d: { pressed: false },
    ArrowRight: { pressed: false },
    ArrowLeft: { pressed: false }
};

function rectangularCollision({ rectangle1, rectangle2 }) {
    return (
        rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x &&
        rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y &&
        rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
    );
}

function determineWinner({player, enemy, timerId}) {
    clearTimeout(timerId);
    document.querySelector('#result-display').style.display = 'flex';
    if (player.health === enemy.health) {
        document.querySelector('#result-display').innerHTML = 'Tie';
    } else if (player.health > enemy.health) {
        document.querySelector('#result-display').innerHTML = 'Tiger Wins';
    } else {
        document.querySelector('#result-display').innerHTML = 'Azrael Wins';
    }
}

let timer = 60;
let timerId;
function decreaseTimer() {
    if (timer > 0) {
        timerId = setTimeout(decreaseTimer, 1000);
        timer--;
        document.querySelector('#timer').innerHTML = timer;
    }

    if (timer === 0) {
        determineWinner({player, enemy, timerId});
    }
}
decreaseTimer();

function animate() {
    window.requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);

    // Background decoration (floor)
    // c.fillStyle = '#444';
    // c.fillRect(0, canvas.height - 20, canvas.width, 20);

    // Make players face each other
    if (player.position.x < enemy.position.x) {
        player.facing = 1;
    } else {
        player.facing = -1;
    }
    enemy.facing = player.facing;

    player.update();
    enemy.update();

    // Player 1 Movement
    player.velocity.x = 0;
    if (keys.a.pressed && player.lastKey === 'a') {
        player.velocity.x = -5;
    } else if (keys.d.pressed && player.lastKey === 'd') {
        player.velocity.x = 5;
    }

    // Player 2 Movement
    enemy.velocity.x = 0;
    if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
        enemy.velocity.x = -5;
    } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
        enemy.velocity.x = 5;
    }

   
    // End Game Condition
    if (enemy.health <= 0 || player.health <= 0) {
        determineWinner({player, enemy, timerId});
    }
}

animate();

window.addEventListener('keydown', (event) => {
    switch (event.key) {
        // Player 1 Keys
        case 'd':
            keys.d.pressed = true;
            player.lastKey = 'd';
            break;
        case 'a':
            keys.a.pressed = true;
            player.lastKey = 'a';
            break;
        case 'w':
            if (player.position.y + player.height >= canvas.height) // Only jump if on ground
                player.velocity.y = -20;
            break;
        case ' ':
            player.attack();
            break;

        // Player 2 Keys
        case 'ArrowRight':
            keys.ArrowRight.pressed = true;
            enemy.lastKey = 'ArrowRight';
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true;
            enemy.lastKey = 'ArrowLeft';
            break;
        case 'ArrowUp':
            if (enemy.position.y + enemy.height >= canvas.height)
                enemy.velocity.y = -20;
            break;
        case 'ArrowDown':
            enemy.attack();
            break;
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;
    }
});