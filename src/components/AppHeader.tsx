import React from 'react';
import { AlertCircle, Upload, GraduationCap } from 'lucide-react';
import { UserProfile } from '../types/attendance';

interface AppHeaderProps {
  user: UserProfile;
  currentSection: string;
  isUsingLastWeekFallback: boolean;
  onGoToUpload: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  currentSection,
  isUsingLastWeekFallback,
  onGoToUpload,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md px-4 py-3 border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        {/* Section Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200/80 text-xs font-semibold shadow-2xs">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
            <span>Section {currentSection}</span>
          </div>

          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            {user.name.split(' ')[0]}
          </span>
        </div>

        {/* Right side: User Profile Avatar */}
        <div className="flex items-center gap-2">
          <div
            title={user.name}
            className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs ring-2 ring-slate-200/70 shrink-0"
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Fallback Banner if using last week's data */}
      {isUsingLastWeekFallback && (
        <div
          id="fallback-warning-badge"
          className="mt-2.5 py-1.5 px-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/60 text-amber-900 text-xs flex items-center justify-between gap-2 shadow-2xs font-round"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span className="truncate text-[11px] font-medium">
              Showing previous week&apos;s schedule
            </span>
          </div>
          <button
            id="fallback-upload-cta"
            onClick={onGoToUpload}
            className="text-[10px] font-round font-bold uppercase tracking-wider text-slate-900 hover:text-black bg-white px-2.5 py-0.5 rounded-full border border-amber-200 shadow-2xs flex items-center gap-1 flex-shrink-0 cursor-pointer transition-all hover:bg-amber-50/50"
          >
            <Upload className="w-3 h-3" />
            <span>Update</span>
          </button>
        </div>
      )}
    </header>
  );
};

