import { CONFIG } from '../engine/Config';
import { Enemy } from '../entities/Enemy';
import type { EnemyType } from '../entities/Enemy';

export class SpawnSystem {
  private spawnTimer: number = 0;
  private spawnInterval: number = CONFIG.spawnIntervalBase;
  private wave: number = 1;
  enemiesToSpawn: number = 3;
  enemiesSpawnedThisWave: number = 0;
  waveTimer: number = 0;
  private customWaveQueue: EnemyType[] = [];

  update(dt: number, callback: (enemy: Enemy) => void) {
    this.spawnTimer += dt;
    this.waveTimer += dt;

    // 波次管理
    if (this.waveTimer >= CONFIG.WAVE_INTERVAL) {
      this.waveTimer = 0;
      this.wave++;
      this.enemiesToSpawn += CONFIG.WAVE_ENEMY_COUNT_INCREMENT;
      this.enemiesSpawnedThisWave = 0;
      this.spawnInterval = Math.max(500, CONFIG.spawnIntervalBase - (this.wave - 1) * CONFIG.WAVE_SPAWN_REDUCTION);
      this.applyWaveConfig();
    }

    // 生成敌人
    if (this.enemiesSpawnedThisWave < this.enemiesToSpawn && this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.enemiesSpawnedThisWave++;
      const enemy = this.spawnEnemy();
      callback(enemy);
    }
  }

  private applyWaveConfig() {
    const customWaves = CONFIG.customWaves as unknown as Record<string, Record<string, number>> | undefined;
    const waveKey = String(this.wave);
    const config = customWaves?.[waveKey];

    if (config) {
      const queue: EnemyType[] = [];
      for (const [type, count] of Object.entries(config)) {
        const enemyType = type as EnemyType;
        for (let i = 0; i < count; i++) {
          queue.push(enemyType);
        }
      }
      this.customWaveQueue = queue;
      this.enemiesToSpawn = queue.length;
    } else {
      this.customWaveQueue = [];
    }
  }

  private spawnEnemy(): Enemy {
    const side = Math.floor(Math.random() * 4);
    let x: number, y: number;
    const margin = 50;

    switch (side) {
      case 0: // 上边
        x = Math.random() * CONFIG.MAP_WIDTH;
        y = -margin;
        break;
      case 1: // 右边
        x = CONFIG.MAP_WIDTH + margin;
        y = Math.random() * CONFIG.MAP_HEIGHT;
        break;
      case 2: // 下边
        x = Math.random() * CONFIG.MAP_WIDTH;
        y = CONFIG.MAP_HEIGHT + margin;
        break;
      case 3: // 左边
        x = -margin;
        y = Math.random() * CONFIG.MAP_HEIGHT;
        break;
      default:
        x = 0;
        y = 0;
    }

    const type = this.chooseEnemyType();
    return new Enemy(x, y, type);
  }

  private chooseEnemyType(): EnemyType {
    // 优先使用自定义波次队列
    if (this.customWaveQueue.length > 0) {
      return this.customWaveQueue.shift()!;
    }

    // 否则按概率随机生成
    const roll = Math.random();
    const boomerThreshold = this.wave >= CONFIG.boomer.minWave ? CONFIG.boomer.spawnChance : 0;
    const fatThreshold = boomerThreshold + (this.wave >= CONFIG.fat.minWave ? CONFIG.fat.spawnChance : 0);
    const thinMonkeyThreshold = fatThreshold + (this.wave >= CONFIG.thin_monkey.minWave ? CONFIG.thin_monkey.spawnChance : 0);

    if (roll < boomerThreshold) {
      return 'boomer';
    } else if (roll < fatThreshold) {
      return 'fat';
    } else if (roll < thinMonkeyThreshold) {
      return 'thin_monkey';
    }

    return 'normal';
  }

  getWave(): number {
    return this.wave;
  }

  reset() {
    this.spawnTimer = 0;
    this.spawnInterval = CONFIG.spawnIntervalBase;
    this.wave = 1;
    this.enemiesToSpawn = 3;
    this.enemiesSpawnedThisWave = 0;
    this.waveTimer = 0;
    this.customWaveQueue = [];
    this.applyWaveConfig();
  }
}
