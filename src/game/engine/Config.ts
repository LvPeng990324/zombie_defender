import gameConfig from '@/config/game.json';
import buildingsConfig from '@/config/buildings.json';
import colorsConfig from '@/config/colors.json';
import wavesConfig from '@/config/waves.json';
import zombieConfig from '@/config/zombie.json';

/**
 * 将十六进制颜色转换为 rgba 字符串，用于需要透明度的场景。
 * @param hex 十六进制颜色，例如 #1a1a2e
 * @param alpha 透明度 0-1
 */
export function hexToRgba(hex: string, alpha: number): string {
  const sanitized = hex.replace('#', '');
  const r = parseInt(sanitized.substring(0, 2), 16);
  const g = parseInt(sanitized.substring(2, 4), 16);
  const b = parseInt(sanitized.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// 将 JSON 配置聚合为统一的 CONFIG 对象，保持原有字段名不变
export const CONFIG = {
  ...gameConfig,
  ...buildingsConfig,
  ...colorsConfig,
  ...wavesConfig,
  ...zombieConfig,
} as const;

export type BuildType = 'wall' | 'turret' | 'material_generator' | null;
