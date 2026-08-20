'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface GamepadButtonState {
  pressed: boolean;
  touched: boolean;
  value: number;
}

export interface GamepadInfo {
  id: string;
  index: number;
  connected: boolean;
  timestamp: number;
  mapping: string;
  axes: number[];
  buttons: GamepadButtonState[];
  hasVibration: boolean;
  vibrationActuatorType?: string;
}

function parseGamepad(gp: Gamepad): GamepadInfo {
  return {
    id: gp.id || 'Unknown Controller',
    index: gp.index,
    connected: gp.connected,
    timestamp: gp.timestamp,
    mapping: gp.mapping || '',
    axes: Array.from(gp.axes),
    buttons: gp.buttons.map((b) => ({
      pressed: b.pressed,
      touched: 'touched' in b ? (b.touched as boolean) : false,
      value: b.value,
    })),
    hasVibration: !!gp.vibrationActuator,
    vibrationActuatorType: gp.vibrationActuator?.type,
  };
}

export function useGamepad() {
  const [gamepads, setGamepads] = useState<GamepadInfo[]>([]);
  const [activated, setActivated] = useState(false);
  const rafRef = useRef<number>(0);
  const gamepadsRef = useRef<GamepadInfo[]>([]);
  const activatedRef = useRef(false);

  useEffect(() => {
    const handleConnected = () => {
      if (!activatedRef.current) {
        activatedRef.current = true;
        setActivated(true);
      }
    };

    const poll = () => {
      const rawGamepads = navigator.getGamepads();
      const connected: GamepadInfo[] = [];

      for (let i = 0; i < rawGamepads.length; i++) {
        const gp = rawGamepads[i];
        if (gp) {
          connected.push(parseGamepad(gp));
        }
      }

      connected.sort((a, b) => a.index - b.index);

      const prev = gamepadsRef.current;
      const changed =
        connected.length !== prev.length ||
        connected.some((gp, i) => {
          const p = prev[i];
          return !p || p.index !== gp.index || p.connected !== gp.connected || p.id !== gp.id;
        });

      gamepadsRef.current = connected;

      if (changed) {
        setGamepads(connected);
      }

      rafRef.current = requestAnimationFrame(poll);
    };

    window.addEventListener('gamepadconnected', handleConnected);
    window.addEventListener('gamepaddisconnected', () => {});

    rafRef.current = requestAnimationFrame(poll);

    return () => {
      window.removeEventListener('gamepadconnected', handleConnected);
      window.removeEventListener('gamepaddisconnected', () => {});
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const getGamepadsRef = useCallback(() => gamepadsRef, []);

  const triggerVibration = useCallback(
    (gamepadIndex: number, duration: number, strongMagnitude: number, weakMagnitude: number) => {
      const rawGamepads = navigator.getGamepads();
      const gp = rawGamepads[gamepadIndex];
      if (!gp?.vibrationActuator) return false;

      try {
        const actuator = gp.vibrationActuator;
        if ('playEffect' in actuator && typeof actuator.playEffect === 'function') {
          actuator.playEffect('dual-rumble', {
            startDelay: 0,
            duration,
            strongMagnitude,
            weakMagnitude,
          });
          return true;
        }
        if ('pulse' in actuator && typeof (actuator as any).pulse === 'function') {
          (actuator as any).pulse(weakMagnitude, duration);
          return true;
        }
      } catch {
        return false;
      }
      return false;
    },
    []
  );

  const activate = useCallback(() => {
    activatedRef.current = true;
    setActivated(true);
  }, []);

  return {
    gamepads,
    activated,
    activate,
    getGamepadsRef,
    triggerVibration,
  };
}
