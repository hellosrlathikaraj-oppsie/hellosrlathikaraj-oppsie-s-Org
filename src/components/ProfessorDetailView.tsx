import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Mail, 
  ExternalLink, 
  BookOpen, 
  Copy, 
  Check, 
  Send, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Globe, 
  FileText,
  ChevronDown
} from 'lucide-react';
import { Professor, UserProfile, NavigationTab } from '../types';
import { openalex, MOCK_PROFESSORS } from '../services/openalex';
import { emailFinder } from '../services/emailFinder';
import { storage } from '../services/storage';

interface ProfessorDetailViewProps {
  professor: Professor | null;
  onBackToDiscover: () => void;
  onNavigateToTracker: () => void;
  userProfile: UserProfile;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info', action?: { label: string; onClick: () => void }) => void;
  onSelectProfessorById: (id: string) => void;
}

export function ProfessorDetailView({
  professor,
  onBackToDiscover,
  onNavigateToTracker,
  userProfile,
  onShowToast,
  onSelectProfessorById,
}: ProfessorDetailViewProps) {
  // If no professor is selected, default to the top professor
  const activeProfessor = professor || MOCK_PROFESSORS[0];

  const [templateType, setTemplateType] = useState<'phd' | 'internship' | 'collaboration'>('phd');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [hookRationale, setHookRationale] = useState('');
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [isAddingToTracker, setIsAddingToTracker] = useState(false);

  // Email finder state
  const [currentEmail, setCurrentEmail] = useState<string | null>(activeProfessor.email);
  const [isManualEmail, setIsManualEmail] = useState<boolean>(!!activeProfessor.isManualEmail);
  const [isMockEmail, setIsMockEmail] = useState<boolean>(!activeProfessor.isManualEmail && !!activeProfessor.isMockEmail);
  const [manualEmailInput, setManualEmailInput] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isSearchingEmail, setIsSearchingEmail] = useState(false);

  // Load email and hook when professor or profile changes
  useEffect(() => {
    if (!activeProfessor) return;

    // Check email finder
    setIsSearchingEmail(true);
    emailFinder.findEmail(activeProfessor.id).then((res) => {
      if (res.isCustomManual && res.email) {
        setCurrentEmail(res.email);
        setIsManualEmail(true);
        setIsMockEmail(false);
      } else {
        setCurrentEmail(activeProfessor.email);
        setIsManualEmail(!!activeProfessor.isManualEmail);
        setIsMockEmail(!activeProfessor.isManualEmail && !!activeProfessor.isMockEmail);
      }
      setIsSearchingEmail(false);
    });

    // Generate hook draft
    const hook = openalex.generateEmailHook(activeProfessor, userProfile, templateType);
    setEmailSubject(hook.subject);
    setEmailBody(hook.body);
    setHookRationale(hook.hookRationale);
  }, [activeProfessor.id, templateType, userProfile]);

  // Handle saving manual email
  const handleSaveManualEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmailInput.trim() || !manualEmailInput.includes('@')) {
      onShowToast('Please enter a valid email address', undefined, 'error');
      return;
    }

    const saved = emailFinder.saveManualEmail(activeProfessor.id, manualEmailInput.trim());
    setCurrentEmail(saved.email);
    setIsManualEmail(true);
    setIsMockEmail(false);
    setIsEditingEmail(false);
    setManualEmailInput('');
    onShowToast('Manual email saved for this professor', undefined, 'success');
  };

  // Copy Subject Line
  const handleCopySubject = () => {
    navigator.clipboard.writeText(emailSubject);
    setCopiedSubject(true);
    onShowToast('Subject line copied to clipboard', undefined, 'success');
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  // Copy Draft Body
  const handleCopyDraft = () => {
    navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
    setCopiedDraft(true);
    onShowToast('Full cold outreach draft copied!', undefined, 'success');
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  // Open in Gmail link generator
  const gmailUrl = currentEmail
    ? `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(currentEmail)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    : '';

  // Can send/open email check (forbidden if no email or is mock placeholder)
  const isSendDisabled = !currentEmail || isMockEmail;

  // Mark as Sent & Add to Tracker (End-to-End)
  const handleMarkAsSent = () => {
    if (!currentEmail) {
      onShowToast('Cannot add without an email', 'Please provide a valid contact email for this professor first.', 'error');
      setIsEditingEmail(true);
      return;
    }

    if (isMockEmail) {
      onShowToast('Sample email address', 'Please replace the placeholder with a real email before sending or tracking.', 'error');
      setIsEditingEmail(true);
      return;
    }

    setIsAddingToTracker(true);

    const todayStr = new Date().toISOString().slice(0, 10);
    const newEntry = storage.addTrackerEntry({
      professorId: activeProfessor.id,
      professorName: activeProfessor.name,
      institution: activeProfessor.institution,
      email: currentEmail,
      subject: emailSubject,
      dateSent: todayStr,
      status: 'Sent',
      lastContactDate: todayStr,
      followUpDue: false,
      followUpDays: 0,
      notes: `Sent personalized cold hook via Scout referencing recent work on ${activeProfessor.researchTopics[0] || 'research'}.`,
      hookSnippet: activeProfessor.suggestedHookSnippet,
    });

    setTimeout(() => {
      setIsAddingToTracker(false);
      onShowToast(
        'Outreach marked as sent & added to Tracker!',
        `Successfully logged outreach to ${activeProfessor.name}.`,
        'success',
        {
          label: 'View in Tracker →',
          onClick: onNavigateToTracker,
        }
      );
    }, 400);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top navigation row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBackToDiscover}
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#0e1422] hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discover</span>
        </button>

        {/* Quick professor switcher dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Jump to faculty:</span>
          <select
            value={activeProfessor.id}
            onChange={(e) => onSelectProfessorById(e.target.value)}
            className="bg-[#0e1422] text-xs text-slate-200 border border-slate-800 rounded-xl px-3 py-1.5 outline-none focus:border-indigo-500 cursor-pointer"
          >
            {MOCK_PROFESSORS.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#111827]">
                {p.name} ({p.institution})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hero Professor Card */}
      <div className="bg-[#0e1422] rounded-2xl border border-slate-800/90 p-6 sm:p-8 shadow-xl shadow-black/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            {/* Initials Avatar (No photos, per user rules) */}
            <div
              className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl ${activeProfessor.avatarBg} text-white flex items-center justify-center text-2xl font-bold shadow-xl ring-2 ring-white/10 shrink-0 font-sans`}
            >
              {activeProfessor.initials}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-sans">
                  {activeProfessor.name}
                </h2>
                <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-md bg-slate-800/90 text-slate-200 border border-slate-700">
                  {activeProfessor.primaryField}
                </span>
              </div>

              {activeProfessor.title && (
                <p className="text-sm text-slate-300 font-medium">{activeProfessor.title}</p>
              )}
              {(activeProfessor.department || activeProfessor.institution || activeProfessor.city || activeProfessor.country) && (
                <p className="text-xs text-slate-400">
                  {[activeProfessor.department, activeProfessor.institution, [activeProfessor.city, activeProfessor.country].filter(Boolean).join(', ')].filter(Boolean).map((item, index, items) => (
                    <React.Fragment key={`${item}-${index}`}>
                      {index > 0 && ' · '}
                      <span className={item === activeProfessor.institution ? 'text-slate-300 font-semibold' : undefined}>{item}</span>
                    </React.Fragment>
                  ))}
                </p>
              )}

              {/* External directory links */}
              <div className="flex items-center gap-3 pt-2 text-xs">
                {activeProfessor.googleScholarUrl && (
                  <a
                    href={activeProfessor.googleScholarUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Google Scholar</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}
                {activeProfessor.labWebsiteUrl && (
                  <a
                    href={activeProfessor.labWebsiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Lab Website</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Fit Score & Metrics */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 bg-[#131b2e] lg:bg-transparent p-4 lg:p-0 rounded-xl border border-slate-800 lg:border-transparent">
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-2 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-md shadow-emerald-950/50">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>{activeProfessor.isProvisionalScore ? `${activeProfessor.matchingScore} matching works (provisional)` : `${activeProfessor.matchingScore}% Candidate Fit`}</span>
              </div>
            </div>
            <div className="text-xs font-mono text-slate-400 space-y-0.5 text-left lg:text-right">
              <div>Total Citations: <span className="text-slate-200 font-bold">{activeProfessor.totalCitations.toLocaleString()}</span></div>
              <div>h-index: <span className="text-slate-200 font-bold">{activeProfessor.hIndex}</span></div>
            </div>
          </div>
        </div>

        {/* Contact Email & Status Bar (includes "No email found, add manually" state) */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          {isSearchingEmail ? (
            <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <span>Looking up faculty contact...</span>
            </div>
          ) : currentEmail && !isEditingEmail ? (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0f19] p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-slate-100">{currentEmail}</span>
                    {isMockEmail && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-700/50 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Sample data, not a real address
                      </span>
                    )}
                    {isManualEmail && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/50 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Manually added
                      </span>
                    )}
                  </div>
                  {isMockEmail && (
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Placeholder address for demo. Add a manual email below to enable sending actions.
                    </p>
                  )}
                  {isManualEmail && (
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Saved to your local contact overrides for this faculty member.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentEmail);
                    onShowToast('Email copied to clipboard', undefined, 'success');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={() => {
                    setManualEmailInput(currentEmail);
                    setIsEditingEmail(true);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isManualEmail ? 'Edit' : 'Replace with Real Email'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* "No email found, add manually" state */
            <div className="bg-[#1f1614] border border-amber-800/50 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-amber-200">No email found, add manually</span>
                  <p className="text-[11px] text-amber-300/80 mt-0.5">
                    No contact is listed for this faculty member. Enter their official department email to enable sending.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveManualEmail} className="flex flex-col sm:flex-row gap-2 pt-1">
                <input
                  type="email"
                  placeholder="e.g. professor@cs.university.edu"
                  value={manualEmailInput}
                  onChange={(e) => setManualEmailInput(e.target.value)}
                  className="flex-1 bg-[#120d0c] text-xs text-slate-100 placeholder-slate-400 px-3.5 py-2.5 rounded-lg border border-amber-700/60 focus:border-amber-400 outline-none"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Manual Email</span>
                  </button>
                  {currentEmail && (
                    <button
                      type="button"
                      onClick={() => setIsEditingEmail(false)}
                      className="px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Match Alignment Factors */}
        {activeProfessor.matchReasons && activeProfessor.matchReasons.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono mb-2.5">
              Candidate Alignment Rationale
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {activeProfessor.matchReasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[#0a0f19] border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Research Profile & Publications (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Research Overview */}
          <div className="bg-[#0e1422] rounded-2xl border border-slate-800/90 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Research Focus & Lab
            </h3>
            {activeProfessor.bio && (
              <p className="text-xs text-slate-300 leading-relaxed">{activeProfessor.bio}</p>
            )}

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono block mb-2">
                Core Domains
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeProfessor.researchTopics.map((topic) => (
                  <span
                    key={topic}
                    className="text-xs px-2.5 py-1 rounded-lg bg-[#141e33] text-indigo-200 border border-slate-700/60"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Key Publications List */}
          <div className="bg-[#0e1422] rounded-2xl border border-slate-800/90 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Featured Publications
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {activeProfessor.recentPublications.length} indexed
              </span>
            </div>

            <div className="space-y-3">
              {activeProfessor.recentPublications.map((pub) => (
                <div
                  key={pub.id}
                  className="p-3.5 rounded-xl bg-[#0a0f19] border border-slate-800 hover:border-slate-700 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                      {pub.venue}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {pub.citations} citations
                    </span>
                  </div>

                  <h5 className="text-xs font-semibold text-slate-100 leading-snug">
                    {pub.title}
                  </h5>

                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                    {pub.abstractSnippet}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Cold Outreach Hook Generator & Action (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#0e1422] rounded-2xl border border-slate-800/90 p-5 sm:p-6 space-y-5 shadow-xl shadow-black/20">
            {/* Header & Goal Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Personalized Outreach Hook
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Generated from your research background & recent lab publications
                </p>
              </div>

              {/* Template / Intent Tabs */}
              <div className="flex items-center bg-[#131b2e] p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                <button
                  onClick={() => setTemplateType('phd')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    templateType === 'phd'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  PhD / RA
                </button>
                <button
                  onClick={() => setTemplateType('internship')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    templateType === 'internship'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Internship
                </button>
                <button
                  onClick={() => setTemplateType('collaboration')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    templateType === 'collaboration'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Thesis
                </button>
              </div>
            </div>

            {/* Hook Rationale Callout */}
            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 space-y-1">
              <span className="font-bold text-[11px] uppercase tracking-wider font-mono text-indigo-300 block">
                Hook Strategy
              </span>
              <p className="leading-relaxed text-slate-300">
                {hookRationale}
              </p>
            </div>

            {/* Subject Line Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Subject Line
                </label>
                <button
                  onClick={handleCopySubject}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedSubject ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300 text-[11px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Copy Subject</span>
                    </>
                  )}
                </button>
              </div>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full bg-[#131b2c] text-xs font-mono text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Email Body Editor */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Email Body (Customizable)
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  {emailBody.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                rows={13}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="w-full bg-[#131b2c] text-xs text-slate-100 p-3.5 rounded-xl border border-slate-700/60 focus:border-indigo-500 outline-none leading-relaxed font-sans resize-y"
              />
            </div>

            {/* Action Buttons Row */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handleCopyDraft}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-[#131b2e] hover:bg-slate-800 border border-slate-700/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedDraft ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copied Full Email!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Full Draft</span>
                  </>
                )}
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                {/* Mandated Feature: Open in Gmail */}
                {isSendDisabled ? (
                  <button
                    disabled
                    title={isMockEmail ? "Disabled: Sample email address. Replace with real email first." : "Disabled: No email found."}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-medium text-slate-500 bg-slate-800/40 border border-slate-800 flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open in Gmail</span>
                  </button>
                ) : (
                  <a
                    href={gmailUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-indigo-400" />
                    <span>Open in Gmail</span>
                  </a>
                )}

                {/* Mandated Feature: "Mark as Sent & Add to Tracker" */}
                <button
                  id="mark-sent-add-tracker-btn"
                  onClick={handleMarkAsSent}
                  disabled={isAddingToTracker || isSendDisabled}
                  title={isMockEmail ? "Disabled for sample email data" : !currentEmail ? "Disabled: No email found" : ""}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 flex items-center justify-center gap-2 transition-all cursor-pointer font-sans disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className={`w-4 h-4 ${isAddingToTracker ? 'animate-pulse' : ''}`} />
                  <span>
                    {isAddingToTracker ? 'Adding to Tracker...' : 'Mark as Sent & Add to Tracker'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
