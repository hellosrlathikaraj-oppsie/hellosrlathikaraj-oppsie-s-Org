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
  ChevronDown,
  Paperclip
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
  const [selectedHookId, setSelectedHookId] = useState(activeProfessor.recentPublications[0]?.id || '');

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
    const selectedPublication = activeProfessor.recentPublications.find((publication) => publication.id === selectedHookId);
    const hookProfessor = selectedPublication
      ? { ...activeProfessor, recentPublications: [selectedPublication, ...activeProfessor.recentPublications.filter((publication) => publication.id !== selectedHookId)] }
      : activeProfessor;
    const hook = openalex.generateEmailHook(hookProfessor, userProfile, templateType);
    setEmailSubject(hook.subject);
    setEmailBody(hook.body);
    setHookRationale(hook.hookRationale);
  }, [activeProfessor.id, selectedHookId, templateType, userProfile]);

  useEffect(() => {
    setSelectedHookId(activeProfessor.recentPublications[0]?.id || '');
  }, [activeProfessor.id]);

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
    <div className="space-y-5 pb-20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBackToDiscover}
          className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white px-4 py-2 text-xs font-semibold text-pink-700 shadow-sm transition hover:border-pink-300 hover:bg-pink-50 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Discover
        </button>
        <label className="relative inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
          Jump to faculty
          <select
            value={activeProfessor.id}
            onChange={(e) => onSelectProfessorById(e.target.value)}
            className="appearance-none rounded-full border border-pink-200 bg-white py-2 pl-3 pr-8 text-xs font-semibold text-slate-700 outline-none transition focus:border-pink-400 cursor-pointer"
          >
            {MOCK_PROFESSORS.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.institution})</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-pink-500" />
        </label>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
        <section className="space-y-5 rounded-[28px] border border-pink-100 bg-white p-5 shadow-[0_18px_50px_rgba(190,24,93,0.08)] sm:p-7">
          <div className="flex items-start gap-4">
            <div className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-[24px] ${activeProfessor.avatarBg} text-3xl font-extrabold text-white shadow-lg ring-4 ring-pink-50`}>
              {activeProfessor.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{activeProfessor.name}</h2>
                <span className="rounded-full bg-pink-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-pink-700">
                  {activeProfessor.primaryField}
                </span>
              </div>
              {activeProfessor.title && <p className="mt-1 text-sm font-semibold text-slate-600">{activeProfessor.title}</p>}
              {(activeProfessor.department || activeProfessor.institution || activeProfessor.city || activeProfessor.country) && (
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {[activeProfessor.department, activeProfessor.institution, [activeProfessor.city, activeProfessor.country].filter(Boolean).join(', ')].filter(Boolean).map((value, index) => (
                    <React.Fragment key={`${value}-${index}`}>
                      {index > 0 && <span className="mx-1.5 text-pink-300">·</span>}{value}
                    </React.Fragment>
                  ))}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold">
                {activeProfessor.googleScholarUrl && <a href={activeProfessor.googleScholarUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-pink-600 hover:text-pink-800"><BookOpen className="h-3.5 w-3.5" /> Google Scholar <ExternalLink className="h-3 w-3" /></a>}
                {activeProfessor.labWebsiteUrl && <a href={activeProfessor.labWebsiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-pink-600 hover:text-pink-800"><Globe className="h-3.5 w-3.5" /> Lab Website <ExternalLink className="h-3 w-3" /></a>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-pink-100 rounded-2xl bg-pink-50/70 p-3 text-center">
            <div><div className="text-lg font-extrabold text-pink-700">{activeProfessor.matchingScore}%</div><div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Candidate Fit</div></div>
            <div><div className="text-lg font-extrabold text-slate-800">{activeProfessor.hIndex}</div><div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">h-index</div></div>
            <div><div className="text-lg font-extrabold text-slate-800">{activeProfessor.totalCitations.toLocaleString()}</div><div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Citations</div></div>
          </div>

          {activeProfessor.matchReasons && activeProfessor.matchReasons.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">Match reasons</h3>
              <div className="space-y-2">
                {activeProfessor.matchReasons.map((reason, index) => <div key={index} className="flex items-start gap-2 rounded-xl border border-pink-100 bg-pink-50/40 px-3 py-2 text-xs leading-relaxed text-slate-600"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pink-500" />{reason}</div>)}
              </div>
            </div>
          )}

          {(activeProfessor.bio || activeProfessor.researchTopics.length > 0) && (
            <div className="border-t border-pink-100 pt-5">
              {activeProfessor.bio && <p className="text-sm leading-relaxed text-slate-600">{activeProfessor.bio}</p>}
              {activeProfessor.researchTopics.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{activeProfessor.researchTopics.map((topic) => <span key={topic} className="rounded-full border border-pink-200 bg-white px-3 py-1.5 text-xs font-semibold text-pink-700">{topic}</span>)}</div>}
            </div>
          )}

          <div className="border-t border-pink-100 pt-5">
            <div className="mb-3 flex items-center justify-between"><h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-800"><FileText className="h-4 w-4 text-pink-500" />Recent publications</h3><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">{activeProfessor.recentPublications.length} indexed</span></div>
            <div className="space-y-2.5">
              {activeProfessor.recentPublications.map((pub) => (
                <label key={pub.id} className={`block cursor-pointer rounded-2xl border p-3 transition ${selectedHookId === pub.id ? 'border-pink-300 bg-pink-50/70' : 'border-slate-100 bg-slate-50 hover:border-pink-200'}`}>
                  <div className="flex items-start gap-3">
                    <input type="radio" name="hook-publication" value={pub.id} checked={selectedHookId === pub.id} onChange={() => setSelectedHookId(pub.id)} className="mt-1 accent-pink-600" />
                    <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center justify-between gap-2"><span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pink-700">{pub.venue}</span><span className="text-[10px] font-semibold text-slate-400">{pub.year} · {pub.citations} citations</span></span><span className="mt-1.5 block text-xs font-bold leading-snug text-slate-800">{pub.title}</span>{pub.abstractSnippet && <span className="mt-1 block line-clamp-2 text-[11px] leading-relaxed text-slate-500">{pub.abstractSnippet}</span>}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-pink-100 pt-5">
            {isSearchingEmail ? <div className="flex items-center gap-2 py-2 text-xs text-slate-500"><div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />Looking up faculty contact...</div> : currentEmail && !isEditingEmail ? (
              <div className="rounded-2xl border border-pink-100 bg-pink-50/50 p-3.5"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2.5"><Mail className="h-4 w-4 shrink-0 text-pink-600" /><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="truncate text-xs font-semibold text-slate-800">{currentEmail}</span>{isMockEmail && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">Sample data</span>}{isManualEmail && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Manually added</span>}</div>{isMockEmail && <p className="mt-0.5 text-[11px] text-slate-500">Placeholder address for demo. Add a manual email below to enable sending actions.</p>}</div></div><div className="flex gap-2"><button onClick={() => { navigator.clipboard.writeText(currentEmail); onShowToast('Email copied to clipboard', undefined, 'success'); }} className="rounded-full border border-pink-200 bg-white px-3 py-1.5 text-xs font-semibold text-pink-700 hover:bg-pink-50 cursor-pointer"><Copy className="mr-1 inline h-3.5 w-3.5" />Copy</button><button onClick={() => { setManualEmailInput(currentEmail); setIsEditingEmail(true); }} className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-white cursor-pointer"><Edit3 className="mr-1 inline h-3.5 w-3.5" />{isManualEmail ? 'Edit' : 'Replace'}</button></div></div></div>
            ) : <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><div className="flex items-start gap-2"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /><div><span className="text-xs font-bold text-amber-800">No email found, add manually</span><p className="mt-0.5 text-[11px] text-amber-700/80">No contact is listed for this faculty member. Enter their official department email to enable sending.</p></div></div><form onSubmit={handleSaveManualEmail} className="mt-3 flex flex-col gap-2 sm:flex-row"><input type="email" placeholder="e.g. professor@cs.university.edu" value={manualEmailInput} onChange={(e) => setManualEmailInput(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-amber-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-amber-400" autoFocus /><button type="submit" className="rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 cursor-pointer"><Plus className="mr-1 inline h-3.5 w-3.5" />Save Manual Email</button>{currentEmail && <button type="button" onClick={() => setIsEditingEmail(false)} className="rounded-full px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-white cursor-pointer">Cancel</button>}</form></div>}
          </div>
        </section>

        <section className="rounded-[28px] border border-pink-100 bg-white p-5 shadow-[0_18px_50px_rgba(190,24,93,0.08)] sm:p-7 xl:sticky xl:top-24">
          <div className="flex flex-col gap-4 border-b border-pink-100 pb-5 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-pink-100 text-pink-600"><Sparkles className="h-4 w-4" /></div><div><h3 className="text-lg font-extrabold text-slate-900">Outreach draft</h3><p className="text-xs text-slate-500">Personalized from your profile and the selected publication</p></div></div></div><div className="flex rounded-full bg-pink-50 p-1"><button onClick={() => setTemplateType('phd')} className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition cursor-pointer ${templateType === 'phd' ? 'bg-pink-600 text-white shadow' : 'text-pink-700 hover:bg-white'}`}>PhD / RA</button><button onClick={() => setTemplateType('internship')} className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition cursor-pointer ${templateType === 'internship' ? 'bg-pink-600 text-white shadow' : 'text-pink-700 hover:bg-white'}`}>Internship</button><button onClick={() => setTemplateType('collaboration')} className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition cursor-pointer ${templateType === 'collaboration' ? 'bg-pink-600 text-white shadow' : 'text-pink-700 hover:bg-white'}`}>Thesis</button></div></div>
          <div className="mt-5 rounded-2xl border border-pink-200 bg-pink-50/70 p-4"><span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-700">Hook strategy</span><p className="mt-1 text-xs leading-relaxed text-slate-600">{hookRationale}</p></div>
          <div className="mt-5 space-y-5"><div><div className="mb-1.5 flex items-center justify-between"><label className="text-xs font-bold text-slate-600">Subject line</label><button onClick={handleCopySubject} className="text-[11px] font-semibold text-pink-600 hover:text-pink-800 cursor-pointer">{copiedSubject ? <><Check className="mr-1 inline h-3.5 w-3.5" />Copied</> : <><Copy className="mr-1 inline h-3.5 w-3.5" />Copy subject</>}</button></div><input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="w-full rounded-2xl border border-pink-100 bg-pink-50/40 px-4 py-3 text-xs text-slate-800 outline-none focus:border-pink-400" /></div><div><div className="mb-1.5 flex items-center justify-between"><label className="text-xs font-bold text-slate-600">Email body</label><span className="text-[11px] font-semibold text-slate-400">{emailBody.split(/\s+/).filter(Boolean).length} words</span></div><textarea rows={17} value={emailBody} onChange={(e) => setEmailBody(e.target.value)} className="w-full resize-y rounded-2xl border border-pink-100 bg-pink-50/40 p-4 text-xs leading-relaxed text-slate-800 outline-none focus:border-pink-400" /></div></div>
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-dashed border-pink-200 bg-pink-50/40 p-3.5"><Paperclip className="h-4 w-4 shrink-0 text-pink-600" /><div className="min-w-0"><p className="text-xs font-bold text-slate-700">Resume attachment</p>{userProfile.cvUrl ? <a href={userProfile.cvUrl} target="_blank" rel="noreferrer" className="block truncate text-[11px] text-pink-600 hover:text-pink-800">{userProfile.cvUrl.split('/').pop() || userProfile.cvUrl}</a> : <p className="text-[11px] text-slate-500">No resume attached</p>}</div></div>
          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between"><button onClick={handleCopyDraft} className="rounded-full border border-pink-200 bg-white px-4 py-2.5 text-xs font-bold text-pink-700 hover:bg-pink-50 cursor-pointer">{copiedDraft ? <><Check className="mr-1.5 inline h-4 w-4 text-emerald-500" />Copied full email!</> : <><Copy className="mr-1.5 inline h-4 w-4" />Copy full draft</>}</button><div className="flex flex-col gap-2 sm:flex-row">{isSendDisabled ? <button disabled title={isMockEmail ? "Disabled: Sample email address. Replace with real email first." : "Disabled: No email found."} className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-400 opacity-70 cursor-not-allowed"><ExternalLink className="mr-1.5 inline h-4 w-4" />Open in Gmail</button> : <a href={gmailUrl} target="_blank" rel="noreferrer" className="rounded-full border border-pink-200 bg-white px-4 py-2.5 text-xs font-bold text-pink-700 hover:bg-pink-50"><ExternalLink className="mr-1.5 inline h-4 w-4" />Open in Gmail</a>}<button id="mark-sent-add-tracker-btn" onClick={handleMarkAsSent} disabled={isAddingToTracker || isSendDisabled} title={isMockEmail ? "Disabled for sample email data" : !currentEmail ? "Disabled: No email found" : ""} className="rounded-full bg-pink-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-pink-200 transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-40">{isAddingToTracker ? 'Adding to Tracker...' : 'Mark as Sent & Add to Tracker'}</button></div></div>
        </section>
      </div>
    </div>
  );
}
