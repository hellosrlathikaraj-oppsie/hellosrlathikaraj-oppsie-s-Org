import React from 'react';
import { Menu, Search, Sparkles, ExternalLink, Bookmark, UserCheck } from 'lucide-react';
import { NavigationTab, Professor } from '../types';

interface HeaderProps {
  currentTab: NavigationTab;
  onToggleMobileMenu: () => void;
  selectedProfessor: Professor | null;
  onSelectTab: (tab: NavigationTab) => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export function Header({
  currentTab,
  onToggleMobileMenu,
  selectedProfessor,
  onSelectTab,
  searchQuery,
  onSearchChange,
}: HeaderProps) {
  const titles: Record<NavigationTab, { title: string; subtitle: string }> = {
    discover: {
      title: 'Discover Faculty',
      subtitle: 'Find and evaluate research advisors matching your background and publications',
    },
    detail: {
      title: selectedProfessor ? selectedProfessor.name : 'Professor Detail',
      subtitle: selectedProfessor
        ? `${selectedProfessor.title} · ${selectedProfessor.institution}`
        : 'View profile, publications, and generated cold email hooks',
    },
    tracker: {
      title: 'Outreach Pipeline Tracker',
      subtitle: 'Manage faculty outreach, responses, and follow-up schedules',
    },
    profile: {
      title: 'Candidate Research Profile',
      subtitle: 'Configure your research focus, technical skills, and target opportunities',
    },
  };

  const current = titles[currentTab];

  return (
    <header className="sticky top-0 z-30 bg-[#0b0f17]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white truncate font-sans">
              {current.title}
            </h1>
            {currentTab === 'detail' && selectedProfessor && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                Active Profile
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 truncate hidden sm:block mt-0.5">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {currentTab === 'discover' && onSearchChange !== undefined && (
          <div className="relative hidden md:block w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search faculty or topic..."
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#111827] text-xs text-slate-200 placeholder-slate-400 pl-9 pr-3 py-2 rounded-xl border border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>
        )}

        {/* Quick link to active professor detail if not currently on it */}
        {currentTab !== 'detail' && selectedProfessor && (
          <button
            onClick={() => onSelectTab('detail')}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#111927] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            title={`View ${selectedProfessor.name}`}
          >
            <span className={`w-5 h-5 rounded-md ${selectedProfessor.avatarBg} text-white flex items-center justify-center text-[10px] font-bold`}>
              {selectedProfessor.initials}
            </span>
            <span className="truncate max-w-[120px]">{selectedProfessor.name}</span>
            <UserCheck className="w-3.5 h-3.5 text-indigo-400 ml-0.5" />
          </button>
        )}
      </div>
    </header>
  );
}
