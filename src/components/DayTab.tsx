import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DayClassSession, AttendanceStatus, SubjectAttendance } from '../types/attendance';

interface DayTabProps {
  schedule: DayClassSession[];
  subjects: SubjectAttendance[];
  onUpdateSessionStatus: (sessionId: string, newStatus: AttendanceStatus) => void;
  activeDay?: string;
  onSelectDay?: (day: DayName) => void;
  onOpenCalendarSync?: () => void;
}

export type DayName = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

const DAYS: { name: DayName; short: string; dateNum: number }[] = [
  { name: 'Monday', short: 'Mon', dateNum: 7 },
  { name: 'Tuesday', short: 'Tue', dateNum: 8 },
  { name: 'Wednesday', short: 'Wed', dateNum: 9 },
  { name: 'Thursday', short: 'Thu', dateNum: 10 },
  { name: 'Friday', short: 'Fri', dateNum: 11 },
  { name: 'Saturday', short: 'Sat', dateNum: 12 },
];

export const DayTab: React.FC<DayTabProps> = ({
  schedule,
  subjects,
  onUpdateSessionStatus,
  activeDay,
  onSelectDay,
  onOpenCalendarSync,
}) => {
  const [internalDay, setInternalDay] = useState<DayName>(
    (DAYS.some((d) => d.name.toLowerCase() === activeDay?.toLowerCase())
      ? (DAYS.find((d) => d.name.toLowerCase() === activeDay?.toLowerCase())?.name as DayName)
      : 'Friday')
  );

  const selectedDay = (
    DAYS.some((d) => d.name.toLowerCase() === activeDay?.toLowerCase())
      ? (DAYS.find((d) => d.name.toLowerCase() === activeDay?.toLowerCase())?.name as DayName)
      : internalDay
  );

  const handleSelectDay = (day: DayName) => {
    setInternalDay(day);
    if (onSelectDay) onSelectDay(day);
  };

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  // Filter classes for the selected day
  const dayClasses = schedule.filter((s) => s.day === selectedDay);

  // Class statistics for the selected day
  const totalClassesToday = dayClasses.length;
  const attendedClasses = dayClasses.filter((s) => s.status === 'present').length;
  const upcomingClasses = dayClasses.filter((s) => s.status === 'upcoming').length;
  const absentClasses = dayClasses.filter((s) => s.status === 'absent').length;

  const getSubjectColor = (subjectName: string) => {
    const sub = subjects.find((s) => s.name === subjectName);
    return sub?.color || '#8B5CF6';
  };

  const getStatusChip = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return {
          label: 'Present',
          className: 'bg-emerald-50/90 text-emerald-700 border-emerald-200/70',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
        };
      case 'absent':
        return {
          label: 'Absent',
          className: 'bg-rose-50/90 text-rose-700 border-rose-200/70',
          icon: <XCircle className="w-3.5 h-3.5 text-rose-600" />,
        };
      case 'upcoming':
      default:
        return {
          label: 'Upcoming',
          className: 'bg-slate-100/80 text-slate-600 border-slate-200/60',
          icon: <Clock className="w-3.5 h-3.5 text-slate-400" />,
        };
    }
  };

  return (
    <div id="day-tab" className="pb-24 pt-2 px-4 max-w-md mx-auto space-y-4">
      {/* HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5.5 shadow-[0_8px_30px_rgba(15,23,42,0.12)] relative overflow-hidden"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-round font-bold uppercase tracking-wider text-indigo-200 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-2xs">
              Day Schedule
            </span>
            <h1 className="text-xl font-round font-bold tracking-tight mt-2 text-white">
              {totalClassesToday} {totalClassesToday === 1 ? 'Class' : 'Classes'} Scheduled
            </h1>
            <p className="text-xs font-round text-slate-300 mt-0.5">
              {selectedDay}: {attendedClasses} Attended • {upcomingClasses} Pending
            </p>
          </div>

          <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center flex-shrink-0 shadow-2xs">
            <Calendar className="w-5 h-5 text-indigo-200" />
          </div>
        </div>

        {/* Quick status bar */}
        <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between text-xs font-round">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-200">{attendedClasses} Attended</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-slate-200">{upcomingClasses} Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-slate-200">{absentClasses} Absent</span>
          </div>
        </div>
      </motion.div>

      {/* DAY SWITCHER PILLS (Mon - Sat) */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-150/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] flex items-center justify-between gap-1 overflow-x-auto">
        {DAYS.map((d) => {
          const isSelected = selectedDay === d.name;
          const count = schedule.filter((s) => s.day === d.name).length;

          return (
            <button
              key={d.name}
              id={`day-selector-${d.short.toLowerCase()}`}
              onClick={() => handleSelectDay(d.name)}
              className={`flex-1 min-w-[48px] py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white font-round font-bold shadow-xs'
                  : 'text-slate-500 hover:bg-slate-50 font-round font-medium'
              }`}
            >
              <p className="text-[10px] leading-tight uppercase font-bold">{d.short}</p>
              <p className="text-xs font-bold mt-0.5">{d.dateNum}</p>
              <span
                className={`text-[9px] px-2 py-0.2 rounded-full mt-0.5 inline-block font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* GOOGLE CALENDAR QUICK SYNC ACTION */}
      {onOpenCalendarSync && (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.03)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-round font-bold text-slate-900 truncate">Google Calendar Sync</p>
              <p className="text-[11px] font-round text-slate-500 truncate">
                Sync {selectedDay}&apos;s {dayClasses.length} sessions to your calendar
              </p>
            </div>
          </div>
          <button
            id="open-calendar-sync-from-day"
            type="button"
            onClick={onOpenCalendarSync}
            className="py-2 px-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-round font-bold transition-all shadow-xs flex-shrink-0 cursor-pointer"
          >
            Sync Day
          </button>
        </div>
      )}

      {/* TODAY'S CLASSES LIST */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-round font-bold text-slate-900 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>{selectedDay}&apos;s Schedule</span>
          </h2>
          <span className="text-[11px] font-round text-slate-400">
            Tap status to record
          </span>
        </div>

        {dayClasses.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-150/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
            <Sparkles className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
            <p className="text-sm font-round font-bold text-slate-900">No classes scheduled for {selectedDay}</p>
            <p className="text-xs font-round text-slate-400 mt-0.5">Free day for revision or self-study.</p>
          </div>
        ) : (
          dayClasses.map((item, index) => {
            const subjectColor = getSubjectColor(item.subject);
            const statusChip = getStatusChip(item.status);

            return (
              <motion.div
                key={item.id}
                id={`class-session-${item.id}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(15,23,42,0.03)] border border-slate-100 hover:border-slate-200/90 transition-all relative overflow-hidden"
              >
                {/* Left accent color bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5 rounded-r"
                  style={{ backgroundColor: subjectColor }}
                />

                <div className="pl-1.5">
                  {/* Top row: Time + Status Chip */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.time}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-round font-bold border shadow-2xs ${statusChip.className}`}
                      >
                        {statusChip.icon}
                        <span>{statusChip.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Subject Name & Faculty */}
                  <div className="mb-2">
                    <h3 className="text-sm font-round font-bold text-slate-900 leading-snug">
                      {item.subject}
                    </h3>
                    {item.faculty && (
                      <div className="flex items-center gap-2 text-xs font-round text-slate-500 mt-0.5">
                        <span>{item.faculty}</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Attendance Mark Actions */}
                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-round uppercase font-bold tracking-wider">Record Attendance:</span>
                    <div className="flex items-center gap-2">
                      <button
                        id={`mark-present-${item.id}`}
                        onClick={() => onUpdateSessionStatus(item.id, 'present')}
                        className={`px-3 py-1 rounded-full text-xs font-round font-bold border transition-all cursor-pointer shadow-2xs ${
                          item.status === 'present'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        ✓ Present
                      </button>

                      <button
                        id={`mark-absent-${item.id}`}
                        onClick={() => onUpdateSessionStatus(item.id, 'absent')}
                        className={`px-3 py-1 rounded-full text-xs font-round font-bold border transition-all cursor-pointer shadow-2xs ${
                          item.status === 'absent'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        ✕ Absent
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
