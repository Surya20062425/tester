'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { GamepadInfo } from '@/hooks/useGamepad';
import { Activity } from 'lucide-react';

interface AxisTesterProps {
  gamepad: GamepadInfo;
}

export function AxisTester({ gamepad }: AxisTesterProps) {
  const { axes } = gamepad;

  if (axes.length === 0) {
    return null;
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Axis Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <ScrollArea className="max-h-80">
          <div className="flex flex-col gap-2.5">
            {axes.map((value, i) => (
              <AxisRow key={i} index={i} value={value} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function AxisRow({ index, value }: { index: number; value: number }) {
  // Map value from [-1, 1] to [0, 100] for the position indicator
  const percent = ((value + 1) / 2) * 100;
  // Clamp
  const clampedPercent = Math.max(0, Math.min(100, percent));

  const isCentered = Math.abs(value) < 0.05;
  const isExtremity = Math.abs(value) > 0.95;

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-mono text-muted-foreground w-16 shrink-0">
        Axis {index}
      </span>
      <div className="flex-1 relative h-6">
        {/* Track background */}
        <div className="absolute inset-0 rounded-full bg-muted/60" />

        {/* Center marker */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-foreground/20 z-10" />
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-full rounded-full bg-foreground/5 z-10" />

        {/* Min/max labels */}
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-muted-foreground/60">
          -1
        </span>
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-muted-foreground/60">
          1
        </span>

        {/* Position indicator dot */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 h-5 w-5 rounded-full border-2 transition-[left] duration-75 shadow-sm ${
            isCentered
              ? 'bg-primary border-primary'
              : isExtremity
                ? 'bg-orange-500 border-orange-400'
                : 'bg-primary/80 border-primary/60'
          }`}
          style={{ left: `${clampedPercent}%` }}
        />

        {/* Dead zone indicators */}
        <div className="absolute top-0 bottom-0 left-[47.5%] w-[5%] bg-primary/5 rounded-full z-0" />
      </div>
      <span
        className={`text-xs font-mono w-16 text-right shrink-0 tabular-nums ${
          isCentered ? 'text-muted-foreground' : 'text-foreground font-medium'
        }`}
      >
        {value >= 0 ? '+' : ''}{value.toFixed(3)}
      </span>
    </div>
  );
}
