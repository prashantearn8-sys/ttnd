import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
  CalendarDays,
  Coffee,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DayClassSession,
  AttendanceStatus,
  SubjectAttendance,
  ExtractedScheduleDate,
  WeeklyOffPattern,
} from '../types/attendance';
import {
  DayName,
  DAY_NAMES,
  MONTH_NAMES,
  MONTH_SHORT_NAMES,
  parseIsoDate,
  formatIsoDate,
  getMondayOfWeek,
  getWeekDays,
  isWeeklyOffDay,
} from '../utils/calendarUtils';
import { CalendarMonthPickerModal } from './CalendarMonthPickerModal';

export { type DayName };

interface DayTabProps {
  schedule: DayClassSession[];
  subjects: SubjectAttendance[];
  onUpdateSessionStatus: (sessionId: string, newStatus: AttendanceStatus) => void;
  activeDay?: string;
  onSelectDay?: (day: DayName) => void;
  onOpenCalendarSync?: () => void;
  currentSection?: string;
  onFetchSchedule?: (section?: string, day?: string) => Promise<void>;
  isFetchingSchedule?: boolean;
  selectedCalendarDate?: string;
  onSelectCalendarDate?: (isoDate: string, dayName: DayName) => void;
  extractedDateInfo?: ExtractedScheduleDate | null;
  weeklyOffPattern?: WeeklyOffPattern;
}

