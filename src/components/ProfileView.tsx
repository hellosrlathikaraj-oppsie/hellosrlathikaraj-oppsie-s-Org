import React, { useState } from 'react';
import { 
  User, 
  Sparkles, 
  Save, 
  Plus, 
  X, 
  GraduationCap, 
  Briefcase, 
  FileText, 
  Code, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import { UserProfile } from '../types';
import { storage } from '../services/storage';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onDataImported: () => void;
  onClearData: () => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export function ProfileView({
  profile,
  onUpdateProfile,
  onDataImported,
  onClearData,
  onShowToast,
}: ProfileViewProps) {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [newInterest, setNewInterest] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Dynamic Profile Completeness computation (Replacing 'Corpus readiness')
  const completeness = storage.computeProfileCompleteness(formData);

  const handleFieldChange = (field: keyof UserProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInterest.trim()) return;
    if (!formData.primaryInterests.includes(newInterest.trim())) {
      setFormData((prev) => ({
        ...prev,
        primaryInterests: [...prev.primaryInterests, newInterest.trim()],
      }));
    }
    setNewInterest('');
  };

  const handleRemoveInterest = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      primaryInterests: prev.primaryInterests.filter((i) => i !== item),
    }));
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (!formData.technicalSkills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        technicalSkills: [...prev.technicalSkills, newSkill.trim()],
      }));
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      technicalSkills: prev.technicalSkills.filter((s) => s !== item),
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    storage.saveProfile(formData);
    onUpdateProfile(formData);

    setTimeout(() => {
      setIsSaving(false);
      onShowToast('Profile saved & persisted', 'Your fit scores across Discover have been updated.', 'success');
    }, 250);
  };

  const handleExport = () => {
    const blob = new Blob([storage.exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scout-data-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      storage.importData(await file.text());
      const importedProfile = storage.getProfile();
      setFormData(importedProfile);
      onUpdateProfile(importedProfile);
      onDataImported();
      onShowToast('Scout data imported', 'Profile, tracker, and manual email data were restored locally.', 'success');
    } catch {
      onShowToast('Import failed', 'Choose a JSON file exported from Scout.', 'error');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Profile Completeness Banner (Computed dynamically from filled fields) */}
      <div className="bg-[#0e1422] rounded-2xl border border-slate-800/90 p-6 shadow-lg shadow-black/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* User Initials Avatar */}
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl ring-2 ring-white/10 shrink-0 font-sans">
              {formData.fullName ? formData.fullName.slice(0, 2).toUpperCase() : 'AC'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight font-sans">
                  {formData.fullName || 'Candidate Profile'}
                </h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                  {formData.targetOpportunity || 'Prospective Applicant'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {formData.currentDegree} · {formData.currentInstitution} (Class of {formData.graduationYear})
              </p>
            </div>
          </div>

          {/* Profile Completeness Score (Renamed from Corpus readiness as mandated) */}
          <div className="flex flex-col sm:items-end bg-[#131b2e] sm:bg-transparent p-3.5 sm:p-0 rounded-xl border border-slate-800 sm:border-transparent">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                Profile Completeness
              </span>
              <span className="text-sm font-mono font-bold text-indigo-400">
                {completeness.percent}%
              </span>
            </div>
            <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden mt-1.5">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${completeness.percent}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1">
              {completeness.filledFields} of {completeness.totalFields} profile sections completed
            </span>
          </div>
        </div>

        {/* Missing fields banner */}
        {completeness.missing.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-start gap-2.5 text-xs text-amber-300/90 bg-amber-950/20 p-2.5 rounded-xl border border-amber-800/30">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-200">Recommended additions to reach 100% completeness: </span>
              <span>{completeness.missing.join(', ')}</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#0e1422] rounded-2xl border border-slate-800/90 p-5 sm:p-6 space-y-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-white">Your data stays in this browser</h3>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">Scout stores your profile, tracker entries, manual emails, and OpenAlex key in local browser storage. The site does not upload this personal data to Scout servers.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"><Download className="w-3.5 h-3.5" />Export JSON</button>
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"><Upload className="w-3.5 h-3.5" />Import JSON<input type="file" accept="application/json,.json" onChange={handleImport} className="hidden" /></label>
          <button type="button" onClick={() => { if (window.confirm('Clear your Scout profile, tracker, manual emails, and saved OpenAlex key from this browser?')) onClearData(); }} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/70 border border-rose-800/50 text-xs font-semibold text-rose-200 cursor-pointer"><Trash2 className="w-3.5 h-3.5" />Clear my data</button>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Academic & Target Opportunity */}
        <div className="bg-[#0e1422] rounded-2xl border border-slate-800/90 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Academic Background & Intent
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => handleFieldChange('fullName', e.target.value)}
                className="w-full bg-[#131b2c] text-xs text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Primary Contact Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className="w-full bg-[#131b2c] text-xs text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:border-indigo-500 outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Current Institution *
              </label>
              <input
                type="text"
                required
                value={formData.currentInstitution}
                onChange={(e) => handleFieldChange('currentInstitution', e.target.value)}
                className="w-full bg-[#131b2c] text-xs text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Degree & Major *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. B.S. in Computer Science"
                value={formData.currentDegree}
                onChange={(e) => handleFieldChange('currentDegree', e.target.value)}
                className="w-full bg-[#131b2c] text-xs text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Graduation Year
              </label>
              <input
                type="text"
                placeholder="e.g. 2026"
                value={formData.graduationYear}
                onChange={(e) => handleFieldChange('graduationYear', e.target.value)}
                className="w-full bg-[#131b2c] text-xs text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:border-indigo-500 outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Target Opportunity *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. PhD Fall 2027 / Summer Research"
                value={formData.targetOpportunity}
                onChange={(e) => handleFieldChange('targetOpportunity', e.target.value)}
                className="w-full bg-[#131b2c] text-xs text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Research Interests & Technical Skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Research Interests */}
          <div className="bg-[#0e1422] rounded-2xl border border-slate-800/90 p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Primary Research Interests
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {formData.primaryInterests.length} topics
              </span>
            </div>

            {/* Chips list */}
            <div className="flex flex-wrap gap-1.5 min-h-[40px]">
              {formData.primaryInterests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-indigo-950/60 text-indigo-300 border border-indigo-700/50"
                >
                  <span>{interest}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(interest)}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add interest input */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Add research topic (e.g. Paxos, KV Caching)..."
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddInterest(e);
                  }
                }}
                className="flex-1 bg-[#131b2c] text-xs text-slate-100 placeholder-slate-400 px-3 py-2 rounded-xl border border-slate-700/60 focus:border-indigo-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddInterest}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Technical Skills */}
          <div className="bg-[#0e1422] rounded-2xl border border-slate-800/90 p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Technical Skills & Methodologies
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {formData.technicalSkills.length} skills
              </span>
            </div>

            {/* Chips list */}
            <div className="flex flex-wrap gap-1.5 min-h-[40px]">
              {formData.technicalSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-emerald-950/60 text-emerald-300 border border-emerald-700/50"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add skill input */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Add tool/skill (e.g. Rust, PyTorch, TLA+)..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(e);
                  }
                }}
                className="flex-1 bg-[#131b2c] text-xs text-slate-100 placeholder-slate-400 px-3 py-2 rounded-xl border border-slate-700/60 focus:border-indigo-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Research Statement & Bio */}
        <div className="bg-[#0e1422] rounded-2xl border border-slate-800/90 p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Candidate Research Statement
            </h3>
            <span className="text-xs text-slate-400">
              Injected into cold outreach hooks
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Summarize your core research accomplishments, project implementations, and specific questions you wish to explore with prospective faculty advisors.
          </p>

          <textarea
            rows={4}
            value={formData.researchStatement}
            onChange={(e) => handleFieldChange('researchStatement', e.target.value)}
            className="w-full bg-[#131b2c] text-xs text-slate-100 p-3.5 rounded-xl border border-slate-700/60 focus:border-indigo-500 outline-none leading-relaxed resize-y"
          />
        </div>

        {/* Section 4: Academic Links & CV */}
        <div className="bg-[#0e1422] rounded-2xl border border-slate-800/90 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <LinkIcon className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Academic Artifacts & Links
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                CV / Resume URL
              </label>
              <input
                type="text"
                placeholder="https://yourname.dev/cv.pdf"
                value={formData.cvUrl || ''}
                onChange={(e) => handleFieldChange('cvUrl', e.target.value)}
                className="w-full bg-[#131b2c] text-xs font-mono text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                GitHub Profile
              </label>
              <input
                type="text"
                placeholder="https://github.com/username"
                value={formData.githubUrl || ''}
                onChange={(e) => handleFieldChange('githubUrl', e.target.value)}
                className="w-full bg-[#131b2c] text-xs font-mono text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Personal Academic Website
              </label>
              <input
                type="text"
                placeholder="https://yourname.dev"
                value={formData.portfolioUrl || ''}
                onChange={(e) => handleFieldChange('portfolioUrl', e.target.value)}
                className="w-full bg-[#131b2c] text-xs font-mono text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-700/60 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
