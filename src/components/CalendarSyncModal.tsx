import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  X,
  Clock,
  BookOpen,
  RefreshCw,
  Bell,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DayClassSession } from '../types/attendance';
import {
  syncSessionsToGoogleCalendar,
  getUpcomingCalendarEvents,
  deleteCalendarEvent,
  CalendarEventItem,
} from '../services/calendarService';
import { getCachedAccessToken } from '../lib/firebase';

interface CalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: DayClassSession[];
  currentSection: string;
  activeDay: string;
  onRequestGoogleAuth?: () => void;
}

export const CalendarSyncModal: React.FC<CalendarSyncModalProps> = ({
  isOpen,
  onClose,
  schedule,
  currentSection,
  activeDay,
  onRequestGoogleAuth,
}) => {
  const [selectedScope, setSelectedScope] = useState<'day' | 'all'>('day');
  const [isRecurring, setIsRecurring] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Confirmation state for sync (Mandatory per workspace-integration)
  const [showConfirmSync, setShowConfirmSync] = useState(false);

  // Deletion state
  const [eventToDelete, setEventToDelete] = useState<CalendarEventItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Existing calendar events
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const hasAuthToken = Boolean(getCachedAccessToken());

  // Filter classes based on selection
  const classesToSync =
    selectedScope === 'day'
      ? schedule.filter((s) => s.day.toLowerCase() === activeDay.toLowerCase())
      : schedule;

  // Load existing events if authenticated
  const loadExistingEvents = async () => {
    if (!getCachedAccessToken()) return;
    setIsLoadingEvents(true);
    try {
      const events = await getUpcomingCalendarEvents();
      // Filter for app-synced or class-related events
      const classEvents = events.filter(
        (e) =>
          e.summary.toLowerCase().includes('[class]') ||
          e.summary.toLowerCase().includes('class') ||
          (e.description && e.description.includes('Attendance Tracker'))
      );
      setCalendarEvents(classEvents.length > 0 ? classEvents : events.slice(0, 10));
    } catch (err: any) {
      console.warn('Could not load calendar events:', err.message);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (isOpen && hasAuthToken) {
      loadExistingEvents();
    }
  }, [isOpen, hasAuthToken]);

  // Execute the confirmed sync
  const handleExecuteSync = async () => {
    setShowConfirmSync(false);
    setIsSyncing(true);
    setSyncStatus({ type: null, message: '' });

    try {
      const result = await syncSessionsToGoogleCalendar(classesToSync, currentSection, isRecurring);
      if (result.success) {
        setSyncStatus({
          type: 'success',
          message: `Successfully synced ${result.createdCount} class ${
            result.createdCount === 1 ? 'period' : 'periods'
          } to your Google Calendar!`,
        });
        await loadExistingEvents();
      } else {
        setSyncStatus({
          type: 'error',
          message: result.errors[0] || 'Unable to sync classes to Google Calendar.',
        });
      }
    } catch (err: any) {
      setSyncStatus({
        type: 'error',
        message: err.message || 'Error communicating with Google Calendar API.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Delete event confirmation execution
  const handleExecuteDelete = async (eventId: string) => {
    setIsDeleting(true);
    try {
      await deleteCalendarEvent(eventId);
      setCalendarEvents((prev) => prev.filter((e) => e.id !== eventId));
      setEventToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete event:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="calendar-sync-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-150/80 overflow-hidden relative font-round"
      >
        {/* Modal Header */}
        <div className="p-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shadow-2xs">
              <CalendarIcon className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                Google Calendar Sync
              </h3>
              <p className="text-xs text-slate-500">Timetable export &amp; reminders</p>
            </div>
          </div>
          <button
            id="close-calendar-sync-modal"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center border border-slate-200 transition-colors shadow-2xs cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-sm text-slate-900">
          {/* Status Alert if any */}
          {syncStatus.type && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3.5 rounded-2xl flex items-start gap-2.5 text-xs shadow-2xs ${
                syncStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {syncStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p>{syncStatus.message}</p>
                {syncStatus.type === 'success' && (
                  <a
                    href="https://calendar.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 mt-1 text-slate-900 font-bold underline text-[11px]"
                  >
                    <span>Open Google Calendar</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </motion.div>
          )}

          {/* If Not Authenticated with Google Calendar Scopes */}
          {!hasAuthToken && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Google Calendar Access Required</span>
              </div>
              <p>
                To sync timetable sessions directly into your Google Calendar, grant access via Google Sign In.
              </p>
              {onRequestGoogleAuth && (
                <button
                  type="button"
                  onClick={onRequestGoogleAuth}
                  className="w-full mt-2 py-2.5 px-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Connect Google Calendar</span>
                </button>
              )}
            </div>
          )}

          {/* Sync Configuration Options */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-900 block">
              Schedule Scope to Export
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedScope('day')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedScope === 'day'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{activeDay} Only</span>
                  {selectedScope === 'day' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                <p className={`text-[11px] mt-1 ${selectedScope === 'day' ? 'text-slate-300' : 'text-slate-400'}`}>
                  {schedule.filter((s) => s.day.toLowerCase() === activeDay.toLowerCase()).length}{' '}
                  classes today
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedScope('all')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedScope === 'all'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">All Week Schedule</span>
                  {selectedScope === 'all' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                <p className={`text-[11px] mt-1 ${selectedScope === 'all' ? 'text-slate-300' : 'text-slate-400'}`}>{schedule.length} total periods</p>
              </button>
            </div>

            {/* Recurrence Switch */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 text-indigo-600" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Repeat Weekly</p>
                  <p className="text-[11px] text-slate-500">
                    Recur on subsequent weeks for {activeDay}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded text-slate-900 accent-slate-900 focus:ring-slate-900 border-slate-300 cursor-pointer"
              />
            </div>

            {/* Reminders Pill */}
            <div className="flex items-center gap-2 text-xs text-slate-500 px-1">
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              <span>Includes 15 min reminder prior to class start</span>
            </div>
          </div>

          {/* Preview of Classes to be Created */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                Classes to Sync ({classesToSync.length})
              </span>
              <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                Section: {currentSection}
              </span>
            </div>

            {classesToSync.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">
                No classes recorded for {activeDay}. You can scan a schedule in the Upload tab.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {classesToSync.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-bold text-slate-900 truncate">{c.subject}</p>
                      <p className="text-[10px] font-mono text-slate-500">
                        {c.day} • {c.faculty || 'Faculty'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-slate-700 flex-shrink-0">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{c.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Synced Calendar Events Section */}
          {calendarEvents.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  Existing Calendar Events
                </span>
                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-indigo-600 font-bold hover:underline flex items-center gap-1"
                >
                  <span>Google Calendar</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {calendarEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-bold text-slate-900 truncate">{evt.summary}</p>
                      <p className="text-[10px] font-mono text-slate-400">
                        {evt.start.dateTime
                          ? new Date(evt.start.dateTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'All day'}
                      </p>
                    </div>
                    <button
                      type="button"
                      title="Remove event from calendar"
                      onClick={() => setEventToDelete(evt)}
                      className="p-1 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-full border border-slate-200 hover:bg-white text-slate-600 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            id="open-sync-confirm-button"
            type="button"
            disabled={classesToSync.length === 0 || isSyncing}
            onClick={() => setShowConfirmSync(true)}
            className="py-2.5 px-5 rounded-full bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSyncing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Synchronizing...</span>
              </>
            ) : (
              <>
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Sync to Google Calendar</span>
              </>
            )}
          </button>
        </div>

        {/* MANDATORY USER CONFIRMATION DIALOG */}
        <AnimatePresence>
          {showConfirmSync && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                className="bg-white rounded-3xl p-5.5 shadow-2xl max-w-sm w-full border border-slate-150/80 text-center space-y-3 font-round"
              >
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-700 mx-auto flex items-center justify-center shadow-2xs">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Confirm Calendar Synchronization
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Add <strong className="font-mono text-slate-900">{classesToSync.length} class {classesToSync.length === 1 ? 'period' : 'periods'}</strong> for{' '}
                    <strong className="text-slate-900">{selectedScope === 'day' ? activeDay : 'all week'}</strong> to your primary Google Calendar?
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl text-[11px] text-slate-600 text-left space-y-1">
                  <p className="font-bold text-slate-900">Events to create:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                    {classesToSync.slice(0, 3).map((c) => (
                      <li key={c.id} className="truncate">
                        {c.subject} ({c.time})
                      </li>
                    ))}
                    {classesToSync.length > 3 && (
                      <li className="text-slate-900 font-bold">
                        + {classesToSync.length - 3} more periods
                      </li>
                    )}
                  </ul>
                  {isRecurring && <p className="text-slate-900 pt-0.5 font-bold">• Weekly recurring event</p>}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowConfirmSync(false)}
                    className="flex-1 py-2 px-3.5 rounded-full border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="confirm-calendar-sync-action"
                    type="button"
                    onClick={handleExecuteSync}
                    className="flex-1 py-2 px-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    Confirm &amp; Sync
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MANDATORY USER CONFIRMATION FOR DELETION */}
        <AnimatePresence>
          {eventToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                className="bg-white rounded-3xl p-5.5 shadow-2xl max-w-sm w-full border border-rose-200 text-center space-y-3 font-round"
              >
                <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 mx-auto flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Delete Calendar Event?</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Remove <strong className="text-slate-900">&quot;{eventToDelete.summary}&quot;</strong> from your Google Calendar? This action cannot be undone.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setEventToDelete(null)}
                    className="flex-1 py-2 px-3.5 rounded-full border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="confirm-delete-calendar-event"
                    type="button"
                    disabled={isDeleting}
                    onClick={() => handleExecuteDelete(eventToDelete.id)}
                    className="flex-1 py-2 px-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Event'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
