import { supabase } from '@/integrations/supabase/client';
import type { Device, Session, Workout, ActivityLog } from '@/types/ring';

// Devices
export async function getDevices(): Promise<Device[]> {
  const { data, error } = await supabase.from('devices').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as Device[];
}

export async function upsertDevice(device: Partial<Device> & { user_id: string }): Promise<Device> {
  const { data, error } = await supabase.from('devices').upsert(device as any).select().single();
  if (error) throw error;
  return data as unknown as Device;
}

export async function updateDevice(id: string, updates: Partial<Device>): Promise<Device> {
  const { data, error } = await supabase.from('devices').update(updates as any).eq('id', id).select().single();
  if (error) throw error;
  return data as unknown as Device;
}

// Sessions
export async function getSessions(limit = 20): Promise<Session[]> {
  const { data, error } = await supabase.from('sessions').select('*').order('started_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data || []) as unknown as Session[];
}

export async function createSession(session: Partial<Session> & { user_id: string }): Promise<Session> {
  const { data, error } = await supabase.from('sessions').insert(session as any).select().single();
  if (error) throw error;
  return data as unknown as Session;
}

// Workouts
export async function getWorkouts(limit = 20): Promise<Workout[]> {
  const { data, error } = await supabase.from('workouts').select('*').order('started_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data || []) as unknown as Workout[];
}

export async function createWorkout(workout: Partial<Workout> & { user_id: string; workout_type: string }): Promise<Workout> {
  const { data, error } = await supabase.from('workouts').insert(workout as any).select().single();
  if (error) throw error;
  return data as unknown as Workout;
}

// Activity Logs
export async function getActivityLogs(days = 7): Promise<ActivityLog[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .gte('log_date', since.toISOString().split('T')[0])
    .order('log_date', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as ActivityLog[];
}

export async function upsertActivityLog(log: Partial<ActivityLog> & { user_id: string; log_date: string }): Promise<ActivityLog> {
  const { data, error } = await supabase.from('activity_logs').upsert(log as any).select().single();
  if (error) throw error;
  return data as unknown as ActivityLog;
}
