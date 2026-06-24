import { CONFIG } from '../engine/Config';
import { Entity } from './Entity';

/**
 * 浮动文字特效：用于显示“+N 建材”等提示，向上飘动并逐渐淡出。
 */
export class FloatingText extends Entity {
  text: string;
  color: string;
  private maxLife: number;
  private life: number;
  private vy: number; // 向上移动速度，单位 px/s

  constructor(x: number, y: number, text: string, color: string = CONFIG.COLOR_MATERIAL_FLOAT) {
    super(x, y, 0, 0, 1);
    this.text = text;
    this.color = color;
    this.maxLife = 1000; // 总生命周期 1s
    this.life = this.maxLife;
    this.vy = -40; // 每秒向上移动 40 像素
  }

  update(dt: number) {
    this.life -= dt;
    this.y += (this.vy * dt) / 1000;
    if (this.life <= 0) {
      this.alive = false;
    }
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const alpha = Math.max(0, this.life / this.maxLife);
    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = this.color;
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText(this.text, screenX, screenY);
    ctx.restore();
  }
}
