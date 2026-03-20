import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { bleService, BLEEvent, BLEConnectionState } from '@/services/ble';
import type { ConnectionStatus } from '@/types/ring';

interface LiveMetrics {
  heartRate: number;
  batteryLevel: number | null;
}

interface BLEContextValue {
  status: ConnectionStatus;
  deviceName: string | null;
  metrics: LiveMetrics;
  scan: () => Promise<void>;
  disconnect: () => Promise<void>;
  syncNow: () => Promise<void>;
}

const BLEContext = createContext<BLEContextValue | null>(null);

export function BLEProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<LiveMetrics>({ heartRate: 0, batteryLevel: null });

  useEffect(() => {
    const unsub = bleService.subscribe((event: BLEEvent) => {
      switch (event.type) {
        case 'connection': {
          const s = event.data?.state as BLEConnectionState;
          if (s === 'connected') setStatus('connected');
          else if (s === 'connecting' || s === 'scanning') setStatus('connecting');
          else if (s === 'error') setStatus('error');
          else setStatus('disconnected');
          break;
        }
        case 'heartrate':
          setMetrics(prev => ({ ...prev, heartRate: event.data?.heartRate ?? prev.heartRate }));
          break;
        case 'battery':
          setMetrics(prev => ({ ...prev, batteryLevel: event.data?.level ?? prev.batteryLevel }));
          break;
        case 'disconnect':
          setStatus('disconnected');
          setDeviceName(null);
          setMetrics({ heartRate: 0, batteryLevel: null });
          break;
      }
    });
    return unsub;
  }, []);

  const scan = useCallback(async () => {
    if (!bleService.isSupported) return;
    const device = await bleService.scan();
    if (device) {
      setDeviceName(device.name || 'Smart Ring');
      const connected = await bleService.connect(device);
      if (connected) {
        await bleService.readBattery();
      }
    }
  }, []);

  const disconnect = useCallback(async () => {
    await bleService.disconnect();
  }, []);

  const syncNow = useCallback(async () => {
    if (status !== 'connected') return;
    setStatus('syncing');
    await bleService.readBattery();
    // Trigger a fresh read cycle
    setTimeout(() => setStatus('connected'), 1500);
  }, [status]);

  return (
    <BLEContext.Provider value={{ status, deviceName, metrics, scan, disconnect, syncNow }}>
      {children}
    </BLEContext.Provider>
  );
}

export function useBLE() {
  const ctx = useContext(BLEContext);
  if (!ctx) throw new Error('useBLE must be inside BLEProvider');
  return ctx;
}
