import type { Rect } from './Collision';

// 线段与矩形相交检测（用于机枪塔视线检测）
// 使用Liang-Barsky算法思路：检测线段是否与矩形任何一边相交
export function lineRectIntersect(
  x1: number, y1: number,
  x2: number, y2: number,
  rect: Rect
): boolean {
  // 检查线段是否与矩形相交
  // 左边界
  if (lineLineIntersect(x1, y1, x2, y2, rect.x, rect.y, rect.x, rect.y + rect.height)) return true;
  // 右边界
  if (lineLineIntersect(x1, y1, x2, y2, rect.x + rect.width, rect.y, rect.x + rect.width, rect.y + rect.height)) return true;
  // 上边界
  if (lineLineIntersect(x1, y1, x2, y2, rect.x, rect.y, rect.x + rect.width, rect.y)) return true;
  // 下边界
  if (lineLineIntersect(x1, y1, x2, y2, rect.x, rect.y + rect.height, rect.x + rect.width, rect.y + rect.height)) return true;

  // 线段起点在矩形内部也算相交
  if (x1 >= rect.x && x1 <= rect.x + rect.width && y1 >= rect.y && y1 <= rect.y + rect.height) return true;
  if (x2 >= rect.x && x2 <= rect.x + rect.width && y2 >= rect.y && y2 <= rect.y + rect.height) return true;

  return false;
}

// 两条线段是否相交
function lineLineIntersect(
  x1: number, y1: number, x2: number, y2: number,
  x3: number, y3: number, x4: number, y4: number
): boolean {
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 1e-10) return false; // 平行

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

// 射线检测：从起点到终点是否有墙体阻挡
export function hasLineOfSight(
  fromX: number, fromY: number,
  toX: number, toY: number,
  obstacles: Rect[]
): boolean {
  for (const obs of obstacles) {
    if (lineRectIntersect(fromX, fromY, toX, toY, obs)) {
      return false;
    }
  }
  return true;
}
