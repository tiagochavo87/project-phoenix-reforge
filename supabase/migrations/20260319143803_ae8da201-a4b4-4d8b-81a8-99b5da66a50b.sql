
-- New tables for smart ring companion app

-- Devices table - tracks paired smart rings
CREATE TABLE public.devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name text NOT NULL DEFAULT 'Smart Ring',
  device_id text, -- BLE device ID
  firmware_version text,
  hardware_version text,
  battery_level integer,
  last_synced_at timestamptz,
  is_connected boolean DEFAULT false,
  ring_size text,
  color text,
  serial_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own devices" ON public.devices
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Sessions table - ring usage sessions
CREATE TABLE public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id uuid REFERENCES public.devices(id) ON DELETE SET NULL,
  session_type text NOT NULL DEFAULT 'general', -- general, sleep, workout, meditation
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer,
  heart_rate_avg integer,
  heart_rate_min integer,
  heart_rate_max integer,
  hrv_avg numeric,
  spo2_avg numeric,
  skin_temp_avg numeric,
  steps integer DEFAULT 0,
  calories_burned numeric,
  data_json jsonb DEFAULT '{}'::jsonb,
  synced boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sessions" ON public.sessions
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Workouts table
CREATE TABLE public.workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.sessions(id) ON DELETE SET NULL,
  workout_type text NOT NULL, -- running, cycling, swimming, strength, yoga, etc.
  title text,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer,
  distance_meters numeric,
  calories_burned numeric,
  avg_heart_rate integer,
  max_heart_rate integer,
  avg_pace numeric, -- min/km
  elevation_gain numeric,
  route_json jsonb, -- GPS coordinates array
  summary_json jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own workouts" ON public.workouts
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Activity logs - daily aggregated metrics
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  steps integer DEFAULT 0,
  calories_burned numeric DEFAULT 0,
  active_minutes integer DEFAULT 0,
  distance_meters numeric DEFAULT 0,
  floors_climbed integer DEFAULT 0,
  resting_heart_rate integer,
  hrv_daily numeric,
  spo2_avg numeric,
  skin_temp_avg numeric,
  sleep_score integer,
  readiness_score integer,
  activity_score integer,
  data_json jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, log_date)
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own activity logs" ON public.activity_logs
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Enable realtime for sessions (live sync)
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.devices;
