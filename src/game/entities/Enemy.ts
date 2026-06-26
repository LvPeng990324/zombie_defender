import { CONFIG } from '../engine/Config';
import { getDistance } from '../engine/Collision';
import { Entity } from './Entity';
import type { Player } from './Player';
import type { Building } from './Building';
import type { Wall } from './Wall';

export type EnemyType = 'normal' | 'thin_monkey' | 'fat' | 'boomer';

interface EnemyConfig {
  size: number;
  hp: number;
  speed: number;
  damage: number;
  dropChance: number;
  dropMin: number;
  dropMax: number;
  color: string;
  attackRange?: number;
  attackCooldown?: number;
  projectileDamage?: number;
  explosionRadius?: number;
  explosionDamage?: number;
}

const ENEMY_CONFIG_MAP: Record<EnemyType, EnemyConfig> = {
  normal: {
    size: CONFIG.normal.size,
    hp: CONFIG.normal.hp,
    speed: CONFIG.normal.speed,
    damage: CONFIG.normal.damage,
    dropChance: CONFIG.normal.dropChance,
    dropMin: CONFIG.normal.dropMin,
    dropMax: CONFIG.normal.dropMax,
    color: CONFIG.COLOR_ENEMY,
  },
  thin_monkey: {
    size: CONFIG.thin_monkey.size,
    hp: CONFIG.thin_monkey.hp,
    speed: CONFIG.thin_monkey.speed,
    damage: CONFIG.thin_monkey.damage,
    dropChance: CONFIG.thin_monkey.dropChance,
    dropMin: CONFIG.thin_monkey.dropMin,
    dropMax: CONFIG.thin_monkey.dropMax,
    color: CONFIG.COLOR_THIN_MONKEY,
  },
  fat: {
    size: CONFIG.fat.size,
    hp: CONFIG.fat.hp,
    speed: CONFIG.fat.speed,
    damage: CONFIG.fat.damage,
    dropChance: CONFIG.fat.dropChance,
    dropMin: CONFIG.fat.dropMin,
    dropMax: CONFIG.fat.dropMax,
    color: CONFIG.COLOR_FAT,
  },
  boomer: {
    size: CONFIG.boomer.size,
    hp: CONFIG.boomer.hp,
    speed: CONFIG.boomer.speed,
    damage: CONFIG.boomer.damage,
    dropChance: CONFIG.boomer.dropChance,
    dropMin: CONFIG.boomer.dropMin,
    dropMax: CONFIG.boomer.dropMax,
    color: CONFIG.COLOR_BOOMER,
    attackRange: CONFIG.boomer.attackRange,
    attackCooldown: CONFIG.boomer.attackCooldown,
    projectileDamage: CONFIG.boomer.projectileDamage,
    explosionRadius: CONFIG.boomer.explosionRadius,
    explosionDamage: CONFIG.boomer.explosionDamage,
  },
};

export class Enemy extends Entity {
  enemyType: EnemyType;
  speed: number;
  damage: number;
  dropChance: number;
  dropMin: number;
  dropMax: number;
  color: string;
  attackCooldown: number = 0;
  boomerAttackCooldown: number = 0;
  vx: number = 0;
  vy: number = 0;
  private targetX: number = 0;
  private targetY: number = 0;
  private targetUpdateTimer: number = 0;

  constructor(x: number, y: number, type: EnemyType = 'normal') {
    const cfg = ENEMY_CONFIG_MAP[type];
    super(x, y, cfg.size, cfg.size, cfg.hp);

    this.enemyType = type;
    this.speed = cfg.speed;
    this.damage = cfg.damage;
    this.dropChance = cfg.dropChance;
    this.dropMin = cfg.dropMin;
    this.dropMax = cfg.dropMax;
    this.color = cfg.color;
  }

