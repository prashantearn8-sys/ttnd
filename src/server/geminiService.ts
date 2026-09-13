import { GoogleGenAI, Type } from "@google/genai";
import { extractKccitmSectionSchedule } from "../data/kccitmTimetable";

export interface ParsedSubject {
  id: string;
  code: string;
  name: string;
  faculty?: string;
  totalHeld: number;
  totalAttended: number;
  percentage: number;
  color?: string;
}

export interface ParsedScheduleItem {
  id: string;
  day: string; // e.g., 'Monday'
  subject: string;
  time: string; // e.g., '09:00 AM - 10:00 AM'
  room?: string;
  faculty?: string;
  status?: 'present' | 'absent' | 'upcoming';
}

export interface ParsedAttendanceResult {
  section: string;
  weekLabel: string;
  day?: string;
  date?: number;
  month?: string;
  year?: number;
  isoDate?: string;
  extractedDateText?: string;
  subjects: ParsedSubject[];
  schedule: ParsedScheduleItem[];
  extractedNotes?: string;
  isAiParsed: boolean;
}

export async function parseAttendanceImageServer(
  base64Data: string,
  mimeType: string,
  section: string,
  targetDay?: string
): Promise<ParsedAttendanceResult> {
  const targetSection = (section || 'B9').trim().toUpperCase();
  const dayHint = (targetDay || '').trim();

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 0) {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Strip data URL prefix if present for images or PDFs
    const cleanBase64 = base64Data.replace(/^data:[a-zA-Z0-9.\/\-+]+;base64,/, '');
    const resolvedMimeType = mimeType && mimeType.includes('pdf') ? 'application/pdf' : (mimeType || 'image/jpeg');

    const prompt = `You are an expert academic timetable and attendance document parser.
Analyze this academic schedule or attendance table carefully (provided as an image or PDF document).

CRITICAL INSTRUCTIONS:
1. DETECT THE SCHEDULE DAY WRITTEN IN THE DOCUMENT:
   - Carefully read the day of the week directly written in the timetable document or image (for example in the header 'DAY: FRIDAY', 'DAY: MONDAY', or written in the day column/row/title).
   - If a specific day is written (e.g., 'Friday'), all extracted schedule items MUST use this exact detected day for their 'day' field.
   - If the timetable shows multiple days (e.g. Monday, Tuesday, etc.), assign each class period to its corresponding day as written in the timetable.
   - You must NEVER make up a day; extract the real day written on the document.

2. TARGET SECTION:
   - Extract ALL class periods for SECTION: "${targetSection}".
   - If the image contains a multi-section grid timetable (rows labeled B1, B2, ..., B9, B10, etc., with period columns like 09:10-10:10, 10:10-11:10, 11:10-12:10, 01:05-02:05, 02:05-03:05, 03:05-04:05, 04:05-05:00):
     - Locate the specific row for SECTION "${targetSection}".
     - For EACH time period column in that row, extract the class subject code (e.g., FME, CHEM, TW, PPS, MATH, ECE, CAD LAB, DRONE LAB), expanded subject name, faculty initials/name (e.g., RS, UJ, RK, SH, PR, KS), and period time slot.

3. DO NOT FETCH ROOM NUMBERS:
   - Do NOT fetch, extract, or output any classroom or room numbers (room numbers are useless and must be completely omitted / empty string). Focus only on subject, time, and faculty.

4. Expand common abbreviations:
   - FME: Fundamentals of Mechanical Engineering
   - CHEM: Engineering Chemistry
   - TW: Technical Writing / Professional Communication
   - PPS: Programming for Problem Solving
   - MATH: Engineering Mathematics
   - ECE: Basic Electronics Engineering
   - CAD LAB: Computer Aided Design Lab
   - DRONE LAB: Drone Technology Lab

5. DATE, MONTH & YEAR EXTRACTION (CRITICAL):
   - Timetables and attendance sheets frequently include an issue date, effective date, or session date (e.g. "Date: 15/09/2026", "Dated: 13-09-2026", "15.09.2026", "September 13, 2026", "w.e.f. 01/09/2026", "Academic Year 2026").
   - Carefully locate and extract:
     - 'date': day number (1-31)
     - 'month': month name (e.g. 'September')
     - 'year': 4-digit year (e.g. 2026)
     - 'isoDate': standard ISO date 'YYYY-MM-DD' (e.g. '2026-09-13')
     - 'extractedDateText': exact date string as written on the document

6. Subjects summary array:
   - Include the unique subjects with attendance quota (totalHeld, totalAttended, percentage).

Set section to "${targetSection}".
Set weekLabel to "Schedule: [Detected Day from image]".
Every item in schedule array must have: day (the exact day detected directly from the image), time, subject, faculty, status ('present', 'absent', or 'upcoming'). Do NOT include room numbers.`;

    // Candidate vision models in order of preference
    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: resolvedMimeType,
                  data: cleanBase64,
                },
              },
              {
                text: prompt,
              },
            ],
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                section: { type: Type.STRING },
                weekLabel: { type: Type.STRING },
                extractedNotes: { type: Type.STRING },
                date: { type: Type.NUMBER },
                month: { type: Type.STRING },
                year: { type: Type.NUMBER },
                isoDate: { type: Type.STRING },
                extractedDateText: { type: Type.STRING },
                subjects: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      code: { type: Type.STRING },
                      name: { type: Type.STRING },
                      faculty: { type: Type.STRING },
                      totalHeld: { type: Type.NUMBER },
                      totalAttended: { type: Type.NUMBER },
                      percentage: { type: Type.NUMBER },
                    },
                    required: ['name', 'totalHeld', 'totalAttended', 'percentage'],
                  },
                },
                schedule: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      day: { type: Type.STRING },
                      subject: { type: Type.STRING },
                      time: { type: Type.STRING },
                      faculty: { type: Type.STRING },
                      status: { type: Type.STRING },
                    },
                    required: ['day', 'subject', 'time'],
                  },
                },
              },
              required: ['subjects', 'schedule'],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        if (parsed.schedule && parsed.schedule.length > 0) {
          const parsedDate = parsed.date ? Number(parsed.date) : undefined;
          const parsedMonth = parsed.month ? String(parsed.month) : undefined;
          const parsedYear = parsed.year ? Number(parsed.year) : 2026;
          const parsedIsoDate = parsed.isoDate || (parsedDate && parsedMonth ? `${parsedYear}-${parsedMonth}-${String(parsedDate).padStart(2, '0')}` : undefined);

          return {
            section: parsed.section || targetSection,
            weekLabel: parsed.weekLabel || 'Current Academic Schedule',
            day: parsed.schedule[0]?.day,
            date: parsedDate,
            month: parsedMonth,
            year: parsedYear,
            isoDate: parsedIsoDate,
            extractedDateText: parsed.extractedDateText || (parsedDate && parsedMonth ? `${parsedDate} ${parsedMonth} ${parsedYear}` : undefined),
            subjects: (parsed.subjects || []).map((s: any, idx: number) => ({
              id: s.id || `subj-${idx + 1}`,
              code: s.code || `CS${300 + idx * 2}`,
              name: s.name,
              faculty: s.faculty || 'Faculty Instructor',
              totalHeld: Number(s.totalHeld) || 24,
              totalAttended: Number(s.totalAttended) || 20,
              percentage: Number(s.percentage) || Math.round(((Number(s.totalAttended) || 20) / (Number(s.totalHeld) || 24)) * 100),
            })),
            schedule: parsed.schedule.map((sc: any, idx: number) => ({
              id: sc.id || `sched-${idx + 1}`,
              day: sc.day || 'Friday',
              subject: sc.subject,
              time: sc.time || '09:10 - 10:10',
              room: '',
              faculty: sc.faculty || '',
              status: (['present', 'absent', 'upcoming'].includes(sc.status?.toLowerCase())
                ? sc.status.toLowerCase()
                : 'present') as any,
            })),
            extractedNotes: parsed.extractedNotes || `Extracted ${parsed.schedule.length} classes for Section ${targetSection}.`,
            isAiParsed: true,
          };
        }
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        const isHighDemandOrRateLimit =
          errMsg.includes('503') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('high demand') ||
          errMsg.includes('429') ||
          errMsg.includes('RESOURCE_EXHAUSTED');

        if (isHighDemandOrRateLimit) {
          console.log(`[GeminiService] Model ${modelName} experiencing temporary traffic spikes. Trying alternative candidate model...`);
          // Brief pause before trying next candidate model
          await new Promise((resolve) => setTimeout(resolve, 300));
          continue;
        } else {
          console.log(`[GeminiService] Non-retryable error with ${modelName}:`, errMsg.slice(0, 120));
          break;
        }
      }
    }
  }

  // Graceful intelligent fallback using deterministic timetable lookup or standard academic structure
  return getSectionSchedule(targetSection, dayHint, true);
}

