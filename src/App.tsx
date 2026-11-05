import React, { useState, useEffect } from 'react';
import { CourseProvider, useCourse } from './context/CourseContext';
import { Navbar } from './components/Navbar';
import { CourseCatalog } from './components/CourseCatalog';
import { CourseDetailModal } from './components/CourseDetailModal';
import { CoursePlayer } from './components/CoursePlayer';
import { InstructorStudio } from './components/InstructorStudio';
import { VideoUploaderModal } from './components/VideoUploaderModal';
import { StudentTracker } from './components/StudentTracker';
import { StudentDetailModal } from './components/StudentDetailModal';
import { CertificateModal } from './components/CertificateModal';
import { AuthModal } from './components/AuthModal';
import { RolePickerModal } from './components/RolePickerModal';
import { GatewayPage } from './components/GatewayPage';
import { WhitelistManagerModal } from './components/WhitelistManagerModal';
import { Course, StudentRosterItem } from './types';
import { MyLearning } from './components/MyLearning';
import { RotateCcw, GraduationCap } from 'lucide-react';

function AppContent() {
  const {
    role,
    setRole,
    viewMode,
    setViewMode,
    currentUser,
    resetDataToDefaults,
    isRolePickerOpen,
    setIsRolePickerOpen,
  } = useCourse();

  // Show gateway on initial landing unless user has dismissed it or is already signed in
  const [showGateway, setShowGateway] = useState<boolean>(() => {
    return !sessionStorage.getItem('coursecraft_gateway_dismissed');
  });

  const [activeTab, setActiveTab] = useState<'catalog' | 'mylearning' | 'instructor' | 'tracker'>('catalog');
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<Course | null>(null);
  const [selectedCourseForPlayer, setSelectedCourseForPlayer] = useState<Course | null>(null);
  const [selectedCourseForCertificate, setSelectedCourseForCertificate] = useState<Course | null>(null);
  const [inspectedStudent, setInspectedStudent] = useState<StudentRosterItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWhitelistModalOpen, setIsWhitelistModalOpen] = useState(false);
  const [whitelistCourseId, setWhitelistCourseId] = useState<string | undefined>(undefined);

  // If a user signs in via Google or demo from the Gateway, automatically dismiss gateway
  useEffect(() => {
    if (currentUser?.isGoogleUser) {
      setShowGateway(false);
      sessionStorage.setItem('coursecraft_gateway_dismissed', 'true');
    }
  }, [currentUser]);

  const handleDismissGateway = () => {
    setShowGateway(false);
    sessionStorage.setItem('coursecraft_gateway_dismissed', 'true');
  };

  const handleOpenPlayer = (course: Course) => {
    setSelectedCourseForPlayer(course);
  };

  const handleClosePlayer = () => {
    setSelectedCourseForPlayer(null);
  };

  // If gateway is active, render full-screen immersive gateway screen
  if (showGateway) {
    return <GatewayPage onEnterAsGuest={handleDismissGateway} />;
  }

  // Instructor Preview Mode: when instructor chooses student preview, show catalog or mylearning
  const effectiveTab =
    role === 'instructor' && viewMode === 'student_preview' && (activeTab === 'instructor' || activeTab === 'tracker')
      ? 'catalog'
      : activeTab;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Navigation */}
      <Navbar
        activeTab={effectiveTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedCourseForPlayer(null);
        }}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenGateway={() => setShowGateway(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedCourseForPlayer ? (
          <CoursePlayer
            course={selectedCourseForPlayer}
            onBack={handleClosePlayer}
            onOpenCertificate={(course) => setSelectedCourseForCertificate(course)}
          />
        ) : (
          <>
            {effectiveTab === 'catalog' && (
              <CourseCatalog
                onSelectCourse={(course) => setSelectedCourseForModal(course)}
                onOpenPlayer={handleOpenPlayer}
              />
            )}

            {effectiveTab === 'mylearning' && (
              <MyLearning
                onOpenPlayer={handleOpenPlayer}
                onOpenCertificate={(course) => setSelectedCourseForCertificate(course)}
                onBrowseCatalog={() => setActiveTab('catalog')}
              />
            )}

            {effectiveTab === 'instructor' && (
              <InstructorStudio
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
                onNavigateToTracker={() => setActiveTab('tracker')}
                onPreviewCourse={handleOpenPlayer}
                onOpenWhitelistModal={(courseId) => {
                  setWhitelistCourseId(courseId);
                  setIsWhitelistModalOpen(true);
                }}
                onSwitchToStudentPreview={() => {
                  setViewMode('student_preview');
                  setActiveTab('catalog');
                }}
              />
            )}

            {effectiveTab === 'tracker' && (
              <StudentTracker
                onInspectStudent={(item) => setInspectedStudent(item)}
                onOpenWhitelistModal={() => {
                  setWhitelistCourseId(undefined);
                  setIsWhitelistModalOpen(true);
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Global Modals & Authentication Flows */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <RolePickerModal
        isOpen={isRolePickerOpen}
        onClose={() => setIsRolePickerOpen(false)}
      />

      <CourseDetailModal
        course={selectedCourseForModal}
        onClose={() => setSelectedCourseForModal(null)}
        onOpenPlayer={handleOpenPlayer}
      />

      <VideoUploaderModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      <StudentDetailModal
        item={inspectedStudent}
        onClose={() => setInspectedStudent(null)}
      />

      <CertificateModal
        course={selectedCourseForCertificate}
        onClose={() => setSelectedCourseForCertificate(null)}
      />

      <WhitelistManagerModal
        isOpen={isWhitelistModalOpen}
        onClose={() => setIsWhitelistModalOpen(false)}
        initialCourseId={whitelistCourseId}
      />

      {/* Clean Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-700">Coursecraft Academy</span>
            <span aria-hidden="true">·</span>
            <span>Private YouTube Lecture & Gmail Whitelist System</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowGateway(true)}
              className="text-slate-400 hover:text-slate-700 transition-colors"
              title="Return to initial role selection gateway"
            >
              Role Gateway
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => {
                if (window.confirm('Reset all demo courses, student enrollments, and progress back to factory defaults?')) {
                  resetDataToDefaults();
                  window.location.reload();
                }
              }}
              className="text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1"
              title="Reset state to initial sample records"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Demo State</span>
            </button>
            <span aria-hidden="true">·</span>
            <span>© 2026 Coursecraft Systems Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <CourseProvider>
      <AppContent />
    </CourseProvider>
  );
}
