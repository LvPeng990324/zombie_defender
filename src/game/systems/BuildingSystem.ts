import { CONFIG } from '../engine/Config';
import type { BuildType } from '../engine/Config';
import { Wall } from '../entities/Wall';
import { Turret } from '../entities/Turret';
import type { Building } from '../entities/Building';
import type { Player } from '../entities/Player';

export class BuildingSystem {
  buildings: Building[] = [];
  private buildCooldown: number = 0;
  private buildCooldownMax: number = 300; // 300ms建造冷却

  update(dt: number) {
    if (this.buildCooldown > 0) {
      this.buildCooldown -= dt;
    }
  }

  canBuild(): boolean {
    return this.buildCooldown <= 0;
  }

  build(type: BuildType, worldX: number, worldY: number, _player: Player): boolean {
    if (!type || this.buildCooldown > 0) return false;

    // 检查位置是否已被占用
    const gridSize = CONFIG.wall.size;
    const gridX = Math.floor(worldX / gridSize) * gridSize;
    const gridY = Math.floor(worldY / gridSize) * gridSize;

    for (const b of this.buildings) {
      if (b.alive && b.x === gridX && b.y === gridY) {
        return false; // 位置已被占用
      }
    }

    // 检查是否在玩家身上
    const px = _player.x;
    const py = _player.y;
    const pw = _player.width;
    const ph = _player.height;
    if (
      gridX < px + pw &&
      gridX + gridSize > px &&
      gridY < py + ph &&
      gridY + gridSize > py
    ) {
      return false;
    }

    let building: Building;
    if (type === 'wall') {
      building = new Wall(worldX, worldY);
    } else if (type === 'turret') {
      building = new Turret(worldX, worldY);
    } else {
      return false;
    }

    this.buildings.push(building);
    this.buildCooldown = this.buildCooldownMax;
    return true;
  }

  // 检查某个位置是否可以建造（用于预览）
  canBuildAt(worldX: number, worldY: number, player: Player): boolean {
    const gridSize = CONFIG.wall.size;
    const gridX = Math.floor(worldX / gridSize) * gridSize;
    const gridY = Math.floor(worldY / gridSize) * gridSize;

    for (const b of this.buildings) {
      if (b.alive && b.x === gridX && b.y === gridY) {
        return false;
      }
    }

    const px = player.x;
    const py = player.y;
    const pw = player.width;
    const ph = player.height;
    if (
      gridX < px + pw &&
      gridX + gridSize > px &&
      gridY < py + ph &&
      gridY + gridSize > py
    ) {
      return false;
    }

    return true;
  }

  getWalls(): Wall[] {
    return this.buildings.filter(b => b.alive && b.buildingType === 'wall') as Wall[];
  }

  getTurrets(): Turret[] {
    return this.buildings.filter(b => b.alive && b.buildingType === 'turret') as unknown as Turret[];
  }

  cleanup() {
    this.buildings = this.buildings.filter(b => b.alive);
  }

  reset() {
    this.buildings = [];
    this.buildCooldown = 0;
  }
}
