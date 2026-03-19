import { useEffect, useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { ScoreRing } from '@/components/ring/ScoreRing';
import { MetricCard } from '@/components/ring/MetricCard';
import { ConnectionBadge } from '@/components/ring/ConnectionBadge';
import { BatteryIndicator } from '@/components/ring/BatteryIndicator';
import { Heart, Footprints, Flame, Moon, Waves, Thermometer } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Demo data — replaced by real data when ring is connected
const DEMO = {
  readiness: 82,
  sleep: 78,
  activity: 65,
  heartRate: 68,
  hrv: 42,
  spo2: 97,
  skinTemp: 36.4,
  steps: 7842,
  calories: 420,
  batteryLevel: 73,
};

export default function HomePage() {
  const { user } = useAuth();
  const [data] = useState(DEMO);
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there';

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
            <BatteryIndicator level={data.batteryLevel} />
            <ConnectionBadge status="connected" />
          </div>
        </div>

        {/* Scores */}
        <div className="flex items-center justify-center gap-6 py-4">
          <ScoreRing score={data.readiness} label="Readiness" size={100} color="hsl(var(--primary))" />
          <ScoreRing score={data.sleep} label="Sleep" size={80} color="hsl(var(--sleep))" />
          <ScoreRing score={data.activity} label="Activity" size={80} color="hsl(var(--calories))" />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={Heart}
            label="Heart Rate"
            value={data.heartRate}
            unit="bpm"
            color="hsl(var(--heart-rate))"
            subtitle="Resting"
          />
          <MetricCard
            icon={Waves}
            label="HRV"
            value={data.hrv}
            unit="ms"
            color="hsl(var(--hrv))"
            subtitle="Average"
          />
          <MetricCard
            icon={Footprints}
            label="Steps"
            value={data.steps.toLocaleString()}
            color="hsl(var(--steps))"
            subtitle="of 10,000 goal"
          />
          <MetricCard
            icon={Flame}
            label="Calories"
            value={data.calories}
            unit="kcal"
            color="hsl(var(--calories))"
            subtitle="Active burn"
          />
          <MetricCard
            icon={Moon}
            label="SpO2"
            value={data.spo2}
            unit="%"
            color="hsl(var(--spo2))"
            subtitle="Blood Oxygen"
          />
          <MetricCard
            icon={Thermometer}
            label="Skin Temp"
            value={data.skinTemp.toFixed(1)}
            unit="°C"
            color="hsl(var(--temperature))"
            subtitle="Average"
          />
        </div>
      </div>
    </MobileLayout>
  );
}
