import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_KEY = 'sidomu…base';
export const TOKEN_KEY = '***';
export const LAST_PUSH_KEY = 'sidomu…push';

export type ApiResult<T> = { ok: boolean; data?: T; error?: string };

export async function getApiBase() {
  return (await AsyncStorage.getItem(API_BASE_KEY)) || 'http://localhost:3000';
}

export async function setApiBase(url: string) {
  await AsyncStorage.setItem(API_BASE_KEY, url.replace(/\/+$/, ''));
}

export async function api<T>(path: string, body: Record<string, unknown> = {}) {
  const base = await getApiBase();
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as ApiResult<T>;
  if (!json.ok) throw new Error(json.error || 'API error');
  return json.data as T;
}

export async function apiGet<T>(path: string) {
  const base = await getApiBase();
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${base}${path}`, {
    method: 'GET',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  const json = (await res.json()) as ApiResult<T>;
  if (!json.ok) throw new Error(json.error || 'API error');
  return json.data as T;
}
