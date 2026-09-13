import { AppAttendanceState, UserProfile } from '../types/attendance';

export const INITIAL_USER: UserProfile = {
  id: 'usr-nishant',
  name: 'Nishant Kumar',
  email: 'nishant19987@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  role: 'student',
  section: 'CSE-A',
  studentId: '22CSE048',
};

export const INITIAL_ATTENDANCE_STATE: AppAttendanceState = {
  currentSection: 'CSE-A',
  isUsingLastWeekFallback: true, // Show fallback badge initially until user uploads
  lastUploadedDate: '2026-09-05',
  weeklyOffPattern: 'sunday',
  weekLabel: 'Week of Sep 8 - Sep 14',
  targetPercentage: 75,
  subjects: [
    {
      id: 'sub-1',
      code: 'CS301',
      name: 'Data Structures & Algorithms',
      faculty: 'Dr. Sarah Mitchell',
      totalHeld: 26,
      totalAttended: 23,
      percentage: 88.5,
      color: '#587056', // Vintage Botanical Sage
    },
    {
      id: 'sub-2',
      code: 'CS302',
      name: 'Computer Networks',
      faculty: 'Prof. David Chen',
      totalHeld: 22,
      totalAttended: 18,
      percentage: 81.8,
      color: '#526B7D', // Dusty Slate Blue
    },
    {
      id: 'sub-3',
      code: 'CS303',
      name: 'Database Management Systems',
      faculty: 'Dr. Elena Rostova',
      totalHeld: 25,
      totalAttended: 22,
      percentage: 88.0,
      color: '#4A6B63', // Muted Cedar
    },
    {
      id: 'sub-4',
      code: 'CS304',
      name: 'Operating Systems',
      faculty: 'Prof. Marcus Vance',
      totalHeld: 24,
      totalAttended: 16,
      percentage: 66.7, // Below 75% -> triggers low attendance warning
      color: '#B85D43', // Vintage Terracotta
    },
    {
      id: 'sub-5',
      code: 'CS305',
      name: 'Web Technologies & Frameworks',
      faculty: 'Dr. Ananya Sharma',
      totalHeld: 20,
      totalAttended: 18,
      percentage: 90.0,
      color: '#7D6353', // Warm Sepia
    },
    {
      id: 'sub-6',
      code: 'CS306',
      name: 'Artificial Intelligence',
      faculty: 'Dr. Kevin Thorne',
      totalHeld: 18,
      totalAttended: 15,
      percentage: 83.3,
      color: '#C08A3E', // Antique Ochre
    },
  ],
  schedule: [
    // Monday
    {
      id: 'sch-mon-1',
      day: 'Monday',
      subject: 'Data Structures & Algorithms',
      subjectCode: 'CS301',
      time: '09:00 AM - 10:00 AM',
      room: 'Hall 304',
      faculty: 'Dr. Sarah Mitchell',
      status: 'present',
    },
    {
      id: 'sch-mon-2',
      day: 'Monday',
      subject: 'Database Management Systems',
      subjectCode: 'CS303',
      time: '10:15 AM - 11:15 AM',
      room: 'Lab 2B',
      faculty: 'Dr. Elena Rostova',
      status: 'present',
    },
    {
      id: 'sch-mon-3',
      day: 'Monday',
      subject: 'Computer Networks',
      subjectCode: 'CS302',
      time: '01:30 PM - 02:30 PM',
      room: 'Hall 108',
      faculty: 'Prof. David Chen',
      status: 'present',
    },
    {
      id: 'sch-mon-4',
      day: 'Monday',
      subject: 'Operating Systems',
      subjectCode: 'CS304',
      time: '02:45 PM - 03:45 PM',
      room: 'Turing Lab',
      faculty: 'Prof. Marcus Vance',
      status: 'absent',
    },

    // Tuesday
    {
      id: 'sch-tue-1',
      day: 'Tuesday',
      subject: 'Operating Systems',
      subjectCode: 'CS304',
      time: '09:00 AM - 10:00 AM',
      room: 'Turing Lab',
      faculty: 'Prof. Marcus Vance',
      status: 'present',
    },
    {
      id: 'sch-tue-2',
      day: 'Tuesday',
      subject: 'Web Technologies & Frameworks',
      subjectCode: 'CS305',
      time: '10:15 AM - 11:15 AM',
      room: 'Room 205',
      faculty: 'Dr. Ananya Sharma',
      status: 'present',
    },
    {
      id: 'sch-tue-3',
      day: 'Tuesday',
      subject: 'Artificial Intelligence',
      subjectCode: 'CS306',
      time: '01:30 PM - 02:30 PM',
      room: 'Hall 304',
      faculty: 'Dr. Kevin Thorne',
      status: 'present',
    },

    // Wednesday
    {
      id: 'sch-wed-1',
      day: 'Wednesday',
      subject: 'Data Structures & Algorithms',
      subjectCode: 'CS301',
      time: '09:00 AM - 10:00 AM',
      room: 'Hall 304',
      faculty: 'Dr. Sarah Mitchell',
      status: 'present',
    },
    {
      id: 'sch-wed-2',
      day: 'Wednesday',
      subject: 'Computer Networks',
      subjectCode: 'CS302',
      time: '10:15 AM - 11:15 AM',
      room: 'Hall 108',
      faculty: 'Prof. David Chen',
      status: 'present',
    },
    {
      id: 'sch-wed-3',
      day: 'Wednesday',
      subject: 'Database Management Systems',
      subjectCode: 'CS303',
      time: '01:30 PM - 03:30 PM',
      room: 'Lab 2B',
      faculty: 'Dr. Elena Rostova',
      status: 'present',
    },

    // Thursday
    {
      id: 'sch-thu-1',
      day: 'Thursday',
      subject: 'Web Technologies & Frameworks',
      subjectCode: 'CS305',
      time: '09:00 AM - 11:00 AM',
      room: 'Software Lab 1',
      faculty: 'Dr. Ananya Sharma',
      status: 'present',
    },
    {
      id: 'sch-thu-2',
      day: 'Thursday',
      subject: 'Operating Systems',
      subjectCode: 'CS304',
      time: '11:15 AM - 12:15 PM',
      room: 'Turing Lab',
      faculty: 'Prof. Marcus Vance',
      status: 'absent',
    },
    {
      id: 'sch-thu-3',
      day: 'Thursday',
      subject: 'Artificial Intelligence',
      subjectCode: 'CS306',
      time: '02:00 PM - 03:00 PM',
      room: 'Hall 304',
      faculty: 'Dr. Kevin Thorne',
      status: 'present',
    },

    // Friday
    {
      id: 'sch-fri-1',
      day: 'Friday',
      subject: 'Data Structures & Algorithms',
      subjectCode: 'CS301',
      time: '09:00 AM - 10:00 AM',
      room: 'Hall 304',
      faculty: 'Dr. Sarah Mitchell',
      status: 'present',
    },
    {
      id: 'sch-fri-2',
      day: 'Friday',
      subject: 'Computer Networks',
      subjectCode: 'CS302',
      time: '10:15 AM - 11:15 AM',
      room: 'Hall 108',
      faculty: 'Prof. David Chen',
      status: 'present',
    },
    {
      id: 'sch-fri-3',
      day: 'Friday',
      subject: 'Database Management Systems',
      subjectCode: 'CS303',
      time: '01:30 PM - 02:30 PM',
      room: 'Lab 2B',
      faculty: 'Dr. Elena Rostova',
      status: 'upcoming',
    },
    {
      id: 'sch-fri-4',
      day: 'Friday',
      subject: 'Artificial Intelligence',
      subjectCode: 'CS306',
      time: '02:45 PM - 03:45 PM',
      room: 'Hall 304',
      faculty: 'Dr. Kevin Thorne',
      status: 'upcoming',
    },

    // Saturday
    {
      id: 'sch-sat-1',
      day: 'Saturday',
      subject: 'Data Structures Practical Lab',
      subjectCode: 'CS301',
      time: '09:00 AM - 11:00 AM',
      room: 'Lab 4A',
      faculty: 'Dr. Sarah Mitchell',
      status: 'upcoming',
    },
    {
      id: 'sch-sat-2',
      day: 'Saturday',
      subject: 'Operating Systems Hands-on',
      subjectCode: 'CS304',
      time: '11:15 AM - 01:15 PM',
      room: 'Turing Lab',
      faculty: 'Prof. Marcus Vance',
      status: 'upcoming',
    },
  ],
  history: [
    {
      id: 'hist-1',
      date: '2026-09-11',
      day: 'Friday',
      subjectName: 'Data Structures & Algorithms',
      subjectCode: 'CS301',
      status: 'present',
      time: '09:00 AM',
    },
    {
      id: 'hist-2',
      date: '2026-09-11',
      day: 'Friday',
      subjectName: 'Computer Networks',
      subjectCode: 'CS302',
      status: 'present',
      time: '10:15 AM',
    },
    {
      id: 'hist-3',
      date: '2026-09-10',
      day: 'Thursday',
      subjectName: 'Operating Systems',
      subjectCode: 'CS304',
      status: 'absent',
      time: '11:15 AM',
    },
    {
      id: 'hist-4',
      date: '2026-09-09',
      day: 'Wednesday',
      subjectName: 'Database Management Systems',
      subjectCode: 'CS303',
      status: 'present',
      time: '01:30 PM',
    },
  ],
};

