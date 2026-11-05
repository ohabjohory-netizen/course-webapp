import React from 'react';
import { useCourse } from '../context/CourseContext';
import { GraduationCap, Video, CheckCircle2, ShieldCheck, Youtube, FileText, ArrowRight, Sparkles } from 'lucide-react';

interface GatewayPageProps {
  onEnterAsGuest: () => void;
}

export const GatewayPage: React.FC<GatewayPageProps> = ({ onEnterAsGuest }) => {
  const { signInWithGoogle, loginAsDemoStudent, loginAsDemoInstructor, isAuthLoading } = useCourse();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-amber-500/5 blur-[100px] pointer-events-none rounded-full" />

      {/* Top Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-display font-bold text-lg tracking-tight text-white">
              Coursecraft
            </span>
            <span className="text-[11px] text-slate-400 block font-mono">
              Private Cohort Learning Portal
            </span>
          </div>
        </div>

        <button
          onClick={onEnterAsGuest}
          className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-slate-800"
        >
          <span>Explore Public Catalog</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Center Gateway Selection Deck */}
      <main className="relative z-10 max-w-5xl mx-auto w-full px-6 py-8 my-auto space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Gmail-Keyed Private Access Gateway</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            How would you like to access Coursecraft today?
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Select your primary role to sign in with your Google account. Course permissions and unlisted YouTube lecture access will be automatically linked to your Gmail.
          </p>
        </div>

        {/* 2-Card Gateway Deck */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Card 1: Student Option */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/80 p-6 sm:p-8 flex flex-col justify-between hover:border-indigo-500/60 transition-all duration-300 group shadow-lg">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-semibold bg-indigo-950 px-2.5 py-1 rounded-md border border-indigo-900">
                  Student Portal
                </span>
              </div>

              <div>
                <h3 className="font-display font-bold text-xl text-white">
                  I am a Student
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Join private cohorts, stream unlisted YouTube video lectures, study in-app PDF lecture sheets, take timestamped notes, and earn verified mastery certificates.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-700/60 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Youtube className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Unlisted YouTube video lecture playback</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Interactive PDF lecture sheets & notes viewer</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Access verified against instructor&apos;s Gmail whitelist</span>
                </div>
              </div>
            </div>

            <div className="pt-8 space-y-3">
              <button
                disabled={isAuthLoading}
                onClick={() => signInWithGoogle('student')}
                className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-3 group-hover:shadow-indigo-500/20"
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
                <span>Sign In with Google as Student</span>
              </button>

              <button
                type="button"
                onClick={loginAsDemoStudent}
                className="w-full text-center text-[11px] text-slate-400 hover:text-slate-200 transition-colors py-1"
              >
                Instant Test: Continue as Demo Student (Alex Rivera)
              </button>
            </div>
          </div>

          {/* Card 2: Instructor Option */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/80 p-6 sm:p-8 flex flex-col justify-between hover:border-amber-500/60 transition-all duration-300 group shadow-lg">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Video className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold bg-amber-950 px-2.5 py-1 rounded-md border border-amber-900">
                  Instructor Admin
                </span>
              </div>

              <div>
                <h3 className="font-display font-bold text-xl text-white">
                  I am an Instructor
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Manage masterclasses, embed unlisted YouTube playlist videos, upload PDF lecture sheets, maintain student Gmail whitelist access, and view student progress.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-700/60 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Dual-View Switcher: Toggle between Admin and Student Preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <Youtube className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Embed unlisted YouTube lectures or record webcam</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Private Gmail Whitelist Access Controller</span>
                </div>
              </div>
            </div>

            <div className="pt-8 space-y-3">
              <button
                disabled={isAuthLoading}
                onClick={() => signInWithGoogle('instructor')}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-3"
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
                <span>Sign In as Instructor (Gmail)</span>
              </button>

              <button
                type="button"
                onClick={loginAsDemoInstructor}
                className="w-full text-center text-[11px] text-slate-400 hover:text-slate-200 transition-colors py-1"
              >
                Instant Test: Continue as Demo Instructor (Dr. Elena Vance)
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 text-center text-xs text-slate-500">
        Coursecraft Academic LMS · Private YouTube Stream & Lecture Sheet Delivery System · © 2026
      </footer>
    </div>
  );
};
