import { RotateCcw, Skull, Clock, Swords } from 'lucide-react';

interface GameOverScreenProps {
  killCount: number;
  survivalTime: number;
  onRestart: () => void;
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

export default function GameOverScreen({ killCount, survivalTime, onRestart }: GameOverScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a2e]/95">
      <div className="flex flex-col items-center gap-6 max-w-md px-8">
        {/* 标题 */}
        <div className="flex flex-col items-center gap-2">
          <Skull className="w-16 h-16 text-[#e74c3c]" />
          <h1 className="text-4xl font-black text-white">游戏结束</h1>
          <p className="text-white/60">你的阵地已被敌人攻破</p>
        </div>

        {/* 统计 */}
        <div className="w-full bg-black/50 rounded-xl p-6 border border-white/10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-[#4ecca3]" />
              <span className="text-white/70">存活时间</span>
            </div>
            <span className="text-white text-xl font-mono font-bold">{formatTime(survivalTime)}</span>
          </div>

          <div className="w-full h-px bg-white/10" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Swords className="w-6 h-6 text-[#f1c40f]" />
              <span className="text-white/70">击杀数</span>
            </div>
            <span className="text-white text-xl font-mono font-bold">{killCount}</span>
          </div>
        </div>

        {/* 重新开始按钮 */}
        <button
          onClick={onRestart}
          className="flex items-center gap-3 px-10 py-4 bg-[#4ecca3] hover:bg-[#3dbb95] text-[#1a1a2e] font-black text-lg rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#4ecca3]/30"
        >
          <RotateCcw className="w-5 h-5" />
          重新开始
        </button>
      </div>
    </div>
  );
}
