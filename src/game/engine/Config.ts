// 游戏参数集中配置
export const CONFIG = {
  // 玩家
  PLAYER_HP: 100,
  PLAYER_SPEED: 3,
  PLAYER_SHOOT_COOLDOWN: 200, // ms
  PLAYER_SIZE: 20,

  // 子弹
  BULLET_SPEED: 8,
  BULLET_DAMAGE: 20,
  BULLET_SIZE: 4,

  // 墙体
  WALL_HP: 500,
  WALL_SIZE: 32,

  // 机枪塔
  TURRET_HP: 100,
  TURRET_SIZE: 28,
  TURRET_RANGE: 200,
  TURRET_SHOOT_COOLDOWN: 500, // ms
  TURRET_DURABILITY_COST: 2, // HP per shot

  // 敌人
  ENEMY_HP: 50,
  ENEMY_SPEED: 1.5,
  ENEMY_DAMAGE: 10, // per second
  ENEMY_SIZE: 18,
  ENEMY_SPAWN_INTERVAL_BASE: 3000, // ms

  // 波次
  WAVE_INTERVAL: 15000, // ms per wave
  WAVE_SPAWN_REDUCTION: 200, // ms reduced per wave
  WAVE_ENEMY_COUNT_INCREMENT: 1,

  // 地图
  MAP_WIDTH: 2000,
  MAP_HEIGHT: 2000,
  GRID_SIZE: 40,

  // 颜色
  COLOR_BG: '#1a1a2e',
  COLOR_GRID: '#16213e',
  COLOR_PLAYER: '#4ecca3',
  COLOR_ENEMY: '#e74c3c',
  COLOR_WALL: '#8b7355',
  COLOR_TURRET: '#3498db',
  COLOR_BULLET: '#f1c40f',
  COLOR_UI_PANEL: 'rgba(0,0,0,0.7)',
  COLOR_HP_GREEN: '#2ecc71',
  COLOR_HP_RED: '#e74c3c',
  COLOR_TURRET_RANGE: 'rgba(52,152,219,0.15)',
  COLOR_PREVIEW_VALID: 'rgba(46,204,113,0.4)',
  COLOR_PREVIEW_INVALID: 'rgba(231,76,60,0.4)',
} as const;

export type BuildType = 'wall' | 'turret' | null;
