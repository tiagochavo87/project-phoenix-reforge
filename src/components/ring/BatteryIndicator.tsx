import { Battery, BatteryCharging, BatteryLow, BatteryMedium, BatteryFull } from 'lucide-react';

interface BatteryIndicatorProps {
  level: number | null;
  charging?: boolean;
  className?: string;
}

export function BatteryIndicator({ level, charging, className = '' }: BatteryIndicatorProps) {
  if (level === null) {
    return (
      <div className={`flex items-center gap-1 text-muted-foreground ${className}`}>
        <Battery className="h-4 w-4" />
        <span className="text-xs">--</span>
      </div>
    );
  }

  const Icon = charging ? BatteryCharging
    : level > 75 ? BatteryFull
    : level > 30 ? BatteryMedium
    : BatteryLow;

  const colorClass = level > 75 ? 'text-battery-full'
    : level > 30 ? 'text-battery-mid'
    : 'text-battery-low';

  return (
    <div className={`flex items-center gap-1 ${colorClass} ${className}`}>
      <Icon className="h-4 w-4" />
      <span className="text-xs font-medium">{level}%</span>
    </div>
  );
}
