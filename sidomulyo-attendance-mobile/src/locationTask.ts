import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

export const LOCATION_TASK = 'SIDOMULYO_ATTENDANCE_LOCATION_TASK';
const SESSION_KEY = 'sidomulyo_active_session_id';
const QUEUE_KEY = 'sidomulyo_location_queue';

type Point = { session_id: string; lat: number; lng: number; accuracy?: number | null; recorded_at: string };

async function enqueue(point: Point) {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  const list = raw ? (JSON.parse(raw) as Point[]) : [];
  list.push(point);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(list.slice(-500)));
}

export async function flushLocations() {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  const list = raw ? (JSON.parse(raw) as Point[]) : [];
  if (!list.length) return;
  const remaining: Point[] = [];
  for (const p of list) {
    try { await api('/api/attendance/location', p); } catch { remaining.push(p); }
  }
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
}

TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
  if (error) return;
  const session_id = await AsyncStorage.getItem(SESSION_KEY);
  if (!session_id) return;
  const locations = (data as { locations?: Location.LocationObject[] })?.locations || [];
  for (const loc of locations) {
    const point: Point = { session_id, lat: loc.coords.latitude, lng: loc.coords.longitude, accuracy: loc.coords.accuracy, recorded_at: new Date(loc.timestamp).toISOString() };
    try { await api('/api/attendance/location', point); await flushLocations(); } catch { await enqueue(point); }
  }
});

export async function startTracking(sessionId: string) {
  await AsyncStorage.setItem(SESSION_KEY, sessionId);
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== 'granted') throw new Error('Izin lokasi foreground ditolak');
  const bg = await Location.requestBackgroundPermissionsAsync();
  if (bg.status !== 'granted') throw new Error('Izin lokasi background ditolak');
  const started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);
  if (!started) {
    await Location.startLocationUpdatesAsync(LOCATION_TASK, {
      accuracy: Location.Accuracy.High,
      timeInterval: 60000,
      distanceInterval: 25,
      showsBackgroundLocationIndicator: true,
      foregroundService: { notificationTitle: 'Absensi aktif', notificationBody: 'Lokasi sedang dikirim ke Sidomulyo Motor.' },
    });
  }
}

export async function stopTracking() {
  await AsyncStorage.removeItem(SESSION_KEY);
  if (await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK)) await Location.stopLocationUpdatesAsync(LOCATION_TASK);
}
