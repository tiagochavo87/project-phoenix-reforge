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
    console.log('[BLE]', event.type, event.data);
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
        acceptAllDevices: true,
        optionalServices: [RING_SERVICE_UUID, BATTERY_SERVICE_UUID, RING_CUSTOM_SERVICE_UUID],
      });

      this.device = device;
      device.addEventListener('gattserverdisconnected', () => this.onDisconnect());
      console.log('[BLE] Device selected:', device.name, device.id);
      return device;
    } catch (err: any) {
      console.error('[BLE] Scan error:', err);
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
    if (!target?.gatt) {
      console.error('[BLE] No GATT server on device');
      return false;
    }

    try {
      this.setState('connecting');
      console.log('[BLE] Connecting to GATT server...');
      this.server = await target.gatt.connect();
      this.device = target;
      this.setState('connected');
      console.log('[BLE] GATT connected, discovering services...');
      await this.discoverAndSubscribe();
      return true;
    } catch (err: any) {
      console.error('[BLE] Connect error:', err);
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

  private async discoverAndSubscribe() {
    if (!this.server) return;

    // Try to get all available services
    let services: any[] = [];
    try {
      services = await this.server.getPrimaryServices();
      console.log('[BLE] Available services:', services.map((s: any) => s.uuid));
    } catch (err) {
      console.warn('[BLE] Could not enumerate services, trying known UUIDs');
    }

    // Try heart rate notifications
    await this.tryHeartRateNotifications();

    // Try battery read
    await this.readBattery();

    // Try to read characteristics from all discovered services
    for (const service of services) {
      try {
        const chars = await service.getCharacteristics();
        console.log(`[BLE] Service ${service.uuid} characteristics:`, chars.map((c: any) => ({
          uuid: c.uuid,
          properties: {
            read: c.properties.read,
            write: c.properties.write,
            notify: c.properties.notify,
            indicate: c.properties.indicate,
          }
        })));

        // Auto-subscribe to any notifiable characteristic
        for (const char of chars) {
          if (char.properties.notify && char.uuid !== HEART_RATE_CHAR_UUID) {
            try {
              await char.startNotifications();
              char.addEventListener('characteristicvaluechanged', (event: any) => {
                const value = event.target.value;
                const bytes = new Uint8Array(value.buffer);
                console.log(`[BLE] Notify from ${char.uuid}:`, Array.from(bytes));
                this.emit({
                  type: 'data',
                  data: { uuid: char.uuid, bytes: Array.from(bytes) },
                  timestamp: Date.now()
                });
              });
              console.log(`[BLE] Subscribed to notifications on ${char.uuid}`);
            } catch (e) {
              console.warn(`[BLE] Could not subscribe to ${char.uuid}:`, e);
            }
          }

          // Try reading readable characteristics
          if (char.properties.read) {
            try {
              const val = await char.readValue();
              const bytes = new Uint8Array(val.buffer);
              console.log(`[BLE] Read ${char.uuid}:`, Array.from(bytes));
              this.emit({
                type: 'data',
                data: { uuid: char.uuid, bytes: Array.from(bytes) },
                timestamp: Date.now()
              });
            } catch (e) {
              console.warn(`[BLE] Could not read ${char.uuid}`);
            }
          }
        }
      } catch (err) {
        console.warn(`[BLE] Could not get characteristics for ${service.uuid}`);
      }
    }
  }

  private async tryHeartRateNotifications() {
    if (!this.server) return;
    try {
      const service = await this.server.getPrimaryService(RING_SERVICE_UUID);
      const char = await service.getCharacteristic(HEART_RATE_CHAR_UUID);
      await char.startNotifications();
      char.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        const flags = value.getUint8(0);
        const is16bit = flags & 0x01;
        const hr = is16bit ? value.getUint16(1, true) : value.getUint8(1);
        console.log('[BLE] Heart rate:', hr);
        this.emit({ type: 'heartrate', data: { heartRate: hr }, timestamp: Date.now() });
      });
      console.log('[BLE] Heart rate notifications started');
    } catch (err) {
      console.warn('[BLE] Heart rate service not available:', err);
    }
  }

  async readBattery(): Promise<number | null> {
    if (!this.server) return null;
    try {
      const service = await this.server.getPrimaryService(BATTERY_SERVICE_UUID);
      const char = await service.getCharacteristic(BATTERY_LEVEL_CHAR_UUID);
      const value = await char.readValue();
      const level = value.getUint8(0);
      console.log('[BLE] Battery level:', level);
      this.emit({ type: 'battery', data: { level }, timestamp: Date.now() });
      return level;
    } catch (err) {
      console.warn('[BLE] Battery service not available:', err);
      return null;
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
