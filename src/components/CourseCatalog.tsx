import React, { useState, useMemo } from 'react';
import { Course } from '../types';
import { useCourse } from '../context/CourseContext';
import {
  Search,
  Star,
  Clock,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Youtube,
  FileText,
  Lock,
} from 'lucide-react';

interface CourseCatalogProps {
  onSelectCourse: (course: Course) => void;
  onOpenPlayer: (course: Course) => void;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({ onSelectCourse, onOpenPlayer }) => {
  const { courses, isEnrolled, getProgress, isCourseAuthorizedForUser, currentUser } = useCourse();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');

  const categories = ['All', 'Web Engineering', 'Data Science', 'Design Systems', 'Cloud & DevOps'];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
      const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [courses, searchQuery, selectedCategory, selectedLevel]);

  return (
    <div className="space-y-8">
      {/* Hero introduction section */}
      <div className="relative rounded-2xl bg-slate-900 text-white p-8 md:p-12 overflow-hidden shadow-sm">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-indigo-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Private Cohort Curriculum · YouTube Streams & PDF Sheets</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-display">
            Deep technical masterclasses with private unlisted video lectures.
          </h1>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl">
            Stream unlisted YouTube video lectures, study interactive PDF lecture sheets, take notes on exact timestamps, and earn verified credentials tied to your Gmail address.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Youtube className="w-4 h-4 text-rose-400" />
              <span>YouTube Video Streams</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>In-App PDF Lecture Sheets</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Gmail Whitelist Verification</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by topic, keyword, or instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-500 whitespace-nowrap">Level:</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {levels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl === 'All' ? 'All Experience Levels' : lvl}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-xl border border-slate-200">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 mb-1">No courses match your filter</h3>
          <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
            Try adjusting your search query or reset the category filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedLevel('All');
            }}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredCourses.map((course) => {
            const enrolled = isEnrolled(course.id);
            const authorized = isCourseAuthorizedForUser(course);
            const progress = enrolled ? getProgress(course.id) : undefined;
            const allLessons = course.modules.flatMap((m) => m.lessons);
            const totalLessons = allLessons.length;
            const completedLessons = progress?.completedLessonIds.length || 0;
            const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
            const youtubeCount = allLessons.filter((l) => l.videoType === 'youtube').length;
            const sheetCount = allLessons.filter((l) => Boolean(l.pdfLectureSheet)).length;

            return (
              <div
                key={course.id}
                className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail container */}
                  <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                    {/* Price or Enrolled marker */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {course.isPrivateCohort && (
                        <span className="text-[11px] font-semibold px-2 py-1 bg-slate-900/90 text-indigo-300 rounded-md backdrop-blur-xs flex items-center gap-1 shadow-xs border border-indigo-900/50">
                          <Lock className="w-3 h-3 text-indigo-400" />
                          <span>Private Cohort</span>
                        </span>
                      )}

                      {enrolled ? (
                        <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-600/90 text-white rounded-md backdrop-blur-xs flex items-center gap-1 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Enrolled
                        </span>
                      ) : (
                        <span className="text-xs font-semibold font-mono tabular-nums px-2.5 py-1 bg-slate-900/80 text-white rounded-md backdrop-blur-xs shadow-xs">
                          {course.price === 0 ? 'Free' : `$${course.price}`}
                        </span>
                      )}
                    </div>

                    {/* Bottom overlay indicators */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 text-[11px] text-white">
                      {youtubeCount > 0 && (
                        <span className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs">
                          <Youtube className="w-3.5 h-3.5 text-rose-400" />
                          <span>{youtubeCount} YouTube Lectures</span>
                        </span>
                      )}
                      {sheetCount > 0 && (
                        <span className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs">
                          <FileText className="w-3.5 h-3.5 text-indigo-300" />
                          <span>{sheetCount} PDF Sheets</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Course Details Content */}
                  <div className="p-5 space-y-3">
                    {/* Unboxed Metadata */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                      <span className="font-medium text-slate-700">{course.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="tabular-nums font-mono">{course.durationHours} hrs</span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums font-mono">{totalLessons} lessons</span>
                      <span aria-hidden="true">·</span>
                      <span>{course.level}</span>
                    </div>

                    <h3 className="font-display font-semibold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Whitelist Authorization status message */}
                    {course.isPrivateCohort && (
                      <div className="pt-1">
                        {authorized ? (
                          <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Your Gmail ({currentUser?.email}) is authorized for this cohort</span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Private Cohort: Requires instructor Gmail whitelist access</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Instructor & Rating */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <img
                          src={course.instructor.avatar}
                          alt={course.instructor.name}
                          referrerPolicy="no-referrer"
                          className="w-6 h-6 rounded-full object-cover bg-slate-200"
                        />
                        <span className="font-medium text-slate-700">{course.instructor.name}</span>
                      </div>

                      <div className="flex items-center gap-1 text-slate-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold font-mono tabular-nums">{course.rating.toFixed(1)}</span>
                        <span className="text-slate-400 font-mono tabular-nums">({course.ratingCount})</span>
                      </div>
                    </div>

                    {/* Progress Bar if enrolled */}
                    {enrolled && (
                      <div className="pt-2 space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Your Progress</span>
                          <span className="font-mono tabular-nums font-semibold text-slate-700">{percent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-5 pb-5 pt-1">
                  {enrolled ? (
                    <button
                      onClick={() => onOpenPlayer(course)}
                      className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                    >
                      <span>Continue Learning</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectCourse(course)}
                        className="flex-1 py-2 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center"
                      >
                        Syllabus & Lecture Sheets
                      </button>
                      <button
                        onClick={() => onSelectCourse(course)}
                        className="py-2 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
                      >
                        Enroll Now
                      </button>
                    </div>
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
