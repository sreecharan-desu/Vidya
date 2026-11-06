import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useNotifications } from '../hooks/useNotifications';
import { apiClient } from '../lib/apiClient';
import { resolveAvatarUrl } from '../lib/avatar';
import { uploadAvatar } from '../services/profileService';
import { ProfileEditForm } from '../components/profile/ProfileEditForm';
import { Button } from '../components/ui/Button';
import { AlertBanner } from '../components/ui/AlertBanner';
import {
  Bell,
  Camera,
  CheckCircle,
  Home,
  LogOut,
  Pencil,
  Trophy,
  User,
} from 'lucide-react';
import {
  BookOpen,
  Cake,
  Calendar,
  GraduationCap,
  Languages,
  Mail,
  MapPin,
  Phone,
  School,
  Smile,
  Users,
} from 'lucide-react';
import { extractErrorMessage } from '../lib/apiClient';
import type { ProfileEditValues } from '../schemas/profileSchema';
import type { StudentProfile } from '../types/profile';

interface ProgressSummary {
  completedChapters: number;
  completedTopics: number;
}

export const ProfilePage: React.FC = () => {
  const { profile, loading, error, refresh, save, setProfile } = useProfile();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [progress, setProgress] = useState<ProgressSummary>({ completedChapters: 0, completedTopics: 0 });
  const [offlineCache, setOfflineCache] = useState(true);
  const [studyMedium, setStudyMedium] = useState<'English' | 'Telugu'>('English');
  const [studyGoal, setStudyGoal] = useState('45 mins');
  const { unreadCount } = useNotifications();

  const [avatarError, setAvatarError] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAvatarError(false);
  }, [profile?.avatarUrl]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  useEffect(() => {
    if (profile?.medium) {
      setStudyMedium(profile.medium.toUpperCase().includes('TELUGU') ? 'Telugu' : 'English');
    }
    if (profile?.studyGoalMinutes) {
      setStudyGoal(`${profile.studyGoalMinutes} mins`);
    }
  }, [profile?.medium, profile?.studyGoalMinutes]);

  useEffect(() => {
    let mounted = true;
    apiClient
      .get<{ overallPercent: number; chapters: Record<string, { completed: boolean; completedSections?: string[] }> }>(
        '/api/v1/students/me/progress'
      )
      .then((res) => {
        if (!mounted) return;
        const chapters = res.data?.chapters || {};
        const completedChapters = Object.values(chapters).filter((c) => c.completed).length;
        const completedTopics = Object.values(chapters).reduce(
          (sum, c) => sum + (c.completedSections?.length || 0),
          0
        );
        setProgress({ completedChapters, completedTopics });
      })
      .catch(() => {
        // keep defaults
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async (values: ProfileEditValues) => {
    setSaving(true);
    setNotice(null);
    try {
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        gender: values.gender,
        dob: values.dob,
        dateOfBirth: values.dob,
        district: values.district,
        villageCity: values.location,
        location: values.location,
        schoolName: values.schoolName,
        grade: values.grade,
        section: values.section,
        medium: values.medium,
        rollNumber: values.rollNumber,
        fatherName: values.fatherName,
        motherName: values.motherName,
        parentPhone: values.parentPhone,
        studyGoalMinutes: values.studyGoalMinutes,
      };
      Object.keys(payload).forEach((k) => {
        if ((payload as Record<string, unknown>)[k] === undefined) {
          delete (payload as Record<string, unknown>)[k];
        }
      });
      await save(payload);
      setEditMode(false);
      setNotice({ type: 'success', message: 'Profile updated successfully.' });
    } catch (err) {
      setNotice({ type: 'error', message: extractErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const updateMedium = async (medium: 'English' | 'Telugu') => {
    setStudyMedium(medium);
    try {
      await save({ medium: medium === 'English' ? 'ENGLISH' : 'TELUGU' });
    } catch {
      setNotice({ type: 'error', message: 'Could not update study medium.' });
    }
  };

  const updateStudyGoal = async (goal: string) => {
    setStudyGoal(goal);
    const minutes = parseInt(goal, 10) || 30;
    try {
      await localStorage.setItem('@vidya_study_goal', goal);
    } catch {
      // ignore
    }
    try {
      await save({ studyGoalMinutes: minutes });
    } catch {
      setNotice({ type: 'error', message: 'Could not update study goal.' });
    }
  };

  const allowedAvatarTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxAvatarSize = 5 * 1024 * 1024;

  const openAvatarPicker = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';
    setAvatarUploadError(null);
    if (!allowedAvatarTypes.includes(file.type)) {
      setAvatarUploadError('Please select a JPG, PNG, WebP, or GIF image.');
      return;
    }
    if (file.size > maxAvatarSize) {
      setAvatarUploadError('Image must be 5 MB or smaller.');
      return;
    }
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setSelectedAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const cancelAvatarUpload = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setSelectedAvatar(null);
    setAvatarPreview(null);
    setAvatarUploadError(null);
  };

  const handleAvatarUpload = async () => {
    if (!selectedAvatar) return;
    setUploadingAvatar(true);
    setAvatarUploadError(null);
    try {
      const result = await uploadAvatar(selectedAvatar);
      if (profile) {
        setProfile({ ...profile, avatarUrl: result.avatarUrl } as StudentProfile);
      }
      setNotice({ type: 'success', message: 'Profile picture updated successfully.' });
      cancelAvatarUpload();
    } catch (err) {
      setAvatarUploadError(extractErrorMessage(err));
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="w-full max-w-md space-y-4">
          <AlertBanner type="error" message={error} />
          <Button onClick={() => void refresh()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="w-full max-w-md rounded-[22px] border border-borderWarm bg-white p-8 text-center shadow-card">
          <p className="text-textSecondary">No profile data available.</p>
        </div>
      </div>
    );
  }

  const fullName =
    profile.name || [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim() || 'Student';
  const avatar = resolveAvatarUrl(profile.avatarUrl);
  const activeClass =
    profile.grade ? `Class ${profile.grade}` : profile.activeClassId || profile.classId || 'Class not set';
  const classSection = profile.section ? `${activeClass} — Section ${profile.section}` : activeClass;
  const mobile = profile.parentPhone || '—';
  const address = [profile.location || profile.villageCity, profile.district].filter(Boolean).join(', ') || '—';
  const initial = (fullName[0] || 'S').toUpperCase();

  return (
    <div className="min-h-screen bg-white pb-[78px]">
      {/* Mobile-style header */}
      <header className="sticky top-0 z-20 bg-white">
        <div className="h-16 border-b border-borderWarm bg-white px-4">
          <div className="flex h-full items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2.5"
              aria-label="Go to Home"
            >
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[#f2ded3] bg-palePeach shadow-sm">
                <img src="/logo.png" alt="Vidya Learning" className="h-7 w-7 object-contain" />
              </div>
              <div>
                <p className="font-manrope text-base font-extrabold tracking-tight text-textPrimary">
                  Vidya Learning
                </p>
                <p className="font-manrope -mt-0.5 text-[10px] font-medium text-textMuted">
                  AP SCERT Division
                </p>
              </div>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
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
                aria-label="Student profile"
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-borderWarm bg-white shadow-sm"
              >
                {avatar && !avatarError ? (
                  <img
                    src={avatar}
                    alt="Profile"
                    onError={() => setAvatarError(true)}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-palePeach font-semibold text-primary">
                    {initial}
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-[22px] pt-[18px] pb-[48px]">
        <div className="space-y-6">
          {notice && (
            <AlertBanner type={notice.type} message={notice.message} onClose={() => setNotice(null)} />
          )}

          {/* Page intro */}
          <div className="py-1">
            <div className="mb-0.5 flex items-center gap-2">
              <span className="font-manrope text-[11px] font-extrabold uppercase tracking-widest text-primary">
                STUDENT ACCOUNT
              </span>
              <span className="rounded-full bg-palePeach px-2 py-0.5 font-manrope text-[10px] font-bold text-primaryDark">
                {activeClass} Enrolled
              </span>
            </div>
            <h1 className="font-manrope text-[22px] font-extrabold tracking-tight text-textPrimary">
              Student Profile &amp; Settings
            </h1>
          </div>

          {/* Profile card */}
          <div className="rounded-[22px] border border-[#f2ded3] bg-palePeach p-[22px] shadow-sm">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={openAvatarPicker}
                  aria-label="Edit profile picture"
                  className="relative"
                >
                  {avatar && !avatarError ? (
                    <img
                      src={avatar}
                      alt="Profile"
                      onError={() => setAvatarError(true)}
                      className="h-[66px] w-[66px] rounded-full border-2 border-white object-cover shadow-sm"
                    />
                  ) : (
                    <div className="flex h-[66px] w-[66px] items-center justify-center rounded-full border-2 border-white bg-primary text-xl font-bold text-white shadow-sm">
                      {initial}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-primary shadow-md">
                    <Camera className="h-3.5 w-3.5 text-white" />
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleAvatarSelected}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="truncate font-manrope text-lg font-extrabold text-textPrimary">
                    {fullName}
                  </h2>
                  <span className="rounded-full bg-primary px-2.5 py-0.5 font-manrope text-[10px] font-bold text-white">
                    Roll #{profile.rollNumber || '—'}
                  </span>
                </div>
                <p className="truncate font-manrope text-xs font-medium text-textSecondary">
                  {profile.schoolName || 'School not set'}
                </p>
                <p className="mt-0.5 font-manrope text-xs font-bold text-primaryDark">
                  {activeClass} · Section {profile.section || '—'} · {profile.medium || '—'}
                </p>
              </div>
            </div>
          </div>

          {avatarPreview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-sm rounded-[22px] border border-borderWarm bg-white p-5 shadow-card">
                <h3 className="mb-4 font-manrope text-lg font-extrabold text-textPrimary">Profile Photo</h3>
                <div className="mb-4 flex justify-center">
                  <img
                    src={avatarPreview}
                    alt="Selected profile"
                    className="h-32 w-32 rounded-full border-2 border-borderWarm object-cover"
                  />
                </div>
                {avatarUploadError && (
                  <div className="mb-4">
                    <AlertBanner type="error" message={avatarUploadError} onClose={() => setAvatarUploadError(null)} />
                  </div>
                )}
                <div className="flex justify-end gap-3">
                  <Button variant="secondary" onClick={cancelAvatarUpload} disabled={uploadingAvatar}>
                    Cancel
                  </Button>
                  <Button loading={uploadingAvatar} onClick={handleAvatarUpload}>
                    Upload
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!editMode && (
            <>
              {/* Student details */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-manrope text-lg font-extrabold tracking-tight text-textPrimary">
                    Student Details
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-1 rounded-full border border-borderWarm bg-palePeach px-3 py-1.5 font-manrope text-xs font-bold text-primary"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit Profile
                  </button>
                </div>
                <div className="rounded-[22px] border border-borderWarm bg-white p-5 shadow-sm">
                  <Row icon={User} label="Student Name" value={fullName} />
                  <Row icon={Cake} label="Date of Birth" value={profile.dob || profile.dateOfBirth || '—'} />
                  <Row icon={Smile} label="Gender" value={profile.gender || '—'} />
                  <Row icon={GraduationCap} label="Roll Number" value={profile.rollNumber ? `#${profile.rollNumber}` : '—'} last />
                </div>
              </div>

              {/* Academic info */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-manrope text-lg font-extrabold tracking-tight text-textPrimary">
                    Academic Information
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-1 rounded-full border border-borderWarm bg-palePeach px-3 py-1.5 font-manrope text-xs font-bold text-primary"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit Details
                  </button>
                </div>
                <div className="rounded-[22px] border border-borderWarm bg-white p-5 shadow-sm">
                  <Row icon={School} label="School" value={profile.schoolName || '—'} />
                  <Row icon={MapPin} label="Location & District" value={address} />
                  <Row icon={GraduationCap} label="Class & Section" value={classSection} />
                  <Row icon={Languages} label="Medium" value={profile.medium || '—'} />
                  <Row icon={Calendar} label="Academic Session" value={`${profile.academicYear || '—'} (AP SCERT)`} last />
                </div>
              </div>

              {/* Parents & contact */}
              <div className="space-y-2.5">
                <h3 className="font-manrope text-lg font-extrabold tracking-tight text-textPrimary">
                  Parents &amp; Contact Details
                </h3>
                <div className="rounded-[22px] border border-borderWarm bg-white p-5 shadow-sm">
                  <Row icon={User} label="Father's Name" value={profile.fatherName || '—'} />
                  <Row icon={Smile} label="Mother's Name" value={profile.motherName || '—'} />
                  <Row icon={Phone} label="Parent Contact Mobile" value={mobile} />
                  <Row icon={Mail} label="Login Email" value={user?.email || profile.email} last />
                </div>
              </div>

              {/* Achievements */}
              <div className="space-y-2">
                <h3 className="font-manrope text-lg font-extrabold tracking-tight text-textPrimary">
                  Achievements
                </h3>
                <div className="flex gap-2.5">
                  <StatTile value={progress.completedTopics} label="Topics Done" />
                  <StatTile value={progress.completedChapters} label="Chapters Done" />
                </div>
              </div>

              {/* Study settings */}
              <div className="space-y-2">
                <h3 className="font-manrope text-lg font-extrabold tracking-tight text-textPrimary">
                  Study Settings
                </h3>
                <div className="overflow-hidden rounded-[22px] border border-borderWarm bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-borderWarm p-4">
                    <div className="flex items-center gap-3">
                      <Languages className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-manrope text-[13px] font-bold text-textPrimary">
                          Study Medium / Language
                        </p>
                        <p className="font-manrope text-[11px] font-medium text-textSecondary">
                          Primary instruction language
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 rounded-xl bg-surfaceSoft p-1">
                      {(['English', 'Telugu'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => updateMedium(m)}
                          className={`rounded-lg px-2.5 py-1 font-manrope text-[11px] font-bold transition ${
                            studyMedium === m ? 'bg-primary text-white' : 'text-textSecondary'
                          }`}
                        >
                          {m === 'Telugu' ? 'తెలుగు' : m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-b border-borderWarm p-4">
                    <div className="mb-2.5 flex items-center gap-3">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-manrope text-[13px] font-bold text-textPrimary">Daily Study Goal</p>
                        <p className="font-manrope text-[11px] font-medium text-textSecondary">
                          Target daily learning time
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {['15 mins', '30 mins', '45 mins', '60 mins'].map((goal) => {
                        const selected = studyGoal === goal;
                        return (
                          <button
                            key={goal}
                            type="button"
                            onClick={() => updateStudyGoal(goal)}
                            className={`flex-1 rounded-xl border py-2 font-manrope text-[11px] font-bold transition ${
                              selected
                                ? 'border-primary bg-primary text-white shadow-sm'
                                : 'border-borderWarm bg-white text-textSecondary'
                            }`}
                          >
                            {goal}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-manrope text-[13px] font-bold text-textPrimary">
                          Offline Content Cache
                        </p>
                        <p className="font-manrope text-[11px] font-medium text-textSecondary">
                          Cached curriculum for offline reading
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOfflineCache((v) => !v)}
                      className={`h-6 w-11 rounded-full transition ${offlineCache ? 'bg-primary' : 'bg-borderWarm'}`}
                    >
                      <span
                        className={`block h-5 w-5 rounded-full bg-white shadow transition ${
                          offlineCache ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Account actions */}
              <div>
                <button
                  type="button"
                  onClick={() => void logout().then(() => navigate('/login'))}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3.5 font-manrope text-sm font-bold text-red-600 shadow-sm"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>

              {/* App info */}
              <div className="py-2 text-center">
                <p className="font-manrope text-xs font-bold text-textSecondary">
                  Vidya Learning App v1.2.0
                </p>
                <p className="font-manrope text-[10px] font-medium text-textMuted">
                  Aligned with Andhra Pradesh SCERT Curriculum
                </p>
              </div>
            </>
          )}

          {editMode && (
            <div className="rounded-[22px] border border-borderWarm bg-white p-5 shadow-sm">
              <h3 className="mb-4 font-manrope text-lg font-extrabold text-textPrimary">
                Edit Profile
              </h3>
              <ProfileEditForm
                profile={profile}
                saving={saving}
                onSubmit={handleSave}
                onCancel={() => setEditMode(false)}
              />
            </div>
          )}
        </div>
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-borderWarm bg-white/95 pt-2 shadow-lg">
        <div className="flex items-center justify-around" style={{ paddingBottom: 8, height: 70 }}>
          {[
            { key: 'Home', label: 'Home', icon: Home, path: '/dashboard' },
            { key: 'Learn', label: 'Learn', icon: BookOpen, path: '/courses' },
            { key: 'Profile', label: 'Profile', icon: User, path: '/profile' },
          ].map((tab) => {
            const isActive = tab.key === 'Profile';
            const Icon = tab.icon;
            const color = isActive ? '#b95d3f' : '#99877f';
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  if (!isActive) navigate(tab.path);
                }}
                className="flex flex-1 flex-col items-center justify-center py-0.5"
                aria-label={tab.label}
              >
                <div
                  className={`flex h-7 w-11 items-center justify-center rounded-full ${
                    isActive ? 'bg-palePeach' : ''
                  }`}
                >
                  <Icon className="h-[21px] w-[21px]" style={{ color }} />
                </div>
                <span
                  className={`mt-0.5 font-manrope text-[10px] font-bold ${
                    isActive ? 'text-primary' : 'text-[#99877f]'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

const Row: React.FC<{ icon: React.ElementType; label: string; value: string; last?: boolean }> = ({
  icon: Icon,
  label,
  value,
  last,
}) => {
  return (
    <div className={`flex items-center justify-between py-3 ${last ? '' : 'border-b border-borderWarm'}`}>
      <div className="flex items-center gap-2.5">
        <Icon className="h-[18px] w-[18px] text-primary" />
        <span className="font-manrope text-xs font-medium text-textSecondary">{label}</span>
      </div>
      <span className="font-manrope text-xs font-bold text-textPrimary">{value}</span>
    </div>
  );
};

const StatTile: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  const bg = label === 'Topics Done' ? 'bg-emerald-50' : 'bg-palePeach';
  const iconColor = label === 'Topics Done' ? 'text-emerald-600' : 'text-primary';
  const Icon = label === 'Topics Done' ? CheckCircle : Trophy;
  return (
    <div className="flex-1 rounded-2xl border border-borderWarm bg-white px-2 py-3.5 text-center shadow-sm">
      <div className={`mx-auto mb-2 flex h-[34px] w-[34px] items-center justify-center rounded-[10px] ${bg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <p className="font-manrope text-lg font-extrabold text-textPrimary">{value}</p>
      <p className="mt-0.5 font-manrope text-[11px] font-semibold text-textSecondary">{label}</p>
    </div>
  );
};