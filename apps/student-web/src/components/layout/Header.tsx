import React, { useEffect, useState } from 'react';
import { Bell, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { useNotifications } from '../../hooks/useNotifications';
import { resolveAvatarUrl } from '../../lib/avatar';

interface HeaderProps {
  title: string;
  breadcrumb: string[];
}

export const Header: React.FC<HeaderProps> = ({ title, breadcrumb }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { unreadCount } = useNotifications();
  const avatar = resolveAvatarUrl(profile?.avatarUrl);
  const [avatarError, setAvatarError] = useState(false);
  useEffect(() => setAvatarError(false), [profile?.avatarUrl]);
  const displayName = profile?.name || user?.name || user?.email || 'Student';
  return (
    <header className="flex items-center justify-between border-b border-borderWarm bg-white px-6 py-4">
      <div>
        <div className="flex items-center gap-1 text-xs text-textMuted">
          {breadcrumb.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="h-3 w-3" />}
              <span>{b}</span>
            </React.Fragment>
          ))}
        </div>
        <h1 className="mt-1 text-2xl font-bold text-textPrimary">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/notifications')}
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-borderWarm bg-white"
        >
          <Bell className="h-5 w-5 text-textPrimary" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-white bg-error text-[9px] font-extrabold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 rounded-lg px-2 py-1 transition hover:bg-palePeach"
          aria-label="Open profile"
        >
          {avatar && !avatarError ? (
            <img
              src={avatar}
              alt="avatar"
              onError={() => setAvatarError(true)}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-palePeach font-semibold text-primary">
              {(user?.email?.[0] || 'S').toUpperCase()}
            </div>
          )}
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-textPrimary">{displayName}</p>
            <p className="text-xs text-textMuted">Student</p>
          </div>
        </button>
      </div>
    </header>
  );
};