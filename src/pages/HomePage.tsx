import { MobileLayout } from '@/components/layout/MobileLayout';
import { ScoreRing } from '@/components/ring/ScoreRing';
import { MetricCard } from '@/components/ring/MetricCard';
import { ConnectionBadge } from '@/components/ring/ConnectionBadge';
import { BatteryIndicator } from '@/components/ring/BatteryIndicator';
import { Heart, Footprints, Flame, Moon, Waves, Thermometer } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBLE } from '@/contexts/BLEContext';

export default function HomePage() {
  const { user } = useAuth();
  const { status, metrics } = useBLE();
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there';

  const isConnected = status === 'connected' || status === 'syncing';

  return (
    <MobileLayout>
      <div className="px-4 pt-6 pb-4 space-y-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Good evening,</p>
            <h1 className="text-xl font-bold text-foreground">Hi {firstName}</h1>
          </div>
          <div className="flex items-center gap-3">
            {metrics.batteryLevel !== null && <BatteryIndicator level={metrics.batteryLevel} />}
            <ConnectionBadge status={status} />
          </div>
        </div>

        {/* Scores — zeroed until real data arrives */}
        <div className="flex items-center justify-center gap-6 py-4">
          <ScoreRing score={0} label="Readiness" size={100} color="hsl(var(--primary))" />
          <ScoreRing score={0} label="Sleep" size={80} color="hsl(var(--sleep))" />
          <ScoreRing score={0} label="Activity" size={80} color="hsl(var(--calories))" />
        </div>

        {/* Metrics Grid — live heart rate from BLE, rest zeroed */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={Heart}
            label="Heart Rate"
            value={metrics.heartRate || '--'}
            unit="bpm"
            color="hsl(var(--heart-rate))"
            subtitle={isConnected ? 'Live' : 'No data'}
          />
          <MetricCard
            icon={Waves}
            label="HRV"
            value="--"
            unit="ms"
            color="hsl(var(--hrv))"
            subtitle="No data"
          />
          <MetricCard
            icon={Footprints}
            label="Steps"
            value="0"
            color="hsl(var(--steps))"
            subtitle="of 10,000 goal"
          />
          <MetricCard
            icon={Flame}
            label="Calories"
            value="0"
            unit="kcal"
            color="hsl(var(--calories))"
            subtitle="Active burn"
          />
          <MetricCard
            icon={Moon}
            label="SpO2"
            value="--"
            unit="%"
            color="hsl(var(--spo2))"
            subtitle="Blood Oxygen"
          />
          <MetricCard
            icon={Thermometer}
            label="Skin Temp"
            value="--"
            unit="°C"
            color="hsl(var(--temperature))"
            subtitle="No data"
          />
        </div>
      </div>
    </MobileLayout>
  );
}
