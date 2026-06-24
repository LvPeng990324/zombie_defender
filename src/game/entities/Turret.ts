import { CONFIG } from '../engine/Config';
import { Building } from './Building';
import { getDistance } from '../engine/Collision';
import type { Enemy } from './Enemy';

export class Turret extends Building {
  buildingType: string = 'turret';
  range: number = CONFIG.turret.range;
  shootCooldown: number = 0;
  shootCooldownMax: number = CONFIG.turret.shootCooldown;
  facingAngle: number = 0;
  target: Enemy | null = null;

  constructor(x: number, y: number) {
    const gridX = Math.floor(x / CONFIG.wall.size) * CONFIG.wall.size;
    const gridY = Math.floor(y / CONFIG.wall.size) * CONFIG.wall.size;
    super(gridX, gridY, CONFIG.turret.size, CONFIG.turret.size, CONFIG.turret.hp);
  }

  update(dt: number, enemies?: Enemy[]) {
    if (!this.alive) return;

    // 射击冷却
    if (this.shootCooldown > 0) {
      this.shootCooldown -= dt;
    }

    // 选择目标（墙体不再遮挡视线）
    this.target = enemies ? this.findTarget(enemies) : null;

    if (this.target) {
      // 更新朝向（带提前量）
      this.facingAngle = this.calculateLeadAngle();
    }
  }

  // 计算带提前量的瞄准角度，考虑目标速度和子弹速度
  private calculateLeadAngle(): number {
    if (!this.target) return this.facingAngle;

    const dx = this.target.centerX - this.centerX;
    const dy = this.target.centerY - this.centerY;

    // 目标静止或速度为0，直接瞄准当前位置
    if (this.target.vx === 0 && this.target.vy === 0) {
      return Math.atan2(dy, dx);
    }

    const bulletSpeed = CONFIG.BULLET_SPEED;
    // 解二次方程求子弹命中移动目标所需时间 t
    // (bulletSpeed^2) * t^2 = (dx + vx*t)^2 + (dy + vy*t)^2
    const a = bulletSpeed * bulletSpeed - this.target.vx * this.target.vx - this.target.vy * this.target.vy;
    const b = -2 * (dx * this.target.vx + dy * this.target.vy);
    const c = -(dx * dx + dy * dy);

    // 目标速度不低于子弹速度或无实数解时，退化为直接瞄准
    if (a <= 0) {
      return Math.atan2(dy, dx);
    }

    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) {
      return Math.atan2(dy, dx);
    }

    const t = (-b + Math.sqrt(discriminant)) / (2 * a);
    if (t <= 0) {
      return Math.atan2(dy, dx);
    }

    const predictedX = this.target.centerX + this.target.vx * t;
    const predictedY = this.target.centerY + this.target.vy * t;

    return Math.atan2(predictedY - this.centerY, predictedX - this.centerX);
  }

  canShoot(): boolean {
    return this.alive && this.shootCooldown <= 0 && this.target !== null;
  }

  shoot() {
    this.shootCooldown = this.shootCooldownMax;
    this.takeDamage(CONFIG.turret.durabilityCost);
  }

  // 找最近且在射程内的敌人（墙体不再遮挡视线）
  private findTarget(enemies: Enemy[]): Enemy | null {
    let closest: Enemy | null = null;
    let closestDist = Infinity;

    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const dist = getDistance(this.centerX, this.centerY, enemy.centerX, enemy.centerY);
      if (dist > this.range) continue;

      if (dist < closestDist) {
        closest = enemy;
        closestDist = dist;
      }
    }

    return closest;
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    if (!this.alive) return;

    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;

    // 射程圈（半透明）
    ctx.fillStyle = CONFIG.COLOR_TURRET_RANGE;
    ctx.beginPath();
    ctx.arc(
      screenX + this.width / 2,
      screenY + this.height / 2,
      this.range,
      0, Math.PI * 2
    );
    ctx.fill();

    // 底座
    ctx.fillStyle = CONFIG.COLOR_TURRET_SHADE;
    ctx.beginPath();
    ctx.arc(
      screenX + this.width / 2,
      screenY + this.height / 2,
      this.width / 2,
      0, Math.PI * 2
    );
    ctx.fill();

    // 枪管
    ctx.save();
    ctx.translate(screenX + this.width / 2, screenY + this.height / 2);
    ctx.rotate(this.facingAngle);
    ctx.fillStyle = CONFIG.COLOR_TURRET;
    ctx.fillRect(this.width / 2 - 2, -4, 18, 8);
    ctx.restore();

    // 中心点
    ctx.fillStyle = CONFIG.COLOR_TURRET_BARREL;
    ctx.beginPath();
    ctx.arc(screenX + this.width / 2, screenY + this.height / 2, 5, 0, Math.PI * 2);
    ctx.fill();

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
