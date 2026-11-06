import { apiClient } from '../lib/apiClient';
import type { WebNotification } from '../types/notification';

export async function getNotifications(): Promise<WebNotification[]> {
  const res = await apiClient.get<WebNotification[]>('/api/v1/notifications');
  return Array.isArray(res.data) ? res.data : [];
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiClient.patch(`/api/v1/notifications/${encodeURIComponent(id)}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.post('/api/v1/notifications/read-all');
}