export const DayTab: React.FC<DayTabProps> = ({
  schedule,
  subjects,
  onUpdateSessionStatus,
  activeDay,
  onSelectDay,
  onOpenCalendarSync,
  currentSection,
  onFetchSchedule,
  isFetchingSchedule,
  selectedCalendarDate,
  onSelectCalendarDate,
  extractedDateInfo,
  weeklyOffPattern = 'sunday',
}) => {
  const TODAY_ISO = '2026-09-13';

  // Selected calendar date (ISO string YYYY-MM-DD)
  const [selectedIsoDate, setSelectedIsoDate] = useState<string>(() => {
    return selectedCalendarDate || extractedDateInfo?.isoDate || TODAY_ISO;
  });

  // Base Monday for the week view
  const [weekBaseDate, setWeekBaseDate] = useState<Date>(() => {
    const initDate = parseIsoDate(selectedCalendarDate || extractedDateInfo?.isoDate || TODAY_ISO);
    return getMondayOfWeek(initDate);
  });

  // Full Month Calendar Picker Modal state
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  // Sync state when props change
  useEffect(() => {
    if (selectedCalendarDate && selectedCalendarDate !== selectedIsoDate) {
      setSelectedIsoDate(selectedCalendarDate);
      const parsed = parseIsoDate(selectedCalendarDate);
      setWeekBaseDate(getMondayOfWeek(parsed));
    }
  }, [selectedCalendarDate]);

  // Selected date object
  const selectedDateObj = parseIsoDate(selectedIsoDate);

  // Days in current week (Monday through Sunday)
  const weekDays = getWeekDays(weekBaseDate, selectedDateObj, parseIsoDate(TODAY_ISO));

  // Week header label (e.g. "September 2026" or "Sep - Oct 2026")
  const startMonthName = MONTH_SHORT_NAMES[weekDays[0].monthIndex];
  const endMonthName = MONTH_SHORT_NAMES[weekDays[weekDays.length - 1].monthIndex];
  const weekYear = weekDays[0].year;
  const weekHeaderTitle =
    startMonthName === endMonthName
      ? `${MONTH_NAMES[weekDays[0].monthIndex]} ${weekYear}`
      : `${startMonthName} - ${endMonthName} ${weekYear}`;

  // Current day of week for timetable filtering
  const currentDayName = weekDays.find((d) => d.isoDate === selectedIsoDate)?.dayName || (activeDay as DayName) || 'Friday';

  const [internalDay, setInternalDay] = useState<DayName>(currentDayName);

  const selectedDay: DayName = activeDay && DAY_NAMES.includes(activeDay as DayName)
    ? (activeDay as DayName)
    : internalDay;

  const handleSelectDay = (day: DayName) => {
    setInternalDay(day);
    if (onSelectDay) onSelectDay(day);
  };

  const handleSelectDate = (isoDate: string, dayName: DayName) => {
    setSelectedIsoDate(isoDate);
    const dateObj = parseIsoDate(isoDate);
    setWeekBaseDate(getMondayOfWeek(dateObj));
    handleSelectDay(dayName);
    if (onSelectCalendarDate) {
      onSelectCalendarDate(isoDate, dayName);
    }
  };

  // Week shift navigation handlers (-7 days and +7 days)
  const handlePrevWeek = () => {
    setWeekBaseDate((prev) => {
      const nextMonday = new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 7);
      return nextMonday;
    });
  };

  const handleNextWeek = () => {
    setWeekBaseDate((prev) => {
      const nextMonday = new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 7);
      return nextMonday;
    });
  };

  const handleJumpToToday = () => {
    const todayObj = parseIsoDate(TODAY_ISO);
    setWeekBaseDate(getMondayOfWeek(todayObj));
    setSelectedIsoDate(TODAY_ISO);
    const dayName = DAY_NAMES[todayObj.getDay()];
    handleSelectDay(dayName);
    if (onSelectCalendarDate) {
      onSelectCalendarDate(TODAY_ISO, dayName);
    }
  };

  // Filter classes for the selected day of week
  const dayClasses = schedule.filter((s) => s.day.toLowerCase() === selectedDay.toLowerCase());

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
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-round font-bold uppercase tracking-wider text-indigo-200 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-2xs">
                Day Schedule
              </span>
              <span className="text-[10px] font-mono text-indigo-200/90 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
                {selectedIsoDate}
              </span>
            </div>
            <h1 className="text-xl font-round font-bold tracking-tight mt-2 text-white">
              {totalClassesToday} {totalClassesToday === 1 ? 'Class' : 'Classes'} Scheduled
            </h1>
            <p className="text-xs font-round text-slate-300 mt-0.5">
              {selectedDay}: {attendedClasses} Attended • {upcomingClasses} Pending
            </p>
          </div>

          {/* Interactive calendar icon button in hero card */}
          <button
            id="open-hero-calendar-btn"
            onClick={() => setIsMonthPickerOpen(true)}
            className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md flex items-center justify-center flex-shrink-0 shadow-2xs transition-all cursor-pointer group"
            title="Open Interactive Calendar Picker"
          >
            <Calendar className="w-5 h-5 text-indigo-200 group-hover:scale-110 transition-transform" />
          </button>
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

      {/* AI EXTRACTED SCHEDULE DATE BANNER (if timetable had date stamped) */}
      {extractedDateInfo && (extractedDateInfo.extractedDateText || extractedDateInfo.isoDate) && (
        <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <div className="min-w-0 truncate">
              <span className="text-[10px] font-round text-slate-500 block">AI Detected Timetable Date:</span>
              <span className="text-xs font-mono font-bold text-indigo-900 truncate block">
                {extractedDateInfo.extractedDateText || extractedDateInfo.isoDate}
              </span>
            </div>
          </div>
          {extractedDateInfo.isoDate && extractedDateInfo.isoDate !== selectedIsoDate && (
            <button
              onClick={() => {
                if (extractedDateInfo.isoDate) {
                  const sObj = parseIsoDate(extractedDateInfo.isoDate);
                  handleSelectDate(extractedDateInfo.isoDate, DAY_NAMES[sObj.getDay()]);
                }
              }}
              className="py-1 px-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-round font-bold flex-shrink-0 transition-colors cursor-pointer"
            >
              View Date
            </button>
          )}
        </div>
      )}

      {/* INTERACTIVE CALENDAR WEEK NAVIGATION & DATE STRIP */}
      <div className="bg-white rounded-3xl p-3.5 border border-slate-150/80 shadow-[0_2px_16px_rgba(15,23,42,0.03)] space-y-2.5">
        {/* Week bar header: Month/Year navigation + Calendar modal trigger */}
        <div className="flex items-center justify-between px-1">
          <button
            id="open-calendar-modal-header-btn"
            onClick={() => setIsMonthPickerOpen(true)}
            className="flex items-center gap-1.5 text-xs font-round font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer group"
            title="Click to open Month Calendar"
          >
            <CalendarDays className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
            <span>{weekHeaderTitle}</span>
            <span className="text-[10px] font-round font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              Pick Date
            </span>
          </button>

          {/* Previous week, Today, Next week buttons */}
          <div className="flex items-center gap-1">
            <button
              id="prev-week-nav-btn"
              onClick={handlePrevWeek}
              className="w-7 h-7 rounded-xl hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              title="Previous Week (Dates before)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              id="jump-today-nav-btn"
              onClick={handleJumpToToday}
              className={`px-2 py-1 rounded-lg text-[10px] font-round font-bold transition-all cursor-pointer ${
                selectedIsoDate === TODAY_ISO
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              Today
            </button>

            <button
              id="next-week-nav-btn"
              onClick={handleNextWeek}
              className="w-7 h-7 rounded-xl hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              title="Next Week (Dates after)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* DYNAMIC DATE STRIP (Monday through Sunday) */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-0.5">
          {weekDays.map((d) => {
            const isSelected = d.isoDate === selectedIsoDate;
            const count = schedule.filter((s) => s.day.toLowerCase() === d.dayName.toLowerCase()).length;
            const isOffDay = isWeeklyOffDay(d.dayName, weeklyOffPattern);

            return (
              <button
                key={d.isoDate}
                id={`date-pill-${d.isoDate}`}
                onClick={() => handleSelectDate(d.isoDate, d.dayName)}
                className={`flex-1 min-w-[42px] py-2 px-1 rounded-2xl text-center transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-slate-900 text-white font-round font-bold shadow-sm'
                    : d.isToday
                    ? 'bg-indigo-50/90 text-indigo-900 font-round font-bold border border-indigo-200/80 hover:bg-indigo-100/80'
                    : 'text-slate-600 hover:bg-slate-50 font-round font-medium'
                }`}
              >
                {/* Day abbreviation */}
                <p
                  className={`text-[9px] leading-tight uppercase font-bold ${
                    isSelected ? 'text-slate-300' : isOffDay ? 'text-rose-500' : 'text-slate-400'
                  }`}
                >
                  {d.shortDay}
                </p>

                {/* Day number (1 - 31) */}
                <p className="text-xs font-bold mt-0.5 leading-tight">{d.dateNum}</p>

                {/* Period Count or Day Off badge */}
                <span
                  className={`text-[8px] px-1.5 py-0.2 rounded-full mt-1 inline-block font-mono leading-tight ${
                    isSelected
                      ? 'bg-white/20 text-white font-bold'
                      : isOffDay
                      ? 'bg-rose-50 text-rose-600 font-semibold'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isOffDay ? 'Off' : count}
                </span>

                {/* Today indicator dot */}
                {d.isToday && !isSelected && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-600" />
                )}
              </button>
            );
          })}
        </div>
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
            <span className="text-[10px] font-mono text-slate-400">({selectedIsoDate})</span>
          </h2>
          {onFetchSchedule && (
            <button
              id="day-tab-sync-schedule-btn"
              onClick={() => onFetchSchedule(currentSection, selectedDay)}
              disabled={isFetchingSchedule}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-indigo-50 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              title="Sync or reload timetable for this section"
            >
              <RefreshCw className={`w-3 h-3 ${isFetchingSchedule ? 'animate-spin' : ''}`} />
              <span>{isFetchingSchedule ? 'Fetching...' : 'Sync Timetable'}</span>
            </button>
          )}
        </div>

        {dayClasses.length === 0 ? (
          <div className="bg-white rounded-2xl p-7 text-center border border-slate-150/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-3">
            {isWeeklyOffDay(selectedDay, weeklyOffPattern) ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
                  <Coffee className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-round font-bold text-slate-900">
                    {selectedDay} - College Day Off (No Classes)
                  </p>
                  <p className="text-xs font-round text-slate-500 mt-1 max-w-xs mx-auto">
                    {weeklyOffPattern === 'saturday_sunday'
                      ? `Your college is set to Saturday & Sunday off. Enjoy your weekend holiday or catch up on study goals!`
                      : `Your college is set to Sunday off. Enjoy your weekend holiday!`}
                  </p>
                </div>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 text-indigo-400 mx-auto" />
                <div>
                  <p className="text-sm font-round font-bold text-slate-900">
                    No classes loaded for {selectedDay}
                  </p>
                  <p className="text-xs font-round text-slate-400 mt-0.5">
                    Section {currentSection || 'B9'} timetable has not been loaded for {selectedDay}.
                  </p>
                </div>
                {onFetchSchedule && (
                  <button
                    type="button"
                    id="fetch-day-schedule-btn"
                    disabled={isFetchingSchedule}
                    onClick={() => onFetchSchedule(currentSection, selectedDay)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFetchingSchedule ? 'animate-spin' : ''}`} />
                    <span>Fetch Schedule for Section {currentSection || 'B9'}</span>
                  </button>
                )}
              </>
            )}
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

      {/* Full Month Calendar Picker Modal */}
      <CalendarMonthPickerModal
        isOpen={isMonthPickerOpen}
        onClose={() => setIsMonthPickerOpen(false)}
        selectedIsoDate={selectedIsoDate}
        onSelectDate={handleSelectDate}
        schedule={schedule}
        extractedDateInfo={extractedDateInfo}
        todayIsoDate={TODAY_ISO}
        weeklyOffPattern={weeklyOffPattern}
      />
    </div>
  );
};
