import { CONFIG } from '../engine/Config';
import type { BuildType } from '../engine/Config';
import { rectIntersect } from '../engine/Collision';
import { Wall } from '../entities/Wall';
import { Turret } from '../entities/Turret';
import { MaterialGenerator } from '../entities/MaterialGenerator';
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

    const newRect = this.getBuildingRect(type, worldX, worldY);
    if (!newRect) return false;

    // 检查是否与现有建筑重叠
    for (const b of this.buildings) {
      if (!b.alive) continue;
      if (rectIntersect(newRect, b)) {
        return false;
      }
    }

    // 检查是否与玩家重叠
    const playerRect = { x: _player.x, y: _player.y, width: _player.width, height: _player.height };
    if (rectIntersect(newRect, playerRect)) {
      return false;
    }

    let building: Building;
    if (type === 'wall') {
      building = new Wall(worldX, worldY);
    } else if (type === 'turret') {
      building = new Turret(worldX, worldY);
    } else if (type === 'material_generator') {
      building = new MaterialGenerator(worldX, worldY);
    } else {
      return false;
    }

    this.buildings.push(building);
    this.buildCooldown = this.buildCooldownMax;
    return true;
  }

  // 检查某个位置是否可以建造（用于预览）
  canBuildAt(type: BuildType, worldX: number, worldY: number, player: Player): boolean {
    if (!type) return false;

    const newRect = this.getBuildingRect(type, worldX, worldY);
    if (!newRect) return false;

    for (const b of this.buildings) {
      if (!b.alive) continue;
      if (rectIntersect(newRect, b)) {
        return false;
      }
    }

    const playerRect = { x: player.x, y: player.y, width: player.width, height: player.height };
    if (rectIntersect(newRect, playerRect)) {
      return false;
    }

    return true;
  }

  // 获取指定类型的建筑在指定世界坐标下的矩形（用于碰撞/放置检测）
  getBuildingRect(type: BuildType, worldX: number, worldY: number): { x: number; y: number; width: number; height: number } | null {
    if (!type) return null;

    const gridSize = CONFIG.wall.size;
    const gridX = Math.floor(worldX / gridSize) * gridSize;
    const gridY = Math.floor(worldY / gridSize) * gridSize;

    if (type === 'wall') {
      return { x: gridX, y: gridY, width: CONFIG.wall.size, height: CONFIG.wall.size };
    }
    if (type === 'turret') {
      return { x: gridX, y: gridY, width: CONFIG.turret.size, height: CONFIG.turret.size };
    }
    if (type === 'material_generator') {
      return { x: gridX, y: gridY, width: CONFIG.material_generator.size, height: CONFIG.material_generator.size };
    }
    return null;
  }

  getWalls(): Wall[] {
    return this.buildings.filter(b => b.alive && b.buildingType === 'wall') as Wall[];
  }

  getTurrets(): Turret[] {
    return this.buildings.filter(b => b.alive && b.buildingType === 'turret') as unknown as Turret[];
  }

  getMaterialGenerators(): MaterialGenerator[] {
    return this.buildings.filter(b => b.alive && b.buildingType === 'material_generator') as unknown as MaterialGenerator[];
  }

  cleanup() {
    this.buildings = this.buildings.filter(b => b.alive);
  }

  reset() {
    this.buildings = [];
    this.buildCooldown = 0;
  }
}
