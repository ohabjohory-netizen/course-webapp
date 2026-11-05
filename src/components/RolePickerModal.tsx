import React, { useState } from 'react';
import { useCourse } from '../context/CourseContext';
import { UserRole } from '../types';
import { GraduationCap, Video, CheckCircle2 } from 'lucide-react';

interface RolePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RolePickerModal: React.FC<RolePickerModalProps> = ({ isOpen, onClose }) => {
  const { role, setUserRole, currentUser } = useCourse();
  const [selectedRole, setSelectedRole] = useState<UserRole>(role || 'student');

  if (!isOpen) return null;

  const handleConfirm = () => {
    setUserRole(selectedRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8 p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="text-xs font-mono uppercase tracking-wider text-indigo-600 font-semibold">
            Account Setup · Select Workspace Mode
          </div>
          <h2 className="font-display font-bold text-2xl text-slate-900">
            Welcome, {currentUser?.name || 'Scholar'}!
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Choose your primary role. You can switch between Student and Instructor modes at any time.
          </p>
        </div>

        {/* 2-Card Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option: Student */}
          <div
            onClick={() => setSelectedRole('student')}
            className={`p-5 rounded-xl border-2 cursor-pointer transition-all space-y-3 relative ${
              selectedRole === 'student'
                ? 'border-indigo-600 bg-indigo-50/30'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              {selectedRole === 'student' && (
                <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              )}
            </div>

            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                I am a Student
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Enroll in technical masterclasses, stream video lectures, take timestamped notes, and earn technical certificates.
              </p>
            </div>
          </div>

          {/* Option: Instructor */}
          <div
            onClick={() => setSelectedRole('instructor')}
            className={`p-5 rounded-xl border-2 cursor-pointer transition-all space-y-3 relative ${
              selectedRole === 'instructor'
                ? 'border-amber-600 bg-amber-50/30'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              {selectedRole === 'instructor' && (
                <CheckCircle2 className="w-5 h-5 text-amber-600" />
              )}
            </div>

            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                I am an Instructor
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Upload video lectures (files or webcam recording), manage curriculum modules, and monitor real-time student progress rosters.
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleConfirm}
            className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
          >
            Confirm & Enter Coursecraft
          </button>
        </div>
      </div>
    </div>
  );
};
