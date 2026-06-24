import { CONFIG } from '@/game/engine/Config';

interface HPBarProps {
  hp: number;
  maxHp: number;
}

export default function HPBar({ hp, maxHp }: HPBarProps) {
  const ratio = Math.max(0, hp / maxHp);
  const color = ratio > 0.5 ? CONFIG.COLOR_HP_GREEN : ratio > 0.25 ? '#f39c12' : CONFIG.COLOR_HP_RED;

  return (
    <div className="flex flex-col gap-1 min-w-[200px]">
      <div className="flex justify-between items-center">
        <span className="text-white text-sm font-bold">HP</span>
        <span className="text-white text-sm font-mono">{Math.ceil(hp)} / {maxHp}</span>
      </div>
      <div className="w-full h-5 bg-black/60 rounded-full overflow-hidden border border-white/20">
        <div
          className="h-full rounded-full transition-all duration-200"
          style={{
            width: `${ratio * 100}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
