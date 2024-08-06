import Phaser from 'phaser';

const tg = window.Telegram.WebApp;

// Инициализация Telegram Web App
tg.expand();
tg.ready();

let bird;
let pipes;
let score = 0;
let scoreText;

const config = {
    type: Phaser.AUTO,
    width: 288,
    height: 512,
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('sky', 'https://labs.phaser.io/assets/skies/sky1.png');
    this.load.image('bird', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
    this.load.image('pipe', 'https://labs.phaser.io/assets/sprites/bullet.png');
}

function create() {
    this.add.image(144, 256, 'sky');

    bird = this.physics.add.sprite(50, 256, 'bird');
    bird.setCollideWorldBounds(true);

    pipes = this.physics.add.group();

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

    this.input.on('pointerdown', flap);

    this.time.addEvent({
        delay: 1500,
        callback: addPipe,
        callbackScope: this,
        loop: true
    });

    this.physics.add.collider(bird, pipes, gameOver, null, this);
}

function update() {
    if (bird.y > config.height || bird.y < 0) {
        gameOver.call(this);
    }
}

function flap() {
    bird.setVelocityY(-150);
}

function addPipe() {
    const hole = Math.floor(Math.random() * 5) + 1;
    
    for (let i = 0; i < 8; i++) {
        if (i !== hole && i !== hole + 1) {
            const pipe = pipes.create(288, i * 64, 'pipe');
            pipe.body.allowGravity = false;
            pipe.setVelocityX(-200);
        }
    }

    score += 1;
    scoreText.setText('Score: ' + score);
}

function gameOver() {
    this.physics.pause();
    bird.setTint(0xff0000);

    const restartButton = this.add.text(144, 256, 'Restart', {
        fontSize: '32px',
        fill: '#fff',
        backgroundColor: '#000'
    }).setOrigin(0.5).setInteractive();

    restartButton.on('pointerdown', () => {
        score = 0;
        this.scene.restart();
    });
// Отправка счета в Telegram
  tg.sendData(JSON.stringify({score: score}));

}