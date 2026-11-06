import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Card } from '../components/ui/Card';
import { AlertBanner } from '../components/ui/AlertBanner';
import { Button } from '../components/ui/Button';
import { Bell } from 'lucide-react';

const typeConfig: Record<string, { bg: string; color: string }> = {
  announcement: { bg: 'bg-palePeach', color: 'text-primary' },
  reminder: { bg: 'bg-amber-50', color: 'text-amber-600' },
  achievement: { bg: 'bg-emerald-50', color: 'text-emerald-600' },
  update: { bg: 'bg-surfaceSoft', color: 'text-textSecondary' },
  system: { bg: 'bg-palePeach', color: 'text-primary' },
};

const formatTime = (value: string): string => {
  const time = new Date(value).getTime();
  const now = Date.now();
  const diff = now - time;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (isNaN(diff) || minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
};

export const NotificationsPage: React.FC = () => {
  const { items, loading, error, unreadCount, refresh, markRead, markAllRead } = useNotifications();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <AlertBanner type="error" message={error} />
        <Button onClick={() => void refresh()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-manrope text-[22px] font-extrabold tracking-tight text-textPrimary">
            Notifications
          </h2>
          <p className="font-manrope text-xs font-medium text-textSecondary">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All read'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" onClick={() => void markAllRead()}>
            Mark all read
          </Button>
        )}
      </div>

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((notif) => {
            const config = typeConfig[notif.type] || typeConfig.update;
            return (
              <button
                key={notif.id}
                type="button"
                onClick={() => void markRead(notif.id)}
                className={`w-full rounded-[18px] border p-4 text-left shadow-sm transition ${
                  notif.isRead ? 'border-borderWarm bg-white' : 'border-borderAccent bg-surfaceSoft'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.bg}`}>
                    <Bell className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`truncate font-manrope text-[13px] font-extrabold text-textPrimary ${
                          notif.isRead ? 'opacity-70' : ''
                        }`}
                      >
                        {notif.title}
                      </p>
                      {!notif.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <p className="mt-1 font-manrope text-xs font-medium leading-4 text-textSecondary">
                      {notif.message || notif.body}
                    </p>
                    <p className="mt-1 font-manrope text-[11px] font-medium text-textMuted">
                      {formatTime(notif.createdAt)}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <div className="mb-1.5 flex h-14 w-14 items-center justify-center rounded-[17px] bg-palePeach">
              <Bell className="h-7 w-7 text-primary" />
            </div>
            <p className="font-manrope text-[17px] font-extrabold text-textPrimary">All caught up!</p>
            <p className="max-w-xs font-manrope text-[13px] font-medium leading-[18px] text-textMuted">
              No new notifications. Check back later for updates.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};