export const AVAILABLE_SECTIONS = [
  'B9',
  'B1',
  'B2',
  'B3',
  'B4',
  'B5',
  'B6',
  'B7',
  'B8',
  'B10',
  'CSE-A',
  'CSE-B',
  'IT-Section 1',
  'ECE-Batch A',
];

// Generates an educational sample attendance sheet as an SVG data URL for instant 1-click testing
export function createSampleAttendanceSheetImage(section: string = 'CSE-A'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
    <defs>
      <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#8B5CF6" />
        <stop offset="100%" stop-color="#6366F1" />
      </linearGradient>
    </defs>
    <rect width="900" height="600" fill="#FFFFFF" rx="16"/>
    <!-- Header Banner -->
    <rect width="900" height="90" fill="url(#grad)" rx="16"/>
    <text x="35" y="42" fill="#FFFFFF" font-family="sans-serif" font-size="22" font-weight="bold">DEPARTMENT OF COMPUTER SCIENCE &amp; ENGINEERING</text>
    <text x="35" y="68" fill="#EDE9FE" font-family="sans-serif" font-size="14">Official Weekly Attendance Summary Register • SECTION: ${section} • Academic Term 2026</text>

    <!-- Table Header -->
    <rect x="30" y="115" width="840" height="42" fill="#F3F0FF" rx="8"/>
    <text x="50" y="141" fill="#6B21A8" font-family="sans-serif" font-size="13" font-weight="bold">COURSE CODE</text>
    <text x="170" y="141" fill="#6B21A8" font-family="sans-serif" font-size="13" font-weight="bold">SUBJECT TITLE</text>
    <text x="460" y="141" fill="#6B21A8" font-family="sans-serif" font-size="13" font-weight="bold">FACULTY</text>
    <text x="630" y="141" fill="#6B21A8" font-family="sans-serif" font-size="13" font-weight="bold">HELD</text>
    <text x="700" y="141" fill="#6B21A8" font-family="sans-serif" font-size="13" font-weight="bold">ATTENDED</text>
    <text x="790" y="141" fill="#6B21A8" font-family="sans-serif" font-size="13" font-weight="bold">STATUS %</text>

    <!-- Row 1 -->
    <line x1="30" y1="205" x2="870" y2="205" stroke="#F1F1F5"/>
    <text x="50" y="185" fill="#333" font-family="sans-serif" font-size="13" font-weight="600">CS301</text>
    <text x="170" y="185" fill="#1F2937" font-family="sans-serif" font-size="13">Data Structures &amp; Algorithms</text>
    <text x="460" y="185" fill="#4B5563" font-family="sans-serif" font-size="13">Dr. Sarah Mitchell</text>
    <text x="640" y="185" fill="#333" font-family="sans-serif" font-size="13">28</text>
    <text x="715" y="185" fill="#333" font-family="sans-serif" font-size="13">25</text>
    <text x="800" y="185" fill="#059669" font-family="sans-serif" font-size="13" font-weight="bold">89.3%</text>

    <!-- Row 2 -->
    <line x1="30" y1="255" x2="870" y2="255" stroke="#F1F1F5"/>
    <text x="50" y="235" fill="#333" font-family="sans-serif" font-size="13" font-weight="600">CS302</text>
    <text x="170" y="235" fill="#1F2937" font-family="sans-serif" font-size="13">Computer Networks</text>
    <text x="460" y="235" fill="#4B5563" font-family="sans-serif" font-size="13">Prof. David Chen</text>
    <text x="640" y="235" fill="#333" font-family="sans-serif" font-size="13">24</text>
    <text x="715" y="235" fill="#333" font-family="sans-serif" font-size="13">20</text>
    <text x="800" y="235" fill="#059669" font-family="sans-serif" font-size="13" font-weight="bold">83.3%</text>

    <!-- Row 3 -->
    <line x1="30" y1="305" x2="870" y2="305" stroke="#F1F1F5"/>
    <text x="50" y="285" fill="#333" font-family="sans-serif" font-size="13" font-weight="600">CS303</text>
    <text x="170" y="285" fill="#1F2937" font-family="sans-serif" font-size="13">Database Management Systems</text>
    <text x="460" y="285" fill="#4B5563" font-family="sans-serif" font-size="13">Dr. Elena Rostova</text>
    <text x="640" y="285" fill="#333" font-family="sans-serif" font-size="13">26</text>
    <text x="715" y="285" fill="#333" font-family="sans-serif" font-size="13">23</text>
    <text x="800" y="285" fill="#059669" font-family="sans-serif" font-size="13" font-weight="bold">88.5%</text>

    <!-- Row 4 (Operating systems - low) -->
    <line x1="30" y1="355" x2="870" y2="355" stroke="#F1F1F5"/>
    <text x="50" y="335" fill="#333" font-family="sans-serif" font-size="13" font-weight="600">CS304</text>
    <text x="170" y="335" fill="#1F2937" font-family="sans-serif" font-size="13">Operating Systems</text>
    <text x="460" y="335" fill="#4B5563" font-family="sans-serif" font-size="13">Prof. Marcus Vance</text>
    <text x="640" y="335" fill="#333" font-family="sans-serif" font-size="13">25</text>
    <text x="715" y="335" fill="#333" font-family="sans-serif" font-size="13">17</text>
    <text x="800" y="335" fill="#E11D48" font-family="sans-serif" font-size="13" font-weight="bold">68.0% ⚠️</text>

    <!-- Row 5 -->
    <line x1="30" y1="405" x2="870" y2="405" stroke="#F1F1F5"/>
    <text x="50" y="385" fill="#333" font-family="sans-serif" font-size="13" font-weight="600">CS305</text>
    <text x="170" y="385" fill="#1F2937" font-family="sans-serif" font-size="13">Web Technologies &amp; Frameworks</text>
    <text x="460" y="385" fill="#4B5563" font-family="sans-serif" font-size="13">Dr. Ananya Sharma</text>
    <text x="640" y="385" fill="#333" font-family="sans-serif" font-size="13">22</text>
    <text x="715" y="385" fill="#333" font-family="sans-serif" font-size="13">20</text>
    <text x="800" y="385" fill="#059669" font-family="sans-serif" font-size="13" font-weight="bold">90.9%</text>

    <!-- Row 6 -->
    <line x1="30" y1="455" x2="870" y2="455" stroke="#F1F1F5"/>
    <text x="50" y="435" fill="#333" font-family="sans-serif" font-size="13" font-weight="600">CS306</text>
    <text x="170" y="435" fill="#1F2937" font-family="sans-serif" font-size="13">Artificial Intelligence</text>
    <text x="460" y="435" fill="#4B5563" font-family="sans-serif" font-size="13">Dr. Kevin Thorne</text>
    <text x="640" y="435" fill="#333" font-family="sans-serif" font-size="13">20</text>
    <text x="715" y="435" fill="#333" font-family="sans-serif" font-size="13">17</text>
    <text x="800" y="435" fill="#059669" font-family="sans-serif" font-size="13" font-weight="bold">85.0%</text>

    <!-- Footer Summary Box -->
    <rect x="30" y="480" width="840" height="85" fill="#FAF5FF" rx="10" stroke="#E9D5FF"/>
    <text x="50" y="515" fill="#581C87" font-family="sans-serif" font-size="14" font-weight="bold">ACADEMIC SUMMARY:</text>
    <text x="210" y="515" fill="#6B21A8" font-family="sans-serif" font-size="14">Total Lectures Conducted: 145  |  Total Classes Attended: 122  |  Overall Attendance: 84.1%</text>
    <text x="50" y="545" fill="#7E22CE" font-family="sans-serif" font-size="12">Authorized by: Dean of Academic Affairs • Status: Approved for Section ${section} • Timestamp: 2026-09-12</text>
  </svg>`;

  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}
