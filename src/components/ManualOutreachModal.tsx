import React, { useState } from 'react';
import { X, Send, User, Building2, Mail, Calendar, MessageSquare, CheckCircle2 } from 'lucide-react';
import { TrackerEntry, OutreachStatus } from '../types';
import { storage } from '../services/storage';

interface ManualOutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: (entry: TrackerEntry) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export function ManualOutreachModal({
  isOpen,
  onClose,
  onAdded,
  onShowToast,
}: ManualOutreachModalProps) {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [professorName, setProfessorName] = useState('');
  const [institution, setInstitution] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [dateSent, setDateSent] = useState(todayStr);
  const [status, setStatus] = useState<OutreachStatus>('Sent');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!professorName.trim() || !email.trim()) {
      onShowToast('Missing required fields', 'Please provide at least a professor name and email.', 'error');
      return;
    }

    setIsSubmitting(true);

    const newEntry = storage.addTrackerEntry({
      professorName: professorName.trim(),
      institution: institution.trim() || 'Unspecified Institution',
      email: email.trim(),
      subject: subject.trim() || 'Cold Research Inquiry',
      dateSent: dateSent || todayStr,
      status,
      lastContactDate: dateSent || todayStr,
      followUpDue: false,
      followUpDays: 0,
      notes: notes.trim(),
    });

    setTimeout(() => {
      setIsSubmitting(false);
      onAdded(newEntry);
      onShowToast('Outreach logged successfully', `Added ${professorName} to your pipeline.`, 'success');
      onClose();
      // Reset form
      setProfessorName('');
      setInstitution('');
      setEmail('');
      setSubject('');
      setNotes('');
      setStatus('Sent');
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-[#0e1422] border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-sans">
                Log Manual Outreach
              </h3>
              <p className="text-xs text-slate-400">
                Record an email or outreach message sent outside Scout
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Professor Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                Professor Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Jennifer Widom"
                value={professorName}
                onChange={(e) => setProfessorName(e.target.value)}
                className="w-full bg-[#131b2c] text-xs text-slate-100 placeholder-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Institution */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                University / Institution
              </label>
              <input
                type="text"
                placeholder="e.g. Stanford University"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full bg-[#131b2c] text-xs text-slate-100 placeholder-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Contact Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                Contact Email *
              </label>
              <input
                type="email"
                required
                placeholder="prof@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#131b2c] text-xs text-slate-100 placeholder-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:border-indigo-500 outline-none font-mono"
              />
            </div>

            {/* Date Sent */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Date Sent
              </label>
              <input
                type="date"
                value={dateSent}
                onChange={(e) => setDateSent(e.target.value)}
                className="w-full bg-[#131b2c] text-xs text-slate-100 px-3.5 py-2 rounded-xl border border-slate-700/60 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Subject Line */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Email Subject Line
            </label>
            <input
              type="text"
              placeholder="e.g. Prospective Graduate Researcher - Systems Lab"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-[#131b2c] text-xs text-slate-100 placeholder-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Current Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Initial Outreach Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OutreachStatus)}
              className="w-full bg-[#131b2c] text-xs text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="Sent" className="bg-[#111827]">Sent (Awaiting Reply)</option>
              <option value="Followed Up" className="bg-[#111827]">Followed Up</option>
              <option value="Replied" className="bg-[#111827]">Replied</option>
              <option value="Meeting Booked" className="bg-[#111827]">Meeting Booked</option>
              <option value="Not Interested" className="bg-[#111827]">Not Interested</option>
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              Notes & Follow-up Details
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Reached out after viewing their keynote at OSDI. Mentioned interest in BFT state machines."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#131b2c] text-xs text-slate-100 placeholder-slate-400 p-3 rounded-xl border border-slate-700/60 focus:border-indigo-500 outline-none resize-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Logging...' : 'Save to Pipeline'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
