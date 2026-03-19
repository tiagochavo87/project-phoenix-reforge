import { MobileLayout } from '@/components/layout/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Navigation, Clock, TrendingUp } from 'lucide-react';

// Demo workout routes
const DEMO_ROUTES = [
  { id: '1', title: 'Morning Run', distance: '5.2 km', duration: '31:00', pace: '5:58/km', date: 'Today' },
  { id: '2', title: 'Evening Walk', distance: '2.8 km', duration: '35:00', pace: '12:30/km', date: 'Yesterday' },
  { id: '3', title: 'Trail Hike', distance: '8.5 km', duration: '1:45:00', pace: '12:21/km', date: '3 days ago' },
];

export default function MapPage() {
  return (
    <MobileLayout>
      <div className="px-4 pt-6 pb-4 space-y-6 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-foreground">Map</h1>

        {/* Map Placeholder */}
        <Card className="overflow-hidden">
          <div className="relative h-48 bg-secondary flex items-center justify-center">
            <div className="text-center space-y-2">
              <MapPin className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Map view available in native app</p>
              <p className="text-2xs text-muted-foreground">GPS tracking requires Capacitor integration</p>
            </div>
          </div>
        </Card>

        {/* Recent Routes */}
        <div>
          <p className="text-sm font-medium text-foreground mb-3">Recent Routes</p>
          <div className="space-y-2">
            {DEMO_ROUTES.map((route) => (
              <Card key={route.id} className="animate-fade-in">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">{route.title}</span>
                    </div>
                    <span className="text-2xs text-muted-foreground">{route.date}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {route.distance}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {route.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {route.pace}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
