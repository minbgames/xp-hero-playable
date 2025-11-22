import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    private fireTimer: number = 0;
    private fireRate: number = 300; // ms
    private speed: number = 250;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'player');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setCircle(16); // Assuming 32x32 sprite
    }

    update(cursors?: Phaser.Types.Input.Keyboard.CursorKeys) {
        this.setVelocity(0);

        // Keyboard movement
        if (cursors) {
            let dx = 0;
            let dy = 0;

            if (cursors.left.isDown) dx = -1;
            else if (cursors.right.isDown) dx = 1;

            if (cursors.up.isDown) dy = -1;
            else if (cursors.down.isDown) dy = 1;

            if (dx !== 0 || dy !== 0) {
                const vec = new Phaser.Math.Vector2(dx, dy).normalize().scale(this.speed);
                this.setVelocity(vec.x, vec.y);
                return; // Prioritize keyboard if used
            }
        }

        // Touch/Mouse movement (Virtual Joystick style or Follow)
        const pointer = this.scene.input.activePointer;
        if (pointer.isDown) {
            this.scene.physics.moveTo(this, pointer.x, pointer.y, this.speed);

            // Stop jitter
            if (Phaser.Math.Distance.Between(this.x, this.y, pointer.x, pointer.y) < 15) {
                this.setVelocity(0);
            }
        }
    }

    autoFire(enemies: Phaser.Physics.Arcade.Group, bullets: Phaser.Physics.Arcade.Group, delta: number) {
        this.fireTimer += delta;
        if (this.fireTimer < this.fireRate) return;

        // Find closest enemy
        let closest: Phaser.Physics.Arcade.Sprite | null = null;
        let closestDist = Infinity;

        enemies.children.iterate((child: any) => {
            if (!child.active) return true;
            const dist = Phaser.Math.Distance.Between(this.x, this.y, child.x, child.y);
            if (dist < closestDist && dist < 300) { // Range check
                closestDist = dist;
                closest = child;
            }
            return true;
        });

        if (closest) {
            const bullet = bullets.get(this.x, this.y);
            if (bullet) {
                bullet.fire(this.x, this.y, (closest as any).x, (closest as any).y);
                this.fireTimer = 0;
            }
        }
    }
}
