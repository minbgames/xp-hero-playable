import Phaser from 'phaser';
import Player from './Player';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    private target: Player;
    private speed: number = 100;

    constructor(scene: Phaser.Scene, x: number, y: number, target: Player) {
        super(scene, x, y, 'enemy');
        this.target = target;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCircle(12); // Slightly smaller than player
    }

    update() {
        if (!this.active || !this.target.active) return;

        this.scene.physics.moveToObject(this, this.target, this.speed);
    }
}
