'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { GamepadInfo } from '@/hooks/useGamepad';
import { Gamepad2, Wifi, WifiOff, Clock, BarChart3, CircleDot } from 'lucide-react';

interface GamepadMetadataPanelProps {
  gamepad: GamepadInfo;
}

export function GamepadMetadataPanel({ gamepad }: GamepadMetadataPanelProps) {
  const formatTimestamp = (ts: number) => {
    if (!ts) return '—';
    return ts.toLocaleString ? ts.toLocaleString() : String(ts);
  };

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {/* Controller Name & Index */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Gamepad2 className="h-5 w-5 text-primary shrink-0" />
              <h3 className="font-semibold text-sm leading-tight truncate" title={gamepad.id}>
                {gamepad.id || 'Unknown Controller'}
              </h3>
            </div>
            <Badge variant="secondary" className="shrink-0 text-xs">
              Gamepad #{gamepad.index}
            </Badge>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Connection State */}
            <InfoItem
              icon={gamepad.connected ? <Wifi className="h-3.5 w-3.5 text-green-500" /> : <WifiOff className="h-3.5 w-3.5 text-destructive" />}
              label="Status"
              value={gamepad.connected ? 'Connected' : 'Disconnected'}
              valueClass={gamepad.connected ? 'text-green-600' : 'text-destructive'}
            />

            {/* Timestamp */}
            <InfoItem
              icon={<Clock className="h-3.5 w-3.5 text-muted-foreground" />}
              label="Timestamp"
              value={formatTimestamp(gamepad.timestamp)}
              mono
            />

            {/* Mapping */}
            <InfoItem
              icon={<CircleDot className="h-3.5 w-3.5 text-muted-foreground" />}
              label="Mapping"
              value={gamepad.mapping || 'N/A'}
              valueClass={gamepad.mapping ? 'text-primary font-medium' : 'text-muted-foreground'}
            />

            {/* Axes */}
            <InfoItem
              icon={<BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />}
              label="Axes"
              value={`${gamepad.axes.length} axes`}
            />

            {/* Buttons */}
            <InfoItem
              icon={<CircleDot className="h-3.5 w-3.5 text-muted-foreground" />}
              label="Buttons"
              value={`${gamepad.buttons.length} buttons`}
            />

            {/* Vibration */}
            <InfoItem
              icon={<Wifi className="h-3.5 w-3.5 text-muted-foreground" />}
              label="Haptics"
              value={gamepad.hasVibration ? `Supported${gamepad.vibrationActuatorType ? ` (${gamepad.vibrationActuatorType})` : ''}` : 'Not Available'}
              valueClass={gamepad.hasVibration ? 'text-green-600' : 'text-muted-foreground'}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoItem({
  icon,
  label,
  value,
  valueClass = 'text-foreground',
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <span className={`text-sm ${mono ? 'font-mono' : ''} ${valueClass} truncate`} title={value}>
        {value}
      </span>
    </div>
  );
}
