'use client';

import { useGamepad } from '@/hooks/useGamepad';
import { GamepadMetadataPanel } from '@/components/gamepad/gamepad-metadata-panel';
import { AxisTester } from '@/components/gamepad/axis-tester';
import { AnalogStickVisualization } from '@/components/gamepad/analog-stick-visualization';
import { ButtonTester } from '@/components/gamepad/button-tester';
import { StandardControllerLayout } from '@/components/gamepad/standard-controller-layout';
import { VibrationTester } from '@/components/gamepad/vibration-tester';
import { CircularityTest } from '@/components/gamepad/circularity-test';
import { FaqSection } from '@/components/gamepad/faq-section';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Gamepad2,
  Plug,
  MonitorCheck,
  Activity,
  MousePointerClick,
  Vibrate,
  Circle,
  Zap,
} from 'lucide-react';
import { useEffect, useSyncExternalStore, useRef, useState } from 'react';

// A high-frequency canvas-like display that reads from the gamepad ref
// to avoid React re-render overhead for axes/buttons.
function LiveValueDisplay({
  getGamepadsRef,
  gamepadIndex,
}: {
  getGamepadsRef: () => React.MutableRefObject<import('@/hooks/useGamepad').GamepadInfo[]>;
  gamepadIndex: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const gps = getGamepadsRef().current;
      const gp = gps.find((g) => g.index === gamepadIndex);
      if (!gp) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      // Draw live axes as a mini bar chart
      const barH = Math.min(14, (h - 4) / Math.max(gp.axes.length, 1) - 2);
      const gap = 2;
      const labelW = 50;
      const barAreaW = w - labelW - 60;
      const midX = labelW + barAreaW / 2;

      gp.axes.forEach((val, i) => {
        const y = 4 + i * (barH + gap);

        // Label
        ctx.font = '10px ui-monospace, monospace';
        ctx.fillStyle = 'hsl(var(--muted-foreground))';
        ctx.textAlign = 'left';
        ctx.fillText(`A${i}`, 4, y + barH - 2);

        // Track
        ctx.fillStyle = 'hsl(var(--muted) / 0.5)';
        ctx.fillRect(labelW, y, barAreaW, barH);

        // Center line
        ctx.fillStyle = 'hsl(var(--foreground) / 0.1)';
        ctx.fillRect(midX - 0.5, y, 1, barH);

        // Value bar
        const barW = (val / 2) * barAreaW;
        if (barW > 0) {
          ctx.fillStyle = 'hsl(var(--primary) / 0.6)';
          ctx.fillRect(midX, y, barW, barH);
        } else {
          ctx.fillStyle = 'hsl(var(--primary) / 0.6)';
          ctx.fillRect(midX + barW, y, -barW, barH);
        }

        // Value text
        ctx.fillStyle = 'hsl(var(--foreground) / 0.8)';
        ctx.textAlign = 'right';
        ctx.fillText(val.toFixed(2), w - 4, y + barH - 2);
      });

      // Button indicators at the bottom
      const btnY = 4 + gp.axes.length * (barH + gap) + 10;
      const btnSize = 18;
      const btnGap = 4;
      const btnPerRow = Math.floor((w - 10) / (btnSize + btnGap));

      gp.buttons.forEach((btn, i) => {
        const row = Math.floor(i / btnPerRow);
        const col = i % btnPerRow;
        const bx = 6 + col * (btnSize + btnGap);
        const by = btnY + row * (btnSize + btnGap);

        if (by + btnSize > h) return;

        ctx.beginPath();
        // Manual rounded rect for broader compatibility
        const r = 2;
        ctx.moveTo(bx + r, by);
        ctx.lineTo(bx + btnSize - r, by);
        ctx.quadraticCurveTo(bx + btnSize, by, bx + btnSize, by + r);
        ctx.lineTo(bx + btnSize, by + btnSize - r);
        ctx.quadraticCurveTo(bx + btnSize, by + btnSize, bx + btnSize - r, by + btnSize);
        ctx.lineTo(bx + r, by + btnSize);
        ctx.quadraticCurveTo(bx, by + btnSize, bx, by + btnSize - r);
        ctx.lineTo(bx, by + r);
        ctx.quadraticCurveTo(bx, by, bx + r, by);
        ctx.closePath();
        if (btn.pressed) {
          ctx.fillStyle = btn.value > 0 && btn.value < 1 ? 'hsl(25, 95%, 53%)' : 'hsl(var(--primary))';
        } else {
          ctx.fillStyle = 'hsl(var(--muted) / 0.4)';
        }
        ctx.fill();

        // Index label
        ctx.font = '8px ui-monospace, monospace';
        ctx.fillStyle = btn.pressed ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))';
        ctx.textAlign = 'center';
        ctx.fillText(String(i), bx + btnSize / 2, by + btnSize / 2 + 3);
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [getGamepadsRef, gamepadIndex]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-lg border border-border/40 bg-card"
      style={{ height: '280px' }}
    />
  );
}

