import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
    private score: number = 0;

    constructor() {
        super('UIScene');
    }

    create() {
        const { width, height } = this.scale;

        // --- TOP BAR ---
        // Level Indicator (Hexagon/Shield shape placeholder)
        const topBarY = 40;
        this.add.polygon(60, topBarY, [0, 20, 20, 0, 40, 20, 40, 50, 20, 70, 0, 50], 0x2980b9).setStrokeStyle(2, 0xffffff);
        this.add.text(60, topBarY + 10, '57', { fontSize: '24px', fontStyle: 'bold' }).setOrigin(0.5);

        // EXP Bar Background
        this.add.rectangle(width / 2 - 50, topBarY, 300, 30, 0x000000, 0.5).setOrigin(0, 0.5);
        // EXP Bar Fill (Blue)
        this.add.rectangle(width / 2 - 48, topBarY, 200, 26, 0x3498db).setOrigin(0, 0.5);
        this.add.text(width / 2 + 100, topBarY, '85/1.2K', { fontSize: '18px', fontStyle: 'bold' }).setOrigin(0.5);

        // Currency (Top Right)
        this.add.rectangle(width - 100, topBarY - 15, 120, 30, 0x000000, 0.5);
        this.add.text(width - 100, topBarY - 15, '150K 🟡', { fontSize: '16px' }).setOrigin(0.5);

        this.add.rectangle(width - 100, topBarY + 20, 120, 30, 0x000000, 0.5);
        this.add.text(width - 100, topBarY + 20, '200K 💎', { fontSize: '16px' }).setOrigin(0.5);

        // --- BOTTOM MENU BAR ---
        const bottomBarHeight = 80;
        const bottomBarY = height - bottomBarHeight / 2;

        // Background Panel
        this.add.rectangle(width / 2, bottomBarY, width - 40, bottomBarHeight, 0x34495e).setStrokeStyle(4, 0x2c3e50);

        // Icons (Mockup)
        const icons = ['⬆️', '⚔️', '⚒️', '🤠', '🔒'];
        const startX = width / 2 - 200;
        icons.forEach((icon, index) => {
            const x = startX + index * 100;
            // Button bg
            this.add.rectangle(x, bottomBarY, 60, 60, 0x95a5a6, 1).setStrokeStyle(2, 0xffffff);
            this.add.text(x, bottomBarY, icon, { fontSize: '32px' }).setOrigin(0.5);
        });

        // --- INSTALL BUTTON (Floating) ---
        // Keep it prominent but maybe move it slightly
        const btn = this.add.rectangle(width - 80, height - 150, 120, 50, 0x27ae60).setInteractive();
        btn.setStrokeStyle(2, 0xffffff);
        this.add.text(width - 80, height - 150, 'INSTALL', { fontSize: '20px', fontStyle: 'bold' }).setOrigin(0.5);

        btn.on('pointerdown', () => {
            this.openStore();
        });

        // Listen for game events
        const gameScene = this.scene.get('GameScene');
        gameScene.events.on('enemyKilled', this.updateScore, this);
        gameScene.events.on('gameOver', this.showGameOver, this);
    }

    updateScore() {
        this.score++;

        // "LEVEL UP" Effect every 5 kills
        if (this.score % 5 === 0) {
            this.showLevelUp();
        }

        // Simple progression: Show end screen after 20 kills
        if (this.score >= 20) {
            this.showVictory();
        }
    }

    showLevelUp() {
        const { width, height } = this.scale;
        const text = this.add.text(width / 2, height / 2 - 50, 'LEVEL UP', {
            fontSize: '64px',
            fontStyle: 'bold',
            color: '#f1c40f',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.tweens.add({
            targets: text,
            y: height / 2 - 150,
            alpha: 0,
            duration: 1500,
            onComplete: () => text.destroy()
        });
    }

    showGameOver() {
        this.showEndScreen('GAME OVER', 0xc0392b);
    }

    showVictory() {
        // Pause game scene
        this.scene.pause('GameScene');
        this.showEndScreen('VICTORY!', 0x27ae60);
    }

    showEndScreen(text: string, color: number) {
        const { width, height } = this.scale;

        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
        this.add.text(width / 2, height / 2 - 100, text, { fontSize: '64px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

        const btn = this.add.rectangle(width / 2, height / 2 + 50, 300, 80, color).setInteractive();
        btn.setStrokeStyle(4, 0xffffff);

        this.add.text(width / 2, height / 2 + 50, 'PLAY NOW', { fontSize: '48px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

        // Pulse animation
        this.tweens.add({
            targets: btn,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        btn.on('pointerdown', () => {
            this.openStore();
        });
    }

    openStore() {
        console.log('Open Store URL');
        window.open('https://play.google.com/store/apps/details?hl=en-US&id=io.supercent.weaponrpg', '_blank');
    }
}
