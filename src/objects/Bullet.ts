import Phaser from 'phaser';

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
    private speed: number = 600;
    private lifeTime: number = 1000;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'bullet');
    }

    fire(x: number, y: number, targetX: number, targetY: number) {
        (this.body as Phaser.Physics.Arcade.Body).reset(x, y);
        this.setActive(true);
        this.setVisible(true);

        this.scene.physics.moveTo(this, targetX, targetY, this.speed);
        this.lifeTime = 1000;
    }

    update(_time: number, delta: number) {
        this.lifeTime -= delta;
        if (this.lifeTime <= 0) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}
