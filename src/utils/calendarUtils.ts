export type DayName = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export const DAY_NAMES: DayName[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const MONTH_SHORT_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Check whether a given day is designated as a college day off
 * Options:
 * - 'sunday': Only Sunday is off (6-day week)
 * - 'saturday_sunday': Both Saturday & Sunday are off (5-day week)
 */
export function isWeeklyOffDay(dayName: string, pattern: string = 'sunday'): boolean {
  const norm = dayName.trim().toLowerCase();
  const patternNorm = (pattern || 'sunday').toLowerCase();
  if (patternNorm === 'saturday_sunday' || patternNorm === 'saturday-sunday') {
    return norm === 'sunday' || norm === 'saturday';
  }
  return norm === 'sunday';
}

export interface CalendarDayInfo {
  date: Date;
  dateNum: number;
  dayName: DayName;
  shortDay: string;
  monthName: string;
  monthShort: string;
  monthIndex: number;
  year: number;
  isoDate: string; // YYYY-MM-DD
  isToday: boolean;
  isSelected: boolean;
}

/**
 * Format a Date object to YYYY-MM-DD in local time
 */
export function formatIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Parse YYYY-MM-DD safely to local Date at midnight
 */
export function parseIsoDate(isoStr: string): Date {
  if (!isoStr) return new Date(2026, 8, 13); // Sep 13, 2026 fallback
  const parts = isoStr.split('-').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  const fallback = new Date(isoStr);
  return isNaN(fallback.getTime()) ? new Date(2026, 8, 13) : fallback;
}

/**
 * Get the Monday of the week containing the given date
 */
export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0 is Sunday, 1 is Monday...
  const diff = day === 0 ? -6 : 1 - day; // If Sunday, Monday was 6 days ago
  d.setDate(d.getDate() + diff);
  return d;
}

/**
 * Generate the 6 or 7 days of the week starting from the week's Monday
 */
export function getWeekDays(monday: Date, selectedDate: Date, todayDate: Date = new Date(2026, 8, 13)): CalendarDayInfo[] {
  const result: CalendarDayInfo[] = [];
  const selectedIso = formatIsoDate(selectedDate);
  const todayIso = formatIsoDate(todayDate);

  // Monday through Saturday (and Sunday)
  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const dayOfWeekIdx = cur.getDay();
    const dayName = DAY_NAMES[dayOfWeekIdx];
    const isoDate = formatIsoDate(cur);

    result.push({
      date: cur,
      dateNum: cur.getDate(),
      dayName,
      shortDay: dayName.slice(0, 3).toUpperCase(),
      monthName: MONTH_NAMES[cur.getMonth()],
      monthShort: MONTH_SHORT_NAMES[cur.getMonth()],
      monthIndex: cur.getMonth(),
      year: cur.getFullYear(),
      isoDate,
      isToday: isoDate === todayIso,
      isSelected: isoDate === selectedIso,
    });
  }

  return result;
}

/**
 * Generate monthly grid matrix for a given year and month (0-11)
 */
export interface MonthGridCell {
  date: Date;
  dateNum: number;
  isoDate: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  dayName: DayName;
}

export function getMonthGrid(year: number, month: number, selectedDate: Date, todayDate: Date = new Date(2026, 8, 13)): MonthGridCell[][] {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDays = lastDayOfMonth.getDate();

  // Find day of week for the 1st: 0=Sun, 1=Mon, ..., 6=Sat
  // In Monday-first calendar: Mon=0, Tue=1, ..., Sun=6
  const startDay = (firstDayOfMonth.getDay() + 6) % 7;

  const selectedIso = formatIsoDate(selectedDate);
  const todayIso = formatIsoDate(todayDate);

  const weeks: MonthGridCell[][] = [];
  let currentWeek: MonthGridCell[] = [];

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const d = new Date(year, month - 1, dayNum);
    const iso = formatIsoDate(d);
    currentWeek.push({
      date: d,
      dateNum: dayNum,
      isoDate: iso,
      isCurrentMonth: false,
      isToday: iso === todayIso,
      isSelected: iso === selectedIso,
      dayName: DAY_NAMES[d.getDay()],
    });
  }

  // Current month days
  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, month, day);
    const iso = formatIsoDate(d);
    currentWeek.push({
      date: d,
      dateNum: day,
      isoDate: iso,
      isCurrentMonth: true,
      isToday: iso === todayIso,
      isSelected: iso === selectedIso,
      dayName: DAY_NAMES[d.getDay()],
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Next month leading days to complete the last row
  if (currentWeek.length > 0) {
    let nextDay = 1;
    while (currentWeek.length < 7) {
      const d = new Date(year, month + 1, nextDay);
      const iso = formatIsoDate(d);
      currentWeek.push({
        date: d,
        dateNum: nextDay,
        isoDate: iso,
        isCurrentMonth: false,
        isToday: iso === todayIso,
        isSelected: iso === selectedIso,
        dayName: DAY_NAMES[d.getDay()],
      });
      nextDay++;
    }
    weeks.push(currentWeek);
  }

  return weeks;
}
