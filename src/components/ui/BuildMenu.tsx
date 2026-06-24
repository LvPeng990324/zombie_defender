import { CONFIG, hexToRgba } from '@/game/engine/Config';
import type { BuildType } from '@/game/engine/Config';
import { Shield, Crosshair } from 'lucide-react';

interface BuildMenuProps {
  buildType: BuildType;
  materials: number;
  onSelectBuildType: (type: BuildType) => void;
}

export default function BuildMenu({ buildType, materials, onSelectBuildType }: BuildMenuProps) {
  const wallSelected = buildType === 'wall';
  const turretSelected = buildType === 'turret';
  const canAffordWall = materials >= CONFIG.wall.cost;
  const canAffordTurret = materials >= CONFIG.turret.cost;

  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3 border border-white/10"
      style={{ backgroundColor: CONFIG.COLOR_UI_PANEL }}
    >
      <button
        onClick={() => onSelectBuildType(wallSelected ? null : 'wall')}
        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg border-2 transition-all ${
          wallSelected ? 'scale-105' : 'border-white/20 bg-white/5 hover:bg-white/10'
        } ${!wallSelected && !canAffordWall ? 'opacity-50' : ''}`}
        style={wallSelected ? {
          borderColor: CONFIG.COLOR_WALL,
          backgroundColor: hexToRgba(CONFIG.COLOR_WALL, 0.3),
        } : undefined}
      >
        <Shield className="w-6 h-6" style={{ color: CONFIG.COLOR_WALL }} />
        <span className="text-white text-xs font-bold">墙体</span>
        <span className="text-white/50 text-[10px]">{CONFIG.wall.cost} 建材</span>
        <span className="text-white/50 text-[10px]">按键 1</span>
      </button>

      <button
        onClick={() => onSelectBuildType(turretSelected ? null : 'turret')}
        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg border-2 transition-all ${
          turretSelected ? 'scale-105' : 'border-white/20 bg-white/5 hover:bg-white/10'
        } ${!turretSelected && !canAffordTurret ? 'opacity-50' : ''}`}
        style={turretSelected ? {
          borderColor: CONFIG.COLOR_TURRET,
          backgroundColor: hexToRgba(CONFIG.COLOR_TURRET, 0.3),
        } : undefined}
      >
        <Crosshair className="w-6 h-6" style={{ color: CONFIG.COLOR_TURRET }} />
        <span className="text-white text-xs font-bold">机枪塔</span>
        <span className="text-white/50 text-[10px]">{CONFIG.turret.cost} 建材</span>
        <span className="text-white/50 text-[10px]">按键 2</span>
      </button>

      <div className="w-px h-10 bg-white/20 mx-1" />

      <div className="flex flex-col text-white/70 text-[10px] leading-tight">
        <span>点击空地放置</span>
        <span>ESC 取消建造</span>
      </div>
    </div>
  );
}
