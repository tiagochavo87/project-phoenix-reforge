import { MobileLayout } from '@/components/layout/MobileLayout';
import { ConnectionBadge } from '@/components/ring/ConnectionBadge';
import { BatteryIndicator } from '@/components/ring/BatteryIndicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useBLE } from '@/contexts/BLEContext';
import { bleService } from '@/services/ble';
import { Bluetooth, RefreshCw, CircleDot, Info, Zap, Heart } from 'lucide-react';
import { toast } from 'sonner';

export default function RingPage() {
  const { status, deviceName, metrics, scan, disconnect, syncNow } = useBLE();

  const handleScan = async () => {
    if (!bleService.isSupported) {
      toast.error('Web Bluetooth is not supported in this browser');
      return;
    }
    await scan();
    if (bleService.state === 'connected') {
      toast.success('Ring connected!');
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    toast.info('Ring disconnected');
  };

  const handleSync = async () => {
    await syncNow();
    toast.success('Data synced');
  };

  const isConnected = status === 'connected' || status === 'syncing';

  return (
    <MobileLayout>
      <div className="px-4 pt-6 pb-4 space-y-6 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-foreground">Ring</h1>

        {/* Ring Visual */}
        <div className="flex flex-col items-center py-8">
          <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
            isConnected ? 'border-primary pulse-glow' : 'border-muted'
          }`}>
            <CircleDot className={`h-12 w-12 ${isConnected ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div className="mt-4 text-center space-y-2">
            <ConnectionBadge status={status} />
            {deviceName && <p className="text-sm text-muted-foreground">{deviceName}</p>}
            {metrics.batteryLevel !== null && <BatteryIndicator level={metrics.batteryLevel} />}
          </div>
        </div>

        {/* Live Heart Rate */}
        {isConnected && (
          <Card className="animate-fade-in border-heart-rate/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-heart-rate/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-heart-rate animate-pulse" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {metrics.heartRate > 0 ? metrics.heartRate : '--'}
                  <span className="text-sm font-normal text-muted-foreground ml-1">bpm</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {metrics.heartRate > 0 ? 'Live heart rate' : 'Waiting for data…'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {!isConnected ? (
            <Button onClick={handleScan} className="w-full gap-2" size="lg" disabled={status === 'connecting'}>
              <Bluetooth className="h-4 w-4" />
              {status === 'connecting' ? 'Scanning...' : 'Pair Smart Ring'}
            </Button>
          ) : (
            <>
              <Button onClick={handleSync} variant="outline" className="w-full gap-2" size="lg" disabled={status === 'syncing'}>
                <RefreshCw className={`h-4 w-4 ${status === 'syncing' ? 'animate-spin' : ''}`} />
                {status === 'syncing' ? 'Syncing...' : 'Sync Now'}
              </Button>
              <Button onClick={handleDisconnect} variant="ghost" className="w-full gap-2 text-destructive" size="lg">
                Disconnect
              </Button>
            </>
          )}
        </div>

        {/* Device Info */}
        {isConnected && (
          <Card className="animate-fade-in">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Info className="h-4 w-4 text-primary" />
                Device Info
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="text-foreground">{deviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Battery</span>
                  <span className="text-foreground">{metrics.batteryLevel !== null ? `${metrics.batteryLevel}%` : '--'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Heart Rate</span>
                  <span className="text-foreground">{metrics.heartRate > 0 ? `${metrics.heartRate} bpm` : '--'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-foreground capitalize">{status}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* BLE Support Notice */}
        {!bleService.isSupported && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Bluetooth Not Available</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Web Bluetooth requires Chrome, Edge, or Opera on desktop, or a native app via Capacitor on mobile.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
}
