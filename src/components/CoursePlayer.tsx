import React, { useState, useRef, useEffect } from 'react';
import { Course, Lesson, StudentProgress } from '../types';
import { useCourse, extractYouTubeId } from '../context/CourseContext';
import {
  Play,
  Pause,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Volume2,
  VolumeX,
  FileText,
  HelpCircle,
  ListOrdered,
  Download,
  Award,
  BookmarkPlus,
  Trash2,
  RotateCcw,
  Youtube,
  ShieldAlert,
  Mail,
  Check,
  BookOpen,
} from 'lucide-react';

interface CoursePlayerProps {
  course: Course;
  onBack: () => void;
  onOpenCertificate: (course: Course) => void;
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({ course, onBack, onOpenCertificate }) => {
  const {
    getProgress,
    updateLessonProgress,
    toggleLessonComplete,
    submitQuizScore,
    addStudentNote,
    deleteStudentNote,
    isCourseAuthorizedForUser,
    currentUser,
    addStudentEmailToWhitelist,
  } = useCourse();

  const isAuthorized = isCourseAuthorizedForUser(course);
  const [accessRequested, setAccessRequested] = useState(false);

  const progress = getProgress(course.id);
  const allLessons = course.modules.flatMap((m) => m.lessons);

  // Active lesson selection
  const [activeLessonId, setActiveLessonId] = useState<string>(() => {
    if (progress?.currentLessonId && allLessons.some((l) => l.id === progress.currentLessonId)) {
      return progress.currentLessonId;
    }
    return allLessons[0]?.id || '';
  });

  const activeLesson: Lesson | undefined = allLessons.find((l) => l.id === activeLessonId) || allLessons[0];

  // Video playback state (for native MP4)
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Tabs: overview, sheet, notes, quiz
  const [activeTab, setActiveTab] = useState<'overview' | 'sheet' | 'notes' | 'quiz'>('sheet');
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});

  // Detect YouTube ID
  const effectiveYoutubeId =
    activeLesson?.youtubeVideoId || (activeLesson ? extractYouTubeId(activeLesson.videoUrl) : null);
  const isYouTube = activeLesson?.videoType === 'youtube' || Boolean(effectiveYoutubeId);

  // Sync native video time updates
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isYouTube) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
      if (video.currentTime > 2 && activeLesson) {
        updateLessonProgress(course.id, activeLesson.id, video.currentTime, false);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (activeLesson) {
        updateLessonProgress(course.id, activeLesson.id, video.duration || currentTime, true);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [activeLesson, course.id, updateLessonProgress, isYouTube, currentTime]);

  const handleSelectLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    if (!isYouTube && videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const jumpToSeconds = (seconds: number) => {
    if (!isYouTube && videoRef.current) {
      videoRef.current.currentTime = seconds;
      setCurrentTime(seconds);
      if (!isPlaying) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentIndex = allLessons.findIndex((l) => l.id === activeLessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const isCurrentLessonComplete = progress?.completedLessonIds.includes(activeLesson?.id || '') || false;
  const totalCompleted = progress?.completedLessonIds.length || 0;
  const progressPercent = allLessons.length > 0 ? Math.round((totalCompleted / allLessons.length) * 100) : 0;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !activeLesson) return;
    addStudentNote(course.id, activeLesson.id, Math.floor(currentTime), newNoteText.trim());
    setNewNoteText('');
  };

  const handleQuizSubmit = (questionId: string, correctIdx: number) => {
    const chosen = selectedQuizAnswers[questionId];
    if (chosen === undefined) return;
    setQuizSubmitted((prev) => ({ ...prev, [questionId]: true }));
    const isCorrect = chosen === correctIdx;
    submitQuizScore(course.id, activeLesson?.id || '', isCorrect ? 100 : 0);
  };

  const handleRequestAccess = () => {
    if (currentUser?.email) {
      addStudentEmailToWhitelist(course.id, currentUser.email);
      setAccessRequested(true);
    }
  };

  // If user is not whitelisted for private course
  if (!isAuthorized && !accessRequested) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="font-display font-bold text-xl text-slate-900">
            Private Cohort Access Required
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            This masterclass is restricted to authorized student Gmail addresses. Your current account{' '}
            <strong className="text-slate-900 font-mono">{currentUser?.email || 'Guest'}</strong> is not yet whitelisted on the private course roster.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-1 max-w-md mx-auto">
          <div className="font-semibold text-slate-800">What should you do?</div>
          <div className="text-slate-500">
            1. Click the button below to automatically request authorization with your Gmail.
          </div>
          <div className="text-slate-500">
            2. Contact the instructor ({course.instructor.name}) to verify enrollment.
          </div>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
          >
            Return to Catalog
          </button>
          <button
            onClick={handleRequestAccess}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs flex items-center gap-2"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Instant Self-Authorize Demo ({currentUser?.email || 'My Gmail'})</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top back navigation and Course Info bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Return to Catalog"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
              <span>{course.category}</span>
              {course.isPrivateCohort && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-indigo-600 font-medium">Private Cohort</span>
                </>
              )}
            </div>
            <h1 className="font-display text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {course.title}
            </h1>
          </div>
        </div>

        {/* Progress & Certificate trigger */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-500">Course Progress</div>
            <div className="text-xs font-mono font-semibold tabular-nums text-indigo-600">
              {totalCompleted} of {allLessons.length} lessons ({progressPercent}%)
            </div>
          </div>

          {progressPercent === 100 ? (
            <button
              onClick={() => onOpenCertificate(course)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <Award className="w-4 h-4" />
              <span>View Certificate</span>
            </button>
          ) : (
            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Classroom Split: Video & Details on Left, Module Syllabus on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Video Player & Tabs (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Video Container: YouTube Iframe or HTML5 Video */}
          <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden shadow-sm group">
            {isYouTube && effectiveYoutubeId ? (
              <div className="w-full h-full">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${effectiveYoutubeId}?autoplay=1&enablejsapi=1&rel=0`}
                  title={activeLesson?.title || 'YouTube Video Player'}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : activeLesson ? (
              <>
                <video
                  ref={videoRef}
                  src={activeLesson.videoUrl}
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={togglePlay}
                  playsInline
                  preload="metadata"
                />

                {/* Video Controls Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 opacity-95 transition-opacity">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={(e) => {
                      const time = parseFloat(e.target.value);
                      setCurrentTime(time);
                      if (videoRef.current) videoRef.current.currentTime = time;
                    }}
                    className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:h-1.5 transition-all"
                  />

                  <div className="flex items-center justify-between text-white text-xs pt-3">
                    <div className="flex items-center gap-3">
                      <button onClick={togglePlay} className="p-1 hover:text-indigo-400">
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                      </button>
                      <span className="font-mono tabular-nums text-slate-300 text-xs">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {[1, 1.25, 1.5].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => {
                            setPlaybackSpeed(spd);
                            if (videoRef.current) videoRef.current.playbackRate = spd;
                          }}
                          className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                            playbackSpeed === spd ? 'bg-indigo-600 text-white' : 'text-slate-300'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                No video available
              </div>
            )}
          </div>

          {/* Lesson Action Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs text-indigo-600 font-mono font-medium flex items-center gap-1.5">
                {isYouTube ? (
                  <span className="text-rose-600 flex items-center gap-1 font-semibold">
                    <Youtube className="w-3.5 h-3.5" />
                    <span>YouTube Lecture Stream</span>
                  </span>
                ) : (
                  <span>Curriculum Lesson</span>
                )}
              </div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                {activeLesson?.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => activeLesson && toggleLessonComplete(course.id, activeLesson.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  isCurrentLessonComplete
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 ${isCurrentLessonComplete ? 'text-emerald-600' : 'text-slate-400'}`}
                />
                <span>{isCurrentLessonComplete ? 'Lesson Completed' : 'Mark Lesson Complete'}</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  disabled={!prevLesson}
                  onClick={() => prevLesson && handleSelectLesson(prevLesson.id)}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 text-slate-700"
                  title="Previous Lesson"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={!nextLesson}
                  onClick={() => nextLesson && handleSelectLesson(nextLesson.id)}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 text-slate-700"
                  title="Next Lesson"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Lesson Tabs: PDF Lecture Sheet, Overview, Notes, Quiz */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center border-b border-slate-200 px-4 bg-slate-50/50 overflow-x-auto">
              <button
                onClick={() => setActiveTab('sheet')}
                className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'sheet'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF Lecture Sheet & Notes</span>
                {activeLesson?.pdfLectureSheet && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Timestamps & Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('notes')}
                className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'notes'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>My Notes ({progress?.notes?.length || 0})</span>
              </button>

              {activeLesson?.quiz && activeLesson.quiz.length > 0 && (
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'quiz'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Checkpoint Quiz</span>
                </button>
              )}
            </div>

            <div className="p-5">
              {/* Tab: PDF Lecture Sheet Viewer */}
              {activeTab === 'sheet' && (
                <div className="space-y-5">
                  {activeLesson?.pdfLectureSheet ? (
                    <div className="space-y-5">
                      {/* Sheet Header Card */}
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-display font-bold text-sm text-slate-900">
                              {activeLesson.pdfLectureSheet.title}
                            </h3>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              {activeLesson.pdfLectureSheet.fileSize || '2.4 MB'} ·{' '}
                              {activeLesson.pdfLectureSheet.pagesCount || 10} Pages · Verified Reference
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            alert(
                              `Initiating PDF Download: ${activeLesson.pdfLectureSheet?.title}.pdf`
                            );
                          }}
                          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2 shadow-xs shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF Sheet</span>
                        </button>
                      </div>

                      {/* Summary Abstract */}
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                          Lecture Executive Summary
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {activeLesson.pdfLectureSheet.summary}
                        </p>
                      </div>

                      {/* Key Takeaways */}
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                          Key Architectural Takeaways & Theorems
                        </h4>
                        <div className="space-y-2">
                          {activeLesson.pdfLectureSheet.keyTakeaways.map((takeaway, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-200 flex items-start gap-2.5 text-xs text-slate-800"
                            >
                              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{takeaway}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sample Formulas / Notes Box */}
                      {activeLesson.pdfLectureSheet.sampleNotesContent && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                            Formulas, Queuing Laws & Cheat Sheet
                          </h4>
                          <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono leading-relaxed overflow-x-auto">
                            {activeLesson.pdfLectureSheet.sampleNotesContent}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-xs text-slate-400">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      No specific PDF lecture sheet attached to this lecture yet.
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Overview & Timestamps */}
              {activeTab === 'overview' && (
                <div className="space-y-5 text-xs">
                  <div>
                    <h3 className="font-semibold text-slate-900 uppercase tracking-wider mb-1">
                      Lesson Guidance
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {activeLesson?.description}
                    </p>
                  </div>

                  {activeLesson?.timestamps && (
                    <div className="pt-3 border-t border-slate-100">
                      <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                        <ListOrdered className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Interactive Video Chapters</span>
                      </h3>
                      <div className="space-y-1.5">
                        {activeLesson.timestamps.map((ts, idx) => (
                          <button
                            key={idx}
                            onClick={() => jumpToSeconds(ts.timeSeconds)}
                            className="w-full text-left p-2 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-colors flex items-center justify-between group"
                          >
                            <span className="text-slate-700 group-hover:text-indigo-900 font-medium">
                              {ts.label}
                            </span>
                            <span className="font-mono tabular-nums text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                              {formatTime(ts.timeSeconds)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Notes */}
              {activeTab === 'notes' && (
                <div className="space-y-4 text-xs">
                  <form onSubmit={handleAddNote} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Write a personal note or takeaway..."
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="submit"
                        disabled={!newNoteText.trim()}
                        className="px-3.5 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Save Note
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2 pt-2">
                    {!progress?.notes || progress.notes.length === 0 ? (
                      <div className="text-center py-6 text-slate-400">
                        No notes taken yet. Write notes while watching to mark key ideas.
                      </div>
                    ) : (
                      progress.notes.map((note) => (
                        <div
                          key={note.id}
                          className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <button
                              onClick={() => jumpToSeconds(note.timestampSeconds)}
                              className="font-mono tabular-nums text-indigo-600 hover:underline font-semibold text-[11px]"
                            >
                              Jump to {formatTime(note.timestampSeconds)}
                            </button>
                            <p className="text-slate-800 leading-relaxed">{note.text}</p>
                            <div className="text-[10px] text-slate-400 font-mono">{note.createdAt}</div>
                          </div>
                          <button
                            onClick={() => deleteStudentNote(course.id, note.id)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Quiz */}
              {activeTab === 'quiz' && activeLesson?.quiz && (
                <div className="space-y-4 text-xs">
                  {activeLesson.quiz.map((q) => {
                    const isSubmitted = quizSubmitted[q.id];
                    const selectedIdx = selectedQuizAnswers[q.id];
                    const isCorrect = selectedIdx === q.correctOptionIndex;

                    return (
                      <div key={q.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                        <h4 className="font-semibold text-slate-900">{q.question}</h4>
                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => (
                            <label
                              key={optIdx}
                              className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                                selectedIdx === optIdx
                                  ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`quiz_${q.id}`}
                                disabled={isSubmitted}
                                checked={selectedIdx === optIdx}
                                onChange={() => setSelectedQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                                className="accent-indigo-600"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>

                        {!isSubmitted ? (
                          <button
                            disabled={selectedIdx === undefined}
                            onClick={() => handleQuizSubmit(q.id, q.correctOptionIndex)}
                            className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors"
                          >
                            Submit Answer
                          </button>
                        ) : (
                          <div
                            className={`p-3 rounded-lg leading-relaxed ${
                              isCorrect
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            <div className="font-bold mb-1">
                              {isCorrect ? 'Correct! Checkpoint Passed.' : 'Incorrect.'}
                            </div>
                            <p>{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Syllabus (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 overflow-hidden sticky top-20">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Course Syllabus</h3>
            <div className="text-xs text-slate-500 mt-0.5">
              Select any lecture below to stream
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[70vh] overflow-y-auto">
            {course.modules.map((mod) => (
              <div key={mod.id}>
                <div className="bg-slate-50/70 px-4 py-2 text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>
                    Module {mod.order}: {mod.title}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {mod.lessons.length} {mod.lessons.length === 1 ? 'lecture' : 'lectures'}
                  </span>
                </div>

                <div className="divide-y divide-slate-100 bg-white">
                  {mod.lessons.map((lesson) => {
                    const isActive = lesson.id === activeLessonId;
                    const isCompleted = progress?.completedLessonIds.includes(lesson.id);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => handleSelectLesson(lesson.id)}
                        className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                          isActive
                            ? 'bg-indigo-50/70 border-l-2 border-indigo-600'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : isActive ? (
                            <Play className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-xs font-medium truncate ${
                              isActive ? 'text-indigo-950 font-bold' : 'text-slate-800'
                            }`}
                          >
                            {lesson.title}
                          </div>
                          <div className="text-[11px] font-mono tabular-nums text-slate-400 mt-0.5 flex items-center gap-1.5">
                            <span>{lesson.durationMinutes} min</span>
                            {lesson.pdfLectureSheet && (
                              <span className="text-emerald-600 font-semibold">· PDF Sheet</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
