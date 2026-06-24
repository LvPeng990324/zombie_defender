import { CONFIG } from '../engine/Config';
import { Building } from './Building';

export class MaterialGenerator extends Building {
  buildingType: string = 'material_generator';
  productionTimer: number = 0;
  productionInterval: number = CONFIG.material_generator.productionInterval;
  productionAmount: number = CONFIG.material_generator.productionAmount;

  constructor(x: number, y: number) {
    // 将坐标对齐到网格（2x2 尺寸，按左下角网格单元对齐）
    const gridSize = CONFIG.wall.size;
    const gridX = Math.floor(x / gridSize) * gridSize;
    const gridY = Math.floor(y / gridSize) * gridSize;
    super(
      gridX,
      gridY,
      CONFIG.material_generator.size,
      CONFIG.material_generator.size,
      CONFIG.material_generator.hp
    );
  }

  /**
   * 更新生产计时，返回本帧产出的建材数量。
   * @param dt 毫秒
   */
  update(dt: number): number {
    if (!this.alive) return 0;

    this.productionTimer += dt;
    let produced = 0;
    while (this.productionTimer >= this.productionInterval) {
      this.productionTimer -= this.productionInterval;
      produced += this.productionAmount;
    }
    return produced;
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    if (!this.alive) return;

    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;
    const centerX = screenX + this.width / 2;
    const centerY = screenY + this.height / 2;

    // 外发光
    ctx.fillStyle = CONFIG.COLOR_MATERIAL_GENERATOR_GLOW;
    ctx.beginPath();
    ctx.arc(centerX, centerY, this.width / 2 + 4, 0, Math.PI * 2);
    ctx.fill();

    // 主体
    ctx.fillStyle = CONFIG.COLOR_MATERIAL_GENERATOR;
    ctx.fillRect(screenX, screenY, this.width, this.height);

    // 边框
    ctx.strokeStyle = CONFIG.COLOR_MATERIAL_GENERATOR_SHADE;
    ctx.lineWidth = 3;
    ctx.strokeRect(screenX + 2, screenY + 2, this.width - 4, this.height - 4);

    // 中心“产出”标识（小方块 + 光芒）
    ctx.fillStyle = '#fff';
    const coreSize = this.width * 0.25;
    ctx.fillRect(centerX - coreSize / 2, centerY - coreSize / 2, coreSize, coreSize);

    // 四角装饰
    ctx.fillStyle = CONFIG.COLOR_MATERIAL_GENERATOR_SHADE;
    const decoSize = this.width * 0.12;
    ctx.fillRect(screenX + 6, screenY + 6, decoSize, decoSize);
    ctx.fillRect(screenX + this.width - 6 - decoSize, screenY + 6, decoSize, decoSize);
    ctx.fillRect(screenX + 6, screenY + this.height - 6 - decoSize, decoSize, decoSize);
    ctx.fillRect(screenX + this.width - 6 - decoSize, screenY + this.height - 6 - decoSize, decoSize, decoSize);

    // HP条
    if (this.hp < this.maxHp) {
      const barWidth = this.width - 8;
      const barHeight = 4;
      const barX = screenX + 4;
      const barY = screenY - 8;
      const hpRatio = this.hp / this.maxHp;

      ctx.fillStyle = CONFIG.COLOR_HP_BG;
      ctx.fillRect(barX, barY, barWidth, barHeight);
      ctx.fillStyle = hpRatio > 0.3 ? CONFIG.COLOR_HP_GREEN : CONFIG.COLOR_HP_RED;
      ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);
    }
  }
}