  update(
    dt: number,
    player?: Player,
    buildings?: Building[],
    onShootBile?: (x: number, y: number, angle: number, damage: number) => void
  ) {
    if (!this.alive) return;

    this.targetUpdateTimer -= dt;

    // 定期更新目标
    if (this.targetUpdateTimer <= 0) {
      this.targetUpdateTimer = 500; // 每500ms重新评估目标
      if (player && buildings) {
        this.chooseTarget(player, buildings);
      }
    }

    // Boomer 远程喷射胆汁攻击
    if (this.enemyType === 'boomer' && player && buildings) {
      this.boomerAttackCooldown -= dt;
      if (this.boomerAttackCooldown <= 0) {
        const target = this.findBileTarget(player, buildings);
        if (target) {
          const angle = Math.atan2(
            target.centerY - this.centerY,
            target.centerX - this.centerX
          );
          onShootBile?.(
            this.centerX,
            this.centerY,
            angle,
            CONFIG.boomer.projectileDamage
          );
          this.boomerAttackCooldown = CONFIG.boomer.attackCooldown;
        }
      }
    }

    // 向目标移动
    const dx = this.targetX - this.centerX;
    const dy = this.targetY - this.centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 5) {
      const prevX = this.x;
      const prevY = this.y;
      const moveX = (dx / dist) * this.speed;
      const moveY = (dy / dist) * this.speed;

      // 简单的碰撞避免 - 如果移动后与建筑碰撞，尝试绕行
      const newX = this.x + moveX;
      const newY = this.y + moveY;

      // 检查与墙体碰撞
      let collidesX = false;
      let collidesY = false;

      const buildingList = buildings || [];
      for (const b of buildingList) {
        if (!b.alive || b.buildingType !== 'wall') continue;
        if (this.rectCollision(newX, this.y, b)) collidesX = true;
        if (this.rectCollision(this.x, newY, b)) collidesY = true;
      }

      if (!collidesX) this.x = newX;
      if (!collidesY) this.y = newY;

      // 如果两个方向都碰撞，尝试斜向
      if (collidesX && collidesY) {
        const altX = this.x + moveX * 0.7 - moveY * 0.7;
        const altY = this.y + moveX * 0.7 + moveY * 0.7;
        let altCollides = false;
        for (const b of buildingList) {
          if (!b.alive || b.buildingType !== 'wall') continue;
          if (this.rectCollision(altX, altY, b)) { altCollides = true; break; }
        }
        if (!altCollides) {
          this.x = altX;
          this.y = altY;
        }
      }

      // 记录本帧实际速度，供炮塔计算提前量
      this.vx = this.x - prevX;
      this.vy = this.y - prevY;
    } else {
      this.vx = 0;
      this.vy = 0;
    }

    // 边界限制
    this.x = Math.max(0, Math.min(CONFIG.MAP_WIDTH - this.width, this.x));
    this.y = Math.max(0, Math.min(CONFIG.MAP_HEIGHT - this.height, this.y));

