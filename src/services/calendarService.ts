import { DayClassSession } from '../types/attendance';
import { getCachedAccessToken } from '../lib/firebase';

export interface CalendarEventItem {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
  location?: string;
}

export interface SyncCalendarResult {
  success: boolean;
  createdCount: number;
  errors: string[];
  events: CalendarEventItem[];
}

// Convert day string to next date timestamp
function getNextDayOfWeekDate(dayName: string): Date {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const targetDayIndex = days.indexOf(dayName.toLowerCase());
  const now = new Date();
  const currentDayIndex = now.getDay();

  let daysAhead = targetDayIndex - currentDayIndex;
  if (daysAhead < 0) {
    daysAhead += 7;
  }
  // If target is today, schedule for today
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + daysAhead);
  return targetDate;
}

// Parse "09:00 AM - 10:00 AM" into start and end Date objects on targetDate
function parseTimeInterval(timeStr: string, baseDate: Date): { start: Date; end: Date } | null {
  try {
    const parts = timeStr.split('-').map((s) => s.trim());
    if (parts.length !== 2) return null;

    const parsePart = (part: string): { hours: number; minutes: number } => {
      const match = part.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (!match) return { hours: 9, minutes: 0 };
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const meridiem = match[3]?.toUpperCase();

      if (meridiem === 'PM' && hours < 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;
      return { hours, minutes };
    };

    const startTime = parsePart(parts[0]);
    const endTime = parsePart(parts[1]);

    const start = new Date(baseDate);
    start.setHours(startTime.hours, startTime.minutes, 0, 0);

    const end = new Date(baseDate);
    end.setHours(endTime.hours, endTime.minutes, 0, 0);

    // If end time is before start time, handle edge cases
    if (end <= start) {
      end.setHours(start.getHours() + 1);
    }

    return { start, end };
  } catch {
    return null;
  }
}

// Fetch synced class events from user's primary calendar
export async function getUpcomingCalendarEvents(): Promise<CalendarEventItem[]> {
  const token = getCachedAccessToken();
  if (!token) {
    throw new Error('Please authenticate with Google to access your Google Calendar.');
  }

  const now = new Date();
  const timeMin = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(); // From yesterday
  const timeMax = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(); // Next 14 days

  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
    timeMin
  )}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime&maxResults=50`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Calendar API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const items: any[] = data.items || [];

  return items.map((item) => ({
    id: item.id,
    summary: item.summary,
    description: item.description,
    start: item.start,
    end: item.end,
    htmlLink: item.htmlLink,
    location: item.location,
  }));
}

// Sync class sessions to user's Google Calendar with weekly recurrence
export async function syncSessionsToGoogleCalendar(
  sessions: DayClassSession[],
  userSection: string,
  isRecurring: boolean = true
): Promise<SyncCalendarResult> {
  const token = getCachedAccessToken();
  if (!token) {
    throw new Error('Please authenticate with Google to access your Google Calendar.');
  }

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  const createdEvents: CalendarEventItem[] = [];
  const errors: string[] = [];

  for (const session of sessions) {
    const targetDate = getNextDayOfWeekDate(session.day);
    const parsedTimes = parseTimeInterval(session.time, targetDate);

    if (!parsedTimes) {
      errors.push(`Could not parse time format for "${session.subject}" (${session.time})`);
      continue;
    }

    const eventPayload: any = {
      summary: `[Class] ${session.subject}`,
      description: `Subject: ${session.subject}\nFaculty: ${session.faculty || 'N/A'}\nSection: ${userSection}\nDay: ${session.day}\nSynced from Student Attendance Tracker.`,
      start: {
        dateTime: parsedTimes.start.toISOString(),
        timeZone,
      },
      end: {
        dateTime: parsedTimes.end.toISOString(),
        timeZone,
      },
      colorId: '9', // Blueberry / soft purple color in Google Calendar
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 15 },
          { method: 'popup', minutes: 5 },
        ],
      },
      extendedProperties: {
        private: {
          app: 'AttendanceTracker',
          sessionId: session.id,
          day: session.day,
        },
      },
    };

    // If recurring weekly on this day
    if (isRecurring) {
      const dayCodeMap: Record<string, string> = {
        monday: 'MO',
        tuesday: 'TU',
        wednesday: 'WE',
        thursday: 'TH',
        friday: 'FR',
        saturday: 'SA',
        sunday: 'SU',
      };
      const dayCode = dayCodeMap[session.day.toLowerCase()] || 'FR';
      eventPayload.recurrence = [`RRULE:FREQ=WEEKLY;BYDAY=${dayCode}`];
    }

    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventPayload),
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        errors.push(`Failed to create event for ${session.subject}: ${errorMsg}`);
      } else {
        const createdData = await response.json();
        createdEvents.push({
          id: createdData.id,
          summary: createdData.summary,
          description: createdData.description,
          start: createdData.start,
          end: createdData.end,
          htmlLink: createdData.htmlLink,
          location: createdData.location,
        });
      }
    } catch (err: any) {
      errors.push(`Network error creating event for ${session.subject}: ${err.message}`);
    }
  }

  return {
    success: createdEvents.length > 0,
    createdCount: createdEvents.length,
    errors,
    events: createdEvents,
  };
}

// Delete an event from Google Calendar
export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  const token = getCachedAccessToken();
  if (!token) {
    throw new Error('Please authenticate with Google to access your Google Calendar.');
  }

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.ok || response.status === 404;
}
