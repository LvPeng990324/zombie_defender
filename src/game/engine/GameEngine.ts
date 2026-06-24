import { CONFIG } from './Config';
import type { BuildType } from './Config';
import { InputManager } from './InputManager';
import { getDistance } from './Collision';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { FloatingText } from '../entities/FloatingText';
import { SpawnSystem } from '../systems/SpawnSystem';
import { BuildingSystem } from '../systems/BuildingSystem';
import { UIRenderer } from '../systems/UIRenderer';
import type { GameState } from '../GameCanvas';

export class GameEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  input: InputManager;
  player: Player;
  enemies: Enemy[] = [];
  bullets: Bullet[] = [];
  floatingTexts: FloatingText[] = [];
  spawnSystem: SpawnSystem;
  buildingSystem: BuildingSystem;
  uiRenderer: UIRenderer;

  cameraX: number = 0;
  cameraY: number = 0;

  // 游戏状态回调
  onStateChange: ((state: GameState) => void) | null = null;

  // 统计
  killCount: number = 0;
  survivalTime: number = 0; // ms
  startTime: number = 0;

  // 建材资源
  materials: number = CONFIG.MATERIALS_INITIAL;

  // 游戏状态
  isRunning: boolean = false;
  isGameOver: boolean = false;

  // 动画帧
  private animFrameId: number = 0;
  private lastTimestamp: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    // 初始化输入
    this.input = new InputManager();
    this.input.init(canvas);

    // 初始化玩家（地图中心）
    const startX = CONFIG.MAP_WIDTH / 2 - CONFIG.PLAYER_SIZE / 2;
    const startY = CONFIG.MAP_HEIGHT / 2 - CONFIG.PLAYER_SIZE / 2;
    this.player = new Player(startX, startY, this.input);

    // 初始化系统
    this.spawnSystem = new SpawnSystem();
    this.buildingSystem = new BuildingSystem();
    this.uiRenderer = new UIRenderer();
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isGameOver = false;
    this.startTime = Date.now();
    this.lastTimestamp = performance.now();
    this.gameLoop(performance.now());
  }

  stop() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }

  reset() {
    this.stop();
    this.enemies = [];
    this.bullets = [];
    this.floatingTexts = [];
    this.killCount = 0;
    this.survivalTime = 0;
    this.materials = CONFIG.MATERIALS_INITIAL;
    this.isGameOver = false;
    this.isRunning = false;

    // 重置玩家到中心
    const startX = CONFIG.MAP_WIDTH / 2 - CONFIG.PLAYER_SIZE / 2;
    const startY = CONFIG.MAP_HEIGHT / 2 - CONFIG.PLAYER_SIZE / 2;
    this.player = new Player(startX, startY, this.input);

    this.spawnSystem.reset();
    this.buildingSystem.reset();
  }

  destroy() {
    this.stop();
    this.input.destroy();
  }

  private gameLoop = (timestamp: number) => {
    if (!this.isRunning) return;

    const rawDt = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    // 限制最大dt防止切换标签页后跳变
    const dt = Math.min(rawDt, 100);

    this.update(dt);
    this.render();

    this.animFrameId = requestAnimationFrame(this.gameLoop);
  };

  private update(dt: number) {
    if (this.isGameOver) return;

    this.survivalTime = Date.now() - this.startTime;

    // 更新输入
    this.input.setCamera(this.cameraX, this.cameraY);

    // 更新玩家
    this.player.update(dt);

    // 更新摄像机（跟随玩家）
    this.cameraX = this.player.centerX - this.canvas.width / 2;
    this.cameraY = this.player.centerY - this.canvas.height / 2;
    // 限制摄像机范围
    this.cameraX = Math.max(0, Math.min(CONFIG.MAP_WIDTH - this.canvas.width, this.cameraX));
    this.cameraY = Math.max(0, Math.min(CONFIG.MAP_HEIGHT - this.canvas.height, this.cameraY));

    // 玩家射击
    if (this.player.canShoot() && this.input.mouseDown) {
      const angle = Math.atan2(
        this.input.mouseWorldY - this.player.centerY,
        this.input.mouseWorldX - this.player.centerX
      );
      const bullet = new Bullet(
        this.player.centerX - CONFIG.BULLET_SIZE / 2,
        this.player.centerY - CONFIG.BULLET_SIZE / 2,
        angle,
        true
      );
      this.bullets.push(bullet);
      this.player.shoot();
    }

    // 建造
    this.buildingSystem.update(dt);
    if (this.input.buildType && this.input.mouseClicked) {
      const cost = this.input.buildType === 'wall' ? CONFIG.WALL_COST : CONFIG.TURRET_COST;
      if (this.materials >= cost) {
        const success = this.buildingSystem.build(
          this.input.buildType,
          this.input.mouseWorldX,
          this.input.mouseWorldY,
          this.player
        );
        if (success) {
          this.materials -= cost;
          // 播放建造效果或音效可以在这里添加
        }
      }
    }

    // 生成敌人
    this.spawnSystem.update(dt, (enemy) => {
      this.enemies.push(enemy);
    });

    // 更新敌人
    const allBuildings = this.buildingSystem.buildings;
    const walls = this.buildingSystem.getWalls();
    for (const enemy of this.enemies) {
      enemy.update(dt, this.player, allBuildings);
    }

    // 更新机枪塔
    const turrets = this.buildingSystem.getTurrets();
    const aliveEnemies = this.enemies.filter(e => e.alive);

    for (const turret of turrets) {
      turret.update(dt, aliveEnemies, walls);

      if (turret.canShoot() && turret.target) {
        // 使用炮塔已经计算好的带提前量的朝向
        const angle = turret.facingAngle;
        const bullet = new Bullet(
          turret.centerX - CONFIG.BULLET_SIZE / 2,
          turret.centerY - CONFIG.BULLET_SIZE / 2,
          angle,
          false
        );
        bullet.damage = CONFIG.BULLET_DAMAGE / 2; // 机枪塔伤害减半
        this.bullets.push(bullet);
        turret.shoot();
      }
    }

    // 更新浮动文字特效
    for (const text of this.floatingTexts) {
      text.update(dt);
    }

    // 更新子弹
    for (const bullet of this.bullets) {
      bullet.update(dt);

      if (!bullet.alive) continue;

      if (bullet.fromPlayer) {
        // 玩家子弹打敌人
        for (const enemy of this.enemies) {
          if (!enemy.alive) continue;
          const dist = getDistance(
            bullet.centerX, bullet.centerY,
            enemy.centerX, enemy.centerY
          );
          if (dist < enemy.width / 2 + bullet.width / 2) {
            enemy.takeDamage(bullet.damage);
            bullet.alive = false;
            if (!enemy.alive) {
              this.killCount++;
              this.addMaterialDrop(enemy.centerX, enemy.centerY);
            }
            break;
          }
        }
      } else {
        // 机枪塔子弹打敌人
        for (const enemy of this.enemies) {
          if (!enemy.alive) continue;
          const dist = getDistance(
            bullet.centerX, bullet.centerY,
            enemy.centerX, enemy.centerY
          );
          if (dist < enemy.width / 2 + bullet.width / 2) {
            enemy.takeDamage(bullet.damage);
            bullet.alive = false;
            if (!enemy.alive) {
              this.killCount++;
              this.addMaterialDrop(enemy.centerX, enemy.centerY);
            }
            break;
          }
        }
      }

      // 子弹打墙体
      if (bullet.alive) {
        for (const wall of walls) {
          if (!wall.alive) continue;
          const dist = getDistance(
            bullet.centerX, bullet.centerY,
            wall.centerX, wall.centerY
          );
          if (dist < wall.width / 2 + bullet.width) {
            bullet.alive = false;
            break;
          }
        }
      }
    }

    // 清理死亡实体
    this.enemies = this.enemies.filter(e => e.alive);
    this.bullets = this.bullets.filter(b => b.alive);
    this.floatingTexts = this.floatingTexts.filter(t => t.alive);
    this.buildingSystem.cleanup();

    // 检查游戏结束
    if (this.player.hp <= 0) {
      this.isGameOver = true;
      this.isRunning = false;
      this.onStateChange?.({
        hp: 0,
        maxHp: CONFIG.PLAYER_HP,
        wave: this.spawnSystem.getWave(),
        buildType: this.input.buildType,
        killCount: this.killCount,
        survivalTime: this.survivalTime,
        materials: this.materials,
        isGameOver: true,
        isRunning: false,
      });
      return;
    }

    // 重置点击状态
    this.input.resetClick();

    // 通知UI更新
    this.onStateChange?.({
      hp: this.player.hp,
      maxHp: this.player.maxHp,
      wave: this.spawnSystem.getWave(),
      buildType: this.input.buildType,
      killCount: this.killCount,
      survivalTime: this.survivalTime,
      materials: this.materials,
      isGameOver: false,
      isRunning: true,
    });
  }

  private render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 清空画布
    ctx.fillStyle = CONFIG.COLOR_BG;
    ctx.fillRect(0, 0, w, h);

    // 绘制网格背景
    this.renderGrid(ctx, w, h);

    // 绘制建筑
    for (const building of this.buildingSystem.buildings) {
      building.render(ctx, this.cameraX, this.cameraY);
    }

    // 绘制敌人
    for (const enemy of this.enemies) {
      enemy.render(ctx, this.cameraX, this.cameraY);
    }

    // 绘制玩家
    this.player.render(ctx, this.cameraX, this.cameraY);

    // 绘制子弹
    for (const bullet of this.bullets) {
      bullet.render(ctx, this.cameraX, this.cameraY);
    }

    // 绘制浮动文字特效（在最上层）
    for (const text of this.floatingTexts) {
      text.render(ctx, this.cameraX, this.cameraY);
    }

    // 绘制建造预览
    if (this.input.buildType) {
      const cost = this.input.buildType === 'wall' ? CONFIG.WALL_COST : CONFIG.TURRET_COST;
      const canBuild =
        this.buildingSystem.canBuildAt(
          this.input.mouseWorldX,
          this.input.mouseWorldY,
          this.player
        ) && this.materials >= cost;
      this.uiRenderer.renderBuildPreview(
        ctx,
        this.input.mouseWorldX,
        this.input.mouseWorldY,
        canBuild,
        this.input.buildType,
        this.cameraX,
        this.cameraY
      );
    }
  }

  private renderGrid(ctx: CanvasRenderingContext2D, screenW: number, screenH: number) {
    ctx.strokeStyle = CONFIG.COLOR_GRID;
    ctx.lineWidth = 1;

    const startX = Math.floor(this.cameraX / CONFIG.GRID_SIZE) * CONFIG.GRID_SIZE;
    const startY = Math.floor(this.cameraY / CONFIG.GRID_SIZE) * CONFIG.GRID_SIZE;

    for (let x = startX; x < this.cameraX + screenW + CONFIG.GRID_SIZE; x += CONFIG.GRID_SIZE) {
      const screenX = x - this.cameraX;
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, screenH);
      ctx.stroke();
    }

    for (let y = startY; y < this.cameraY + screenH + CONFIG.GRID_SIZE; y += CONFIG.GRID_SIZE) {
      const screenY = y - this.cameraY;
      ctx.beginPath();
      ctx.moveTo(0, screenY);
      ctx.lineTo(screenW, screenY);
      ctx.stroke();
    }
  }

  // 获取游戏状态（用于React UI渲染）
  getGameState(): GameState {
    return {
      hp: this.player.hp,
      maxHp: this.player.maxHp,
      wave: this.spawnSystem.getWave(),
      buildType: this.input.buildType,
      killCount: this.killCount,
      survivalTime: this.survivalTime,
      materials: this.materials,
      isGameOver: this.isGameOver,
      isRunning: this.isRunning,
    };
  }

  // 击杀敌人时概率掉落建材（直接加到玩家身上）并在死亡位置显示浮动提示
  private addMaterialDrop(x: number, y: number) {
    if (Math.random() < CONFIG.MATERIAL_DROP_CHANCE) {
      const amount = Math.floor(
        Math.random() * (CONFIG.MATERIAL_DROP_MAX - CONFIG.MATERIAL_DROP_MIN + 1)
      ) + CONFIG.MATERIAL_DROP_MIN;
      this.materials += amount;
      this.floatingTexts.push(new FloatingText(x, y, `+${amount}`));
    }
  }

  selectBuildType(type: BuildType) {
    this.input.selectBuildType(type);
  }
}
