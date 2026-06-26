import { CONFIG } from '../engine/Config';
import { Entity } from './Entity';

/**
 * Boomer 死亡爆炸的视觉特效：在地图上渲染一个逐渐扩散并淡出的绿色透明圆圈。
 */
export class ExplosionEffect extends Entity {
  radius: number;
  private maxLife: number;
  private life: number;

  constructor(x: number, y: number, radius: number, duration: number = 600) {
    super(x - radius, y - radius, radius * 2, radius * 2, 1);
    this.radius = radius;
    this.maxLife = duration;
    this.life = duration;
  }

  update(dt: number) {
    this.life -= dt;
    if (this.life <= 0) {
      this.alive = false;
    }
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const alpha = Math.max(0, this.life / this.maxLife);
    const screenX = this.centerX - cameraX;
    const screenY = this.centerY - cameraY;

    ctx.save();
    ctx.globalAlpha = alpha * 0.5;
    ctx.fillStyle = CONFIG.COLOR_BOOMER;
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // 内圈高亮
    ctx.globalAlpha = alpha * 0.25;
    ctx.fillStyle = CONFIG.COLOR_BOOMER_PROJECTILE;
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
