import { useState, useRef, useCallback } from 'react';
import GameCanvas from './game/GameCanvas';
import type { GameState } from './game/GameCanvas';
import type { BuildType } from './game/engine/Config';
import GameUI from './components/ui/GameUI';
import StartScreen from './components/ui/StartScreen';
import GameOverScreen from './components/ui/GameOverScreen';
import { GameEngine } from './game/engine/GameEngine';
import './App.css';

type GameScreen = 'start' | 'playing' | 'gameover';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('start');
  const [gameState, setGameState] = useState<GameState>({
    hp: 100,
    maxHp: 100,
    wave: 1,
    buildType: null,
    killCount: 0,
    survivalTime: 0,
    isGameOver: false,
    isRunning: false,
  });

  const gameRef = useRef<GameEngine | null>(null);

  const handleStateChange = useCallback((state: GameState) => {
    setGameState(state);
    if (state.isGameOver && screen !== 'gameover') {
      setScreen('gameover');
    }
  }, [screen]);

  const handleStart = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.reset();
      gameRef.current.start();
    }
    setScreen('playing');
  }, []);

  const handleRestart = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.reset();
      gameRef.current.start();
    }
    setScreen('playing');
  }, []);

  const handleSelectBuildType = useCallback((type: BuildType) => {
    if (gameRef.current) {
      gameRef.current.selectBuildType(type);
    }
  }, []);

  return (
    <div className="game-container">
      <GameCanvas onStateChange={handleStateChange} gameRef={gameRef} />

      {screen === 'start' && (
        <StartScreen onStart={handleStart} />
      )}

      {screen === 'playing' && (
        <GameUI state={gameState} onSelectBuildType={handleSelectBuildType} />
      )}

      {screen === 'gameover' && (
        <>
          <GameUI state={gameState} onSelectBuildType={handleSelectBuildType} />
          <GameOverScreen
            killCount={gameState.killCount}
            survivalTime={gameState.survivalTime}
            onRestart={handleRestart}
          />
        </>
      )}
    </div>
  );
}
