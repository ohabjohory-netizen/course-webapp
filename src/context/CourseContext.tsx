import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course, Student, StudentProgress, StudentRosterItem, UserRole, Lesson, StudentNote, AppUser } from '../types';
import { INITIAL_COURSES, INITIAL_PROGRESS, SAMPLE_STUDENTS, CURRENT_STUDENT, CURRENT_INSTRUCTOR } from '../data/mockData';
import { auth, googleProvider, signInWithPopup, firebaseSignOut, onAuthStateChanged, db } from '../firebase';
import { doc, getDocFromServer } from 'firebase/firestore';
import confetti from 'canvas-confetti';

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  // Patterns for youtube: watch?v=ID, youtu.be/ID, embed/ID, shorts/ID, etc.
  const regExp = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

interface CourseContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  viewMode: 'admin' | 'student_preview';
  setViewMode: (mode: 'admin' | 'student_preview') => void;
  currentUser: AppUser | null;
  isAuthLoading: boolean;
  signInWithGoogle: (targetRole?: UserRole) => Promise<void>;
  signOutUser: () => Promise<void>;
  loginAsDemoStudent: () => void;
  loginAsDemoInstructor: () => void;
  setUserRole: (role: UserRole) => void;
  isRolePickerOpen: boolean;
  setIsRolePickerOpen: (open: boolean) => void;
  currentStudent: Student;
  courses: Course[];
  progressMap: Record<string, StudentProgress>;
  students: Student[];
  isCourseAuthorizedForUser: (course: Course) => boolean;
  addStudentEmailToWhitelist: (courseId: string, email: string) => void;
  removeStudentEmailFromWhitelist: (courseId: string, email: string) => void;
  enrollCourse: (courseId: string) => void;
  unenrollCourse: (courseId: string) => void;
  isEnrolled: (courseId: string) => boolean;
  getProgress: (courseId: string, studentId?: string) => StudentProgress | undefined;
  updateLessonProgress: (courseId: string, lessonId: string, watchSeconds: number, markComplete?: boolean) => void;
  toggleLessonComplete: (courseId: string, lessonId: string) => void;
  submitQuizScore: (courseId: string, lessonId: string, scorePercent: number) => void;
  addStudentNote: (courseId: string, lessonId: string, timestampSeconds: number, text: string) => void;
  deleteStudentNote: (courseId: string, noteId: string) => void;
  createCourse: (newCourse: Course) => void;
  updateCourse: (courseId: string, updates: Partial<Course>) => void;
  deleteCourse: (courseId: string) => void;
  addLessonToCourse: (courseId: string, moduleId: string, lesson: Lesson) => void;
  deleteLessonFromCourse: (courseId: string, moduleId: string, lessonId: string) => void;
  createModule: (courseId: string, moduleTitle: string) => void;
  getRoster: (courseIdFilter?: string) => StudentRosterItem[];
  resetDataToDefaults: () => void;
}

const CourseContext = createContext<CourseContextType | null>(null);

