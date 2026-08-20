'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { GamepadInfo } from '@/hooks/useGamepad';
import { Vibrate, Zap } from 'lucide-react';
import { useState, useCallback } from 'react';

interface VibrationTesterProps {
  gamepad: GamepadInfo;
  triggerVibration: (
    gamepadIndex: number,
    duration: number,
    strongMagnitude: number,
    weakMagnitude: number
  ) => boolean;
}

export function VibrationTester({ gamepad, triggerVibration }: VibrationTesterProps) {
  const [enabled, setEnabled] = useState(false);
  const [duration, setDuration] = useState(200);
  const [strongMagnitude, setStrongMagnitude] = useState(1.0);
  const [weakMagnitude, setWeakMagnitude] = useState(0.5);
  const [lastResult, setLastResult] = useState<'success' | 'fail' | null>(null);

  const handleTest = useCallback(() => {
    const result = triggerVibration(
      gamepad.index,
      duration,
      strongMagnitude,
      weakMagnitude
    );
    setLastResult(result ? 'success' : 'fail');
    if (result) {
      setTimeout(() => setLastResult(null), duration + 200);
    }
  }, [gamepad.index, duration, strongMagnitude, weakMagnitude, triggerVibration]);

  if (!gamepad.hasVibration) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Vibrate className="h-4 w-4 text-muted-foreground" />
            Vibration / Haptics
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <p className="text-sm text-muted-foreground">
            This controller does not report a vibration actuator. Haptic feedback is not
            available through the browser for this device.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Vibrate className="h-4 w-4 text-primary" />
          Vibration / Haptics
          {gamepad.vibrationActuatorType && (
            <span className="text-xs font-normal text-muted-foreground ml-1">
              ({gamepad.vibrationActuatorType})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex flex-col gap-5">
          {/* Enable toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="vib-enable" className="text-sm">
              Enable vibration test
            </Label>
            <Switch
              id="vib-enable"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          {enabled && (
            <>
              {/* Duration */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Duration</Label>
                  <span className="text-xs font-mono text-muted-foreground">
                    {duration}ms
                  </span>
                </div>
                <Slider
                  value={[duration]}
                  onValueChange={([v]) => setDuration(v)}
                  min={50}
                  max={1000}
                  step={50}
                  className="w-full"
                />
              </div>

              {/* Strong Magnitude */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Strong Magnitude</Label>
                  <span className="text-xs font-mono text-muted-foreground">
                    {strongMagnitude.toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={[strongMagnitude * 100]}
                  onValueChange={([v]) => setStrongMagnitude(v / 100)}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Weak Magnitude */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Weak Magnitude</Label>
                  <span className="text-xs font-mono text-muted-foreground">
                    {weakMagnitude.toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={[weakMagnitude * 100]}
                  onValueChange={([v]) => setWeakMagnitude(v / 100)}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Test Button */}
              <Button
                onClick={handleTest}
                className="w-full"
                variant={lastResult === 'fail' ? 'destructive' : 'default'}
              >
                <Zap className="h-4 w-4 mr-2" />
                Test Vibration
              </Button>

              {lastResult === 'fail' && (
                <p className="text-xs text-destructive">
                  Vibration failed. Your browser or controller may not support the dual-rumble effect.
                </p>
              )}

              {/* Quick presets */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Quick Presets
                </span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDuration(100);
                      setStrongMagnitude(1.0);
                      setWeakMagnitude(1.0);
                    }}
                  >
                    Short Pulse
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDuration(500);
                      setStrongMagnitude(0.5);
                      setWeakMagnitude(0.2);
                    }}
                  >
                    Gentle
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDuration(300);
                      setStrongMagnitude(1.0);
                      setWeakMagnitude(0.0);
                    }}
                  >
                    Strong Only
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDuration(200);
                      setStrongMagnitude(0.0);
                      setWeakMagnitude(1.0);
                    }}
                  >
                    Weak Only
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
