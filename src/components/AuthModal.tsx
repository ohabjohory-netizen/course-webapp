import React from 'react';
import { useCourse } from '../context/CourseContext';
import { X, GraduationCap, Video, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signInWithGoogle, isAuthLoading, loginAsDemoStudent, loginAsDemoInstructor } = useCourse();

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8 p-6 sm:p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-sm">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="font-display font-bold text-2xl text-slate-900">
            Welcome to Coursecraft
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Log in to enroll in technical masterclasses, resume video lectures, and track verified credentials.
          </p>
        </div>

        {/* Primary Action: 1-Click Google Sign-In */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={isAuthLoading}
            className="w-full py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-3 group disabled:opacity-50"
          >
            {/* Official Google G Logo */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
            <span className="text-slate-800 group-hover:text-black">
              {isAuthLoading ? 'Opening Google Sign-In...' : 'Continue with Google Account'}
            </span>
          </button>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 justify-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Free · No credit card required · Instant access</span>
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-slate-400 font-mono">
            Or Test Fast Demo Accounts
          </span>
        </div>

        {/* Quick Demo Switchers */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => {
              loginAsDemoStudent();
              onClose();
            }}
            className="p-3 text-left rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition-colors text-xs space-y-1"
          >
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Student Demo</span>
            </div>
            <div className="text-[11px] text-slate-500">Alex Rivera (Enrolled)</div>
          </button>

          <button
            onClick={() => {
              loginAsDemoInstructor();
              onClose();
            }}
            className="p-3 text-left rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 transition-colors text-xs space-y-1"
          >
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-amber-600" />
              <span>Instructor Demo</span>
            </div>
            <div className="text-[11px] text-slate-500">Dr. Elena Vance (Lead)</div>
          </button>
        </div>
      </div>
    </div>
  );
};
