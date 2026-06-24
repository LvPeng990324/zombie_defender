import { CONFIG } from '@/game/engine/Config';
import type { BuildType } from '@/game/engine/Config';
import { Shield, Crosshair } from 'lucide-react';

interface BuildMenuProps {
  buildType: BuildType;
  onSelectBuildType: (type: BuildType) => void;
}

export default function BuildMenu({ buildType, onSelectBuildType }: BuildMenuProps) {
  return (
    <div className="flex items-center gap-3 bg-black/70 rounded-xl px-4 py-3 border border-white/10">
      <button
        onClick={() => onSelectBuildType(buildType === 'wall' ? null : 'wall')}
        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg border-2 transition-all ${
          buildType === 'wall'
            ? 'border-[#8b7355] bg-[#8b7355]/30 scale-105'
            : 'border-white/20 bg-white/5 hover:bg-white/10'
        }`}
      >
        <Shield className="w-6 h-6" style={{ color: CONFIG.COLOR_WALL }} />
        <span className="text-white text-xs font-bold">墙体</span>
        <span className="text-white/50 text-[10px]">按键 1</span>
      </button>

      <button
        onClick={() => onSelectBuildType(buildType === 'turret' ? null : 'turret')}
        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg border-2 transition-all ${
          buildType === 'turret'
            ? 'border-[#3498db] bg-[#3498db]/30 scale-105'
            : 'border-white/20 bg-white/5 hover:bg-white/10'
        }`}
      >
        <Crosshair className="w-6 h-6" style={{ color: CONFIG.COLOR_TURRET }} />
        <span className="text-white text-xs font-bold">机枪塔</span>
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
