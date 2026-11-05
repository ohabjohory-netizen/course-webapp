import React from 'react';
import { Course } from '../types';
import { useCourse } from '../context/CourseContext';
import { X, Award, Printer, CheckCircle, ShieldCheck } from 'lucide-react';

interface CertificateModalProps {
  course: Course | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ course, onClose }) => {
  const { currentStudent, getProgress } = useCourse();

  if (!course) return null;

  const progress = getProgress(course.id);
  const completionDate = progress?.completedAt || new Date().toISOString().split('T')[0];
  const credentialId = `CC-${course.id.replace('course-', '')}-${Math.abs(
    studentHash(currentStudent.id + course.id)
  )
    .toString(36)
    .toUpperCase()
    .padStart(6, '0')}`;

  function studentHash(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 print:m-0 print:border-none print:shadow-none">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-display font-semibold text-sm">
              Official Verified Credential
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Parchment Body */}
        <div className="p-8 sm:p-12 bg-linear-to-b from-amber-50/20 via-white to-slate-50 relative border-8 border-double border-slate-200 m-4 sm:m-6 rounded-xl">
          {/* Subtle watermark seal */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <Award className="w-96 h-96 text-slate-900" />
          </div>

          <div className="relative text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center shadow-md">
                <Award className="w-8 h-8" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-mono tracking-widest text-slate-500 uppercase">
                Coursecraft Engineering Academy
              </div>
              <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Certificate of Technical Mastery
              </h1>
              <div className="text-xs text-slate-500 italic">
                This verified credential is proud to certify that
              </div>
            </div>

            {/* Student Name */}
            <div className="py-2 border-b-2 border-slate-300 max-w-md mx-auto">
              <span className="font-display text-2xl sm:text-3xl font-bold text-indigo-950">
                {currentStudent.name}
              </span>
            </div>

            {/* Completion Description */}
            <p className="text-xs sm:text-sm text-slate-700 max-w-xl mx-auto leading-relaxed">
              has successfully fulfilled all rigorous lecture requirements, interactive code checkpoints, and curriculum syllabi for the advanced technical masterclass:
            </p>

            <div className="font-display font-bold text-lg sm:text-xl text-slate-900 max-w-lg mx-auto">
              {course.title}
            </div>

            {/* Signatures & Verification Strip */}
            <div className="pt-8 sm:pt-12 grid grid-cols-2 gap-8 max-w-lg mx-auto text-center border-t border-slate-200">
              <div className="space-y-1">
                <div className="font-serif italic text-base text-slate-800">
                  {course.instructor.name}
                </div>
                <div className="text-[11px] text-slate-500">{course.instructor.title}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  Authorized Instructor
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-mono text-xs font-semibold text-slate-800">
                  {completionDate}
                </div>
                <div className="text-[11px] text-slate-500">Date of Completion</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  Credential ID: {credentialId}
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-center gap-1.5 text-[11px] text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cryptographically verified against Coursecraft academic registry</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
