import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, GraduationCap, Calendar, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile } from '../types/attendance';
import { signInWithGoogleCalendar, saveUserProfileToFirestore } from '../lib/firebase';

interface LoginViewProps {
  onLoginSuccess: (user: UserProfile) => void;
  defaultEmail?: string;
  defaultName?: string;
  currentSection?: string;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  defaultEmail = 'nishant19987@gmail.com',
  defaultName = 'Nishant Kumar',
  currentSection = 'CSE-A',
}) => {
  const [rememberSession, setRememberSession] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      const authResult = await signInWithGoogleCalendar();
      if (!authResult) {
        // User closed or dismissed the popup
        setErrorMessage('Sign-in was closed. Click above to retry, or use Quick Demo Sign-in below.');
        return;
      }
      if (authResult.user) {
        const u = authResult.user;
        const user: UserProfile = {
          id: u.uid,
          name: u.displayName || defaultName,
          email: u.email || defaultEmail,
          avatar: u.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
          role: 'student',
          section: currentSection,
          studentId: '22CSE048',
        };

        // Persist profile to Firestore
        try {
          await saveUserProfileToFirestore(u.uid, {
            userId: u.uid,
            displayName: user.name,
            email: user.email,
            section: user.section,
            role: user.role,
          });
        } catch (dbErr) {
          console.warn('Firestore profile save warning:', dbErr);
        }

        if (rememberSession) {
          localStorage.setItem('attendance_auth_user', JSON.stringify(user));
        }
        onLoginSuccess(user);
        return;
      }
    } catch (error: any) {
      console.warn('Firebase popup sign-in encountered an issue:', error);
      // If popup blocked or cancelled or domain restricted in iframe preview
      if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/popup-closed-by-user' || error?.message?.includes('popup')) {
        setErrorMessage('Popup was closed or blocked. You can retry or use Quick Sign-in below.');
      } else {
        setErrorMessage(error?.message || 'Authentication failed. Please retry.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleQuickDemoSignIn = () => {
    const user: UserProfile = {
      id: `usr-${Date.now()}`,
      name: defaultName,
      email: defaultEmail,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      role: 'student',
      section: currentSection,
      studentId: '22CSE048',
    };
    if (rememberSession) {
      localStorage.setItem('attendance_auth_user', JSON.stringify(user));
    }
    onLoginSuccess(user);
  };

  return (
    <div
      id="login-screen"
      className="min-h-screen w-full flex flex-col items-center justify-center p-5 bg-[#F8F9FC] text-slate-900 relative"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm bg-white rounded-3xl p-7 shadow-[0_8px_30px_rgba(15,23,42,0.06)] border border-slate-150/80 relative z-10"
      >
        {/* Top Icon and Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-3 shadow-md ring-4 ring-slate-100">
            <GraduationCap className="w-7 h-7 stroke-[1.75] text-indigo-200" />
          </div>
          <span className="text-[10px] font-round font-bold tracking-wider uppercase text-indigo-700 bg-indigo-50/90 px-3 py-1 rounded-full mb-2 border border-indigo-150/70 shadow-2xs">
            Student Portal
          </span>
          <h2 className="text-xl font-round font-bold tracking-tight text-slate-900">Student Sign In</h2>
          <p className="text-xs font-round text-slate-500 mt-1">
            Access your attendance records, timetable, and calendar sync.
          </p>
        </div>

        {/* Detected Google Student Account Card */}
        <div className="mb-5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-150/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-900 to-indigo-900 text-white font-round font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-2xs ring-2 ring-white">
            {defaultName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-round font-bold text-slate-900 truncate">{defaultName}</p>
              <span className="text-[9px] font-round font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Verified
              </span>
            </div>
            <p className="text-[11px] font-round text-slate-500 truncate">{defaultEmail}</p>
          </div>
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
        </div>

        {/* Google Login CTA Button */}
        <button
          id="google-login-button"
          type="button"
          disabled={isSigningIn}
          onClick={handleGoogleSignIn}
          className="w-full py-3.5 px-4 rounded-full bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-round font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
        >
          {isSigningIn ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {/* Official Google 'G' icon */}
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Error notification if popup was cancelled or blocked */}
        {errorMessage && (
          <div className="mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 shadow-2xs font-round">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{errorMessage}</p>
              <button
                type="button"
                onClick={handleQuickDemoSignIn}
                className="mt-1.5 text-slate-900 font-bold underline text-[11px] block hover:text-slate-700 cursor-pointer"
              >
                Continue with Demo Session
              </button>
            </div>
          </div>
        )}

        {/* Quick Demo Sign-in Option */}
        <div className="mt-3.5 pt-3.5 border-t border-slate-100 flex flex-col items-center">
          <button
            id="quick-demo-login-btn"
            type="button"
            onClick={handleQuickDemoSignIn}
            className="w-full py-2.5 px-4 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-round font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span>Quick Demo Sign-in ({defaultName.split(' ')[0]})</span>
          </button>
        </div>

        {/* Remember session checkbox */}
        <div className="mt-4 flex items-center justify-between text-xs font-round">
          <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
            <input
              id="remember-session-checkbox"
              type="checkbox"
              checked={rememberSession}
              onChange={(e) => setRememberSession(e.target.checked)}
              className="rounded text-slate-900 focus:ring-slate-900 w-3.5 h-3.5 border-slate-300 accent-slate-900"
            />
            <span className="text-[11px]">Remember student session</span>
          </label>
        </div>

        {/* Reassuring footer */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-round">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Google Workspace &amp; Firebase Protected</span>
        </div>
      </motion.div>
    </div>
  );
};