const STORAGE_KEYS = {
  COURSES: 'coursecraft_courses_v2',
  PROGRESS: 'coursecraft_progress_v2',
  STUDENTS: 'coursecraft_students_v2',
  ROLE: 'coursecraft_user_role_v2',
  VIEW_MODE: 'coursecraft_view_mode_v2',
  USER_ROLES_MAP: 'coursecraft_user_roles_map_v2',
  CURRENT_USER: 'coursecraft_current_user_v2',
};

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return saved === 'instructor' ? 'instructor' : 'student';
  });

  const [viewMode, setViewModeState] = useState<'admin' | 'student_preview'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
    return saved === 'student_preview' ? 'student_preview' : 'admin';
  });

  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored user', e);
      }
    }
    // Default demo student
    return {
      uid: CURRENT_STUDENT.id,
      name: CURRENT_STUDENT.name,
      email: CURRENT_STUDENT.email,
      avatar: CURRENT_STUDENT.avatar,
      role: 'student',
      isGoogleUser: false,
    };
  });

  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isRolePickerOpen, setIsRolePickerOpen] = useState<boolean>(false);

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COURSES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse courses from localStorage', e);
      }
    }
    return INITIAL_COURSES;
  });

  const [progressMap, setProgressMap] = useState<Record<string, StudentProgress>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse progress from localStorage', e);
      }
    }
    return INITIAL_PROGRESS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse students from localStorage', e);
      }
    }
    return SAMPLE_STUDENTS;
  });

  const [currentStudent, setCurrentStudent] = useState<Student>(() => {
    return students.find((s) => s.id === (currentUser?.uid || CURRENT_STUDENT.id)) || CURRENT_STUDENT;
  });

  // Test Firestore connection on boot
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error('Firebase offline or checking connection.');
        }
      }
    }
    testConnection();
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progressMap));
  }, [progressMap]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, viewMode);
  }, [viewMode]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsAuthLoading(false);
      if (firebaseUser) {
        const uid = firebaseUser.uid;
        const savedRoles: Record<string, UserRole> = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.USER_ROLES_MAP) || '{}'
        );

        let userRole: UserRole = savedRoles[uid] || 'student';
        const isNewUser = !savedRoles[uid];

        const user: AppUser = {
          uid,
          name: firebaseUser.displayName || 'Google Scholar',
          email: firebaseUser.email || 'scholar@google.com',
          avatar: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          role: userRole,
          isGoogleUser: true,
        };

        setCurrentUser(user);
        setRoleState(userRole);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));

        // Auto enroll or match student record
        const existingStudent = students.find((s) => s.id === uid || s.email === user.email);
        if (!existingStudent) {
          const newStudent: Student = {
            id: uid,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: 'student',
            enrolledCourseIds: ['course-1'], // auto-enroll in flagship course
            joinedAt: new Date().toISOString().split('T')[0],
          };
          setStudents((prev) => [newStudent, ...prev]);
          setCurrentStudent(newStudent);
        } else {
          setCurrentStudent(existingStudent);
        }

        if (isNewUser) {
          setIsRolePickerOpen(true);
        }
      }
    });

    return () => unsubscribe();
  }, [students]);

  const setViewMode = (mode: 'admin' | 'student_preview') => {
    setViewModeState(mode);
  };

  const isCourseAuthorizedForUser = (course: Course): boolean => {
    // If course is public, anyone can access
    if (!course.isPrivateCohort) return true;
    // Instructors always have access
    if (role === 'instructor') return true;

    // Check user's email
    const userEmail = (currentUser?.email || currentStudent?.email || '').toLowerCase().trim();
    if (!userEmail) return false;

    return course.allowedStudentEmails.some(
      (email) => email.toLowerCase().trim() === userEmail
    );
  };

  const addStudentEmailToWhitelist = (courseId: string, email: string) => {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) return;

    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        if (c.allowedStudentEmails.includes(cleanEmail)) return c;
        return {
          ...c,
          allowedStudentEmails: [...c.allowedStudentEmails, cleanEmail],
          updatedAt: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  const removeStudentEmailFromWhitelist = (courseId: string, email: string) => {
    const cleanEmail = email.toLowerCase().trim();
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          allowedStudentEmails: c.allowedStudentEmails.filter((e) => e !== cleanEmail),
          updatedAt: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  // Google Sign-In with target role specification
  const signInWithGoogle = async (targetRole?: UserRole) => {
    try {
      setIsAuthLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      if (res?.user && targetRole) {
        const uid = res.user.uid;
        const savedRoles: Record<string, UserRole> = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.USER_ROLES_MAP) || '{}'
        );
        savedRoles[uid] = targetRole;
        localStorage.setItem(STORAGE_KEYS.USER_ROLES_MAP, JSON.stringify(savedRoles));
        setRoleState(targetRole);
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      setIsAuthLoading(false);
      if (error?.code !== 'auth/popup-closed-by-user') {
        alert('Google Sign-In: ' + (error?.message || 'Please retry.'));
      }
    }
  };

  const signOutUser = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.error('Sign out error:', e);
    }
    const demo = {
      uid: CURRENT_STUDENT.id,
      name: CURRENT_STUDENT.name,
      email: CURRENT_STUDENT.email,
      avatar: CURRENT_STUDENT.avatar,
      role: 'student' as UserRole,
      isGoogleUser: false,
    };
    setCurrentUser(demo);
    setRoleState('student');
    setViewModeState('admin');
    setCurrentStudent(CURRENT_STUDENT);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(demo));
  };

  const loginAsDemoStudent = () => {
    const demo = {
      uid: CURRENT_STUDENT.id,
      name: CURRENT_STUDENT.name,
      email: CURRENT_STUDENT.email,
      avatar: CURRENT_STUDENT.avatar,
      role: 'student' as UserRole,
      isGoogleUser: false,
    };
    setCurrentUser(demo);
    setRoleState('student');
    setViewModeState('admin');
    setCurrentStudent(CURRENT_STUDENT);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(demo));
  };

  const loginAsDemoInstructor = () => {
    const demo = {
      uid: CURRENT_INSTRUCTOR.id,
      name: CURRENT_INSTRUCTOR.name,
      email: 'dr.elena.vance@coursecraft.edu',
      avatar: CURRENT_INSTRUCTOR.avatar,
      role: 'instructor' as UserRole,
      isGoogleUser: false,
    };
    setCurrentUser(demo);
    setRoleState('instructor');
    setViewModeState('admin');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(demo));
  };

  const setUserRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (currentUser) {
      const updatedUser = { ...currentUser, role: newRole };
      setCurrentUser(updatedUser);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));

      const savedRoles: Record<string, UserRole> = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USER_ROLES_MAP) || '{}'
      );
      savedRoles[currentUser.uid] = newRole;
      localStorage.setItem(STORAGE_KEYS.USER_ROLES_MAP, JSON.stringify(savedRoles));
    }
  };

  const setRole = (newRole: UserRole) => {
    setUserRole(newRole);
  };

  const getProgressKey = (studentId: string, courseId: string) => `${studentId}_${courseId}`;
  const activeStudentId = currentUser?.uid || currentStudent.id;

  const isEnrolled = (courseId: string) => {
    return currentStudent.enrolledCourseIds.includes(courseId);
  };

  const getProgress = (courseId: string, studentId: string = activeStudentId): StudentProgress | undefined => {
    return progressMap[getProgressKey(studentId, courseId)];
  };

  const enrollCourse = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    const updatedStudent: Student = {
      ...currentStudent,
      enrolledCourseIds: Array.from(new Set([...currentStudent.enrolledCourseIds, courseId])),
    };
    setCurrentStudent(updatedStudent);
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));

    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, enrolledCount: c.enrolledCount + 1 } : c))
    );

    const key = getProgressKey(activeStudentId, courseId);
    if (!progressMap[key]) {
      const firstLessonId = course.modules[0]?.lessons[0]?.id || '';
      const newProgress: StudentProgress = {
        courseId,
        studentId: activeStudentId,
        enrolledAt: new Date().toISOString().split('T')[0],
        lastActiveAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        completedLessonIds: [],
        currentLessonId: firstLessonId,
        videoWatchSeconds: {},
        quizScores: {},
        notes: [],
        isCompleted: false,
      };
      setProgressMap((prev) => ({ ...prev, [key]: newProgress }));
    }
  };

  const unenrollCourse = (courseId: string) => {
    const updatedStudent: Student = {
      ...currentStudent,
      enrolledCourseIds: currentStudent.enrolledCourseIds.filter((id) => id !== courseId),
    };
    setCurrentStudent(updatedStudent);
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
  };

  const updateLessonProgress = (
    courseId: string,
    lessonId: string,
    watchSeconds: number,
    markComplete: boolean = false
  ) => {
    const key = getProgressKey(activeStudentId, courseId);
    const existing = progressMap[key];
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    const allLessons = course.modules.flatMap((m) => m.lessons);
    const currentCompleted = existing ? [...existing.completedLessonIds] : [];

    if (markComplete && !currentCompleted.includes(lessonId)) {
      currentCompleted.push(lessonId);
    }

    const isAllComplete = allLessons.length > 0 && allLessons.every((l) => currentCompleted.includes(l.id));

    if (isAllComplete && !existing?.isCompleted) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }
    }

    const updated: StudentProgress = {
      courseId,
      studentId: activeStudentId,
      enrolledAt: existing?.enrolledAt || new Date().toISOString().split('T')[0],
      lastActiveAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      completedLessonIds: currentCompleted,
      currentLessonId: lessonId,
      videoWatchSeconds: {
        ...(existing?.videoWatchSeconds || {}),
        [lessonId]: Math.max(existing?.videoWatchSeconds?.[lessonId] || 0, Math.floor(watchSeconds)),
      },
      quizScores: existing?.quizScores || {},
      notes: existing?.notes || [],
      isCompleted: isAllComplete,
      completedAt: isAllComplete ? existing?.completedAt || new Date().toISOString().split('T')[0] : undefined,
    };

    setProgressMap((prev) => ({ ...prev, [key]: updated }));
  };

  const toggleLessonComplete = (courseId: string, lessonId: string) => {
    const key = getProgressKey(activeStudentId, courseId);
    const existing = progressMap[key];
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    const allLessons = course.modules.flatMap((m) => m.lessons);
    const isCompleted = existing?.completedLessonIds.includes(lessonId) || false;
    let nextCompleted: string[];

    if (isCompleted) {
      nextCompleted = (existing?.completedLessonIds || []).filter((id) => id !== lessonId);
    } else {
      nextCompleted = [...(existing?.completedLessonIds || []), lessonId];
    }

    const isAllComplete = allLessons.length > 0 && allLessons.every((l) => nextCompleted.includes(l.id));

    if (isAllComplete && !existing?.isCompleted) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }
    }

    const updated: StudentProgress = {
      courseId,
      studentId: activeStudentId,
      enrolledAt: existing?.enrolledAt || new Date().toISOString().split('T')[0],
      lastActiveAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      completedLessonIds: nextCompleted,
      currentLessonId: lessonId,
      videoWatchSeconds: existing?.videoWatchSeconds || {},
      quizScores: existing?.quizScores || {},
      notes: existing?.notes || [],
      isCompleted: isAllComplete,
      completedAt: isAllComplete ? existing?.completedAt || new Date().toISOString().split('T')[0] : undefined,
    };

    setProgressMap((prev) => ({ ...prev, [key]: updated }));
  };

  const submitQuizScore = (courseId: string, lessonId: string, scorePercent: number) => {
    const key = getProgressKey(activeStudentId, courseId);
    const existing = progressMap[key];
    if (!existing) return;

    const updated: StudentProgress = {
      ...existing,
      quizScores: {
        ...existing.quizScores,
        [lessonId]: scorePercent,
      },
      lastActiveAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setProgressMap((prev) => ({ ...prev, [key]: updated }));
  };

  const addStudentNote = (courseId: string, lessonId: string, timestampSeconds: number, text: string) => {
    const key = getProgressKey(activeStudentId, courseId);
    const existing = progressMap[key];
    if (!existing) return;

    const newNote: StudentNote = {
      id: 'note_' + Date.now(),
      courseId,
      lessonId,
      timestampSeconds,
      text,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    const updated: StudentProgress = {
      ...existing,
      notes: [newNote, ...existing.notes],
      lastActiveAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setProgressMap((prev) => ({ ...prev, [key]: updated }));
  };

  const deleteStudentNote = (courseId: string, noteId: string) => {
    const key = getProgressKey(activeStudentId, courseId);
    const existing = progressMap[key];
    if (!existing) return;

    const updated: StudentProgress = {
      ...existing,
      notes: existing.notes.filter((n) => n.id !== noteId),
    };

    setProgressMap((prev) => ({ ...prev, [key]: updated }));
  };

  const createCourse = (newCourse: Course) => {
    setCourses((prev) => [newCourse, ...prev]);
  };

  const updateCourse = (courseId: string, updates: Partial<Course>) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : c))
    );
  };

  const deleteCourse = (courseId: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
  };

  const addLessonToCourse = (courseId: string, moduleId: string, lesson: Lesson) => {
    // Auto detect youtube video id if youtube
    const ytid = extractYouTubeId(lesson.videoUrl);
    const formattedLesson: Lesson = {
      ...lesson,
      videoType: ytid ? 'youtube' : lesson.videoType,
      youtubeVideoId: ytid || lesson.youtubeVideoId,
    };

    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        const updatedModules = c.modules.map((m) => {
          if (m.id !== moduleId) return m;
          return {
            ...m,
            lessons: [...m.lessons, formattedLesson],
          };
        });
        const totalDuration = updatedModules.reduce(
          (acc, m) => acc + m.lessons.reduce((sub, l) => sub + l.durationMinutes, 0),
          0
        );
        return {
          ...c,
          modules: updatedModules,
          durationHours: Math.round((totalDuration / 60) * 10) / 10,
          updatedAt: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  const deleteLessonFromCourse = (courseId: string, moduleId: string, lessonId: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        const updatedModules = c.modules.map((m) => {
          if (m.id !== moduleId) return m;
          return {
            ...m,
            lessons: m.lessons.filter((l) => l.id !== lessonId),
          };
        });
        return {
          ...c,
          modules: updatedModules,
          updatedAt: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  const createModule = (courseId: string, moduleTitle: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        const newModule = {
          id: 'mod-' + Date.now(),
          title: moduleTitle,
          order: c.modules.length + 1,
          lessons: [],
        };
        return {
          ...c,
          modules: [...c.modules, newModule],
          updatedAt: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  const getRoster = (courseIdFilter?: string): StudentRosterItem[] => {
    const items: StudentRosterItem[] = [];

    students.forEach((student) => {
      student.enrolledCourseIds.forEach((courseId) => {
        if (courseIdFilter && courseId !== courseIdFilter) return;

        const course = courses.find((c) => c.id === courseId);
        if (!course) return;

        const key = getProgressKey(student.id, courseId);
        const progress: StudentProgress = progressMap[key] || {
          courseId,
          studentId: student.id,
          enrolledAt: student.joinedAt,
          lastActiveAt: student.joinedAt,
          completedLessonIds: [],
          currentLessonId: course.modules[0]?.lessons[0]?.id || '',
          videoWatchSeconds: {},
          quizScores: {},
          notes: [],
          isCompleted: false,
        };

        const allLessons = course.modules.flatMap((m) => m.lessons);
        const totalLessons = allLessons.length;
        const completedCount = progress.completedLessonIds.length;
        const percentComplete = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

        const currentLesson = allLessons.find((l) => l.id === progress.currentLessonId);
        const lastWatchedLessonTitle = currentLesson ? currentLesson.title : allLessons[0]?.title || 'None';

        const quizScoreValues = Object.values(progress.quizScores);
        const avgQuizScore =
          quizScoreValues.length > 0
            ? Math.round(quizScoreValues.reduce((a, b) => a + b, 0) / quizScoreValues.length)
            : 0;

        items.push({
          student,
          progress,
          course,
          totalLessons,
          completedLessonsCount: completedCount,
          percentComplete,
          avgQuizScore,
          lastWatchedLessonTitle,
        });
      });
    });

    return items;
  };

  const resetDataToDefaults = () => {
    localStorage.removeItem(STORAGE_KEYS.COURSES);
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.ROLE);
    localStorage.removeItem(STORAGE_KEYS.VIEW_MODE);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.USER_ROLES_MAP);
    setCourses(INITIAL_COURSES);
    setProgressMap(INITIAL_PROGRESS);
    setStudents(SAMPLE_STUDENTS);
    setCurrentStudent(CURRENT_STUDENT);
    setRoleState('student');
    setViewModeState('admin');
  };

  return (
    <CourseContext.Provider
      value={{
        role,
        setRole,
        viewMode,
        setViewMode,
        currentUser,
        isAuthLoading,
        signInWithGoogle,
        signOutUser,
        loginAsDemoStudent,
        loginAsDemoInstructor,
        setUserRole,
        isRolePickerOpen,
        setIsRolePickerOpen,
        currentStudent,
        courses,
        progressMap,
        students,
        isCourseAuthorizedForUser,
        addStudentEmailToWhitelist,
        removeStudentEmailFromWhitelist,
        enrollCourse,
        unenrollCourse,
        isEnrolled,
        getProgress,
        updateLessonProgress,
        toggleLessonComplete,
        submitQuizScore,
        addStudentNote,
        deleteStudentNote,
        createCourse,
        updateCourse,
        deleteCourse,
        addLessonToCourse,
        deleteLessonFromCourse,
        createModule,
        getRoster,
        resetDataToDefaults,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
};
