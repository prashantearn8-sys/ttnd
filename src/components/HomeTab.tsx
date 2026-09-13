import React, { useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  Calendar,
  Clock,
  Sparkles,
  ChevronRight,
  Target,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SubjectAttendance, DayClassSession, UserProfile } from '../types/attendance';

interface HomeTabProps {
  user: UserProfile;
  subjects: SubjectAttendance[];
  schedule: DayClassSession[];
  targetPercentage?: number;
  isUsingLastWeekFallback: boolean;
  activeDay?: string;
  onNavigateToTab: (tab: 'home' | 'day' | 'upload' | 'account') => void;
  onUpdateSubject?: (updatedSubject: SubjectAttendance) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  user,
  subjects,
  schedule,
  targetPercentage = 75,
  isUsingLastWeekFallback,
  activeDay = 'Friday',
  onNavigateToTab,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectAttendance | null>(null);

  // Overall attendance calculation
  const totalHeld = subjects.reduce((sum, s) => sum + s.totalHeld, 0);
  const totalAttended = subjects.reduce((sum, s) => sum + s.totalAttended, 0);
  const overallPercentage = totalHeld > 0 ? Number(((totalAttended / totalHeld) * 100).toFixed(1)) : 0;
  const isOverallSafe = overallPercentage >= targetPercentage;

  // Subjects below target percentage
  const lowAttendanceSubjects = subjects.filter((s) => s.percentage < targetPercentage);

  // Today's classes count for active schedule day
  const currentDayName = activeDay || 'Friday';
  const todayClasses = schedule.filter((s) => s.day.toLowerCase() === currentDayName.toLowerCase());

  // Calculate safety margin across overall attendance
  // How many classes can be safely missed without dropping below targetPercentage
  const targetFraction = targetPercentage / 100;
  const safeSkipCount =
    overallPercentage >= targetPercentage && targetFraction < 1
      ? Math.max(0, Math.floor((totalAttended - targetFraction * totalHeld) / targetFraction))
      : 0;
  const neededOverall =
    overallPercentage < targetPercentage && targetFraction < 1
      ? Math.max(1, Math.ceil((targetFraction * totalHeld - totalAttended) / (1 - targetFraction)))
      : 0;