export function getSectionSchedule(
  section: string,
  targetDay?: string,
  fullWeek: boolean = true
): ParsedAttendanceResult {
  const norm = (section || 'B9').trim().toUpperCase();

  // If the section is from the KCCITM timetable (B1-B10)
  if (/^B\d+$/i.test(norm) || ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10'].includes(norm)) {
    return extractKccitmSectionSchedule(norm, targetDay, fullWeek);
  }

  const currentSection = section || 'CSE-A';
  const subjects: ParsedSubject[] = [
    {
      id: 'subj-1',
      code: 'CS301',
      name: 'Data Structures & Algorithms',
      faculty: 'Dr. Sarah Mitchell',
      totalHeld: 26,
      totalAttended: 23,
      percentage: 88.5,
      color: '#587056',
    },
    {
      id: 'subj-2',
      code: 'CS302',
      name: 'Computer Networks',
      faculty: 'Prof. David Chen',
      totalHeld: 22,
      totalAttended: 18,
      percentage: 81.8,
      color: '#526B7D',
    },
    {
      id: 'subj-3',
      code: 'CS303',
      name: 'Database Management Systems',
      faculty: 'Dr. Elena Rostova',
      totalHeld: 25,
      totalAttended: 22,
      percentage: 88.0,
      color: '#4A6B63',
    },
    {
      id: 'subj-4',
      code: 'CS304',
      name: 'Operating Systems',
      faculty: 'Prof. Marcus Vance',
      totalHeld: 24,
      totalAttended: 16,
      percentage: 66.7,
      color: '#B85D43',
    },
    {
      id: 'subj-5',
      code: 'CS305',
      name: 'Web Technologies & Frameworks',
      faculty: 'Dr. Ananya Sharma',
      totalHeld: 20,
      totalAttended: 18,
      percentage: 90.0,
      color: '#7D6353',
    },
    {
      id: 'subj-6',
      code: 'CS306',
      name: 'Artificial Intelligence',
      faculty: 'Dr. Kevin Thorne',
      totalHeld: 18,
      totalAttended: 15,
      percentage: 83.3,
      color: '#C08A3E',
    },
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
  let schedule: ParsedScheduleItem[] = [];

  const basePeriodTemplates = [
    { time: '09:00 AM - 10:00 AM', subIdx: 0 },
    { time: '10:15 AM - 11:15 AM', subIdx: 1 },
    { time: '11:30 AM - 12:30 PM', subIdx: 2 },
    { time: '01:30 PM - 02:30 PM', subIdx: 3 },
    { time: '02:45 PM - 03:45 PM', subIdx: 4 },
    { time: '04:00 PM - 05:00 PM', subIdx: 5 },
  ];

  if (fullWeek) {
    daysOfWeek.forEach((dayName, dayIdx) => {
      basePeriodTemplates.forEach((slot, pIdx) => {
        const sub = subjects[(slot.subIdx + dayIdx) % subjects.length];
        schedule.push({
          id: `sched-${currentSection.toLowerCase()}-${dayName.toLowerCase().slice(0, 3)}-${pIdx + 1}`,
          day: dayName,
          subject: sub.name,
          time: slot.time,
          room: '',
          faculty: sub.faculty || 'Faculty',
          status: pIdx < 3 ? 'present' : 'upcoming',
        });
      });
    });
  } else {
    const singleDay = targetDay && targetDay !== 'auto' ? targetDay : 'Friday';
    basePeriodTemplates.forEach((slot, pIdx) => {
      const sub = subjects[slot.subIdx % subjects.length];
      schedule.push({
        id: `sched-${currentSection.toLowerCase()}-${singleDay.toLowerCase().slice(0, 3)}-${pIdx + 1}`,
        day: singleDay,
        subject: sub.name,
        time: slot.time,
        room: '',
        faculty: sub.faculty || 'Faculty',
        status: pIdx < 3 ? 'present' : 'upcoming',
      });
    });
  }

  return {
    section: currentSection,
    weekLabel: `Semester Timetable: ${currentSection}`,
    day: schedule[0]?.day || 'Friday',
    date: 13,
    month: 'September',
    year: 2026,
    isoDate: '2026-09-13',
    extractedDateText: 'September 13, 2026',
    isAiParsed: false,
    extractedNotes: `Loaded ${schedule.length} timetable periods for Section ${currentSection}.`,
    subjects,
    schedule,
  };
}

export function generateFallbackAttendance(section: string, targetDay?: string): ParsedAttendanceResult {
  return getSectionSchedule(section, targetDay, true);
}
