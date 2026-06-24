import { CONFIG } from '@/game/engine/Config';
import type { GameState } from '@/game/GameCanvas';
import type { BuildType } from '@/game/engine/Config';
import HPBar from './HPBar';
import BuildMenu from './BuildMenu';
import { Swords } from 'lucide-react';

interface GameUIProps {
  state: GameState;
  onSelectBuildType: (type: BuildType) => void;
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) {
    return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  }
  return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
}

export default function GameUI({ state, onSelectBuildType }: GameUIProps) {
  return (
    <div
      className="fixed inset-0 z-10 pointer-events-none"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* 左上角：HP条和波次信息 */}
      <div className="absolute top-4 left-4 flex flex-col gap-3 pointer-events-auto">
        <HPBar hp={state.hp} maxHp={state.maxHp} />

        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2 border border-white/10"
          style={{ backgroundColor: CONFIG.COLOR_UI_PANEL }}
        >
          <Swords className="w-5 h-5" style={{ color: CONFIG.COLOR_UI_ICON_WAVE }} />
          <div className="flex flex-col">
            <span className="text-white text-sm font-bold">
              第 {state.wave} 波
            </span>
            <span className="text-white/60 text-xs">
              击杀: {state.killCount}
            </span>
          </div>
        </div>

        <div
          className="rounded-lg px-3 py-2 border border-white/10"
          style={{ backgroundColor: CONFIG.COLOR_UI_PANEL }}
        >
          <span className="text-white/60 text-xs">存活时间: </span>
          <span className="text-white text-sm font-mono font-bold">{formatTime(state.survivalTime)}</span>
        </div>
      </div>

      {/* 底部中央：建造菜单 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto">
        <BuildMenu
          buildType={state.buildType}
          onSelectBuildType={onSelectBuildType}
        />
      </div>

      {/* 当前建造模式提示 */}
      {state.buildType && (
        <div
          className="absolute top-4 right-4 rounded-lg px-4 py-2 border border-white/20"
          style={{ backgroundColor: CONFIG.COLOR_UI_PANEL }}
        >
          <span className="text-white text-sm">
            建造模式: {' '}
            <span
              className="font-bold"
              style={{
                color: state.buildType === 'wall' ? CONFIG.COLOR_WALL : CONFIG.COLOR_TURRET,
              }}
            >
              {state.buildType === 'wall' ? '墙体' : '机枪塔'}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
