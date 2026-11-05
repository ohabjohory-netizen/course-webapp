import React, { useState } from 'react';
import { useCourse } from '../context/CourseContext';
import { X, ShieldCheck, UserPlus, Trash2, CheckCircle2, Mail, Users, AlertCircle } from 'lucide-react';

interface WhitelistManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCourseId?: string;
}

export const WhitelistManagerModal: React.FC<WhitelistManagerModalProps> = ({
  isOpen,
  onClose,
  initialCourseId,
}) => {
  const { courses, addStudentEmailToWhitelist, removeStudentEmailFromWhitelist } = useCourse();

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    initialCourseId || courses[0]?.id || ''
  );
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  const [singleEmail, setSingleEmail] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen || !selectedCourse) return null;

  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    const email = singleEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    addStudentEmailToWhitelist(selectedCourse.id, email);
    setSingleEmail('');
    showNotice(`Added ${email} to ${selectedCourse.title} whitelist!`);
  };

  const handleAddBulk = (e: React.FormEvent) => {
    e.preventDefault();
    const emails = bulkEmails
      .split(/[\n,;]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0 && e.includes('@'));

    if (emails.length === 0) {
      alert('Please enter valid email addresses separated by commas or new lines.');
      return;
    }

    emails.forEach((email) => {
      addStudentEmailToWhitelist(selectedCourse.id, email);
    });

    setBulkEmails('');
    setIsBulkMode(false);
    showNotice(`Added ${emails.length} student emails to whitelist!`);
  };

  const handleRemove = (email: string) => {
    removeStudentEmailFromWhitelist(selectedCourse.id, email);
    showNotice(`Removed ${email} from whitelist.`);
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Private Gmail Whitelist Manager
              </h3>
              <p className="text-xs text-slate-500">
                Authorize specific student Gmail accounts to access unlisted YouTube lectures and notes
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

        {/* Notice feedback */}
        {notification && (
          <div className="bg-emerald-50 px-6 py-2.5 text-xs text-emerald-800 border-b border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{notification}</span>
          </div>
        )}

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Target Course Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Select Private Masterclass:
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.allowedStudentEmails?.length || 0} whitelisted)
                </option>
              ))}
            </select>
          </div>

          {/* Add Form */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900">
                {isBulkMode ? 'Bulk Add Student Gmails' : 'Add Single Student Gmail'}
              </span>
              <button
                type="button"
                onClick={() => setIsBulkMode(!isBulkMode)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                {isBulkMode ? 'Switch to Single Input' : 'Switch to Bulk Paste'}
              </button>
            </div>

            {!isBulkMode ? (
              <form onSubmit={handleAddSingle} className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="email"
                    placeholder="student.name@gmail.com"
                    value={singleEmail}
                    onChange={(e) => setSingleEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!singleEmail.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Authorize Gmail</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleAddBulk} className="space-y-2">
                <textarea
                  rows={3}
                  placeholder="Paste student emails separated by commas or new lines, e.g.:
student1@gmail.com
student2@gmail.com, student3@gmail.com"
                  value={bulkEmails}
                  onChange={(e) => setBulkEmails(e.target.value)}
                  className="w-full p-3 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!bulkEmails.trim()}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Authorize All Pasted Emails</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Current Whitelisted Roster */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  Authorized Gmail Whitelist ({selectedCourse.allowedStudentEmails?.length || 0})
                </span>
              </h4>
              <span className="text-[11px] text-slate-400">
                Only these Gmail accounts can stream YouTube lectures
              </span>
            </div>

            {(!selectedCourse.allowedStudentEmails ||
              selectedCourse.allowedStudentEmails.length === 0) ? (
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs text-slate-400">
                <AlertCircle className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                No student emails whitelisted yet. Add a student Gmail above to give them access.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden text-xs max-h-56 overflow-y-auto">
                {selectedCourse.allowedStudentEmails.map((email, idx) => (
                  <div
                    key={idx}
                    className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-mono text-[10px] font-bold">
                        {email[0]?.toUpperCase()}
                      </div>
                      <span className="font-mono text-slate-800">{email}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(email)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Revoke student access"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
