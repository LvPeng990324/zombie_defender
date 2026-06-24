import { CONFIG } from '../engine/Config';
import { Building } from './Building';

export class Wall extends Building {
  buildingType: string = 'wall';

  constructor(x: number, y: number) {
    // 将坐标对齐到网格
    const gridX = Math.floor(x / CONFIG.WALL_SIZE) * CONFIG.WALL_SIZE;
    const gridY = Math.floor(y / CONFIG.WALL_SIZE) * CONFIG.WALL_SIZE;
    super(gridX, gridY, CONFIG.WALL_SIZE, CONFIG.WALL_SIZE, CONFIG.WALL_HP);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_dt: number) {
    // 墙体不需要每帧更新
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    if (!this.alive) return;

    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;

    // 主体
    ctx.fillStyle = CONFIG.COLOR_WALL;
    ctx.fillRect(screenX, screenY, this.width, this.height);

    // 边框
    ctx.strokeStyle = CONFIG.COLOR_WALL_STROKE;
    ctx.lineWidth = 2;
    ctx.strokeRect(screenX + 1, screenY + 1, this.width - 2, this.height - 2);

    // 砖块纹理
    ctx.strokeStyle = CONFIG.COLOR_WALL_DETAIL;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(screenX + this.width / 2, screenY);
    ctx.lineTo(screenX + this.width / 2, screenY + this.height);
    ctx.moveTo(screenX, screenY + this.height / 2);
    ctx.lineTo(screenX + this.width / 2, screenY + this.height / 2);
    ctx.moveTo(screenX + this.width / 2, screenY + this.height / 4);
    ctx.lineTo(screenX + this.width, screenY + this.height / 4);
    ctx.moveTo(screenX + this.width / 2, screenY + 3 * this.height / 4);
    ctx.lineTo(screenX + this.width, screenY + 3 * this.height / 4);
    ctx.stroke();

    // HP条
    if (this.hp < this.maxHp) {
      const barWidth = this.width - 4;
      const barHeight = 4;
      const barX = screenX + 2;
      const barY = screenY - 6;
      const hpRatio = this.hp / this.maxHp;

      ctx.fillStyle = CONFIG.COLOR_HP_BG;
      ctx.fillRect(barX, barY, barWidth, barHeight);
      ctx.fillStyle = hpRatio > 0.3 ? CONFIG.COLOR_HP_GREEN : CONFIG.COLOR_HP_RED;
      ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);
    }
  }
}
