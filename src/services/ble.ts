/**
 * BLE Service for Smart Ring communication via Web Bluetooth API.
 */

const RING_SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';
const HEART_RATE_CHAR_UUID = '00002a37-0000-1000-8000-00805f9b34fb';
const BATTERY_SERVICE_UUID = '0000180f-0000-1000-8000-00805f9b34fb';
const BATTERY_LEVEL_CHAR_UUID = '00002a19-0000-1000-8000-00805f9b34fb';
const RING_CUSTOM_SERVICE_UUID = '12345678-1234-5678-1234-56789abcdef0';
const RING_COMMAND_CHAR_UUID = '12345678-1234-5678-1234-56789abcdef2';

export type BLEConnectionState = 'disconnected' | 'scanning' | 'connecting' | 'connected' | 'error';

export interface BLEEvent {
  type: 'connection' | 'data' | 'battery' | 'heartrate' | 'error' | 'disconnect';
  data?: any;
  timestamp: number;
}

type BLEListener = (event: BLEEvent) => void;

class BLEService {
  private device: any = null;
  private server: any = null;
  private listeners: Set<BLEListener> = new Set();
  private _state: BLEConnectionState = 'disconnected';

  get state(): BLEConnectionState {
    return this._state;
  }

  get isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in (navigator as any);
  }

  get deviceName(): string | null {
    return this.device?.name || null;
  }

  get deviceId(): string | null {
    return this.device?.id || null;
  }

  subscribe(listener: BLEListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: BLEEvent) {
    this.listeners.forEach(fn => fn(event));
  }

  private setState(state: BLEConnectionState) {
    this._state = state;
    this.emit({ type: 'connection', data: { state }, timestamp: Date.now() });
  }

  async scan(): Promise<any | null> {
    if (!this.isSupported) {
      this.emit({ type: 'error', data: { message: 'Web Bluetooth not supported' }, timestamp: Date.now() });
      return null;
    }

    try {
      this.setState('scanning');
      const bt = (navigator as any).bluetooth;
      const device = await bt.requestDevice({
        filters: [
          { services: [RING_SERVICE_UUID] },
          { namePrefix: 'Ring' },
          { namePrefix: 'Smart' },
        ],
        optionalServices: [BATTERY_SERVICE_UUID, RING_CUSTOM_SERVICE_UUID],
      });

      this.device = device;
      device.addEventListener('gattserverdisconnected', () => this.onDisconnect());
      return device;
    } catch (err: any) {
      if (err.name !== 'NotFoundError') {
        this.setState('error');
        this.emit({ type: 'error', data: { message: err.message }, timestamp: Date.now() });
      } else {
        this.setState('disconnected');
      }
      return null;
    }
  }

  async connect(device?: any): Promise<boolean> {
    const target = device || this.device;
    if (!target?.gatt) return false;

    try {
      this.setState('connecting');
      this.server = await target.gatt.connect();
      this.device = target;
      this.setState('connected');
      await this.startNotifications();
      return true;
    } catch (err: any) {
      this.setState('error');
      this.emit({ type: 'error', data: { message: err.message }, timestamp: Date.now() });
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.onDisconnect();
  }

  private onDisconnect() {
    this.server = null;
    this.setState('disconnected');
    this.emit({ type: 'disconnect', timestamp: Date.now() });
  }

  async readBattery(): Promise<number | null> {
    if (!this.server) return null;
    try {
      const service = await this.server.getPrimaryService(BATTERY_SERVICE_UUID);
      const char = await service.getCharacteristic(BATTERY_LEVEL_CHAR_UUID);
      const value = await char.readValue();
      const level = value.getUint8(0);
      this.emit({ type: 'battery', data: { level }, timestamp: Date.now() });
      return level;
    } catch {
      return null;
    }
  }

  private async startNotifications() {
    if (!this.server) return;
    try {
      const service = await this.server.getPrimaryService(RING_SERVICE_UUID);
      const char = await service.getCharacteristic(HEART_RATE_CHAR_UUID);
      await char.startNotifications();
      char.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        const hr = value.getUint8(1);
        this.emit({ type: 'heartrate', data: { heartRate: hr }, timestamp: Date.now() });
      });
    } catch {
      // Heart rate service may not be available
    }
  }

  async sendCommand(command: Uint8Array): Promise<boolean> {
    if (!this.server) return false;
    try {
      const service = await this.server.getPrimaryService(RING_CUSTOM_SERVICE_UUID);
      const char = await service.getCharacteristic(RING_COMMAND_CHAR_UUID);
      await char.writeValue(command);
      return true;
    } catch {
      return false;
    }
  }
}

export const bleService = new BLEService();
