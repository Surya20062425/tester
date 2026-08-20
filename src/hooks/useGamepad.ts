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
  const lastStateUpdateRef = useRef<number>(0);

  // Update React state at ~15fps for live button/axis data in React components
  const STATE_UPDATE_INTERVAL = 66; // ~15fps

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

      // Always update the ref (used by canvas components at 60fps)
      gamepadsRef.current = connected;

      // Check if connection state changed (needs immediate update)
      const prev = gamepadsRef.current;
      const prevForCompare = (() => {
        // Use a snapshot from before the update for comparison
        const p = gamepadsRef.current;
        return p;
      })();

      const connectionChanged =
        connected.length !== (gamepads.length) ||
        connected.some((gp, i) => {
          const p = gamepads[i];
          return !p || p.index !== gp.index || p.connected !== gp.connected || p.id !== gp.id;
        });

      if (connectionChanged) {
        // Connection state changed — update immediately
        setGamepads(connected);
        lastStateUpdateRef.current = performance.now();
      } else {
        // Throttled update for live axis/button data (~15fps)
        const now = performance.now();
        if (now - lastStateUpdateRef.current >= STATE_UPDATE_INTERVAL) {
          setGamepads(connected);
          lastStateUpdateRef.current = now;
        }
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
  }, [gamepads.length]);

  const getGamepadsRef = useCallback(() => gamepadsRef, []);

  const triggerVibration = useCallback(
    (gamepadIndex: number, duration: number, strongMagnitude: number, weakMagnitude: number) => {
      // Read fresh from the API — never trust stale state for vibration
      const rawGamepads = navigator.getGamepads();
      let gp: Gamepad | null = null;

      // Find by index (handles sparse GamepadList)
      for (let i = 0; i < rawGamepads.length; i++) {
        if (rawGamepads[i] && rawGamepads[i]!.index === gamepadIndex) {
          gp = rawGamepads[i]!;
          break;
        }
      }

      if (!gp || !gp.connected) return false;

      const actuator = gp.vibrationActuator;
      if (!actuator) return false;

      // Clamp magnitudes to valid range [0, 1]
      const strong = Math.max(0, Math.min(1, strongMagnitude));
      const weak = Math.max(0, Math.min(1, weakMagnitude));
      const dur = Math.max(1, duration);

      try {
        // Try dual-rumble (modern API)
        if ('playEffect' in actuator && typeof actuator.playEffect === 'function') {
          // Reset any ongoing vibration first
          if ('reset' in actuator && typeof (actuator as any).reset === 'function') {
            try { (actuator as any).reset(); } catch { /* ignore */ }
          }

          const result = actuator.playEffect('dual-rumble', {
            startDelay: 0,
            duration: dur,
            strongMagnitude: strong,
            weakMagnitude: weak,
          });

          // playEffect may return a Promise
          if (result instanceof Promise) {
            result.catch(() => {});
          }
          return true;
        }

        // Legacy vibrationActuator with 'pulse' method
        if ('pulse' in actuator && typeof (actuator as any).pulse === 'function') {
          (actuator as any).pulse(weak, dur);
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
