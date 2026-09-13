import React from 'react';
import { Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface SplashViewProps {
  onContinue: () => void;
  appName?: string;
}

export const SplashView: React.FC<SplashViewProps> = ({ onContinue, appName = 'Attendance Tracker' }) => {
  return (
    <div
      id="splash-screen"
      className="min-h-screen w-full flex flex-col items-center justify-between p-6 bg-[#F8F9FC] text-slate-900 relative"
    >
      {/* Top minimal aesthetic tag */}
      <div className="pt-8 flex items-center justify-center">
        <span className="px-4 py-1.5 rounded-full text-xs font-round font-semibold bg-indigo-50/90 text-indigo-700 border border-indigo-150/70 shadow-2xs">
          Student Attendance &amp; Timetable
        </span>
      </div>

      {/* Center Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center text-center max-w-sm"
      >
        {/* Aesthetic Soft Icon */}
        <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 text-white flex items-center justify-center shadow-lg shadow-indigo-950/15 mb-6 ring-4 ring-white">
          <Calendar className="w-9 h-9 stroke-[1.75] text-indigo-200" />
        </div>

        {/* Clean Rounded Title */}
        <h1 className="text-3xl font-round font-bold tracking-tight text-slate-900 mb-2">
          {appName}
        </h1>
        <p className="text-sm font-round text-slate-500 leading-relaxed max-w-xs">
          Track subject attendance thresholds, manage daily lectures, and sync schedules to Google Calendar.
        </p>

        {/* Aesthetic Feature Highlights */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <span className="text-xs font-round font-semibold px-3.5 py-1.5 rounded-full bg-white text-slate-700 border border-slate-200/80 shadow-2xs">
            75% Quota Tracking
          </span>
          <span className="text-xs font-round font-semibold px-3.5 py-1.5 rounded-full bg-white text-slate-700 border border-slate-200/80 shadow-2xs">
            Google Calendar Sync
          </span>
          <span className="text-xs font-round font-semibold px-3.5 py-1.5 rounded-full bg-white text-slate-700 border border-slate-200/80 shadow-2xs">
            Image Scanner
          </span>
        </div>
      </motion.div>

      {/* Bottom CTA Action */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="w-full max-w-sm pb-8"
      >
        <button
          id="splash-get-started-btn"
          onClick={onContinue}
          className="w-full py-4 px-6 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-round font-bold text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-center text-xs font-round text-slate-400 mt-3">
          Sign in with Google or continue with demo
        </p>
      </motion.div>
    </div>
  );
};

