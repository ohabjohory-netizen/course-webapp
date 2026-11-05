export type UserRole = 'student' | 'instructor';

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  isGoogleUser?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface VideoTimestamp {
  timeSeconds: number;
  label: string;
}

export interface LessonResource {
  id: string;
  title: string;
  fileType: string;
  size?: string;
  url?: string;
}

export interface PdfLectureSheet {
  title: string;
  pdfUrl?: string;
  fileSize?: string;
  pagesCount?: number;
  summary: string;
  keyTakeaways: string[];
  sampleNotesContent?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  videoUrl: string;
  videoType: 'youtube' | 'sample' | 'blob' | 'direct_url';
  youtubeVideoId?: string;
  isFreePreview?: boolean;
  pdfLectureSheet?: PdfLectureSheet;
  timestamps?: VideoTimestamp[];
  resources?: LessonResource[];
  quiz?: QuizQuestion[];
}

export interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Instructor {
  id: string;
  name: string;
  title: string;
  avatar: string;
  bio: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  category: 'Web Engineering' | 'Data Science' | 'Design Systems' | 'Cloud & DevOps' | 'General';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  durationHours: number;
  price: number; // 0 for free
  thumbnail: string;
  instructor: Instructor;
  enrolledCount: number;
  rating: number;
  ratingCount: number;
  isPrivateCohort?: boolean;
  allowedStudentEmails: string[]; // Whitelisted student Gmail addresses
  modules: Module[];
  learningObjectives: string[];
  prerequisites: string[];
  updatedAt: string;
}

export interface StudentNote {
  id: string;
  courseId: string;
  lessonId: string;
  timestampSeconds: number;
  text: string;
  createdAt: string;
}

export interface StudentProgress {
  courseId: string;
  studentId: string;
  enrolledAt: string;
  lastActiveAt: string;
  completedLessonIds: string[];
  currentLessonId: string;
  videoWatchSeconds: Record<string, number>; // lessonId -> watched seconds
  quizScores: Record<string, number>; // lessonId -> percentage score (0-100)
  notes: StudentNote[];
  isCompleted: boolean;
  completedAt?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'student';
  enrolledCourseIds: string[];
  joinedAt: string;
}

export interface StudentRosterItem {
  student: Student;
  progress: StudentProgress;
  course: Course;
  totalLessons: number;
  completedLessonsCount: number;
  percentComplete: number;
  avgQuizScore: number;
  lastWatchedLessonTitle: string;
}
