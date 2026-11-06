export interface WebNotification {
  id: string;
  title: string;
  message: string;
  body: string;
  detailedBody?: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  icon: string;
  actionRoute?: string | null;
  actionLabel?: string | null;
}