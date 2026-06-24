import { useRef, useEffect } from 'react';
import { GameEngine } from './engine/GameEngine';
import type { BuildType } from './engine/Config';

export interface GameState {
  hp: number;
  maxHp: number;
  wave: number;
  buildType: BuildType;
  killCount: number;
  survivalTime: number;
  isGameOver: boolean;
  isRunning: boolean;
}

interface GameCanvasProps {
  onStateChange?: (state: GameState) => void;
  gameRef?: React.MutableRefObject<GameEngine | null>;
}

export default function GameCanvas({ onStateChange, gameRef }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const onStateChangeRef = useRef(onStateChange);

  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 设置canvas尺寸为窗口大小
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 创建游戏引擎
    const engine = new GameEngine(canvas);
    engineRef.current = engine;
    if (gameRef) {
      gameRef.current = engine;
    }

    engine.onStateChange = (state) => {
      onStateChangeRef.current?.(state);
    };

    // 初始状态通知
    onStateChangeRef.current?.(engine.getGameState());

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      engine.destroy();
      engineRef.current = null;
      if (gameRef) {
        gameRef.current = null;
      }
    };
  }, [gameRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        cursor: 'crosshair',
      }}
    />
  );
}
