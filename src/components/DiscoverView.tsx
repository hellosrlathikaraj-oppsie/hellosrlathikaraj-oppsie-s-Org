import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Sparkles, 
  ExternalLink, 
  BookOpen, 
  GraduationCap, 
  ChevronRight, 
  Mail, 
  Check, 
  SlidersHorizontal,
  ArrowUpDown,
  Building2,
  RefreshCw,
  FolderSearch
} from 'lucide-react';
import { Professor } from '../types';
import { openalex } from '../services/openalex';

interface DiscoverViewProps {
  onSelectProfessor: (professor: Professor) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export function DiscoverView({
  onSelectProfessor,
  searchQuery,
  onSearchChange,
  onShowToast,
}: DiscoverViewProps) {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedField, setSelectedField] = useState('All Fields');
  const [selectedInstitution, setSelectedInstitution] = useState('All Institutions');
  const [sortBy, setSortBy] = useState<'fit' | 'citations' | 'hIndex'>('fit');
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);

  const institutions = openalex.getInstitutions();
  const fields = openalex.getResearchFields();

  const quickTopics = [
    'Distributed Systems',
    'Consensus Protocols',
    'ML Systems (LLM Serving)',
    'Formal Verification',
    'Disaggregated Memory',
    'Microkernels'
  ];

  const fetchProfessors = async () => {
    setLoading(true);
    try {
      const results = await openalex.searchProfessors(searchQuery, {
        field: selectedField,
        institution: selectedInstitution,
        sortBy,
      });
      setProfessors(results);
    } catch (err) {
      console.error('Failed to search professors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessors();
  }, [searchQuery, selectedField, selectedInstitution, sortBy]);

  const handleCopyEmail = (e: React.MouseEvent, prof: Professor) => {
    e.stopPropagation();
    if (!prof.email) {
      onShowToast('No email found for this professor', 'You can add an email manually in the detail view.', 'info');
      return;
    }
    navigator.clipboard.writeText(prof.email);
    setCopiedEmailId(prof.id);
    onShowToast(`Copied ${prof.email} to clipboard!`, undefined, 'success');
    setTimeout(() => setCopiedEmailId(null), 2000);
  };

  const handleResetFilters = () => {
    onSearchChange('');
    setSelectedField('All Fields');
    setSelectedInstitution('All Institutions');
    setSortBy('fit');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Search & Filter Toolbar */}
      <div className="bg-[#0e1422] rounded-2xl border border-slate-800/80 p-5 shadow-lg shadow-black/20">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Main search input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="discover-search-input"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by professor name, research topic, institution, or keyword..."
              className="w-full bg-[#131b2c] text-sm text-slate-100 placeholder-slate-400 pl-11 pr-4 py-3 rounded-xl border border-slate-700/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 px-2 py-1 rounded cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Controls: Field & Institution Dropdowns */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
            <div className="relative min-w-[150px] flex-1 sm:flex-initial">
              <select
                id="filter-field-select"
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="w-full appearance-none bg-[#131b2c] text-xs text-slate-200 pl-3.5 pr-8 py-3 rounded-xl border border-slate-700/60 focus:border-indigo-500 outline-none cursor-pointer"
              >
                {fields.map((f) => (
                  <option key={f} value={f} className="bg-[#111827]">
                    {f}
                  </option>
                ))}
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative min-w-[160px] flex-1 sm:flex-initial">
              <select
                id="filter-institution-select"
                value={selectedInstitution}
                onChange={(e) => setSelectedInstitution(e.target.value)}
                className="w-full appearance-none bg-[#131b2c] text-xs text-slate-200 pl-3.5 pr-8 py-3 rounded-xl border border-slate-700/60 focus:border-indigo-500 outline-none cursor-pointer"
              >
                {institutions.map((inst) => (
                  <option key={inst} value={inst} className="bg-[#111827]">
                    {inst}
                  </option>
                ))}
              </select>
              <Building2 className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative min-w-[130px] flex-1 sm:flex-initial">
              <select
                id="filter-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full appearance-none bg-[#131b2c] text-xs text-slate-200 pl-3.5 pr-8 py-3 rounded-xl border border-slate-700/60 focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="fit" className="bg-[#111827]">Sort by: Fit Score</option>
                <option value="citations" className="bg-[#111827]">Sort by: Citations</option>
                <option value="hIndex" className="bg-[#111827]">Sort by: h-Index</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Quick Topic Chips */}
        <div className="flex items-center gap-2 mt-4 pt-3.5 border-t border-slate-800/80 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 shrink-0 font-medium">Quick Topics:</span>
          {quickTopics.map((topic) => {
            const isActive = searchQuery.toLowerCase() === topic.toLowerCase() || selectedField === topic;
            return (
              <button
                key={topic}
                onClick={() => {
                  if (isActive) {
                    onSearchChange('');
                    setSelectedField('All Fields');
                  } else {
                    onSearchChange(topic);
                  }
                }}
                className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'bg-[#151f33] text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {topic}
              </button>
            );
          })}
        </div>
      </div>

      {/* Result Count Banner */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-slate-400 font-medium">
          Showing <span className="font-bold text-slate-200 font-mono">{professors.length}</span> research faculty matching your candidate profile
        </p>
        <button
          onClick={fetchProfessors}
          className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh matches</span>
        </button>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#0e1422] rounded-2xl border border-slate-800/80 p-6 animate-pulse space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-slate-800 rounded w-1/3" />
                  <div className="h-4 bg-slate-800/60 rounded w-1/4" />
                </div>
                <div className="w-20 h-8 bg-slate-800 rounded-full" />
              </div>
              <div className="h-4 bg-slate-800/40 rounded w-5/6" />
              <div className="h-16 bg-slate-800/30 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && professors.length === 0 && (
        <div className="bg-[#0e1422] rounded-2xl border border-slate-800/80 p-12 text-center max-w-lg mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <FolderSearch className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white mb-2">No matching faculty found</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            We couldn't find any professors matching your current search parameters and topic filters. Try relaxing your filters or searching by a broader term.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Professor Match Cards */}
      {!loading && professors.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {professors.map((prof) => {
            const fitPercentage = prof.matchingScore;
            const isHighScore = fitPercentage >= 90;

            return (
              <div
                key={prof.id}
                id={`professor-card-${prof.id}`}
                className="bg-[#0e1422] hover:bg-[#12192a] rounded-2xl border border-slate-800/90 hover:border-indigo-500/40 p-5 sm:p-6 transition-all duration-200 shadow-lg shadow-black/20 group relative"
              >
                {/* Header Row: Initials Avatar, Name/Affiliation, Match Score */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Initials Avatar (Replacing photo as mandated) */}
                    <div
                      className={`w-13 h-13 rounded-2xl ${prof.avatarBg} text-white flex items-center justify-center text-lg font-bold shadow-md ring-2 ring-white/10 shrink-0 font-sans`}
                    >
                      {prof.initials}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors">
                          {prof.name}
                        </h3>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60">
                          {prof.primaryField}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 font-medium mt-0.5">
                        {prof.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-400 mt-1">
                        <span className="font-semibold text-slate-300">{prof.institution}</span>
                        <span>·</span>
                        <span className="text-slate-400">{prof.department}</span>
                        <span>·</span>
                        <span className="text-slate-400">{prof.city}, {prof.country}</span>
                      </div>
                    </div>
                  </div>

                  {/* Fit Score Badge */}
                  <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-1 bg-[#141d30] sm:bg-transparent px-3 py-2 sm:p-0 rounded-xl">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 border ${
                          isHighScore
                            ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-900/30'
                            : 'bg-indigo-950/70 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-900/30'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-current" />
                        <span>{fitPercentage}% Fit Score</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      h-index {prof.hIndex} · {prof.totalCitations.toLocaleString()} citations
                    </div>
                  </div>
                </div>

                {/* Research Topics */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {prof.researchTopics.map((topic) => (
                    <span
                      key={topic}
                      className="text-[11px] px-2.5 py-0.5 rounded-lg bg-[#141e33] text-slate-300 border border-slate-700/50"
                    >
                      {topic}
                    </span>
                  ))}
                </div>

                {/* Bio Excerpt */}
                <p className="mt-3 text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {prof.bio}
                </p>

                {/* Recent Key Publication Snippet */}
                {prof.recentPublications.length > 0 && (
                  <div className="mt-3.5 p-3 rounded-xl bg-[#0a0f19] border border-slate-800/80 flex items-start gap-3">
                    <BookOpen className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                          {prof.recentPublications[0].venue}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {prof.recentPublications[0].citations} citations
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium mt-1 truncate">
                        "{prof.recentPublications[0].title}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Bottom Actions Row: Primary "View Profile & Hook" */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {prof.email ? (
                      <button
                        onClick={(e) => handleCopyEmail(e, prof)}
                        className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg bg-[#141e33] hover:bg-slate-800 border border-slate-700/60 flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Copy verified email"
                      >
                        {copiedEmailId === prof.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-300 font-mono">Copied</span>
                          </>
                        ) : (
                          <>
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-mono text-[11px]">{prof.email}</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-[11px] font-mono text-amber-400/90 bg-amber-950/40 border border-amber-800/40 px-2.5 py-1 rounded-lg">
                        Email unlisted · Add manually in detail
                      </span>
                    )}
                  </div>

                  {/* Primary "View Profile & Hook" Button */}
                  <button
                    id={`view-profile-hook-${prof.id}`}
                    onClick={() => onSelectProfessor(prof)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 flex items-center justify-center gap-2 transition-all cursor-pointer font-sans"
                  >
                    <span>View Profile & Hook</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
