'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { GamepadInfo } from '@/hooks/useGamepad';
import { MousePointerClick } from 'lucide-react';

interface ButtonTesterProps {
  gamepad: GamepadInfo;
}

// Standard mapping button labels
const STANDARD_BUTTON_LABELS: Record<number, string> = {
  0: 'A / Cross',
  1: 'B / Circle',
  2: 'X / Square',
  3: 'Y / Triangle',
  4: 'LB / L1',
  5: 'RB / R1',
  6: 'LT / L2',
  7: 'RT / R2',
  8: 'Back / Select',
  9: 'Start',
  10: 'L3 / L-Click',
  11: 'R3 / R-Click',
  12: 'D-Pad Up',
  13: 'D-Pad Down',
  14: 'D-Pad Left',
  15: 'D-Pad Right',
  16: 'Home / Guide',
};

export function ButtonTester({ gamepad }: ButtonTesterProps) {
  const { buttons, mapping } = gamepad;
  const isStandard = mapping === 'standard';
  const isAnalog = (value: number) => value > 0 && value < 1;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <MousePointerClick className="h-4 w-4 text-primary" />
          Button Tester
          <Badge variant="outline" className="ml-auto text-xs font-normal">
            {buttons.length} buttons
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <ScrollArea className="max-h-96">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {buttons.map((btn, i) => {
              const label = isStandard
                ? STANDARD_BUTTON_LABELS[i] || `Button ${i}`
                : `Button ${i}`;

              return (
                <div
                  key={i}
                  className={`relative flex flex-col gap-1.5 rounded-lg border p-2.5 transition-all duration-75 ${
                    btn.pressed
                      ? 'border-primary bg-primary/10 shadow-sm shadow-primary/10'
                      : 'border-border/60 bg-card'
                  }`}
                >
                  {/* Label + Index */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium truncate" title={label}>
                      {label}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                      [{i}]
                    </span>
                  </div>

                  {/* Value bar for analog buttons */}
                  <div className="h-2.5 w-full rounded-full bg-muted/60 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-[width] duration-75 ${
                        btn.pressed
                          ? isAnalog(btn.value)
                            ? 'bg-orange-500'
                            : 'bg-primary'
                          : 'bg-primary/30'
                      }`}
                      style={{ width: `${btn.value * 100}%` }}
                    />
                  </div>

                  {/* Value + State */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono tabular-nums text-muted-foreground">
                      {btn.value.toFixed(3)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {btn.touched && (
                        <span className="text-[10px] text-blue-500 font-medium">Touched</span>
                      )}
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          btn.pressed
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {btn.pressed
                          ? isAnalog(btn.value)
                            ? 'Analog'
                            : 'Pressed'
                          : 'Released'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
