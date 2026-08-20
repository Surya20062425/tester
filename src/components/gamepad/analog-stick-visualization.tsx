'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRef, useEffect } from 'react';
import type { GamepadInfo } from '@/hooks/useGamepad';
import { Crosshair } from 'lucide-react';

interface AnalogStickVisualizationProps {
  gamepad: GamepadInfo;
  getGamepadsRef: () => React.MutableRefObject<GamepadInfo[]>;
  gamepadIndex: number;
}

interface StickDef {
  label: string;
  xAxis: number;
  yAxis: number;
}

export function AnalogStickVisualization({
  gamepad,
  getGamepadsRef,
  gamepadIndex,
}: AnalogStickVisualizationProps) {
  const isStandard = gamepad.mapping === 'standard';

  const sticks: StickDef[] = isStandard
    ? [
        { label: 'Left Stick', xAxis: 0, yAxis: 1 },
        { label: 'Right Stick', xAxis: 2, yAxis: 3 },
      ]
    : gamepad.axes.length >= 2
      ? [{ label: 'Stick 1', xAxis: 0, yAxis: 1 }]
      : [];

  if (sticks.length === 0) return null;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-primary" />
          Analog Stick Visualization
          {!isStandard && (
            <span className="text-xs font-normal text-muted-foreground ml-1">
              (raw axes, non-standard mapping)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex flex-wrap gap-6 justify-center">
          {sticks.map((stick) => (
            <StickCanvas
              key={stick.label}
              stick={stick}
              getGamepadsRef={getGamepadsRef}
              gamepadIndex={gamepadIndex}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StickCanvas({
  stick,
  getGamepadsRef,
  gamepadIndex,
}: {
  stick: StickDef;
  getGamepadsRef: () => React.MutableRefObject<GamepadInfo[]>;
  gamepadIndex: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const size = 180;
  const radius = 75;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.scale(dpr, dpr);

      const cx = size / 2;
      const cy = size / 2;

      ctx.clearRect(0, 0, size, size);

      // Background circle
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(var(--muted) / 0.4)';
      ctx.fill();

      // Boundary ring
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'hsl(var(--muted-foreground) / 0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Dead zone
      const deadZone = radius * 0.08;
      ctx.beginPath();
      ctx.arc(cx, cy, deadZone, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(var(--muted-foreground) / 0.1)';
      ctx.fill();

      // Crosshair
      ctx.strokeStyle = 'hsl(var(--muted-foreground) / 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.stroke();

      // Intermediate rings
      [0.25, 0.5, 0.75].forEach((r) => {
        ctx.beginPath();
        ctx.arc(cx, cy, radius * r, 0, Math.PI * 2);
        ctx.strokeStyle = 'hsl(var(--muted-foreground) / 0.06)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // Live axis values
      const gps = getGamepadsRef().current;
      const gp = gps.find((g) => g.index === gamepadIndex);
      const x = gp?.axes[stick.xAxis] ?? 0;
      const y = gp?.axes[stick.yAxis] ?? 0;

      const dotX = cx + x * radius;
      const dotY = cy + y * radius;

      // Line from center to dot
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(dotX, dotY);
      ctx.strokeStyle = 'hsl(var(--primary) / 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Dot
      const dist = Math.sqrt(x * x + y * y);
      const isCentered = dist < 0.05;
      const isExtremity = dist > 0.95;

      ctx.beginPath();
      ctx.arc(dotX, dotY, isCentered ? 6 : 7, 0, Math.PI * 2);
      ctx.fillStyle = isExtremity
        ? 'hsl(25, 95%, 53%)'
        : isCentered
          ? 'hsl(var(--primary))'
          : 'hsl(var(--primary) / 0.85)';
      ctx.fill();
      ctx.strokeStyle = isExtremity ? 'hsl(25, 90%, 45%)' : 'hsl(var(--primary))';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(var(--muted-foreground) / 0.3)';
      ctx.fill();

      // Values
      ctx.font = '11px ui-monospace, monospace';
      ctx.fillStyle = 'hsl(var(--foreground) / 0.7)';
      ctx.textAlign = 'center';
      ctx.fillText(`X: ${x.toFixed(3)}  Y: ${y.toFixed(3)}`, cx, size - 4);

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [stick, getGamepadsRef, gamepadIndex]);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="rounded-lg"
      />
      <span className="text-xs font-medium text-muted-foreground">{stick.label}</span>
    </div>
  );
}
