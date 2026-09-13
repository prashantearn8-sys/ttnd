/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SplashView } from './components/SplashView';
import { LoginView } from './components/LoginView';
import { AppHeader } from './components/AppHeader';
import { HomeTab } from './components/HomeTab';
import { DayTab } from './components/DayTab';
import { UploadTab } from './components/UploadTab';
import { AccountTab } from './components/AccountTab';
import { BottomNavBar, NavTab } from './components/BottomNavBar';
import { CalendarSyncModal } from './components/CalendarSyncModal';
import { UserProfile, AppAttendanceState, AttendanceStatus, SubjectAttendance, DayClassSession } from './types/attendance';
import { INITIAL_USER, INITIAL_ATTENDANCE_STATE } from './data/initialData';
import { fetchSectionSchedule } from './services/scheduleService';
import { parseIsoDate, DAY_NAMES } from './utils/calendarUtils';
import {
  testConnection,
  saveAttendanceToFirestore,
  getAttendanceFromFirestore,
  logoutUser,
  signInWithGoogleCalendar,
  initAuthListener,
  auth,
} from './lib/firebase';

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [activeDay, setActiveDay] = useState<string>('Friday');
  const [attendanceData, setAttendanceData] = useState<AppAttendanceState>(INITIAL_ATTENDANCE_STATE);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isCloudSynced, setIsCloudSynced] = useState(true);
  const [isFetchingSchedule, setIsFetchingSchedule] = useState(false);

  // Restore saved session and attendance data from localStorage and Firestore
  useEffect(() => {
    async function initSession() {
      try {
        await testConnection();

        const savedUser = localStorage.getItem('attendance_auth_user');
        let currentUser: UserProfile | null = null;
        if (savedUser) {
          currentUser = JSON.parse(savedUser);
          setUser(currentUser);
          setHasStarted(true);
        }

        const savedData = localStorage.getItem('attendance_tracker_data');
        if (savedData) {
          setAttendanceData(JSON.parse(savedData));
        } else {
          localStorage.setItem('attendance_tracker_data', JSON.stringify(INITIAL_ATTENDANCE_STATE));
        }

        // Check if user has remote cloud records in Firestore
        if (currentUser?.id && !currentUser.id.startsWith('usr-') && auth.currentUser) {
          try {
            const remoteData = await getAttendanceFromFirestore(currentUser.id);
            if (remoteData && remoteData.subjects && remoteData.schedule) {
              setAttendanceData(remoteData as AppAttendanceState);
              localStorage.setItem('attendance_tracker_data', JSON.stringify(remoteData));
            }
          } catch (cloudErr) {
            console.warn('Firestore initial sync notice:', cloudErr);
          }
        }
      } catch (err) {
        console.error('Error loading stored session:', err);
      } finally {
        setIsDataLoaded(true);
      }
    }

    initSession();

    // Listen to Firebase Auth state for remote sync
    const unsubscribe = initAuthListener(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const cloudData = await getAttendanceFromFirestore(firebaseUser.uid);
          if (cloudData && cloudData.subjects && cloudData.schedule) {
            setAttendanceData(cloudData as AppAttendanceState);
          }
        } catch (e) {
          console.warn('Sync listener notice:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync attendance state to localStorage and Firestore
  const saveAttendanceData = (updater: (prev: AppAttendanceState) => AppAttendanceState) => {
    setAttendanceData((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem('attendance_tracker_data', JSON.stringify(next));
      } catch (err) {
        console.error('Error saving data to local storage:', err);
      }

      // Sync to Firebase Firestore
      if (user?.id) {
        setIsCloudSynced(false);
        saveAttendanceToFirestore(user.id, next)
          .then(() => setIsCloudSynced(true))
          .catch((e) => {
            console.warn('Cloud sync error:', e);
            setIsCloudSynced(true); // Don't block UI
          });
      }
      return next;
    });
  };

  // Handle Google Login success
  const handleLoginSuccess = async (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setHasStarted(true);
    // Fetch user cloud records if present
    try {
      const cloudData = await getAttendanceFromFirestore(loggedInUser.id);
      if (cloudData && cloudData.subjects && cloudData.schedule) {
        setAttendanceData(cloudData as AppAttendanceState);
        localStorage.setItem('attendance_tracker_data', JSON.stringify(cloudData));
      }
    } catch (e) {
      console.warn('Cloud data fetch error on login:', e);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn('Logout error:', e);
    }
    localStorage.removeItem('attendance_auth_user');
    setUser(null);
    setHasStarted(false);
    setCurrentTab('home');
  };

  // Handle Section Change
  const handleSectionChange = (newSection: string) => {
    saveAttendanceData((prev) => ({
      ...prev,
      currentSection: newSection,
    }));
    if (user) {
      const updatedUser = { ...user, section: newSection };
      setUser(updatedUser);
      localStorage.setItem('attendance_auth_user', JSON.stringify(updatedUser));
    }
  };

  // Mark attendance status for a class session in the Day schedule
  const handleUpdateSessionStatus = (sessionId: string, newStatus: AttendanceStatus) => {
    saveAttendanceData((prev) => {
      const targetSession = prev.schedule.find((s) => s.id === sessionId);
      if (!targetSession) return prev;

      const oldStatus = targetSession.status;
      if (oldStatus === newStatus) return prev;

      // Update session status in schedule
      const updatedSchedule = prev.schedule.map((s) =>
        s.id === sessionId ? { ...s, status: newStatus } : s
      );

      // Dynamically recalculate corresponding subject attendance
      const updatedSubjects = prev.subjects.map((sub) => {
        if (sub.name === targetSession.subject) {
          let heldDelta = 0;
          let attendedDelta = 0;

          // If session was previously upcoming, it is now conducted
          if (oldStatus === 'upcoming') {
            heldDelta = 1;
            if (newStatus === 'present') {
              attendedDelta = 1;
            }
          } else {
            // It was already held
            if (oldStatus === 'present' && newStatus === 'absent') {
              attendedDelta = -1;
            } else if (oldStatus === 'absent' && newStatus === 'present') {
              attendedDelta = 1;
            }
          }

          const newTotalHeld = Math.max(1, sub.totalHeld + heldDelta);
          const newTotalAttended = Math.max(0, Math.min(newTotalHeld, sub.totalAttended + attendedDelta));
          const newPercentage = Number(((newTotalAttended / newTotalHeld) * 100).toFixed(1));

          return {
            ...sub,
            totalHeld: newTotalHeld,
            totalAttended: newTotalAttended,
            percentage: newPercentage,
          };
        }
        return sub;
      });

      return {
        ...prev,
        schedule: updatedSchedule,
        subjects: updatedSubjects,
      };
    });
  };

  // Direct schedule fetcher from API / local timetable
  const handleFetchSchedule = async (sectionToFetch?: string, targetDay?: string) => {
    const sec = (sectionToFetch || attendanceData.currentSection || 'B9').trim().toUpperCase();
    setIsFetchingSchedule(true);
    try {
      const data = await fetchSectionSchedule(sec, targetDay, true);
      if (data && data.schedule && data.schedule.length > 0) {
        saveAttendanceData((prev) => {
          const incomingDays = new Set(data.schedule.map((s) => s.day.toLowerCase()));
          let mergedSchedule: DayClassSession[];
          if (incomingDays.size > 1) {
            mergedSchedule = data.schedule;
          } else {
            const remaining = prev.schedule.filter((s) => !incomingDays.has(s.day.toLowerCase()));
            mergedSchedule = [...remaining, ...data.schedule];
          }

          return {
            ...prev,
            currentSection: sec,
            weekLabel: data.weekLabel,
            isUsingLastWeekFallback: false,
            selectedCalendarDate: data.isoDate || prev.selectedCalendarDate || '2026-09-13',
            extractedDateInfo: {
              date: data.date,
              month: data.month,
              year: data.year,
              isoDate: data.isoDate,
              extractedDateText: data.extractedDateText,
            },
            subjects: data.subjects && data.subjects.length > 0 ? data.subjects : prev.subjects,
            schedule: mergedSchedule,
          };
        });

        if (targetDay) {
          setActiveDay(targetDay);
        }
      }
    } catch (err) {
      console.error('Failed to fetch schedule:', err);
    } finally {
      setIsFetchingSchedule(false);
    }
  };

  // Merge newly parsed AI data from uploaded 1-day schedule
  const handleApplyParsedData = (data: {
    section: string;
    weekLabel: string;
    day?: string;
    date?: number;
    month?: string;
    year?: number;
    isoDate?: string;
    extractedDateText?: string;
    subjects: SubjectAttendance[];
    schedule: DayClassSession[];
    isAiParsed: boolean;
  }) => {
    let uploadDay = data.day || data.schedule?.[0]?.day || 'Friday';
    const targetIso = data.isoDate;

    if (targetIso) {
      const dObj = parseIsoDate(targetIso);
      if (!isNaN(dObj.getTime())) {
        const dayFromDate = DAY_NAMES[dObj.getDay()];
        if (dayFromDate) {
          uploadDay = dayFromDate;
        }
      }
    }

    setActiveDay(uploadDay);

    saveAttendanceData((prev) => {
      // Intelligently merge subjects: update existing or add new
      const mergedSubjects: SubjectAttendance[] = [...prev.subjects];

      data.subjects.forEach((incoming) => {
        const existingIdx = mergedSubjects.findIndex(
          (s) => s.code.toLowerCase() === incoming.code.toLowerCase() || s.name.toLowerCase() === incoming.name.toLowerCase()
        );

        if (existingIdx >= 0) {
          // Update existing subject
          mergedSubjects[existingIdx] = {
            ...mergedSubjects[existingIdx],
            totalHeld: incoming.totalHeld,
            totalAttended: incoming.totalAttended,
            percentage: incoming.percentage,
            faculty: incoming.faculty || mergedSubjects[existingIdx].faculty,
          };
        } else {
          // Add new subject
          mergedSubjects.push({
            ...incoming,
            color: incoming.color || '#8B5CF6',
          });
        }
      });

      // Schedule merging: full weekly replace if multi-day, or day-specific replace
      let mergedSchedule: DayClassSession[];
      if (data.schedule && data.schedule.length > 0) {
        const incomingDays = new Set(data.schedule.map((s) => s.day.toLowerCase()));
        if (incomingDays.size > 1) {
          mergedSchedule = data.schedule;
        } else {
          const otherDaysSchedule = prev.schedule.filter(
            (s) => !incomingDays.has(s.day.toLowerCase())
          );
          mergedSchedule = [...otherDaysSchedule, ...data.schedule];
        }
      } else {
        mergedSchedule = prev.schedule;
      }

      return {
        ...prev,
        currentSection: data.section,
        weekLabel: data.weekLabel,
        isUsingLastWeekFallback: false,
        lastUploadedDate: new Date().toISOString().split('T')[0],
        selectedCalendarDate: targetIso || prev.selectedCalendarDate || '2026-09-13',
        extractedDateInfo: {
          date: data.date,
          month: data.month,
          year: data.year,
          isoDate: data.isoDate,
          extractedDateText: data.extractedDateText,
        },
        subjects: mergedSubjects,
        schedule: mergedSchedule,
      };
    });

    // Auto navigate to Day tab to show the newly imported day schedule directly
    setCurrentTab('day');
  };

  // Reset to default sample data
  const handleResetData = () => {
    localStorage.setItem('attendance_tracker_data', JSON.stringify(INITIAL_ATTENDANCE_STATE));
    setAttendanceData(INITIAL_ATTENDANCE_STATE);
  };

  if (!isDataLoaded) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 font-round">
        <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 1. Splash Screen Flow
  if (!user && !hasStarted) {
    return <SplashView onContinue={() => setHasStarted(true)} />;
  }

  // 2. Google Login Flow
  if (!user) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // Calculate today's pending classes count for bottom nav badge
  const todayClassesCount = attendanceData.schedule.filter(
    (s) => s.day.toLowerCase() === activeDay.toLowerCase()
  ).length;

  // 3. Main Authenticated Application View
  return (
    <div className="min-h-screen w-full bg-slate-100/90 flex items-center justify-center font-round antialiased text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Clean minimal mobile shell */}
      <div className="w-full max-w-md min-h-screen bg-slate-50/60 shadow-xl relative flex flex-col border-x border-slate-200/80">
        {/* Sticky Top Header */}
        <AppHeader
          user={user}
          currentSection={attendanceData.currentSection}
          isUsingLastWeekFallback={attendanceData.isUsingLastWeekFallback}
          onGoToUpload={() => setCurrentTab('upload')}
        />

        {/* Dynamic Tab Screen Body */}
        <main className="flex-1 overflow-y-auto">
          {currentTab === 'home' && (
            <HomeTab
              user={user}
              subjects={attendanceData.subjects}
              schedule={attendanceData.schedule}
              targetPercentage={attendanceData.targetPercentage}
              isUsingLastWeekFallback={attendanceData.isUsingLastWeekFallback}
              activeDay={activeDay}
              currentSection={attendanceData.currentSection}
              onNavigateToTab={(tab) => setCurrentTab(tab)}
              onFetchSchedule={handleFetchSchedule}
              isFetchingSchedule={isFetchingSchedule}
            />
          )}

          {currentTab === 'day' && (
            <DayTab
              schedule={attendanceData.schedule}
              subjects={attendanceData.subjects}
              activeDay={activeDay}
              currentSection={attendanceData.currentSection}
              onSelectDay={(day) => setActiveDay(day)}
              onUpdateSessionStatus={handleUpdateSessionStatus}
              onOpenCalendarSync={() => setIsCalendarModalOpen(true)}
              onFetchSchedule={handleFetchSchedule}
              isFetchingSchedule={isFetchingSchedule}
              selectedCalendarDate={attendanceData.selectedCalendarDate || '2026-09-13'}
              extractedDateInfo={attendanceData.extractedDateInfo}
              weeklyOffPattern={attendanceData.weeklyOffPattern || 'sunday'}
              onSelectCalendarDate={(dateStr, dayName) => {
                setActiveDay(dayName);
                saveAttendanceData((prev) => ({
                  ...prev,
                  selectedCalendarDate: dateStr,
                }));
              }}
            />
          )}

          {currentTab === 'upload' && (
            <UploadTab
              currentSection={attendanceData.currentSection}
              user={user}
              onSectionChange={handleSectionChange}
              onApplyParsedData={handleApplyParsedData}
            />
          )}

          {currentTab === 'account' && (
            <AccountTab
              user={user}
              subjects={attendanceData.subjects}
              targetPercentage={attendanceData.targetPercentage}
              onUpdateTargetPercentage={(target) =>
                saveAttendanceData((prev) => ({ ...prev, targetPercentage: target }))
              }
              weeklyOffPattern={attendanceData.weeklyOffPattern || 'sunday'}
              onUpdateWeeklyOffPattern={(pattern) =>
                saveAttendanceData((prev) => ({ ...prev, weeklyOffPattern: pattern }))
              }
              onResetData={handleResetData}
              onLogout={handleLogout}
              onOpenCalendarSync={() => setIsCalendarModalOpen(true)}
              isCloudSynced={isCloudSynced}
            />
          )}
        </main>

        {/* Fixed 4-item Bottom Navigation Bar */}
        <BottomNavBar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          dayBadgeCount={todayClassesCount}
        />

        {/* Google Calendar Sync & Management Modal */}
        <CalendarSyncModal
          isOpen={isCalendarModalOpen}
          onClose={() => setIsCalendarModalOpen(false)}
          schedule={attendanceData.schedule}
          currentSection={attendanceData.currentSection}
          activeDay={activeDay}
          onRequestGoogleAuth={async () => {
            try {
              const res = await signInWithGoogleCalendar();
              if (res?.user) {
                // Keep token updated
              }
            } catch (authErr) {
              console.warn('Calendar scope auth error:', authErr);
            }
          }}
        />
      </div>
    </div>
  );
}
