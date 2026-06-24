import { CONFIG } from '../engine/Config';

export class WaveSystem {
  wave: number = 1;
  private timer: number = 0;
  private waveDuration: number = CONFIG.WAVE_INTERVAL;
  waveJustStarted: boolean = false;
  waveStartTimer: number = 0;

  update(dt: number): boolean {
    this.timer += dt;
    this.waveStartTimer -= dt;
    if (this.waveStartTimer <= 0) {
      this.waveJustStarted = false;
    }

    if (this.timer >= this.waveDuration) {
      this.timer = 0;
      this.wave++;
      this.waveJustStarted = true;
      this.waveStartTimer = 2000; // 显示2秒波次提示
      return true;
    }
    return false;
  }

  getSpawnInterval(): number {
    return Math.max(500, CONFIG.spawnIntervalBase - (this.wave - 1) * CONFIG.WAVE_SPAWN_REDUCTION);
  }

  getEnemiesPerWave(): number {
    return 3 + (this.wave - 1) * CONFIG.WAVE_ENEMY_COUNT_INCREMENT;
  }

  getWaveProgress(): number {
    return this.timer / this.waveDuration;
  }

  reset() {
    this.wave = 1;
    this.timer = 0;
    this.waveJustStarted = false;
    this.waveStartTimer = 0;
  }
}
