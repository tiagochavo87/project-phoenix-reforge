export interface Device {
  id: string;
  user_id: string;
  device_name: string;
  device_id: string | null;
  firmware_version: string | null;
  hardware_version: string | null;
  battery_level: number | null;
  last_synced_at: string | null;
  is_connected: boolean;
  ring_size: string | null;
  color: string | null;
  serial_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  device_id: string | null;
  session_type: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  heart_rate_avg: number | null;
  heart_rate_min: number | null;
  heart_rate_max: number | null;
  hrv_avg: number | null;
  spo2_avg: number | null;
  skin_temp_avg: number | null;
  steps: number;
  calories_burned: number | null;
  data_json: Record<string, any>;
  synced: boolean;
  created_at: string;
}

export interface Workout {
  id: string;
  user_id: string;
  session_id: string | null;
  workout_type: string;
  title: string | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  distance_meters: number | null;
  calories_burned: number | null;
  avg_heart_rate: number | null;
  max_heart_rate: number | null;
  avg_pace: number | null;
  elevation_gain: number | null;
  route_json: any;
  summary_json: Record<string, any>;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  log_date: string;
  steps: number;
  calories_burned: number;
  active_minutes: number;
  distance_meters: number;
  floors_climbed: number;
  resting_heart_rate: number | null;
  hrv_daily: number | null;
  spo2_avg: number | null;
  skin_temp_avg: number | null;
  sleep_score: number | null;
  readiness_score: number | null;
  activity_score: number | null;
  data_json: Record<string, any>;
  created_at: string;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'syncing' | 'error';

export interface RingState {
  status: ConnectionStatus;
  device: Device | null;
  batteryLevel: number | null;
  lastSync: string | null;
}

export type WorkoutType = 
  | 'running' | 'cycling' | 'swimming' | 'strength'
  | 'yoga' | 'hiking' | 'walking' | 'other';
