import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  color: string;
  subtitle?: string;
  children?: ReactNode;
}

export function MetricCard({ icon: Icon, label, value, unit, color, subtitle, children }: MetricCardProps) {
  return (
    <div className="metric-card animate-fade-in">
      <div className="flex items-start justify-between mb-2">
        <div
          className="p-2 rounded-xl"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </div>
      <div className="space-y-0.5">
        <p className="text-2xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-foreground">{value}</span>
          {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
        </div>
        {subtitle && <p className="text-2xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
