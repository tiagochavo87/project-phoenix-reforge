import { useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Footprints, Flame, Clock, TrendingUp, Dumbbell, Moon } from 'lucide-react';

// Demo sessions
const DEMO_SESSIONS = [
  { id: '1', type: 'workout', title: 'Morning Run', duration: 1860, hr: 145, cal: 320, time: '07:30', icon: TrendingUp },
  { id: '2', type: 'sleep', title: 'Night Sleep', duration: 27600, hr: 56, cal: 0, time: '23:15', icon: Moon },
  { id: '3', type: 'workout', title: 'Strength Training', duration: 2700, hr: 128, cal: 280, time: 'Yesterday', icon: Dumbbell },
];

const DEMO_WEEKLY = [
  { day: 'Mon', steps: 8200, active: 45 },
  { day: 'Tue', steps: 6100, active: 30 },
  { day: 'Wed', steps: 11200, active: 65 },
  { day: 'Thu', steps: 7800, active: 42 },
  { day: 'Fri', steps: 5400, active: 25 },
  { day: 'Sat', steps: 9800, active: 55 },
  { day: 'Sun', steps: 3200, active: 15 },
];

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function ActivityPage() {
  const maxSteps = Math.max(...DEMO_WEEKLY.map(d => d.steps));

  return (
    <MobileLayout>
      <div className="px-4 pt-6 pb-4 space-y-6 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-foreground">Activity</h1>

        {/* Today's Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="metric-card text-center">
            <Footprints className="h-5 w-5 text-metric-steps mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">7,842</p>
            <p className="text-2xs text-muted-foreground">Steps</p>
          </div>
          <div className="metric-card text-center">
            <Flame className="h-5 w-5 text-metric-calories mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">420</p>
            <p className="text-2xs text-muted-foreground">Calories</p>
          </div>
          <div className="metric-card text-center">
            <Clock className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">42</p>
            <p className="text-2xs text-muted-foreground">Active min</p>
          </div>
        </div>

        {/* Weekly bar chart */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-foreground mb-4">This Week</p>
            <div className="flex items-end justify-between gap-2 h-24">
              {DEMO_WEEKLY.map((day, i) => {
                const height = (day.steps / maxSteps) * 100;
                const isToday = i === new Date().getDay() - 1;
                return (
                  <div key={day.day} className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className={`w-full rounded-t-md transition-all ${
                        isToday ? 'bg-primary' : 'bg-secondary'
                      }`}
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <span className={`text-2xs ${isToday ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {day.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sessions */}
        <div>
          <p className="text-sm font-medium text-foreground mb-3">Recent Sessions</p>
          <div className="space-y-2">
            {DEMO_SESSIONS.map((session) => (
              <Card key={session.id} className="animate-fade-in">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <session.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{session.title}</p>
                    <p className="text-2xs text-muted-foreground">
                      {formatDuration(session.duration)} · {session.hr} bpm avg
                      {session.cal > 0 && ` · ${session.cal} kcal`}
                    </p>
                  </div>
                  <span className="text-2xs text-muted-foreground shrink-0">{session.time}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
