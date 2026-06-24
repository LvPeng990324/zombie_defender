import { CONFIG, hexToRgba } from '@/game/engine/Config';
import { Crosshair, Shield, Move, MousePointer } from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
}

export default function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: hexToRgba(CONFIG.COLOR_BG, 0.95) }}
    >
      <div className="flex flex-col items-center gap-8 max-w-lg px-8">
        {/* 标题 */}
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-5xl font-black text-white tracking-tight">
            防守<span style={{ color: CONFIG.COLOR_PLAYER }}>阵地</span>
          </h1>
          <p className="text-white/60 text-lg">建造防御工事，抵御敌人进攻</p>
        </div>

        {/* 操作说明 */}
        <div className="w-full bg-black/50 rounded-xl p-6 border border-white/10">
          <h2 className="text-white font-bold text-lg mb-4 text-center">操作说明</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Move className="w-5 h-5" style={{ color: CONFIG.COLOR_PLAYER }} />
              </div>
              <div>
                <p className="text-white text-sm font-bold">WASD / 方向键</p>
                <p className="text-white/50 text-xs">移动角色</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <MousePointer className="w-5 h-5" style={{ color: CONFIG.COLOR_BULLET }} />
              </div>
              <div>
                <p className="text-white text-sm font-bold">鼠标移动 + 左键</p>
                <p className="text-white/50 text-xs">瞄准射击</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Shield className="w-5 h-5" style={{ color: CONFIG.COLOR_WALL }} />
              </div>
              <div>
                <p className="text-white text-sm font-bold">数字键 1</p>
                <p className="text-white/50 text-xs">选择墙体</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Crosshair className="w-5 h-5" style={{ color: CONFIG.COLOR_TURRET }} />
              </div>
              <div>
                <p className="text-white text-sm font-bold">数字键 2</p>
                <p className="text-white/50 text-xs">选择机枪塔</p>
              </div>
            </div>
          </div>
        </div>

        {/* 开始按钮 */}
        <button
          onClick={onStart}
          className="px-12 py-4 font-black text-xl rounded-xl transition-all hover:scale-105 active:scale-95"
          style={{
            backgroundColor: CONFIG.COLOR_PLAYER,
            color: CONFIG.COLOR_BG,
            boxShadow: `0 10px 15px -3px ${hexToRgba(CONFIG.COLOR_PLAYER, 0.3)}`,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = CONFIG.COLOR_PLAYER_SHADE; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = CONFIG.COLOR_PLAYER; }}
        >
          点击开始游戏
        </button>

        <p className="text-white/40 text-sm">鼠标点击空地即可放置建筑</p>
      </div>
    </div>
  );
}
