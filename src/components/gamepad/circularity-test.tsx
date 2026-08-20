'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRef, useEffect, useState, useCallback } from 'react';
import type { GamepadInfo } from '@/hooks/useGamepad';
import { RotateCcw, Circle } from 'lucide-react';

interface CircularityTestProps {
  gamepad: GamepadInfo;
  getGamepadsRef: () => React.MutableRefObject<GamepadInfo[]>;
  gamepadIndex: number;
}

interface Point {
  x: number;
  y: number;
}

const RECORD_DURATION = 8000;
const CANVAS_SIZE = 220;
const CANVAS_RADIUS = 90;

function drawCanvasStatic(
  canvas: HTMLCanvasElement | null,
  pts: Point[],
  recording: boolean,
  complete: boolean,
  getGamepadsRef: () => React.MutableRefObject<GamepadInfo[]>,
  gamepadIndex: number,
  xAxis: number,
  yAxis: number
) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = CANVAS_SIZE * dpr;
  canvas.height = CANVAS_SIZE * dpr;
  ctx.scale(dpr, dpr);
  canvas.style.width = `${CANVAS_SIZE}px`;
  canvas.style.height = `${CANVAS_SIZE}px`;

  const cx = CANVAS_SIZE / 2;
  const cy = CANVAS_SIZE / 2;
  const r = CANVAS_RADIUS;

  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Perfect circle reference
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2);
  ctx.strokeStyle = 'hsl(var(--muted-foreground) / 0.15)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Crosshair
  ctx.strokeStyle = 'hsl(var(--muted-foreground) / 0.1)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - r, cy);
  ctx.lineTo(cx + r, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx, cy + r);
  ctx.stroke();

  // Center dot
  ctx.beginPath();
  ctx.arc(cx, cy, 2, 0, Math.PI * 2);
  ctx.fillStyle = 'hsl(var(--muted-foreground) / 0.3)';
  ctx.fill();

  // Draw points
  if (pts.length > 0) {
    ctx.beginPath();
    pts.forEach((p, i) => {
      const px = cx + p.x * r * 0.8;
      const py = cy + p.y * r * 0.8;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.strokeStyle = 'hsl(var(--primary) / 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    pts.forEach((p) => {
      const px = cx + p.x * r * 0.8;
      const py = cy + p.y * r * 0.8;
      ctx.beginPath();
      ctx.arc(px, py, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(var(--primary) / 0.7)';
      ctx.fill();
    });
  }

  // Current stick position while recording
  if (recording) {
    const gps = getGamepadsRef().current;
    const gp = gps.find((g) => g.index === gamepadIndex);
    if (gp && gp.axes.length > yAxis) {
      const x = gp.axes[xAxis];
      const y = gp.axes[yAxis];
      const px = cx + x * r * 0.8;
      const py = cy + y * r * 0.8;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(25, 95%, 53%)';
      ctx.fill();
      ctx.strokeStyle = 'hsl(25, 90%, 45%)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  // Analysis when complete
  if (complete && pts.length > 10) {
    const distances = pts.map((p) => Math.sqrt(p.x * p.x + p.y * p.y));
    const avgDist = distances.reduce((a, b) => a + b, 0) / distances.length;
    const minDist = Math.min(...distances);
    const maxDist = Math.max(...distances);
    const variance = distances.reduce((sum, d) => sum + (d - avgDist) ** 2, 0) / distances.length;
    const stdDev = Math.sqrt(variance);

    const angles = pts.map((p) => Math.atan2(p.y, p.x));
    const buckets = new Array(36).fill(false);
    angles.forEach((a) => {
      const normalized = ((a * 180) / Math.PI + 360) % 360;
      const bucket = Math.floor(normalized / 10) % 36;
      buckets[bucket] = true;
    });
    const coverage = (buckets.filter(Boolean).length / 36) * 100;

    ctx.font = '11px ui-monospace, monospace';
    ctx.textAlign = 'left';
    let textY = CANVAS_SIZE - 48;
    const lineH = 14;

    ctx.fillStyle = 'hsl(var(--foreground) / 0.8)';
    ctx.fillText(`Avg radius: ${avgDist.toFixed(3)}`, 8, textY);
    textY += lineH;
    ctx.fillText(`Min / Max: ${minDist.toFixed(3)} / ${maxDist.toFixed(3)}`, 8, textY);
    textY += lineH;
    ctx.fillText(`Std dev: ${stdDev.toFixed(4)}`, 8, textY);
    textY += lineH;
    ctx.fillStyle = coverage > 80 ? 'hsl(142, 76%, 36%)' : 'hsl(25, 95%, 53%)';
    ctx.fillText(`Coverage: ${coverage.toFixed(0)}%`, 8, textY);
  }
}

export function CircularityTest({
  gamepad,
  getGamepadsRef,
  gamepadIndex,
}: CircularityTestProps) {
  const isStandard = gamepad.mapping === 'standard';
  const hasEnoughAxes = gamepad.axes.length >= 2;

  const [activeStick, setActiveStick] = useState<0 | 1>(0);
  const [isRecording, setIsRecording] = useState(false);
  const [sampleCount, setSampleCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const rafRef = useRef<number>(0);
  const recordingStartRef = useRef<number>(0);
  const isRecordingRef = useRef(false);

  const stickLabel = isStandard
    ? activeStick === 0
      ? 'Left Stick'
      : 'Right Stick'
    : `Axes ${activeStick * 2} & ${activeStick * 2 + 1}`;

  const xAxis = activeStick * 2;
  const yAxis = activeStick * 2 + 1;

  const clearTest = useCallback(() => {
    pointsRef.current = [];
    setSampleCount(0);
    setIsRecording(false);
    setIsComplete(false);
    setCompletedCount(0);
    isRecordingRef.current = false;
    cancelAnimationFrame(rafRef.current);
  }, []);

  const startRecording = useCallback(() => {
    clearTest();
    isRecordingRef.current = true;
    setIsRecording(true);
    recordingStartRef.current = performance.now();

    const recordFrame = () => {
      if (!isRecordingRef.current) return;
      const elapsed = performance.now() - recordingStartRef.current;

      if (elapsed > RECORD_DURATION) {
        isRecordingRef.current = false;
        setIsRecording(false);
        setIsComplete(true);
        const finalPts = [...pointsRef.current];
        setCompletedCount(finalPts.length);
        drawCanvasStatic(canvasRef.current, finalPts, false, true, getGamepadsRef, gamepadIndex, xAxis, yAxis);
        return;
      }

      const gps = getGamepadsRef().current;
      const gp = gps.find((g) => g.index === gamepadIndex);
      if (gp && gp.axes.length > yAxis) {
        const x = gp.axes[xAxis];
        const y = gp.axes[yAxis];
        const dist = Math.sqrt(x * x + y * y);
        if (dist > 0.1) {
          pointsRef.current.push({ x, y });
          setSampleCount(pointsRef.current.length);
        }
      }

      drawCanvasStatic(canvasRef.current, pointsRef.current, true, false, getGamepadsRef, gamepadIndex, xAxis, yAxis);
      rafRef.current = requestAnimationFrame(recordFrame);
    };

    rafRef.current = requestAnimationFrame(recordFrame);
  }, [clearTest, getGamepadsRef, gamepadIndex, xAxis, yAxis]);

  // Initial / stick-change draw
  useEffect(() => {
    drawCanvasStatic(canvasRef.current, [], false, false, getGamepadsRef, gamepadIndex, xAxis, yAxis);
  }, [getGamepadsRef, gamepadIndex, xAxis, yAxis]);

  if (!hasEnoughAxes) return null;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Circle className="h-4 w-4 text-primary" />
          Stick Circularity Test
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex flex-col items-center gap-4">
          {isStandard && (
            <div className="flex gap-2">
              <Button
                variant={activeStick === 0 ? 'default' : 'outline'}
                size="sm"
                onClick={() => { clearTest(); setActiveStick(0); }}
              >
                Left Stick
              </Button>
              <Button
                variant={activeStick === 1 ? 'default' : 'outline'}
                size="sm"
                onClick={() => { clearTest(); setActiveStick(1); }}
              >
                Right Stick
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center max-w-sm">
            Slowly rotate the {stickLabel} in a full circle. The test records for {RECORD_DURATION / 1000}s and measures how circular the stick movement is.
          </p>

          <canvas ref={canvasRef} className="rounded-lg border border-border/40" />

          <div className="flex items-center gap-3">
            {isRecording && (
              <Badge variant="default" className="animate-pulse">
                Recording... {sampleCount} samples
              </Badge>
            )}
            {isComplete && (
              <Badge variant="secondary">
                Complete — {completedCount} samples recorded
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={startRecording}
              disabled={isRecording}
              size="sm"
            >
              Start Test
            </Button>
            <Button
              onClick={clearTest}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
