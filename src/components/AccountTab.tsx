import React, { useState } from 'react';
import {
  User,
  Mail,
  Shield,
  LogOut,
  Target,
  AlertTriangle,
  RotateCcw,
  Check,
  Award,
  GraduationCap,
  Layers,
  ChevronRight,
  BookOpen,
  Calendar,
  Cloud,
  Database,
  ExternalLink,
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile, SubjectAttendance } from '../types/attendance';

interface AccountTabProps {
  user: UserProfile;
  subjects: SubjectAttendance[];
  targetPercentage: number;
  onUpdateTargetPercentage: (target: number) => void;
  onResetData: () => void;
  onLogout: () => void;
  onOpenCalendarSync?: () => void;
  isCloudSynced?: boolean;
}

export const AccountTab: React.FC<AccountTabProps> = ({
  user,
  subjects,
  targetPercentage,
  onUpdateTargetPercentage,
  onResetData,
  onLogout,
  onOpenCalendarSync,
  isCloudSynced = true,
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [resetFeedback, setResetFeedback] = useState(false);

  // Overall attendance calculation
  const totalHeld = subjects.reduce((sum, s) => sum + s.totalHeld, 0);
  const totalAttended = subjects.reduce((sum, s) => sum + s.totalAttended, 0);
  const overallPct = totalHeld > 0 ? Number(((totalAttended / totalHeld) * 100).toFixed(1)) : 0;

  // Subjects below target
  const lowSubjects = subjects.filter((s) => s.percentage < targetPercentage);

  const handleReset = () => {
    onResetData();
    setResetFeedback(true);
    setTimeout(() => setResetFeedback(false), 3000);
  };

  return (
    <div id="account-tab" className="pb-28 pt-2 px-4 max-w-md mx-auto space-y-4 font-round">
      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-5 shadow-xs border border-slate-150/80 relative overflow-hidden"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xl shadow-xs border border-indigo-100">
              {user.name.charAt(0)}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-600 text-white p-1 rounded-full border-2 border-white shadow-2xs">
              <Check className="w-2.5 h-2.5" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 truncate">{user.name}</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate flex items-center gap-1.5 mt-0.5 font-medium">
              <Mail className="w-3 h-3 text-slate-400" />
              <span>{user.email}</span>
            </p>
            <p className="text-[11px] font-mono text-slate-600 mt-1 font-semibold">
              Sec: {user.section} • ID: {user.studentId}
            </p>
          </div>
        </div>

        {/* Google connected tag */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 flex items-center gap-2 font-medium">
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span>Google Authentication</span>
          </span>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Connected
          </span>
        </div>
      </motion.div>

      {/* GOOGLE CALENDAR & CLOUD INTEGRATIONS */}
      <div className="bg-white rounded-3xl p-4.5 shadow-xs border border-slate-150/80 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shadow-2xs">
              <Calendar className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Google Calendar Sync</h3>
              <p className="text-[10px] text-slate-400 font-medium">Automatic timetable reminders</p>
            </div>
          </div>
          {onOpenCalendarSync && (
            <button
              id="account-open-calendar-sync-btn"
              type="button"
              onClick={onOpenCalendarSync}
              className="py-1.5 px-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              Sync Schedule
            </button>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <Cloud className="w-4 h-4 text-indigo-600" />
            <div>
              <p className="text-[11px] font-bold text-slate-900">Firebase Firestore Ledger</p>
              <p className="text-[10px] font-mono text-slate-400">asia-south1 • secure cloud</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>{isCloudSynced ? 'Synced' : 'Connecting'}</span>
          </span>
        </div>
      </div>

      {/* ACADEMIC SUMMARY METRICS */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-3xl p-4.5 shadow-xs border border-slate-150/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500">Classes Attended</span>
            <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900">{totalAttended} <span className="text-xs font-mono font-normal text-slate-400">/ {totalHeld}</span></p>
          <p className="text-[11px] font-bold text-indigo-600 mt-1">{overallPct}% Cumulative</p>
        </div>

        <div className="bg-white rounded-3xl p-4.5 shadow-xs border border-slate-150/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500">Target Standing</span>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
              overallPct >= targetPercentage
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-amber-50 text-amber-600'
            }`}>
              <Target className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900">{overallPct >= targetPercentage ? 'On Track' : 'Needs Focus'}</p>
          <p className="text-[11px] font-medium text-slate-400 mt-1">Goal: {targetPercentage}% threshold</p>
        </div>
      </div>

      {/* LOW ATTENDANCE WARNINGS */}
      <div className="bg-white rounded-3xl p-4.5 shadow-xs border border-slate-150/80 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Attendance Health Status</span>
          </h3>
          <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
            Goal: {targetPercentage}%
          </span>
        </div>

        {lowSubjects.length === 0 ? (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 font-medium">
            <Award className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>All courses meet or exceed your {targetPercentage}% target threshold!</span>
          </div>
        ) : (
          <div className="space-y-2">
            {lowSubjects.map((sub) => {
              const needed = Math.max(1, Math.ceil((0.75 * sub.totalHeld - sub.totalAttended) / 0.25));
              return (
                <div
                  key={sub.id}
                  className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-900">{sub.name}</span>
                    <span className="font-mono font-bold text-rose-700">{sub.percentage}%</span>
                  </div>
                  <p className="text-rose-700 text-[11px]">
                    Below target: Attend next <strong className="font-bold">{needed} consecutive lectures</strong> to restore {targetPercentage}% standing.
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TARGET PERCENTAGE GOAL SETTING */}
      <div className="bg-white rounded-3xl p-4.5 shadow-xs border border-slate-150/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-600" />
            <span>Target Goal: {targetPercentage}%</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Baseline: 75%</span>
        </div>

        <div className="flex items-center gap-2">
          {[75, 80, 85, 90].map((val) => (
            <button
              key={val}
              id={`target-goal-${val}`}
              onClick={() => onUpdateTargetPercentage(val)}
              className={`flex-1 py-2 rounded-full text-xs font-mono font-bold border transition-all cursor-pointer ${
                targetPercentage === val
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {val}%
            </button>
          ))}
        </div>
      </div>

      {/* SYSTEM CONTROLS & RESET */}
      <div className="space-y-2 pt-1">
        <button
          id="reset-sample-data-btn"
          onClick={handleReset}
          className="w-full py-3 px-4 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>{resetFeedback ? '✓ Sample Data Restored' : 'Reset to Sample Attendance Records'}</span>
        </button>

        {/* LOGOUT BUTTON */}
        <button
          id="logout-button"
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full py-3 px-4 rounded-full bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-rose-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-600" />
          <span>Sign Out of Account</span>
        </button>
      </div>

      {/* Logout Confirmation Sheet */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-150/80 text-center font-round"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
              <LogOut className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Sign out of Attendance Ledger?</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Your attendance records are stored safely. You can sign back in with your Google account anytime.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="py-2.5 rounded-full border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-logout-btn"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                Yes, Sign Out
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
