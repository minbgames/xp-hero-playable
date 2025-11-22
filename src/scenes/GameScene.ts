import Phaser from 'phaser';
import Player from '../objects/Player';
import Enemy from '../objects/Enemy';
import Bullet from '../objects/Bullet';
import playerImg from '../assets/player.png';
import enemyImg from '../assets/enemy.png';
import grassImg from '../assets/grass.png';

export default class GameScene extends Phaser.Scene {
    private player!: Player;
    private enemies!: Phaser.Physics.Arcade.Group;
    private bullets!: Phaser.Physics.Arcade.Group;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private spawnTimer: number = 0;

    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('playerRaw', playerImg);
        this.load.image('enemyRaw', enemyImg);
        this.load.image('grass', grassImg);

        // Bullet Texture (White/Blue Magic) - Keep procedural for now or simple dot
        const graphics = this.make.graphics({ x: 0, y: 0 });
        graphics.fillStyle(0xffffff);
        graphics.fillCircle(6, 6, 6);
        graphics.generateTexture('bullet', 12, 12);
    }

    create() {
        // Process textures to remove white background
        this.processTexture('playerRaw', 'player');
        this.processTexture('enemyRaw', 'enemy');

        // 1. Setup Ocean Background
        this.cameras.main.setBackgroundColor('#4aa3df'); // Ocean Blue

        // 2. Create Island (Green Rect)
        // We'll use a TiledSprite for the grass pattern
        const islandWidth = 1200;
        const islandHeight = 1200;
        const islandX = (1600 - islandWidth) / 2;
        const islandY = (1200 - islandHeight) / 2;

        // Draw Island Base
        this.add.tileSprite(800, 600, islandWidth, islandHeight, 'grass');

        // Setup Physics World bounds to match the island
        this.physics.world.setBounds(islandX, islandY, islandWidth, islandHeight);

        // Launch UI Scene
        this.scene.launch('UIScene');

        // Create Player
        this.player = new Player(this, 800, 600); // Center of world
        // Scale down if the generated image is too big (usually 1024x1024)
        this.player.setScale(0.15);
        this.player.body?.setCircle(this.player.width * 0.3); // Adjust hitbox

        // Camera follow
        this.cameras.main.setBounds(0, 0, 1600, 1200);
        this.cameras.main.startFollow(this.player);

        // Create Enemy Group
        this.enemies = this.physics.add.group({
            classType: Enemy,
            runChildUpdate: true
        });

        // Create Bullets Group
        this.bullets = this.physics.add.group({
            classType: Bullet,
            runChildUpdate: true
        });

        // Collisions
        this.physics.add.collider(this.player, this.enemies, this.handlePlayerHit, undefined, this);
        this.physics.add.collider(this.enemies, this.enemies); // Enemies push each other
        this.physics.add.overlap(this.bullets, this.enemies, this.handleBulletHit, undefined, this);

        // Input
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
        }

        // Grid background for visual reference
        this.add.grid(800, 600, 1600, 1200, 64, 64, 0x000000).setOutlineStyle(0x222222);
    }

    update(_time: number, delta: number) {
        this.player.update(this.cursors);
        this.player.autoFire(this.enemies, this.bullets, delta);

        // Spawn Enemies
        this.spawnTimer += delta;
        if (this.spawnTimer > 1000) { // Every 1 second
            this.spawnEnemy();
            this.spawnTimer = 0;
        }
    }

    private spawnEnemy() {
        // Spawn at random position on the island
        const islandWidth = 1200;
        const islandHeight = 1200;
        const islandX = (1600 - islandWidth) / 2;
        const islandY = (1200 - islandHeight) / 2;

        let x, y;
        let dist = 0;
        do {
            x = Phaser.Math.Between(islandX, islandX + islandWidth);
            y = Phaser.Math.Between(islandY, islandY + islandHeight);
            dist = Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y);
        } while (dist < 400); // Don't spawn too close

        const enemy = new Enemy(this, x, y, this.player);
        this.enemies.add(enemy);
    }

    private handlePlayerHit(_player: any, _enemy: any) {
        this.cameras.main.shake(100);
        this.events.emit('gameOver');
        this.scene.pause();
    }

    private handleBulletHit(bullet: any, enemy: any) {
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.body.stop();

        enemy.destroy();
        this.events.emit('enemyKilled');
    }

    private processTexture(key: string, newKey: string) {
        const texture = this.textures.get(key);
        const image = texture.getSourceImage();

        // Create a canvas to manipulate pixels
        const canvas = this.textures.createCanvas(newKey, image.width, image.height);
        if (!canvas) return;

        const ctx = canvas.context;
        ctx.drawImage(image as HTMLImageElement, 0, 0);

        const imageData = ctx.getImageData(0, 0, image.width, image.height);
        const data = imageData.data;

        // Simple white removal threshold
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // If pixel is close to white, make it transparent
            if (r > 240 && g > 240 && b > 240) {
                data[i + 3] = 0; // Alpha 0
            }
        }

        ctx.putImageData(imageData, 0, 0);
        canvas.refresh();
    }
}
