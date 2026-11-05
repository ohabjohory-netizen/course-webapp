import React, { useState } from 'react';
import { StudentRosterItem } from '../types';
import {
  X,
  CheckCircle2,
  Circle,
  Clock,
  Award,
  HelpCircle,
  Bookmark,
  Send,
  MessageSquare,
} from 'lucide-react';

interface StudentDetailModalProps {
  item: StudentRosterItem | null;
  onClose: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ item, onClose }) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  if (!item) return null;

  const { student, progress, course, percentComplete } = item;
  const allLessons = course.modules.flatMap((m) => m.lessons);

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackText('');
      setFeedbackSent(false);
    }, 2000);
  };

  const formatSeconds = (totalSec: number) => {
    if (!totalSec || isNaN(totalSec)) return '0:00';
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src={student.avatar}
              alt={student.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full object-cover bg-slate-200 border border-slate-200"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg text-slate-900">{student.name}</h3>
                {percentComplete === 100 && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Award className="w-3 h-3 text-emerald-600" />
                    Completed
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 font-mono">{student.email}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Enrolled: {progress.enrolledAt} · Last Active: {progress.lastActiveAt}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Course Overview Strip */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-800">{course.title}</span>
              <span className="font-mono font-bold text-indigo-600 tabular-nums">
                {percentComplete}% Complete
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  percentComplete === 100 ? 'bg-emerald-600' : 'bg-indigo-600'
                }`}
                style={{ width: `${percentComplete}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>
                {item.completedLessonsCount} of {item.totalLessons} lessons completed
              </span>
              <span>Avg Quiz Score: {item.avgQuizScore}%</span>
            </div>
          </div>

          {/* Detailed Per-Lesson Progress Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Lecture Watch Logs & Checkpoints
            </h4>

            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden text-xs">
              {allLessons.map((lesson) => {
                const isLessonComplete = progress.completedLessonIds.includes(lesson.id);
                const watchedSec = progress.videoWatchSeconds[lesson.id] || 0;
                const quizScore = progress.quizScores[lesson.id];

                return (
                  <div key={lesson.id} className="p-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isLessonComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                      <div className="truncate">
                        <div className="font-medium text-slate-800 truncate">{lesson.title}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Lesson Length: {lesson.durationMinutes} min
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 space-y-0.5">
                      <div className="font-mono text-slate-700 tabular-nums">
                        {isLessonComplete
                          ? '100% Watched'
                          : watchedSec > 0
                          ? `Watched ${formatSeconds(watchedSec)}`
                          : 'Not Started'}
                      </div>
                      {quizScore !== undefined && (
                        <div
                          className={`text-[11px] font-mono ${
                            quizScore === 100 ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          Checkpoint: {quizScore}%
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Student Lecture Notes */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
              <span>Student Timestamped Notes ({progress.notes?.length || 0})</span>
            </h4>

            {!progress.notes || progress.notes.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs text-slate-400">
                No personal notes taken by this student yet.
              </div>
            ) : (
              <div className="space-y-2">
                {progress.notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-mono font-semibold text-indigo-600">
                        Timestamp {formatSeconds(note.timestampSeconds)}
                      </span>
                      <span className="text-slate-400 font-mono">{note.createdAt}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{note.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructor Feedback Direct Message Form */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Send Instructor Direct Guidance</span>
            </h4>

            <form onSubmit={handleSendFeedback} className="space-y-2">
              <textarea
                rows={2}
                placeholder={`Leave personalized technical guidance or review for ${student.name}...`}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex justify-between items-center">
                {feedbackSent ? (
                  <span className="text-xs text-emerald-600 font-medium">
                    Feedback delivered to {student.name}!
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Delivered directly to student notification feed
                  </span>
                )}
                <button
                  type="submit"
                  disabled={!feedbackText.trim()}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  <span>Send Guidance</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/70 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
