import { CONFIG } from '../engine/Config';
import { Entity } from './Entity';

/**
 * Boomer 喷射的胆汁弹体：短距离远程攻击，命中玩家或建筑后造成伤害。
 */
export class BileProjectile extends Entity {
  vx: number;
  vy: number;
  damage: number;
  lifetime: number = 3000; // 3秒后自动销毁

  constructor(x: number, y: number, angle: number, damage: number) {
    super(
      x - CONFIG.boomer.projectileSize / 2,
      y - CONFIG.boomer.projectileSize / 2,
      CONFIG.boomer.projectileSize,
      CONFIG.boomer.projectileSize,
      1
    );
    this.vx = Math.cos(angle) * CONFIG.boomer.projectileSpeed;
    this.vy = Math.sin(angle) * CONFIG.boomer.projectileSpeed;
    this.damage = damage;
  }

  update(dt: number) {
    this.x += this.vx;
    this.y += this.vy;
    this.lifetime -= dt;

    if (
      this.x < 0 ||
      this.x > CONFIG.MAP_WIDTH ||
      this.y < 0 ||
      this.y > CONFIG.MAP_HEIGHT
    ) {
      this.alive = false;
    }

    if (this.lifetime <= 0) {
      this.alive = false;
    }
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;
    const centerX = screenX + this.width / 2;
    const centerY = screenY + this.height / 2;

    // 胆汁光晕
    ctx.fillStyle = 'rgba(205, 220, 57, 0.3)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, this.width, 0, Math.PI * 2);
    ctx.fill();

    // 胆汁核心
    ctx.fillStyle = CONFIG.COLOR_BOOMER_PROJECTILE;
    ctx.beginPath();
    ctx.arc(centerX, centerY, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