export default function Home() {
  const { gamepads, activated, activate, getGamepadsRef, triggerVibration } = useGamepad();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Gamepad2 className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold tracking-tight">Gamepad Tester</h1>
            <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
              Browser Diagnostic Tool
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {gamepads.length > 0 && (
              <Badge variant="outline" className="gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                {gamepads.length} controller{gamepads.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Welcome State */}
        {gamepads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 sm:py-32 text-center">
            <div className="relative mb-6">
              <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Gamepad2 className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">No Controller Detected</h2>
            <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
              Connect a USB or Bluetooth gamepad to your device, then{' '}
              <strong className="text-foreground">press any button</strong> on the controller
              to activate the Gamepad API. This page will automatically detect and display
              your controller&apos;s input state.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg w-full">
              <FeatureHint
                icon={<Plug className="h-5 w-5" />}
                title="Connect"
                desc="USB or Bluetooth"
              />
              <FeatureHint
                icon={<Zap className="h-5 w-5" />}
                title="Press a Button"
                desc="Activate the API"
              />
              <FeatureHint
                icon={<MonitorCheck className="h-5 w-5" />}
                title="Test"
                desc="View live input data"
              />
            </div>
            {!activated && (
              <button
                onClick={activate}
                className="mt-8 text-sm text-primary hover:underline underline-offset-4"
              >
                Controller connected but not detected? Click here to activate detection.
              </button>
            )}
          </div>
        )}

        {/* Gamepad Panels */}
        {gamepads.map((gp) => (
          <GamepadPanel
            key={gp.index}
            gamepad={gp}
            getGamepadsRef={getGamepadsRef}
            triggerVibration={triggerVibration}
          />
        ))}

        {/* FAQ - always visible */}
        <div className="mt-8">
          <FaqSection />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>Gamepad Tester — Built with HTML5 Gamepad API</span>
          <span>Data stays local. No input is sent to any server.</span>
        </div>
      </footer>
    </div>
  );
}

function FeatureHint({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/40 bg-card">
      <div className="text-primary">{icon}</div>
      <span className="text-sm font-semibold">{title}</span>
      <span className="text-xs text-muted-foreground">{desc}</span>
    </div>
  );
}

function GamepadPanel({
  gamepad,
  getGamepadsRef,
  triggerVibration,
}: {
  gamepad: import('@/hooks/useGamepad').GamepadInfo;
  getGamepadsRef: () => React.MutableRefObject<import('@/hooks/useGamepad').GamepadInfo[]>;
  triggerVibration: (
    gamepadIndex: number,
    duration: number,
    strongMagnitude: number,
    weakMagnitude: number
  ) => boolean;
}) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Activity className="h-3.5 w-3.5" /> },
    { id: 'axes', label: 'Axes', icon: <Activity className="h-3.5 w-3.5" /> },
    { id: 'buttons', label: 'Buttons', icon: <MousePointerClick className="h-3.5 w-3.5" /> },
    { id: 'layout', label: 'Layout', icon: <Gamepad2 className="h-3.5 w-3.5" /> },
    { id: 'vibration', label: 'Vibration', icon: <Vibrate className="h-3.5 w-3.5" /> },
    { id: 'circularity', label: 'Circularity', icon: <Circle className="h-3.5 w-3.5" /> },
  ];

  // Hide layout tab for non-standard controllers
  const visibleTabs = tabs.filter(
    (t) => !(t.id === 'layout' && gamepad.mapping !== 'standard')
  );

  return (
    <div className="mb-8">
      {/* Gamepad Metadata */}
      <GamepadMetadataPanel gamepad={gamepad} />

      <div className="mt-4">
        {/* Tab Navigation */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-4 no-scrollbar">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnalogStickVisualization
              gamepad={gamepad}
              getGamepadsRef={getGamepadsRef}
              gamepadIndex={gamepad.index}
            />
            <div>
              <LiveValueDisplay
                getGamepadsRef={getGamepadsRef}
                gamepadIndex={gamepad.index}
              />
            </div>
          </div>
        )}

        {activeTab === 'axes' && (
          <AxisTester gamepad={gamepad} />
        )}

        {activeTab === 'buttons' && (
          <ButtonTester gamepad={gamepad} />
        )}

        {activeTab === 'layout' && gamepad.mapping === 'standard' && (
          <StandardControllerLayout gamepad={gamepad} />
        )}

        {activeTab === 'vibration' && (
          <VibrationTester
            gamepad={gamepad}
            triggerVibration={triggerVibration}
          />
        )}

        {activeTab === 'circularity' && (
          <CircularityTest
            gamepad={gamepad}
            getGamepadsRef={getGamepadsRef}
            gamepadIndex={gamepad.index}
          />
        )}
      </div>

      <Separator className="mt-8" />
    </div>
  );
}
