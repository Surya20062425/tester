'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GamepadInfo } from '@/hooks/useGamepad';
import { LayoutDashboard } from 'lucide-react';

interface StandardControllerLayoutProps {
  gamepad: GamepadInfo;
}

// Button indices for standard mapping
const FACE_BUTTONS = [
  { index: 0, label: 'A', posX: 70, posY: 50 },
  { index: 1, label: 'B', posX: 90, posY: 35 },
  { index: 2, label: 'X', posX: 50, posY: 35 },
  { index: 3, label: 'Y', posX: 70, posY: 20 },
];

const SHOULDER_BUTTONS = [
  { index: 4, label: 'LB', posX: 15, posY: 10 },
  { index: 5, label: 'RB', posX: 85, posY: 10 },
];

const TRIGGERS = [
  { index: 6, label: 'LT', posX: 15, posY: 2 },
  { index: 7, label: 'RT', posX: 85, posY: 2 },
];

const DPAD = [
  { index: 12, label: '↑', posX: 30, posY: 35 },
  { index: 13, label: '↓', posX: 30, posY: 60 },
  { index: 14, label: '←', posX: 17, posY: 48 },
  { index: 15, label: '→', posX: 43, posY: 48 },
];

const CENTER_BUTTONS = [
  { index: 8, label: 'Sel', posX: 43, posY: 48 },
  { index: 9, label: 'Sta', posX: 57, posY: 48 },
  { index: 16, label: '⊙', posX: 50, posY: 42 },
];

const STICK_BUTTONS = [
  { index: 10, label: 'L3', posX: 25, posY: 65 },
  { index: 11, label: 'R3', posX: 75, posY: 65 },
];

export function StandardControllerLayout({ gamepad }: StandardControllerLayoutProps) {
  if (gamepad.mapping !== 'standard') return null;

  const { buttons } = gamepad;

  const isPressed = (idx: number) => buttons[idx]?.pressed ?? false;
  const getValue = (idx: number) => buttons[idx]?.value ?? 0;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4 text-primary" />
          Controller Layout
          <span className="text-xs font-normal text-muted-foreground ml-1">
            (standard mapping)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex justify-center">
          <div className="relative w-[280px] h-[180px] sm:w-[340px] sm:h-[200px]">
            {/* Controller body outline */}
            <svg
              viewBox="0 0 100 65"
              className="absolute inset-0 w-full h-full text-muted-foreground/15"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
            >
              <path d="M 20 10 Q 20 3, 28 3 L 72 3 Q 80 3, 80 10 L 80 28 Q 80 45, 88 55 L 90 58 Q 92 62, 88 62 L 78 62 Q 72 62, 70 56 L 65 42 Q 63 38, 60 38 L 40 38 Q 37 38, 35 42 L 30 56 Q 28 62, 22 62 L 12 62 Q 8 62, 10 58 L 12 55 Q 20 45, 20 28 Z" />
            </svg>

            {/* Triggers (above body) */}
            {TRIGGERS.map((t) => (
              <ControllerButton
                key={t.index}
                label={t.label}
                x={t.posX}
                y={t.posY}
                pressed={isPressed(t.index)}
                value={getValue(t.index)}
                isAnalog={getValue(t.index) > 0 && getValue(t.index) < 1}
              />
            ))}

            {/* Shoulder buttons */}
            {SHOULDER_BUTTONS.map((s) => (
              <ControllerButton
                key={s.index}
                label={s.label}
                x={s.posX}
                y={s.posY}
                pressed={isPressed(s.index)}
              />
            ))}

            {/* D-Pad */}
            {DPAD.map((d) => (
              <ControllerButton
                key={d.index}
                label={d.label}
                x={d.posX}
                y={d.posY}
                pressed={isPressed(d.index)}
                size={8}
              />
            ))}

            {/* Center buttons */}
            {CENTER_BUTTONS.map((c) => (
              <ControllerButton
                key={c.index}
                label={c.label}
                x={c.posX}
                y={c.posY}
                pressed={isPressed(c.index)}
                size={c.label === '⊙' ? 7 : 7}
              />
            ))}

            {/* Face buttons */}
            {FACE_BUTTONS.map((f) => (
              <ControllerButton
                key={f.index}
                label={f.label}
                x={f.posX}
                y={f.posY}
                pressed={isPressed(f.index)}
                size={9}
              />
            ))}

            {/* Stick click buttons (show position, actual stick position comes from axes) */}
            {STICK_BUTTONS.map((s) => (
              <ControllerButton
                key={s.index}
                label={s.label}
                x={s.posX}
                y={s.posY}
                pressed={isPressed(s.index)}
                size={8}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ControllerButton({
  label,
  x,
  y,
  pressed,
  value,
  isAnalog,
  size = 9,
}: {
  label: string;
  x: number;
  y: number;
  pressed: boolean;
  value?: number;
  isAnalog?: boolean;
  size?: number;
}) {
  return (
    <div
      className={`absolute flex items-center justify-center rounded-full border-2 transition-all duration-75 -translate-x-1/2 -translate-y-1/2 ${
        pressed
          ? 'border-primary bg-primary text-primary-foreground scale-110 shadow-md shadow-primary/30'
          : 'border-border bg-card text-muted-foreground'
      } ${isAnalog ? 'border-orange-500 bg-orange-500/15 text-orange-600' : ''}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${size * 3.5}px`,
        height: `${size * 3.5}px`,
        fontSize: `${size * 1.1}px`,
        fontWeight: 600,
      }}
      title={
        value !== undefined && value > 0
          ? `${label}: ${value.toFixed(3)}`
          : `${label}: ${pressed ? 'Pressed' : 'Released'}`
      }
    >
      {label}
    </div>
  );
}
