import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileImage,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Calendar,
  Clock,
  UserCheck,
  Calendar as CalendarIcon,
  ExternalLink,
  X,
  Bell,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SubjectAttendance, DayClassSession, UserProfile } from '../types/attendance';
import { syncSessionsToGoogleCalendar, SyncCalendarResult } from '../services/calendarService';
import { getCachedAccessToken, signInWithGoogleCalendar } from '../lib/firebase';

interface UploadTabProps {
  currentSection: string;
  user: UserProfile | null;
  onSectionChange: (section: string) => void;
  onApplyParsedData: (data: {
    section: string;
    weekLabel: string;
    day?: string;
    subjects: SubjectAttendance[];
    schedule: DayClassSession[];
    isAiParsed: boolean;
  }) => void;
}

export const UploadTab: React.FC<UploadTabProps> = ({
  currentSection,
  user,
  onSectionChange,
  onApplyParsedData,
}) => {
  const [selectedSection, setSelectedSection] = useState<string>(currentSection || 'B9');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/png');
  const [fileName, setFileName] = useState<string>('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseStep, setParseStep] = useState<string>('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<any | null>(null);
  const [successToast, setSuccessToast] = useState(false);
  const [autoSyncCalendar, setAutoSyncCalendar] = useState(true);

  // Calendar sync confirmation modal state
  const [showCalendarConfirmModal, setShowCalendarConfirmModal] = useState(false);
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [calendarSyncResult, setCalendarSyncResult] = useState<SyncCalendarResult | null>(null);
  const [calendarSyncError, setCalendarSyncError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setParseError('Please upload an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    setParseError(null);
    setFileName(file.name);
    setImageMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setParsedPreview(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setParseError('Please upload an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    setParseError(null);
    setFileName(file.name);
    setImageMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setParsedPreview(null);
    };
    reader.readAsDataURL(file);
  };

  // AI Parsing step via server endpoint
  const handleParseWithAi = async () => {
    if (!imagePreview) {
      setParseError('Please upload or select an attendance image first.');
      return;
    }

    setIsParsing(true);
    setParseError(null);

    try {
      setParseStep('1/3 Scanning timetable and detecting schedule day from image...');
      await new Promise((r) => setTimeout(r, 600));

      setParseStep(`2/3 Locating row for section ${selectedSection} and extracting periods...`);

      const response = await fetch('/api/parse-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imagePreview,
          mimeType: imageMimeType,
          section: selectedSection,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse attendance image.');
      }

      setParseStep('3/3 Structuring periods and subjects (omitting room numbers)...');
      const data = await response.json();

      setParsedPreview(data);
    } catch (err: any) {
      console.error('Parsing error:', err);
      setParseError(err.message || 'Unable to parse image. Please try again.');
    } finally {
      setIsParsing(false);
      setParseStep('');
    }
  };

  // Step 1 of Confirm: If calendar sync is requested, show explicit confirmation dialog
  const handleInitiateConfirm = () => {
    if (!parsedPreview) return;

    if (autoSyncCalendar) {
      setCalendarSyncError(null);
      setShowCalendarConfirmModal(true);
    } else {
      applyParsedDataOnly();
    }
  };

  // Apply parsed results to app state
  const applyParsedDataOnly = () => {
    if (!parsedPreview) return;

    const extractedDay = parsedPreview.schedule?.[0]?.day || 'Friday';
    const activeSec = selectedSection.trim().toUpperCase() || parsedPreview.section || 'B9';

    onApplyParsedData({
      section: activeSec,
      weekLabel: parsedPreview.weekLabel || `Timetable: ${extractedDay}`,
      day: extractedDay,
      subjects: parsedPreview.subjects,
      schedule: parsedPreview.schedule,
      isAiParsed: true,
    });

    onSectionChange(activeSec);
    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
    }, 4000);
  };

  // Confirm and execute Google Calendar sync (adhering strictly to Workspace Guidelines)
  const handleExecuteCalendarSync = async () => {
    if (!parsedPreview || !parsedPreview.schedule) return;

    setIsSyncingCalendar(true);
    setCalendarSyncError(null);

    try {
      let token = getCachedAccessToken();
      if (!token) {
        // Prompt user to connect Google Calendar
        const authRes = await signInWithGoogleCalendar();
        if (!authRes) {
          // User closed or dismissed the popup window
          setCalendarSyncError('Google sign-in popup was closed. Click "Confirm & Add" whenever you are ready.');
          setIsSyncingCalendar(false);
          return;
        }
        if (!authRes.accessToken) {
          throw new Error('Could not obtain Google Calendar authorization token. Please try again.');
        }
        token = authRes.accessToken;
      }

      const activeSec = selectedSection.trim().toUpperCase() || parsedPreview.section || 'B9';
      const result = await syncSessionsToGoogleCalendar(
        parsedPreview.schedule,
        activeSec,
        true // Weekly recurrence
      );

      setCalendarSyncResult(result);

      // Apply to app state
      applyParsedDataOnly();
    } catch (err: any) {
      console.error('Calendar sync error:', err);
      setCalendarSyncError(err.message || 'Failed to sync with Google Calendar.');
    } finally {
      setIsSyncingCalendar(false);
    }
  };

  return (
    <div id="upload-tab" className="pb-24 pt-2 px-4 max-w-md mx-auto space-y-4">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5.5 shadow-[0_2px_16px_rgba(15,23,42,0.04)] border border-slate-150/80">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-round font-bold tracking-wider uppercase text-indigo-700 bg-indigo-50/90 px-3 py-1 rounded-full border border-indigo-150/70 shadow-2xs">
              Document Scanner
            </span>
            <h1 className="text-xl font-round font-bold text-slate-900 mt-2 tracking-tight">
              Timetable Sheet Scanner
            </h1>
            <p className="text-xs font-round text-slate-500 mt-0.5">
              Scan your college timetable and synchronize schedule directly to Google Calendar
            </p>
          </div>
        </div>

        {/* Section Input (Strictly Clean - NO PRESET SUGGESTIONS) */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="upload-section-input" className="text-xs font-round font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Registered Section</span>
            </label>
            {selectedSection && (
              <span className="text-[10px] font-mono font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                Section: {selectedSection}
              </span>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              id="upload-section-input"
              placeholder="Enter section designation (e.g. B9, CSE-A)..."
              value={selectedSection}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                setSelectedSection(val);
                if (val.trim()) onSectionChange(val.trim());
              }}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/70 text-slate-900 text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 placeholder:font-sans placeholder:font-normal placeholder:text-slate-400 transition-all"
            />
          </div>

          <p className="text-[11px] font-round text-slate-500">
            Type your section identifier with no predefined presets. The document scanner locates the row for this section and detects the schedule day directly from the document header.
          </p>
        </div>
      </div>

      {/* Image Upload Zone */}
      <div className="bg-white rounded-3xl p-5.5 shadow-[0_2px_16px_rgba(15,23,42,0.04)] border border-slate-150/80 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-round font-bold text-slate-900 flex items-center gap-1.5">
            <FileImage className="w-4 h-4 text-indigo-600" />
            <span>Attendance or Timetable Image</span>
          </h2>
          <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-3 py-0.5 rounded-full border border-slate-200/60">
            JPG, PNG, WEBP
          </span>
        </div>

        {/* Dropzone container */}
        <div
          id="image-dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-indigo-50/20 transition-all rounded-2xl p-6 text-center cursor-pointer relative overflow-hidden group"
        >
          <input
            ref={fileInputRef}
            type="file"
            id="attendance-image-input"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {imagePreview ? (
            <div className="space-y-3">
              <div className="max-h-48 overflow-hidden rounded-2xl border border-slate-200 bg-slate-900/5 flex items-center justify-center p-1">
                <img
                  src={imagePreview}
                  alt="Attendance sheet preview"
                  className="max-h-44 object-contain rounded-xl shadow-2xs"
                />
              </div>
              <div className="flex items-center justify-center gap-2 text-xs font-round text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="truncate max-w-[200px] font-mono font-semibold">{fileName || 'Document ready'}</span>
                <span className="text-slate-400">• Tap to replace</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform shadow-2xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-xs font-round font-bold text-slate-900">
                Drop or browse timetable sheet image
              </p>
              <p className="text-[11px] font-round text-slate-500 mt-0.5 max-w-xs">
                Upload a clear photograph or screenshot of your college timetable schedule
              </p>
            </div>
          )}
        </div>

        {/* Error message */}
        {parseError && (
          <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 text-xs font-round border border-rose-200 flex items-start gap-2 shadow-2xs">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{parseError}</span>
          </div>
        )}

        {/* Parse with AI Action Button */}
        <button
          id="parse-attendance-btn"
          disabled={!imagePreview || isParsing}
          onClick={handleParseWithAi}
          className={`w-full py-3.5 px-5 rounded-full font-round font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer ${
            !imagePreview || isParsing
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md active:scale-[0.99]'
          }`}
        >
          {isParsing ? (
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span className="font-mono">{parseStep || `Scanning Section ${selectedSection} Schedule...`}</span>
            </div>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Scan Schedule &amp; Attendance</span>
            </>
          )}
        </button>
      </div>

      {/* PARSED PREVIEW & CONFIRMATION TABLE */}
      <AnimatePresence>
        {parsedPreview && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            id="parsed-results-preview"
            className="bg-white rounded-3xl p-5.5 shadow-[0_2px_16px_rgba(15,23,42,0.04)] border border-slate-150/80 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-round font-bold text-slate-900">Extracted Timetable</span>
                  <span className="text-[10px] font-round font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Verified
                  </span>
                </div>
                <p className="text-[11px] font-round text-slate-500 mt-0.5">
                  Section: <strong className="font-mono text-slate-900">{parsedPreview.section}</strong> • {parsedPreview.subjects?.length || 0} subjects detected
                </p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>

            {/* Subjects Table Preview */}
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              <p className="text-[11px] font-round font-bold text-slate-900">Identified Subjects:</p>
              {parsedPreview.subjects?.map((subj: any, i: number) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-round font-bold text-slate-900 truncate">{subj.name}</p>
                    <p className="text-[10px] font-mono text-slate-500">
                      Code: {subj.code} • {subj.faculty || 'Faculty'}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-mono font-bold text-slate-900">{subj.percentage}%</span>
                    <p className="text-[10px] font-mono text-slate-400">
                      {subj.totalAttended}/{subj.totalHeld} held
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Timetable Schedule Grid Preview if schedule was extracted */}
            {parsedPreview.schedule && parsedPreview.schedule.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-round font-bold text-slate-900 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Schedule ({parsedPreview.schedule[0]?.day || 'Extracted Day'} • {parsedPreview.schedule.length} periods):</span>
                  </p>
                  <span className="text-[10px] font-round font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    Day: {parsedPreview.schedule[0]?.day || 'Friday'}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {parsedPreview.schedule.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center text-[10px] font-mono font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-round font-bold text-slate-900 leading-tight">{item.subject}</p>
                          <p className="text-[10px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{item.time}</span>
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-round text-slate-500 px-2.5 py-0.5 rounded-full bg-white border border-slate-200">
                        {item.faculty || 'Faculty'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Google Calendar Sync Option */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100/80 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-round font-bold text-slate-900">Google Calendar Sync</p>
                    <p className="text-[10px] font-mono text-slate-500">
                      Target: <strong className="text-slate-800">{user?.email || 'Student Gmail'}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer pt-2 border-t border-indigo-100 font-round">
                <input
                  type="checkbox"
                  id="auto-sync-calendar-checkbox"
                  checked={autoSyncCalendar}
                  onChange={(e) => setAutoSyncCalendar(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300 accent-slate-900 cursor-pointer"
                />
                <span className="text-xs text-slate-800">
                  Synchronize these periods to my Google Calendar ({user?.email || 'my Gmail'})
                </span>
              </label>
            </div>

            {/* Merge & Update Explanation */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-900 text-xs flex items-start gap-2.5 font-round">
              <Layers className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Ledger Integration</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Confirming will update subject records and apply {parsedPreview.schedule?.[0]?.day || 'timetable'}&apos;s schedule for Section {selectedSection}.
                </p>
              </div>
            </div>

            {/* Confirm & Save Button */}
            <button
              id="confirm-parsed-attendance-btn"
              onClick={handleInitiateConfirm}
              className="w-full py-3.5 px-5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-round font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {autoSyncCalendar
                  ? `Confirm & Sync to Google Calendar (${selectedSection})`
                  : `Confirm & Apply ${selectedSection} Schedule`}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EXPLICIT CONFIRMATION MODAL FOR GOOGLE CALENDAR */}
      <AnimatePresence>
        {showCalendarConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-150/80 space-y-4 font-round"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Google Calendar Sync</h3>
                    <p className="text-[11px] text-slate-500">Timetable Schedule Export</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCalendarConfirmModal(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Explicit Explanation of Changes */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 space-y-2">
                <p className="font-bold text-slate-900">
                  Schedule {parsedPreview?.schedule?.length || 0} periods in Google Calendar:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
                  <li><strong>Target Service:</strong> Google Calendar (Primary)</li>
                  <li><strong>Target Account:</strong> {user?.email || 'Your signed-in Gmail'}</li>
                  <li><strong>Section:</strong> {selectedSection}</li>
                  <li><strong>Day &amp; Recurrence:</strong> Every {parsedPreview?.schedule?.[0]?.day || 'Friday'} (weekly)</li>
                  <li><strong>Reminders:</strong> 15 minutes before period</li>
                </ul>
              </div>

              {/* Status or Error Notice */}
              {calendarSyncError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{calendarSyncError}</span>
                </div>
              )}

              {calendarSyncResult && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Added {calendarSyncResult.syncedCount} classes to Google Calendar!</span>
                  </div>
                  <a
                    href="https://calendar.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-slate-900 font-bold underline text-[11px]"
                  >
                    <span>View in Google Calendar</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCalendarConfirmModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-full border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  {calendarSyncResult ? 'Dismiss' : 'Cancel'}
                </button>

                {!calendarSyncResult && (
                  <button
                    type="button"
                    disabled={isSyncingCalendar}
                    onClick={handleExecuteCalendarSync}
                    className="flex-1 py-2.5 px-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSyncingCalendar ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Synchronizing...</span>
                      </>
                    ) : (
                      <>
                        <CalendarIcon className="w-3.5 h-3.5" />
                        <span>Confirm &amp; Add</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Notification Toast */}
      {successToast && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-2xl bg-slate-900 text-white shadow-lg flex items-center justify-between text-xs font-round"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="font-bold">Schedule Updated</p>
              <p className="text-slate-300 text-[11px]">
                Home progress ledger and day schedule updated for Section {selectedSection}.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Automatic Fallback Logic Clarification Card */}
      <div className="bg-white rounded-2xl p-4.5 border border-slate-150/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] text-xs space-y-1 font-round">
        <div className="flex items-center gap-1.5 text-slate-900 font-bold">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>Automatic Archive Safeguard</span>
        </div>
        <p className="text-slate-500 text-[11px] leading-relaxed">
          If no fresh timetable image is scanned for the current week, the app automatically preserves the previous week&apos;s lectures and subject quotas with a visible
          <span className="font-mono font-semibold text-slate-900 mx-1 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            Displaying archived register schedule
          </span>
          badge so your daily desk ledger is always available.
        </p>
      </div>
    </div>
  );
};
