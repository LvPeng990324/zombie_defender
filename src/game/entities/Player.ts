import { CONFIG } from '../engine/Config';
import { InputManager } from '../engine/InputManager';
import { Entity } from './Entity';

export class Player extends Entity {
  speed: number = CONFIG.PLAYER_SPEED;
  shootCooldown: number = 0;
  shootCooldownMax: number = CONFIG.PLAYER_SHOOT_COOLDOWN;
  facingAngle: number = 0;
  input: InputManager;
  invulnerable: number = 0;

  constructor(x: number, y: number, input: InputManager) {
    super(x, y, CONFIG.PLAYER_SIZE, CONFIG.PLAYER_SIZE, CONFIG.PLAYER_HP);
    this.input = input;
  }

  update(dt: number) {
    if (!this.alive) return;

    // 移动
    let dx = 0;
    let dy = 0;
    if (this.input.isMovingLeft()) dx -= 1;
    if (this.input.isMovingRight()) dx += 1;
    if (this.input.isMovingUp()) dy -= 1;
    if (this.input.isMovingDown()) dy += 1;

    // 归一化对角线移动
    if (dx !== 0 && dy !== 0) {
      const invSqrt2 = 1 / Math.sqrt(2);
      dx *= invSqrt2;
      dy *= invSqrt2;
    }

    this.x += dx * this.speed;
    this.y += dy * this.speed;

    // 边界限制
    this.x = Math.max(0, Math.min(CONFIG.MAP_WIDTH - this.width, this.x));
    this.y = Math.max(0, Math.min(CONFIG.MAP_HEIGHT - this.height, this.y));

    // 更新朝向（面向鼠标）
    const worldMouseX = this.input.mouseWorldX;
    const worldMouseY = this.input.mouseWorldY;
    this.facingAngle = Math.atan2(
      worldMouseY - this.centerY,
      worldMouseX - this.centerX
    );

    // 射击冷却
    if (this.shootCooldown > 0) {
      this.shootCooldown -= dt;
    }

    // 无敌时间
    if (this.invulnerable > 0) {
      this.invulnerable -= dt;
    }
  }

  canShoot(): boolean {
    return this.shootCooldown <= 0 && !this.input.buildType;
  }

  shoot() {
    this.shootCooldown = this.shootCooldownMax;
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    if (!this.alive) return;

    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;

    // 无敌闪烁
    if (this.invulnerable > 0 && Math.floor(this.invulnerable / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    ctx.save();
    ctx.translate(screenX + this.width / 2, screenY + this.height / 2);

    // 身体
    ctx.fillStyle = CONFIG.COLOR_PLAYER;
    ctx.beginPath();
    ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
    ctx.fill();

    // 枪管（指示朝向）
    ctx.rotate(this.facingAngle);
    ctx.fillStyle = '#3dbb95';
    ctx.fillRect(this.width / 2 - 2, -3, 14, 6);

    ctx.restore();

    ctx.globalAlpha = 1;
  }
}