    // 攻击冷却
    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
    }

    // 检查与玩家碰撞（攻击）
    if (player && player.alive && this.collidesWith(player)) {
      if (this.attackCooldown <= 0) {
        player.takeDamage(this.damage);
        player.invulnerable = 300; // 300ms无敌时间
        this.attackCooldown = 1000;
      }
    }

    // 检查与建筑碰撞（攻击墙体）
    if (buildings) {
      for (const b of buildings) {
        if (!b.alive || b.buildingType !== 'wall') continue;
        if (this.collidesWith(b)) {
          if (this.attackCooldown <= 0) {
            b.takeDamage(this.damage * 2); // 对建筑伤害更高
            this.attackCooldown = 1000;
          }
          break;
        }
      }
    }
  }

  private chooseTarget(player: Player, buildings: Building[]) {
    // 优先攻击阻挡路径的墙体，其次是玩家
    let bestTarget: Wall | null = null;
    let bestScore = Infinity;

    // 检查路径上是否有墙体阻挡
    const walls = buildings.filter(b => b.alive && b.buildingType === 'wall') as Wall[];

    for (const wall of walls) {
      const dist = getDistance(this.centerX, this.centerY, wall.centerX, wall.centerY);
      // 检查墙体是否在通往玩家的路径上
      const dot = this.isOnPathTo(wall, player);
      if (dot && dist < 200) {
        const score = dist * 0.5; // 优先攻击近的墙体
        if (score < bestScore) {
          bestScore = score;
          bestTarget = wall;
        }
      }
    }

    if (bestTarget) {
      this.targetX = bestTarget.centerX;
      this.targetY = bestTarget.centerY;
      return;
    }

    // 没有阻挡墙体，直接追玩家
    if (player.alive) {
      this.targetX = player.centerX;
      this.targetY = player.centerY;
    } else {
      // 玩家死亡，攻击最近的建筑
      let closest: Building | null = null;
      let closestDist = Infinity;
      for (const b of buildings) {
        if (!b.alive) continue;
        const d = getDistance(this.centerX, this.centerY, b.centerX, b.centerY);
        if (d < closestDist) {
          closestDist = d;
          closest = b;
        }
      }
      if (closest) {
        this.targetX = closest.centerX;
        this.targetY = closest.centerY;
      }
    }
  }

  /**
   * Boomer 寻找胆汁攻击目标：优先玩家，其次射程内最近的建筑。
   */
  private findBileTarget(player: Player, buildings: Building[]): Entity | null {
    const range = CONFIG.boomer.attackRange;

    if (player.alive) {
      const distToPlayer = getDistance(
        this.centerX,
        this.centerY,
        player.centerX,
        player.centerY
      );
      if (distToPlayer <= range) {
        return player;
      }
    }

    let closest: Building | null = null;
    let closestDist = Infinity;
    for (const b of buildings) {
      if (!b.alive) continue;
      const d = getDistance(this.centerX, this.centerY, b.centerX, b.centerY);
      if (d <= range && d < closestDist) {
        closestDist = d;
        closest = b;
      }
    }

    return closest;
  }

  private isOnPathTo(wall: Wall, player: Player): boolean {
    // 简单检查：墙体是否在敌人到玩家的直线路径附近
    const ex = this.centerX, ey = this.centerY;
    const px = player.centerX, py = player.centerY;
    const wx = wall.centerX, wy = wall.centerY;

    // 计算点到线段的距离
    const dx = px - ex;
    const dy = py - ey;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return false;

    let t = ((wx - ex) * dx + (wy - ey) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));

    const projX = ex + t * dx;
    const projY = ey + t * dy;
    const distToLine = getDistance(wx, wy, projX, projY);

    return distToLine < 80; // 如果在路径80px范围内，认为在路径上
  }

  private collidesWith(other: Entity): boolean {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }

  private rectCollision(x: number, y: number, other: Entity): boolean {
    return (
      x < other.x + other.width &&
      x + this.width > other.x &&
      y < other.y + other.height &&
      y + this.height > other.y
    );
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    if (!this.alive) return;

    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;

    // 身体
    ctx.fillStyle = this.color;
    ctx.beginPath();
    // 画一个方形带圆角的敌人
    const r = 4;
    const x = screenX;
    const y = screenY;
    const w = this.width;
    const h = this.height;
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();

    // Boomer 额外绘制膨胀的胆汁囊
    if (this.enemyType === 'boomer') {
      ctx.fillStyle = CONFIG.COLOR_BOOMER_DARK;
      ctx.beginPath();
      ctx.arc(
        screenX + this.width * 0.5,
        screenY + this.height * 0.55,
        this.width * 0.22,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // 眼睛（朝向目标），位置按体型比例缩放
    ctx.fillStyle = CONFIG.COLOR_ENEMY_EYE;
    const dx = this.targetX - this.centerX;
    const dy = this.targetY - this.centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    // 眼睛偏移量固定为朝向目标的方向，最大为体宽的一定比例，避免目标越远眼睛离身体越远
    const maxEyeOffset = this.width * 0.14;
    const eyeOffsetX = dist > 0 ? (dx / dist) * maxEyeOffset : 0;
    const eyeOffsetY = dist > 0 ? (dy / dist) * maxEyeOffset : 0;
    const eyeRadius = this.width * 0.17;
    const eyeY = screenY + this.height * 0.39;
    ctx.beginPath();
    ctx.arc(screenX + this.width * 0.28 + eyeOffsetX, eyeY + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(screenX + this.width * 0.72 + eyeOffsetX, eyeY + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    // HP条
    const barWidth = this.width;
    const barHeight = 3;
    const barX = screenX;
    const barY = screenY - 5;
    const hpRatio = this.hp / this.maxHp;

    ctx.fillStyle = CONFIG.COLOR_HP_BG;
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = hpRatio > 0.3 ? CONFIG.COLOR_HP_GREEN : CONFIG.COLOR_HP_RED;
    ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);
  }
}
