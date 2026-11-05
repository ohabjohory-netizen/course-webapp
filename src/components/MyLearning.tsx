import React from 'react';
import { useCourse } from '../context/CourseContext';
import { Course } from '../types';
import { Play, Award, CheckCircle2, BookOpen, Clock, ArrowRight } from 'lucide-react';

interface MyLearningProps {
  onOpenPlayer: (course: Course) => void;
  onOpenCertificate: (course: Course) => void;
  onBrowseCatalog: () => void;
}

export const MyLearning: React.FC<MyLearningProps> = ({
  onOpenPlayer,
  onOpenCertificate,
  onBrowseCatalog,
}) => {
  const { currentStudent, courses, getProgress } = useCourse();

  const enrolledCourses = courses.filter((c) =>
    currentStudent.enrolledCourseIds.includes(c.id)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-indigo-600 font-semibold">
              Student Dashboard
            </div>
            <h1 className="text-2xl font-bold font-display text-slate-900 mt-1">
              My Active Learning & Enrollments
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Resume video lectures where you left off, review notes, and download certificates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono tabular-nums text-slate-500">
              {enrolledCourses.length} Enrolled {enrolledCourses.length === 1 ? 'Course' : 'Courses'}
            </span>
          </div>
        </div>
      </div>

      {enrolledCourses.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-xl border border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            You are not currently enrolled in any courses
          </h3>
          <p className="text-xs text-slate-500 mb-5 max-w-sm mx-auto">
            Explore our curriculum masterclasses in Web Engineering, Data Science, Design Systems, and Cloud DevOps.
          </p>
          <button
            onClick={onBrowseCatalog}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            Explore Course Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrolledCourses.map((course) => {
            const progress = getProgress(course.id);
            const allLessons = course.modules.flatMap((m) => m.lessons);
            const totalLessons = allLessons.length;
            const completedLessons = progress?.completedLessonIds.length || 0;
            const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
            const currentLesson = allLessons.find((l) => l.id === progress?.currentLessonId) || allLessons[0];
            const isFinished = percent === 100;

            return (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute top-3 right-3">
                      {isFinished ? (
                        <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-600 text-white rounded-md flex items-center gap-1 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mastery Achieved
                        </span>
                      ) : (
                        <span className="text-xs font-mono tabular-nums font-semibold px-2.5 py-1 bg-slate-900/80 text-indigo-300 rounded-md backdrop-blur-xs">
                          {percent}% Complete
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="text-[11px] text-slate-300">{course.category}</div>
                      <h3 className="font-display font-bold text-base text-white truncate">
                        {course.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-mono tabular-nums font-semibold text-slate-800">
                          {completedLessons} of {totalLessons} lessons completed
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isFinished ? 'bg-emerald-600' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Up Next Lesson Card */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="text-[11px] text-indigo-600 font-mono font-medium">
                        {isFinished ? 'Completed Course' : 'Up Next'}
                      </div>
                      <div className="font-semibold text-slate-900 truncate">
                        {currentLesson?.title || 'Course Conclusion'}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{currentLesson?.durationMinutes || 15} minutes</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center gap-2">
                  <button
                    onClick={() => onOpenPlayer(course)}
                    className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{isFinished ? 'Review Lectures' : 'Resume Lecture'}</span>
                  </button>

                  {isFinished && (
                    <button
                      onClick={() => onOpenCertificate(course)}
                      className="py-2.5 px-3.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5"
                      title="View Official Certificate"
                    >
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span>Certificate</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
