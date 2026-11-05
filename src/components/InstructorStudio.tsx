import React, { useState } from 'react';
import { useCourse } from '../context/CourseContext';
import { Course } from '../types';
import {
  Video,
  Plus,
  Users,
  Clock,
  BookOpen,
  TrendingUp,
  Play,
  Film,
  ShieldCheck,
  Youtube,
  Eye,
  FileText,
} from 'lucide-react';

interface InstructorStudioProps {
  onOpenUploadModal: () => void;
  onNavigateToTracker: () => void;
  onPreviewCourse: (course: Course) => void;
  onOpenWhitelistModal: (courseId?: string) => void;
  onSwitchToStudentPreview: () => void;
}

export const InstructorStudio: React.FC<InstructorStudioProps> = ({
  onOpenUploadModal,
  onNavigateToTracker,
  onPreviewCourse,
  onOpenWhitelistModal,
  onSwitchToStudentPreview,
}) => {
  const { courses, createCourse, createModule } = useCourse();

  // Create course modal state
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<Course['category']>('Web Engineering');
  const [newLevel, setNewLevel] = useState<Course['level']>('Intermediate');
  const [newPrice, setNewPrice] = useState<number>(0);
  const [newIsPrivate, setNewIsPrivate] = useState<boolean>(true);
  const [newInitialEmails, setNewInitialEmails] = useState<string>('ohabjohory@gmail.com');
  const [newThumbnail, setNewThumbnail] = useState<string>(
    '/src/assets/images/course_fullstack_dev_1793900717844.jpg'
  );

  // Selected course to inspect/manage syllabus
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(courses[0]?.id || null);

  // Total metrics
  const totalCourses = courses.length;
  const totalStudents = courses.reduce((acc, c) => acc + c.enrolledCount, 0);
  const totalLessons = courses.reduce(
    (acc, c) => acc + c.modules.reduce((sub, m) => sub + m.lessons.length, 0),
    0
  );
  const totalWhitelistedEmails = Array.from(
    new Set(courses.flatMap((c) => c.allowedStudentEmails || []))
  ).length;

  const handleCreateCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const emails = newInitialEmails
      .split(/[\n,;]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0 && e.includes('@'));

    const newCourse: Course = {
      id: 'course-' + Date.now(),
      title: newTitle.trim(),
      slug: newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      tagline: newTagline.trim() || 'Master practical engineering principles and architecture.',
      description: newDescription.trim() || 'Private cohort technical curriculum with video lectures and lecture sheets.',
      category: newCategory,
      level: newLevel,
      durationHours: 3.0,
      price: Number(newPrice),
      thumbnail: newThumbnail,
      instructor: {
        id: 'inst-1',
        name: 'Dr. Elena Vance',
        title: 'Lead Software Architect & Distinguished Instructor',
        avatar: '/src/assets/images/avatar_instructor_lead_1793900720101.jpg',
        bio: 'Principal distributed systems engineer.',
      },
      enrolledCount: 1,
      rating: 5.0,
      ratingCount: 1,
      updatedAt: new Date().toISOString().split('T')[0],
      isPrivateCohort: newIsPrivate,
      allowedStudentEmails: emails,
      learningObjectives: [
        'Understand foundational system architecture and constraints',
        'Build real-world production implementations',
      ],
      prerequisites: ['Basic programming knowledge'],
      modules: [
        {
          id: 'mod-' + Date.now(),
          title: 'Module 1: Getting Started & Core Architecture',
          order: 1,
          lessons: [],
        },
      ],
    };

    createCourse(newCourse);
    setIsCreatingCourse(false);
    setExpandedCourseId(newCourse.id);
    setNewTitle('');
    setNewTagline('');
    setNewDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Dual-View Mode Controller */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Instructor Administration Console
              </span>
            </div>
            <h1 className="text-2xl font-bold font-display text-slate-900 mt-2">
              Course Management, YouTube & Whitelist Studio
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Upload unlisted YouTube lectures, provide PDF lecture sheets, and manage authorized student Gmail addresses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Dual-View Switcher */}
            <button
              onClick={onSwitchToStudentPreview}
              className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-2 shadow-2xs whitespace-nowrap"
              title="Preview the exact student classroom interface"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              <span>Switch to Student View</span>
            </button>

            <button
              onClick={() => onOpenWhitelistModal()}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Manage Gmail Whitelist</span>
            </button>

            <button
              onClick={onOpenUploadModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs flex items-center gap-2 whitespace-nowrap"
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>Upload YouTube Lecture</span>
            </button>
          </div>
        </div>

        {/* 4-Stat Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="space-y-1">
            <div className="text-xs text-slate-500">Active Curricula</div>
            <div className="text-2xl font-bold font-display tabular-nums text-slate-900">
              {totalCourses}
            </div>
            <div className="text-[11px] text-slate-400">Masterclasses live</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-500">Whitelisted Student Emails</div>
            <div className="text-2xl font-bold font-display tabular-nums text-indigo-600">
              {totalWhitelistedEmails}
            </div>
            <div className="text-[11px] text-slate-400">Authorized student Gmails</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-500">YouTube Video Lectures</div>
            <div className="text-2xl font-bold font-display tabular-nums text-rose-600">
              {totalLessons}
            </div>
            <div className="text-[11px] text-slate-400">Unlisted streams & clips</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-500">Total Enrolled Students</div>
            <div className="text-2xl font-bold font-display tabular-nums text-slate-900">
              {totalStudents}
            </div>
            <div className="text-[11px] text-slate-400">Across all private cohorts</div>
          </div>
        </div>
      </div>

      {/* Course List & Syllabus Inspector */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold font-display text-slate-900">
            Active Masterclasses ({courses.length})
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreatingCourse(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Launch New Masterclass</span>
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <button
              onClick={onNavigateToTracker}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Student Progress Tracker</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {courses.map((course) => {
            const isExpanded = expandedCourseId === course.id;
            const lessonCount = course.modules.flatMap((m) => m.lessons).length;

            return (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs transition-all"
              >
                {/* Course Header Bar */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      referrerPolicy="no-referrer"
                      className="w-20 h-14 rounded-lg object-cover bg-slate-900 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{course.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{course.durationHours} hrs</span>
                        {course.isPrivateCohort && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-indigo-600 font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Private ({course.allowedStudentEmails?.length || 0} Gmails)</span>
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="font-display font-semibold text-base text-slate-900 mt-0.5">
                        {course.title}
                      </h3>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                        <span className="font-mono tabular-nums font-semibold text-slate-700">
                          {course.enrolledCount} Active Students
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{course.modules.length} Modules</span>
                        <span aria-hidden="true">·</span>
                        <span>{lessonCount} Lectures</span>
                      </div>
                    </div>
                  </div>

                  {/* Course Quick Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => onOpenWhitelistModal(course.id)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                      title="Manage allowed student Gmail addresses"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Whitelist ({course.allowedStudentEmails?.length || 0})</span>
                    </button>

                    <button
                      onClick={() => onPreviewCourse(course)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Classroom Player</span>
                    </button>

                    <button
                      onClick={onOpenUploadModal}
                      className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Youtube className="w-3.5 h-3.5" />
                      <span>Add Video</span>
                    </button>

                    <button
                      onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      {isExpanded ? 'Hide' : 'Syllabus'}
                    </button>
                  </div>
                </div>

                {/* Expanded Modules & Video Lectures */}
                {isExpanded && (
                  <div className="bg-slate-50 p-4 sm:p-6 border-t border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Course Modules, YouTube Videos & Lecture Sheets
                      </h4>
                      <button
                        onClick={onOpenUploadModal}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add YouTube Lecture to this Course</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {course.modules.map((mod) => (
                        <div
                          key={mod.id}
                          className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                        >
                          <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-800">
                            <span>{mod.title}</span>
                            <span className="font-mono text-slate-500 tabular-nums">
                              {mod.lessons.length} {mod.lessons.length === 1 ? 'lecture' : 'lectures'}
                            </span>
                          </div>

                          <div className="divide-y divide-slate-100">
                            {mod.lessons.length === 0 ? (
                              <div className="p-4 text-center text-xs text-slate-400">
                                No video lectures added yet. Click &quot;Add YouTube Lecture&quot; to attach your first video and lecture sheet.
                              </div>
                            ) : (
                              mod.lessons.map((lesson) => (
                                <div
                                  key={lesson.id}
                                  className="p-3 text-xs flex items-center justify-between hover:bg-slate-50/60 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    {lesson.videoType === 'youtube' ? (
                                      <Youtube className="w-4 h-4 text-rose-600 shrink-0" />
                                    ) : (
                                      <Video className="w-4 h-4 text-indigo-600 shrink-0" />
                                    )}
                                    <div>
                                      <div className="font-medium text-slate-900">{lesson.title}</div>
                                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                        <span className="font-mono tabular-nums">{lesson.durationMinutes} min</span>
                                        {lesson.pdfLectureSheet && (
                                          <span className="text-emerald-600 flex items-center gap-0.5">
                                            <FileText className="w-3 h-3" />
                                            <span>Attached PDF Sheet</span>
                                          </span>
                                        )}
                                        {lesson.youtubeVideoId && (
                                          <span className="font-mono text-slate-400">
                                            ID: {lesson.youtubeVideoId}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                      {lesson.videoType}
                                    </span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Launch New Masterclass Modal */}
      {isCreatingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-display font-bold text-base text-slate-900">
                Launch New Private Masterclass
              </h3>
              <button
                onClick={() => setIsCreatingCourse(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourseSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Course Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems & High-Concurrency Architecture"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Tagline:</label>
                <input
                  type="text"
                  placeholder="Short summary for enrolled students..."
                  value={newTagline}
                  onChange={(e) => setNewTagline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Web Engineering">Web Engineering</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Design Systems">Design Systems</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Level:</label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Private Cohort Toggle & Whitelist Initial Input */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="private-cohort"
                    checked={newIsPrivate}
                    onChange={(e) => setNewIsPrivate(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <label htmlFor="private-cohort" className="font-semibold text-slate-800 cursor-pointer">
                    Private Cohort (Restricted to Authorized Gmails only)
                  </label>
                </div>

                {newIsPrivate && (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Initial Authorized Student Gmails (comma separated):
                    </label>
                    <input
                      type="text"
                      placeholder="student1@gmail.com, student2@gmail.com, ohabjohory@gmail.com"
                      value={newInitialEmails}
                      onChange={(e) => setNewInitialEmails(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-[11px]"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingCourse(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Save & Add YouTube Lectures
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
