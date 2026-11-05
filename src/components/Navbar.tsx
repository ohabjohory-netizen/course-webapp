import React, { useState } from 'react';
import { useCourse } from '../context/CourseContext';
import {
  GraduationCap,
  Video,
  Users,
  LogOut,
  ChevronDown,
  Eye,
  LayoutDashboard,
  HelpCircle,
  ShieldCheck,
  Youtube,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'catalog' | 'mylearning' | 'instructor' | 'tracker';
  setActiveTab: (tab: 'catalog' | 'mylearning' | 'instructor' | 'tracker') => void;
  onOpenUploadModal?: () => void;
  onOpenAuthModal: () => void;
  onOpenGateway: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenUploadModal,
  onOpenAuthModal,
  onOpenGateway,
}) => {
  const {
    role,
    setRole,
    viewMode,
    setViewMode,
    currentStudent,
    currentUser,
    signOutUser,
    setIsRolePickerOpen,
  } = useCourse();
  const enrolledCount = currentStudent.enrolledCourseIds.length;
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isInstructor = role === 'instructor';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Instructor Student Preview Banner if active */}
      {isInstructor && viewMode === 'student_preview' && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs flex items-center justify-between font-medium">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>
                <strong>Student Classroom Preview Active</strong> — Viewing courses exactly as whitelisted students experience them.
              </span>
            </span>
            <button
              onClick={() => setViewMode('admin')}
              className="px-2.5 py-0.5 bg-slate-950 text-white rounded text-[11px] font-semibold hover:bg-slate-800 transition-colors shrink-0"
            >
              Exit Preview & Return to Admin
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single text element) */}
        <button
          onClick={() => setActiveTab('catalog')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition-colors">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            Coursecraft
          </span>
        </button>

        {/* Zone 2: 4 single-line text navigation links */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'catalog'
                ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Course Catalog
          </button>

          <button
            onClick={() => setActiveTab('mylearning')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'mylearning'
                ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>My Learning</span>
            {enrolledCount > 0 && (
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                ({enrolledCount})
              </span>
            )}
          </button>

          {/* Instructor Tabs */}
          {isInstructor && (
            <>
              <button
                onClick={() => {
                  setViewMode('admin');
                  setActiveTab('instructor');
                }}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
                  activeTab === 'instructor'
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-slate-400" />
                <span>Instructor Studio</span>
              </button>

              <button
                onClick={() => {
                  setViewMode('admin');
                  setActiveTab('tracker');
                }}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
                  activeTab === 'tracker'
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Student Tracker</span>
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: 1 primary action & Dual-View / User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Dual-View Switcher for Instructors */}
          {isInstructor && (
            <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setViewMode('admin')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  viewMode === 'admin'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3 h-3 text-indigo-600" />
                <span>Admin View</span>
              </button>

              <button
                onClick={() => setViewMode('student_preview')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  viewMode === 'student_preview'
                    ? 'bg-amber-400 text-slate-950 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Preview portal from student perspective"
              >
                <Eye className="w-3 h-3" />
                <span>Student Preview</span>
              </button>
            </div>
          )}

          {isInstructor && onOpenUploadModal ? (
            <button
              onClick={onOpenUploadModal}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors shadow-2xs flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>Add YouTube Video</span>
            </button>
          ) : null}

          {/* User Profile / Google Sign In */}
          {currentUser && currentUser.isGoogleUser ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full object-cover bg-slate-200"
                />
                <span className="text-xs font-medium text-slate-800 max-w-[100px] truncate">
                  {currentUser.name}
                </span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded capitalize ${
                    role === 'instructor'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {role}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="font-semibold text-slate-900 truncate">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">
                      {currentUser.email}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setRole(role === 'student' ? 'instructor' : 'student');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                    >
                      <span>Switch to {role === 'student' ? 'Instructor' : 'Student'} Role</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenGateway();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50"
                    >
                      Gateway Onboarding Page
                    </button>
                  </div>

                  <div className="border-t border-slate-100 py-1">
                    <button
                      onClick={() => {
                        signOutUser();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuthModal}
                className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-all shadow-2xs flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
                <span>Sign In (Gmail)</span>
              </button>

              <button
                onClick={onOpenGateway}
                title="Open Role Selection Gateway"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
