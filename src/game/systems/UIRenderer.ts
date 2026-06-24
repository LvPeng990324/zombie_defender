import { CONFIG } from '../engine/Config';

export class UIRenderer {
  // 在Canvas上渲染游戏内UI（如建造预览）
  renderBuildPreview(
    ctx: CanvasRenderingContext2D,
    worldX: number,
    worldY: number,
    canBuild: boolean,
    buildType: string,
    cameraX: number,
    cameraY: number
  ) {
    const gridSize = CONFIG.WALL_SIZE;
    const gridX = Math.floor(worldX / gridSize) * gridSize - cameraX;
    const gridY = Math.floor(worldY / gridSize) * gridSize - cameraY;

    ctx.fillStyle = canBuild ? CONFIG.COLOR_PREVIEW_VALID : CONFIG.COLOR_PREVIEW_INVALID;
    ctx.fillRect(gridX, gridY, gridSize, gridSize);

    // 边框
    ctx.strokeStyle = canBuild ? CONFIG.COLOR_PREVIEW_BORDER_VALID : CONFIG.COLOR_PREVIEW_BORDER_INVALID;
    ctx.lineWidth = 2;
    ctx.strokeRect(gridX, gridY, gridSize, gridSize);

    // 如果是机枪塔，显示射程
    if (buildType === 'turret' && canBuild) {
      ctx.fillStyle = CONFIG.COLOR_TURRET_RANGE;
      ctx.beginPath();
      ctx.arc(gridX + gridSize / 2, gridY + gridSize / 2, CONFIG.TURRET_RANGE, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
