import { CONFIG } from '../engine/Config';
import { Entity } from './Entity';

export class Bullet extends Entity {
  vx: number;
  vy: number;
  damage: number;
  fromPlayer: boolean;
  lifetime: number = 2000; // 2秒后自动销毁

  constructor(x: number, y: number, angle: number, fromPlayer: boolean = true) {
    super(x, y, CONFIG.BULLET_SIZE, CONFIG.BULLET_SIZE, 1);
    this.vx = Math.cos(angle) * CONFIG.BULLET_SPEED;
    this.vy = Math.sin(angle) * CONFIG.BULLET_SPEED;
    this.damage = CONFIG.BULLET_DAMAGE;
    this.fromPlayer = fromPlayer;
  }

  update(dt: number) {
    this.x += this.vx;
    this.y += this.vy;
    this.lifetime -= dt;

    // 超出地图边界
    if (this.x < 0 || this.x > CONFIG.MAP_WIDTH || this.y < 0 || this.y > CONFIG.MAP_HEIGHT) {
      this.alive = false;
    }

    if (this.lifetime <= 0) {
      this.alive = false;
    }
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;

    ctx.fillStyle = CONFIG.COLOR_BULLET;
    ctx.beginPath();
    ctx.arc(screenX + this.width / 2, screenY + this.height / 2, this.width / 2, 0, Math.PI * 2);
    ctx.fill();

    // 光晕效果
    ctx.fillStyle = 'rgba(241,196,15,0.3)';
    ctx.beginPath();
    ctx.arc(screenX + this.width / 2, screenY + this.height / 2, this.width, 0, Math.PI * 2);
    ctx.fill();
  }
}
