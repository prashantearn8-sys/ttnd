import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import {
  DayName,
  MONTH_NAMES,
  getMonthGrid,
  parseIsoDate,
  formatIsoDate,
  isWeeklyOffDay,
} from '../utils/calendarUtils';
import { DayClassSession, ExtractedScheduleDate, WeeklyOffPattern } from '../types/attendance';

interface CalendarMonthPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIsoDate: string;
  onSelectDate: (isoDate: string, dayName: DayName) => void;
  schedule: DayClassSession[];
  extractedDateInfo?: ExtractedScheduleDate | null;
  todayIsoDate?: string;
  weeklyOffPattern?: WeeklyOffPattern;
}

export const CalendarMonthPickerModal: React.FC<CalendarMonthPickerModalProps> = ({
  isOpen,
  onClose,
  selectedIsoDate,
  onSelectDate,
  schedule,
  extractedDateInfo,
  todayIsoDate = '2026-09-13',
  weeklyOffPattern = 'sunday',
}) => {
  const initialDate = parseIsoDate(selectedIsoDate || todayIsoDate);
  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth());

  const selectedDateObj = parseIsoDate(selectedIsoDate || todayIsoDate);
  const todayDateObj = parseIsoDate(todayIsoDate);

  const monthGrid = getMonthGrid(viewYear, viewMonth, selectedDateObj, todayDateObj);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const today = parseIsoDate(todayIsoDate);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    const dayNames: DayName[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    onSelectDate(todayIsoDate, dayNames[today.getDay()]);
    onClose();
  };

  const handleJumpToScheduleDate = () => {
    if (!extractedDateInfo?.isoDate) return;
    const sDate = parseIsoDate(extractedDateInfo.isoDate);
    setViewYear(sDate.getFullYear());
    setViewMonth(sDate.getMonth());
    const dayNames: DayName[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    onSelectDate(extractedDateInfo.isoDate, dayNames[sDate.getDay()]);
    onClose();
  };

  // Count scheduled classes for a weekday name
  const getClassCountForDay = (dayName: DayName): number => {
    return schedule.filter((s) => s.day.toLowerCase() === dayName.toLowerCase()).length;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          className="bg-white rounded-3xl p-5 w-full max-w-sm relative z-10 shadow-2xl border border-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-round font-bold text-slate-900">Academic Calendar</h3>
                <p className="text-[11px] font-round text-slate-500">Pick any date to view schedule</p>
              </div>
            </div>
            <button
              onClick={onClose}
              id="close-calendar-modal-btn"
              className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Month & Year Navigator */}
          <div className="flex items-center justify-between my-3 px-1">
            <button
              id="prev-month-btn"
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-round font-bold text-sm text-slate-900">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              id="next-month-btn"
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers (Monday first) */}
          <div className="grid grid-cols-7 text-center text-[10px] font-mono font-semibold text-slate-400 mb-1">
            <span>MO</span>
            <span>TU</span>
            <span>WE</span>
            <span>TH</span>
            <span>FR</span>
            <span className={weeklyOffPattern === 'saturday_sunday' ? 'text-rose-400 font-bold' : ''}>SA</span>
            <span className="text-rose-400 font-bold">SU</span>
          </div>

          {/* Monthly Day Grid */}
          <div className="space-y-1">
            {monthGrid.map((week, wIdx) => (
              <div key={wIdx} className="grid grid-cols-7 gap-1">
                {week.map((cell, cIdx) => {
                  const classCount = getClassCountForDay(cell.dayName);
                  const isOffDay = isWeeklyOffDay(cell.dayName, weeklyOffPattern);

                  return (
                    <button
                      key={cIdx}
                      id={`calendar-cell-${cell.isoDate}`}
                      onClick={() => {
                        onSelectDate(cell.isoDate, cell.dayName);
                        onClose();
                      }}
                      className={`h-9 w-full rounded-xl flex flex-col items-center justify-center text-xs transition-all relative cursor-pointer ${
                        cell.isSelected
                          ? 'bg-slate-900 text-white font-bold shadow-xs'
                          : cell.isToday
                          ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                          : cell.isCurrentMonth
                          ? isOffDay
                            ? 'text-rose-500 hover:bg-rose-50 font-medium'
                            : 'text-slate-700 hover:bg-slate-100 font-medium'
                          : 'text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="leading-none text-[11px]">{cell.dateNum}</span>
                      {/* Dot indicators */}
                      {classCount > 0 && !cell.isSelected && cell.isCurrentMonth && (
                        <span className="w-1 h-1 rounded-full bg-indigo-500 mt-0.5" />
                      )}
                      {cell.isSelected && (
                        <span className="w-1 h-1 rounded-full bg-amber-300 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* AI detected date notice if present */}
          {extractedDateInfo?.isoDate && (
            <div className="mt-3 p-2.5 rounded-2xl bg-indigo-50/70 border border-indigo-100/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-slate-500 block">From Uploaded Timetable:</span>
                  <span className="font-mono font-bold text-slate-900 text-[11px]">
                    {extractedDateInfo.extractedDateText || extractedDateInfo.isoDate}
                  </span>
                </div>
              </div>
              <button
                id="jump-to-timetable-date-btn"
                onClick={handleJumpToScheduleDate}
                className="py-1 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-round font-bold flex-shrink-0 cursor-pointer"
              >
                Jump
              </button>
            </div>
          )}

          {/* Quick jump actions */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              id="calendar-jump-today-btn"
              onClick={handleJumpToToday}
              className="py-1.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-round font-bold transition-colors cursor-pointer"
            >
              Today (Sep 13)
            </button>
            <button
              id="calendar-dismiss-btn"
              onClick={onClose}
              className="py-1.5 px-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-round font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
