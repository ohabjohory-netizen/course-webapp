import React, { useState } from 'react';
import { Course } from '../types';
import { useCourse } from '../context/CourseContext';
import { X, Check, Clock, BookOpen, User, Play, ShieldCheck, Award } from 'lucide-react';

interface CourseDetailModalProps {
  course: Course | null;
  onClose: () => void;
  onOpenPlayer: (course: Course) => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  onClose,
  onOpenPlayer,
}) => {
  const { isEnrolled, enrollCourse } = useCourse();
  const [isProcessing, setIsProcessing] = useState(false);
  const [justEnrolled, setJustEnrolled] = useState(false);

  if (!course) return null;

  const enrolled = isEnrolled(course.id);
  const totalLessons = course.modules.flatMap((m) => m.lessons).length;

  const handleEnroll = () => {
    setIsProcessing(true);
    setTimeout(() => {
      enrollCourse(course.id);
      setIsProcessing(false);
      setJustEnrolled(true);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8">
        {/* Header / Media Hero */}
        <div className="relative aspect-21/9 w-full bg-slate-900 overflow-hidden">
          <img
            src={course.thumbnail}
            alt={course.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/80 flex items-center justify-center transition-colors backdrop-blur-xs"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Title overlay */}
          <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span>{course.category}</span>
              <span aria-hidden="true">·</span>
              <span>{course.level}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{course.durationHours} hours</span>
            </div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
              {course.title}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Tagline & Overview */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-1">About This Masterclass</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{course.description}</p>
          </div>

          {/* What You Will Master */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Key Learning Objectives</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {course.learningObjectives.map((obj, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum Structure */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-900">Curriculum & Video Modules</h4>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                {course.modules.length} Modules · {totalLessons} Lessons
              </span>
            </div>

            <div className="space-y-3">
              {course.modules.map((mod) => (
                <div key={mod.id} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 text-xs font-semibold text-slate-800 flex items-center justify-between">
                    <span>{mod.title}</span>
                    <span className="text-slate-500 font-mono tabular-nums">
                      {mod.lessons.length} {mod.lessons.length === 1 ? 'lesson' : 'lessons'}
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 bg-white">
                    {mod.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="p-3 text-xs flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Play className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="font-medium text-slate-800">{lesson.title}</span>
                          {lesson.isFreePreview && (
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                              Preview
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400 font-mono tabular-nums whitespace-nowrap">
                          {lesson.durationMinutes} min
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructor Bio */}
          <div className="pt-4 border-t border-slate-100 flex items-start gap-4">
            <img
              src={course.instructor.avatar}
              alt={course.instructor.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full object-cover bg-slate-200 shrink-0"
            />
            <div className="space-y-1">
              <div className="text-xs text-slate-500">Instructor</div>
              <div className="text-sm font-bold text-slate-900">{course.instructor.name}</div>
              <div className="text-xs text-indigo-600 font-medium">{course.instructor.title}</div>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">{course.instructor.bio}</p>
            </div>
          </div>
        </div>

        {/* Modal Footer / Checkout Simulation Bar */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-slate-600 w-full sm:w-auto">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Full Lifetime Access</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-slate-400" />
              <span>Certificate Included</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {enrolled || justEnrolled ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenPlayer(course);
                }}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>Launch Classroom Player</span>
                <Play className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="text-right">
                  <div className="text-xs text-slate-500">Tuition Fee</div>
                  <div className="text-base font-bold font-mono tabular-nums text-slate-900">
                    {course.price === 0 ? 'Free' : `$${course.price} USD`}
                  </div>
                </div>
                <button
                  disabled={isProcessing}
                  onClick={handleEnroll}
                  className="flex-1 sm:flex-none px-6 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors shadow-sm whitespace-nowrap"
                >
                  {isProcessing ? 'Enrolling...' : 'Confirm Enrollment'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