  return (
    <div id="home-tab" className="pb-24 pt-2 px-4 max-w-md mx-auto space-y-3.5">
      {/* Overview Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.03)] border border-slate-200/80 relative overflow-hidden"
      >
        {/* Header with Title and Semester Badge (single-line, non-wrapping) */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight truncate">
              Hello, {user.name.split(' ')[0]}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Attendance Target: {targetPercentage}% minimum
            </p>
          </div>
          <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-slate-700 bg-slate-100/90 px-3 py-1 rounded-full border border-slate-200/80 shadow-2xs">
            Semester 6
          </span>
        </div>

        {/* Attendance Gauge & Metrics (Flattened depth - No nested cards!) */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-5">
          {/* Circular Progress Gauge */}
          <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke="#F1F5F9"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke={isOverallSafe ? '#10B981' : '#F43F5E'}
                strokeWidth="7"
                strokeDasharray={2 * Math.PI * 38}
                strokeDashoffset={2 * Math.PI * 38 * (1 - Math.min(100, overallPercentage) / 100)}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-lg font-bold text-slate-900 leading-none">
                {overallPercentage}%
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mt-1">
                Overall
              </span>
            </div>
          </div>

          {/* Metric Columns (Separated by subtle border divider, no card boxes) */}
          <div className="flex-1 grid grid-cols-2 gap-3 pl-1 border-l border-slate-100">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Attended</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">
                {totalAttended} <span className="text-xs font-normal text-slate-400">/ {totalHeld}</span>
              </p>
              <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-600 font-medium">
                <CheckCircle className="w-3 h-3 shrink-0" />
                <span className="truncate">Recorded</span>
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                {isOverallSafe ? 'Safety Margin' : 'Status'}
              </p>
              <p className="text-base font-bold text-slate-900 mt-0.5">
                {isOverallSafe ? (
                  <span className="text-emerald-600">+{safeSkipCount} <span className="text-xs font-normal text-slate-500">can miss</span></span>
                ) : (
                  <span className="text-rose-600">+{neededOverall} <span className="text-xs font-normal text-slate-500">needed</span></span>
                )}
              </p>
              <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500 font-medium">
                <Target className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{isOverallSafe ? 'Above 75%' : 'Below 75%'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Low Attendance Warning Strip (Integrated row instead of nested card) */}
        {lowAttendanceSubjects.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <p className="text-slate-700 truncate">
                <span className="font-semibold text-rose-700">{lowAttendanceSubjects[0].name}</span> is at{' '}
                <span className="font-semibold text-rose-700">{lowAttendanceSubjects[0].percentage}%</span>
                {lowAttendanceSubjects.length > 1 && ` (+${lowAttendanceSubjects.length - 1} more)`}
              </p>
            </div>
            <button
              onClick={() => setSelectedSubject(lowAttendanceSubjects[0])}
              className="text-indigo-600 hover:text-indigo-700 font-semibold text-[11px] shrink-0 underline underline-offset-2 cursor-pointer"
            >
              Review
            </button>
          </div>
        )}
      </motion.div>

      {/* QUICK JUMP TO TODAY'S CLASSES (Light, harmonious card instead of harsh dark void) */}
      <div className="bg-gradient-to-r from-indigo-50/70 via-slate-50/60 to-white rounded-2xl p-4 border border-indigo-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-indigo-900/70 truncate">{currentDayName}&apos;s Schedule</p>
            <p className="text-sm font-bold text-slate-900 truncate">
              {todayClasses.length} {todayClasses.length === 1 ? 'Class' : 'Classes'} Scheduled
            </p>
          </div>
        </div>
        <button
          id="home-view-day-btn"
          onClick={() => onNavigateToTab('day')}
          className="px-3.5 py-1.5 rounded-full bg-slate-900 text-white font-semibold text-xs shadow-xs hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <span>View Day</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* SUBJECT PROGRESS LIST */}
      <div id="subject-progress-section" className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Registered Subjects</h2>
            <p className="text-xs text-slate-500">Track quota progress per course</p>
          </div>
          <span className="text-[11px] font-semibold text-slate-600 bg-white px-3 py-0.5 rounded-full border border-slate-200/80 shadow-2xs">
            {subjects.length} Subjects
          </span>
        </div>

        <div className="space-y-2.5">
          {subjects.map((subject, idx) => {
            const isSafe = subject.percentage >= targetPercentage;
            const subjectFraction = targetPercentage / 100;
            const canMiss = isSafe && subjectFraction < 1
              ? Math.max(0, Math.floor((subject.totalAttended - subjectFraction * subject.totalHeld) / subjectFraction))
              : 0;
            const needed = !isSafe
              ? Math.max(1, Math.ceil((subjectFraction * subject.totalHeld - subject.totalAttended) / (1 - subjectFraction)))
              : 0;

            return (
              <motion.div
                key={subject.id}
                id={`subject-card-${subject.code.toLowerCase()}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.025 }}
                onClick={() => setSelectedSubject(subject)}
                className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-200/70 hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all cursor-pointer group"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider text-white shadow-2xs shrink-0"
                        style={{ backgroundColor: subject.color || '#334155' }}
                      >
                        {subject.code}
                      </span>
                      <span className="text-xs text-slate-500 truncate">{subject.faculty}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-1.5 group-hover:text-indigo-600 transition-colors truncate">
                      {subject.name}
                    </h3>
                  </div>

                  {/* Percentage Chip */}
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-2xs ${
                        isSafe
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {subject.percentage}%
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      {subject.totalAttended}/{subject.totalHeld}
                    </p>
                  </div>
                </div>

                {/* Progress Bar Container with Target Threshold Marker */}
                <div className="mt-3">
                  <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, subject.percentage)}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: isSafe ? (subject.color || '#10B981') : '#F43F5E',
                      }}
                    />
                    {/* Subtle goal line marker at 75% target */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-slate-400/80 z-10 pointer-events-none"
                      style={{ left: `${targetPercentage}%` }}
                      title={`Target ${targetPercentage}%`}
                    />
                  </div>

                  {/* Progress meta row */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: isSafe ? '#10B981' : '#F43F5E' }}
                      />
                      {isSafe ? (
                        <span className="text-slate-600">
                          {canMiss > 0 ? `Can miss ${canMiss} ${canMiss === 1 ? 'class' : 'classes'}` : 'On threshold'}
                        </span>
                      ) : (
                        <span className="text-rose-600 font-semibold">Attend next {needed} classes</span>
                      )}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">Min: {targetPercentage}%</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Subject Detail Drawer Modal */}
      <AnimatePresence>
        {selectedSubject && (
          <div
            id="subject-detail-modal"
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setSelectedSubject(null)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto"
            >
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />
              
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <span
                    className="text-[10px] font-round font-bold px-2.5 py-0.5 rounded-full text-white shadow-2xs"
                    style={{ backgroundColor: selectedSubject.color }}
                  >
                    {selectedSubject.code}
                  </span>
                  <h3 className="text-lg font-round font-bold text-slate-900 mt-2">
                    {selectedSubject.name}
                  </h3>
                  <p className="text-xs font-round text-slate-500">Instructor: {selectedSubject.faculty}</p>
                </div>
                <button
                  onClick={() => setSelectedSubject(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-semibold cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Attendance metrics in modal */}
              <div className="grid grid-cols-3 gap-2 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 mb-4 text-center">
                <div>
                  <p className="text-[10px] font-round uppercase font-bold text-slate-400">Total Held</p>
                  <p className="text-base font-round font-bold text-slate-900">{selectedSubject.totalHeld}</p>
                </div>
                <div>
                  <p className="text-[10px] font-round uppercase font-bold text-slate-400">Attended</p>
                  <p className="text-base font-round font-bold text-emerald-600">{selectedSubject.totalAttended}</p>
                </div>
                <div>
                  <p className="text-[10px] font-round uppercase font-bold text-slate-400">Percentage</p>
                  <p className="text-base font-round font-bold text-slate-900">{selectedSubject.percentage}%</p>
                </div>
              </div>

              <div className="space-y-2 mb-5">
                <p className="text-xs font-round font-bold text-slate-900">Scheduled Sessions</p>
                {schedule
                  .filter((s) => s.subject === selectedSubject.name)
                  .map((session) => (
                    <div
                      key={session.id}
                      className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-round font-bold text-slate-900">{session.day}</span>
                        <span className="font-mono text-[11px] text-slate-500">{session.time}</span>
                      </div>
                      {session.faculty && (
                        <span className="text-[10px] font-round text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-slate-200/70 shadow-2xs">
                          {session.faculty}
                        </span>
                      )}
                    </div>
                  ))}
              </div>

              <button
                onClick={() => setSelectedSubject(null)}
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-round font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
