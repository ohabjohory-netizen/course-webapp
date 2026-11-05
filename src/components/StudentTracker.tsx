import React, { useState, useMemo } from 'react';
import { useCourse } from '../context/CourseContext';
import { StudentRosterItem } from '../types';
import {
  Users,
  Search,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  ChevronRight,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';

interface StudentTrackerProps {
  onInspectStudent: (item: StudentRosterItem) => void;
  onOpenWhitelistModal?: () => void;
}

export const StudentTracker: React.FC<StudentTrackerProps> = ({ onInspectStudent, onOpenWhitelistModal }) => {
  const { courses, getRoster } = useCourse();

  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress' | 'not_started'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allRosterItems = useCourse().getRoster();

  // Filtered roster
  const filteredRoster = useMemo(() => {
    return allRosterItems.filter((item) => {
      const matchesCourse =
        selectedCourseFilter === 'all' || item.course.id === selectedCourseFilter;

      const matchesSearch =
        item.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.course.title.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesStatus = true;
      if (statusFilter === 'completed') {
        matchesStatus = item.percentComplete === 100;
      } else if (statusFilter === 'in_progress') {
        matchesStatus = item.percentComplete > 0 && item.percentComplete < 100;
      } else if (statusFilter === 'not_started') {
        matchesStatus = item.percentComplete === 0;
      }

      return matchesCourse && matchesSearch && matchesStatus;
    });
  }, [allRosterItems, selectedCourseFilter, searchQuery, statusFilter]);

  // Aggregate stats across roster
  const totalEnrollments = allRosterItems.length;
  const completedCount = allRosterItems.filter((i) => i.percentComplete === 100).length;
  const inProgressCount = allRosterItems.filter(
    (i) => i.percentComplete > 0 && i.percentComplete < 100
  ).length;
  const avgCompletionRate =
    totalEnrollments > 0
      ? Math.round(
          allRosterItems.reduce((acc, i) => acc + i.percentComplete, 0) / totalEnrollments
        )
      : 0;

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Student Name',
      'Student Email',
      'Course Title',
      'Completed Lessons',
      'Total Lessons',
      'Completion %',
      'Avg Quiz Score',
      'Last Active',
      'Certificate Awarded',
    ];

    const rows = filteredRoster.map((item) => [
      `"${item.student.name}"`,
      `"${item.student.email}"`,
      `"${item.course.title}"`,
      item.completedLessonsCount,
      item.totalLessons,
      `${item.percentComplete}%`,
      `${item.avgQuizScore}%`,
      `"${item.progress.lastActiveAt}"`,
      item.percentComplete === 100 ? 'Yes' : 'No',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `coursecraft_student_progress_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & High-Level Metric Tiles */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-indigo-600 font-semibold">
              Instructor Analytics & Roster
            </div>
            <h1 className="text-2xl font-bold font-display text-slate-900 mt-1">
              Student Progress Tracking Portal
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time monitoring of course enrollments, lecture watch metrics, and checkpoint pass rates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenWhitelistModal && (
              <button
                onClick={onOpenWhitelistModal}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
              >
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Manage Gmail Whitelist</span>
              </button>
            )}
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Roster CSV</span>
            </button>
          </div>
        </div>

        {/* 4-Stat Strip with Tabular Numerals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="space-y-1">
            <div className="text-xs text-slate-500">Total Enrollments</div>
            <div className="text-2xl font-bold font-display tabular-nums text-slate-900">
              {totalEnrollments}
            </div>
            <div className="text-[11px] text-slate-400">Across {courses.length} courses</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-500">Average Completion Rate</div>
            <div className="text-2xl font-bold font-display tabular-nums text-indigo-600">
              {avgCompletionRate}%
            </div>
            <div className="text-[11px] text-slate-400">Classroom engagement benchmark</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-500">Actively In Progress</div>
            <div className="text-2xl font-bold font-display tabular-nums text-amber-600">
              {inProgressCount}
            </div>
            <div className="text-[11px] text-slate-400">Progressing through lectures</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-500">Certificates Earned</div>
            <div className="text-2xl font-bold font-display tabular-nums text-emerald-600">
              {completedCount}
            </div>
            <div className="text-[11px] text-slate-400">100% syllabus mastery</div>
          </div>
        </div>
      </div>

      {/* Roster Controls: Search & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, email, or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Course and status filters */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {/* Course Dropdown */}
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>

            {/* Segmented Status Selector */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'in_progress', label: 'In Progress' },
                  { id: 'completed', label: 'Completed' },
                  { id: 'not_started', label: 'Not Started' },
                ] as const
              ).map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    statusFilter === st.id
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* High-Density Roster Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-2.5 px-4 font-medium">Student</th>
                <th className="py-2.5 px-4 font-medium">Course</th>
                <th className="py-2.5 px-4 font-medium">Progress Bar</th>
                <th className="py-2.5 px-4 font-medium text-right">Lessons</th>
                <th className="py-2.5 px-4 font-medium text-right">Quiz Score</th>
                <th className="py-2.5 px-4 font-medium">Last Active</th>
                <th className="py-2.5 px-4 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRoster.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No student records match the active criteria.
                  </td>
                </tr>
              ) : (
                filteredRoster.map((item, idx) => {
                  const isFinished = item.percentComplete === 100;

                  return (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => onInspectStudent(item)}
                    >
                      {/* Student info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={item.student.avatar}
                            alt={item.student.name}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 rounded-full object-cover bg-slate-200"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {item.student.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {item.student.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="truncate font-medium text-slate-800" title={item.course.title}>
                          {item.course.title}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.course.category}
                        </div>
                      </td>

                      {/* Progress Bar & Percentage */}
                      <td className="py-3 px-4 min-w-[140px]">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[11px]">
                            <span
                              className={`font-mono tabular-nums font-semibold ${
                                isFinished ? 'text-emerald-600' : 'text-slate-700'
                              }`}
                            >
                              {item.percentComplete}%
                            </span>
                            {isFinished && (
                              <span className="text-[10px] font-medium text-emerald-700 flex items-center gap-0.5">
                                <Award className="w-3 h-3 text-emerald-600" />
                                Certified
                              </span>
                            )}
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                isFinished ? 'bg-emerald-600' : 'bg-indigo-600'
                              }`}
                              style={{ width: `${item.percentComplete}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Lessons Completed */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                        {item.completedLessonsCount} / {item.totalLessons}
                      </td>

                      {/* Avg Quiz Score */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {item.avgQuizScore > 0 ? (
                          <span
                            className={
                              item.avgQuizScore >= 80
                                ? 'text-emerald-600 font-semibold'
                                : 'text-amber-600 font-semibold'
                            }
                          >
                            {item.avgQuizScore}%
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Last Active */}
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {item.progress.lastActiveAt}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onInspectStudent(item);
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors inline-flex items-center gap-1"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
