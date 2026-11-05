import React, { useState, useRef } from 'react';
import { useCourse, extractYouTubeId } from '../context/CourseContext';
import { Lesson, VideoTimestamp, QuizQuestion, PdfLectureSheet } from '../types';
import {
  X,
  Upload,
  Video,
  Film,
  Camera,
  CheckCircle,
  Plus,
  Trash2,
  FolderPlus,
  Youtube,
  FileText,
} from 'lucide-react';

interface VideoUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCourseId?: string;
}

export const VideoUploaderModal: React.FC<VideoUploaderModalProps> = ({
  isOpen,
  onClose,
  defaultCourseId,
}) => {
  const { courses, addLessonToCourse, createModule } = useCourse();

  // Selected course and module
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    defaultCourseId || courses[0]?.id || ''
  );
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const [selectedModuleId, setSelectedModuleId] = useState<string>(
    selectedCourse?.modules[0]?.id || ''
  );

  // New module creation inline
  const [isCreatingNewModule, setIsCreatingNewModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');

  // Video source: YouTube as primary
  const [sourceType, setSourceType] = useState<'youtube' | 'upload' | 'preset' | 'record'>('youtube');
  const [youtubeInput, setYoutubeInput] = useState<string>('https://www.youtube.com/watch?v=SqcY0GlETPk');
  const [parsedYoutubeId, setParsedYoutubeId] = useState<string | null>('SqcY0GlETPk');

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const liveStreamRef = useRef<MediaStream | null>(null);
  const liveVideoPreviewRef = useRef<HTMLVideoElement | null>(null);

  // Lesson Metadata
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(18);
  const [isFreePreview, setIsFreePreview] = useState(false);

  // PDF Lecture Sheet
  const [includePdfSheet, setIncludePdfSheet] = useState(true);
  const [sheetTitle, setSheetTitle] = useState('');
  const [sheetSummary, setSheetSummary] = useState('');
  const [sheetTakeaway1, setSheetTakeaway1] = useState('');
  const [sheetTakeaway2, setSheetTakeaway2] = useState('');

  // Interactive Timestamps
  const [timestamps, setTimestamps] = useState<VideoTimestamp[]>([
    { timeSeconds: 0, label: '00:00 - Introduction & Setup' },
    { timeSeconds: 180, label: '03:00 - Architecture Invariants' },
  ]);
  const [newTsLabel, setNewTsLabel] = useState('');
  const [newTsSeconds, setNewTsSeconds] = useState<number>(300);

  // Optional Checkpoint Quiz
  const [hasQuiz, setHasQuiz] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptions, setQuizOptions] = useState<string[]>([
    'Option A: Primary system principle',
    'Option B: Fallback mechanism',
    'Option C: Edge-case constraint',
  ]);
  const [correctOptionIdx, setCorrectOptionIdx] = useState(0);
  const [quizExplanation, setQuizExplanation] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (!isOpen) return null;

  // Handle YouTube input change
  const handleYoutubeChange = (val: string) => {
    setYoutubeInput(val);
    const ytid = extractYouTubeId(val);
    setParsedYoutubeId(ytid);
  };

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);

      if (!lessonTitle) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setLessonTitle(cleanName);
      }
    }
  };

  // Webcam live recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      liveStreamRef.current = stream;
      if (liveVideoPreviewRef.current) {
        liveVideoPreviewRef.current.srcObject = stream;
      }
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setVideoFile(new File([blob], 'instructor_recorded_lecture.webm', { type: 'video/webm' }));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      alert('Camera access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAddTimestamp = () => {
    if (!newTsLabel.trim()) return;
    const mins = Math.floor(newTsSeconds / 60);
    const secs = (newTsSeconds % 60).toString().padStart(2, '0');
    setTimestamps([
      ...timestamps,
      { timeSeconds: Number(newTsSeconds), label: `${mins}:${secs} - ${newTsLabel.trim()}` },
    ]);
    setNewTsLabel('');
    setNewTsSeconds(newTsSeconds + 120);
  };

  const handleRemoveTimestamp = (idx: number) => {
    setTimestamps(timestamps.filter((_, i) => i !== idx));
  };

  const handleCreateModuleInline = () => {
    if (!newModuleTitle.trim() || !selectedCourse) return;
    createModule(selectedCourse.id, newModuleTitle.trim());
    setIsCreatingNewModule(false);
    setNewModuleTitle('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim()) {
      alert('Please enter a lecture title.');
      return;
    }

    let finalVideoUrl = '';
    let finalVideoType: Lesson['videoType'] = 'youtube';

    if (sourceType === 'youtube') {
      if (!parsedYoutubeId && !youtubeInput.trim()) {
        alert('Please enter a valid YouTube video or playlist link.');
        return;
      }
      finalVideoUrl = youtubeInput.trim();
      finalVideoType = 'youtube';
    } else if (sourceType === 'upload') {
      if (!videoUrl) {
        alert('Please select a video file.');
        return;
      }
      finalVideoUrl = videoUrl;
      finalVideoType = 'blob';
    } else if (sourceType === 'record') {
      if (!videoUrl) {
        alert('Please complete your webcam recording first.');
        return;
      }
      finalVideoUrl = videoUrl;
      finalVideoType = 'blob';
    } else {
      finalVideoUrl =
        videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
      finalVideoType = 'sample';
    }

    const targetModuleId = selectedModuleId || selectedCourse?.modules[0]?.id;
    if (!targetModuleId) {
      alert('Please select or create a module first.');
      return;
    }

    setIsUploading(true);

    const quiz: QuizQuestion[] =
      hasQuiz && quizQuestion.trim()
        ? [
            {
              id: 'quiz-' + Date.now(),
              question: quizQuestion.trim(),
              options: quizOptions.filter((o) => o.trim().length > 0),
              correctOptionIndex: correctOptionIdx,
              explanation: quizExplanation.trim() || 'Verified answer from lecture concepts.',
            },
          ]
        : [];

    const pdfLectureSheet: PdfLectureSheet | undefined = includePdfSheet
      ? {
          title: sheetTitle.trim() || `${lessonTitle} Lecture Sheet & Cheat Sheet`,
          pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileSize: '2.1 MB',
          pagesCount: 10,
          summary:
            sheetSummary.trim() ||
            'Detailed reference notes, architectural formulas, diagrams, and execution checklists for this video lecture.',
          keyTakeaways: [
            sheetTakeaway1.trim() || 'Core architectural trade-offs analyzed in this video session',
            sheetTakeaway2.trim() || 'Production deployment best practices and fault-tolerance guidelines',
          ].filter(Boolean),
        }
      : undefined;

    const newLesson: Lesson = {
      id: 'les-' + Date.now(),
      title: lessonTitle.trim(),
      description:
        lessonDescription.trim() ||
        'Comprehensive technical breakdown, live code walkthrough, and practical exercises.',
      durationMinutes: Number(durationMinutes) || 15,
      videoUrl: finalVideoUrl,
      videoType: finalVideoType,
      youtubeVideoId: parsedYoutubeId || undefined,
      isFreePreview,
      pdfLectureSheet,
      timestamps: timestamps.length > 0 ? timestamps : undefined,
      quiz: quiz.length > 0 ? quiz : undefined,
      resources: [
        {
          id: 'res-' + Date.now(),
          title: `${lessonTitle} Notes (PDF)`,
          fileType: 'pdf',
          size: '2.1 MB',
        },
      ],
    };

    setTimeout(() => {
      addLessonToCourse(selectedCourse.id, targetModuleId, newLesson);
      setIsUploading(false);
      setUploadSuccess(true);
      setTimeout(() => {
        onClose();
        setUploadSuccess(false);
      }, 1000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <Youtube className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                YouTube Lecture & Lecture Sheet Studio
              </h3>
              <p className="text-xs text-slate-500">
                Embed unlisted YouTube playlist videos, attach PDF study notes, and set timestamps
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {uploadSuccess ? (
          <div className="p-12 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-display font-bold text-lg text-slate-900">
              YouTube Lecture & PDF Sheet Published!
            </h4>
            <p className="text-xs text-slate-500">
              Your video lecture and attached notes are now live in the student syllabus.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
            {/* Step 1: Destination Course & Module */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 uppercase tracking-wider">
                1. Target Masterclass & Module
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Select Course:
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => {
                      setSelectedCourseId(e.target.value);
                      const crs = courses.find((c) => c.id === e.target.value);
                      if (crs && crs.modules.length > 0) {
                        setSelectedModuleId(crs.modules[0].id);
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-slate-700">Select Module:</label>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewModule(!isCreatingNewModule)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                    >
                      <FolderPlus className="w-3 h-3" />
                      <span>{isCreatingNewModule ? 'Cancel' : '+ New Module'}</span>
                    </button>
                  </div>

                  {isCreatingNewModule ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Module 3: Microservice Deployment"
                        value={newModuleTitle}
                        onChange={(e) => setNewModuleTitle(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleCreateModuleInline}
                        className="px-3 py-1.5 font-semibold text-white bg-slate-900 rounded-lg"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <select
                      value={selectedModuleId}
                      onChange={(e) => setSelectedModuleId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      {selectedCourse?.modules.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Video Source Selection */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="font-semibold text-slate-900 uppercase tracking-wider">
                2. Video Lecture Source
              </h4>

              {/* Source Tabs */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSourceType('youtube')}
                  className={`flex-1 py-1.5 font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                    sourceType === 'youtube'
                      ? 'bg-white text-rose-600 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Youtube className="w-3.5 h-3.5" />
                  <span>YouTube / Unlisted Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSourceType('upload')}
                  className={`flex-1 py-1.5 font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                    sourceType === 'upload'
                      ? 'bg-white text-slate-900 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Local MP4 File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSourceType('record')}
                  className={`flex-1 py-1.5 font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                    sourceType === 'record'
                      ? 'bg-white text-slate-900 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Record Webcam</span>
                </button>
              </div>

              {/* YouTube URL input and live preview */}
              {sourceType === 'youtube' && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Paste YouTube Video or Playlist URL:
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-600" />
                        <input
                          type="url"
                          required
                          placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                          value={youtubeInput}
                          onChange={(e) => handleYoutubeChange(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Supports unlisted YouTube videos, private channel links, and custom playlist IDs.
                    </p>
                  </div>

                  {/* YouTube Live Embed Preview */}
                  {parsedYoutubeId && (
                    <div className="bg-slate-950 rounded-xl overflow-hidden shadow-sm p-3">
                      <div className="text-[11px] text-slate-400 font-mono mb-2 flex items-center justify-between">
                        <span>Video ID: {parsedYoutubeId}</span>
                        <span className="text-emerald-400 font-semibold">Live Embed Preview</span>
                      </div>
                      <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${parsedYoutubeId}`}
                          title="YouTube Video Preview"
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Local File Upload */}
              {sourceType === 'upload' && (
                <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-6 text-center bg-slate-50/50">
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                    id="local-file-upload"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="local-file-upload" className="cursor-pointer block">
                    <Upload className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                    <div className="font-semibold text-slate-800">
                      {videoFile ? videoFile.name : 'Click to select local MP4 or WebM lecture file'}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {videoFile
                        ? `${(videoFile.size / (1024 * 1024)).toFixed(2)} MB · Ready to attach`
                        : 'Supports MP4, WebM up to 500MB'}
                    </div>
                  </label>
                </div>
              )}

              {/* Webcam Recording */}
              {sourceType === 'record' && (
                <div className="space-y-3 bg-slate-900 rounded-xl p-4 text-white text-center">
                  <div className="aspect-video max-w-sm mx-auto bg-black rounded-lg overflow-hidden relative">
                    <video
                      ref={liveVideoPreviewRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    {isRecording && (
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-mono">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        RECORDING
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={startRecording}
                        className="px-4 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Start Recording</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="px-4 py-2 font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        Finish & Use Recording
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Lecture Details */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="font-semibold text-slate-900 uppercase tracking-wider">
                3. Lecture Title & Duration
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-700 mb-1">
                    Lecture Title:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1.3 Distributed Messaging Queues & Idempotency"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Duration (Minutes):
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Description / Syllabus Notes:
                </label>
                <textarea
                  rows={2}
                  placeholder="Outline key concepts, code repository links, and exercises discussed in this lecture..."
                  value={lessonDescription}
                  onChange={(e) => setLessonDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Step 4: PDF Lecture Sheet & Notes */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>4. Attach PDF Lecture Sheet & Notes</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Provide students with an interactive in-app study sheet and downloadable PDF
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="include-sheet"
                  checked={includePdfSheet}
                  onChange={(e) => setIncludePdfSheet(e.target.checked)}
                  className="rounded text-indigo-600"
                />
              </div>

              {includePdfSheet && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Lecture Sheet Title:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lecture Sheet 1.3: Distributed Invariants & Formulas"
                      value={sheetTitle}
                      onChange={(e) => setSheetTitle(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Executive Summary / Abstract:
                    </label>
                    <input
                      type="text"
                      placeholder="Key theoretical concepts and architectural guidelines covered in the PDF..."
                      value={sheetSummary}
                      onChange={(e) => setSheetSummary(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Key Takeaway 1:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Asynchronous worker isolation prevents request starvation"
                        value={sheetTakeaway1}
                        onChange={(e) => setSheetTakeaway1(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Key Takeaway 2:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Enforce idempotent write semantics on database workers"
                        value={sheetTakeaway2}
                        onChange={(e) => setSheetTakeaway2(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 5: Video Chapters / Timestamps */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-900 uppercase tracking-wider">
                  5. Interactive Video Chapters
                </h4>
                <span className="text-slate-500">Students can jump directly to these timestamps</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  placeholder="Seconds"
                  value={newTsSeconds}
                  onChange={(e) => setNewTsSeconds(Number(e.target.value))}
                  className="w-24 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
                <input
                  type="text"
                  placeholder="Chapter Label (e.g. Circuit breaker implementation)"
                  value={newTsLabel}
                  onChange={(e) => setNewTsLabel(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleAddTimestamp}
                  className="px-3 py-1.5 font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              <div className="space-y-1.5">
                {timestamps.map((ts, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <span className="text-slate-800">{ts.label}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTimestamp(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-6 py-2.5 font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg transition-colors shadow-xs flex items-center gap-2"
              >
                <Youtube className="w-4 h-4" />
                <span>{isUploading ? 'Publishing...' : 'Publish Lecture to Syllabus'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
