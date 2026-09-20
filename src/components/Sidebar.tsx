import React from 'react';
import { 
  Compass, 
  UserCheck, 
  Send, 
  User, 
  Sparkles, 
  GraduationCap, 
  CheckCircle2, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { NavigationTab, Professor, UserProfile } from '../types';
import { storage } from '../services/storage';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  selectedProfessor: Professor | null;
  trackerCount: number;
  userProfile: UserProfile;
  isOpenMobile: boolean;
  onToggleMobile: () => void;
}

export function Sidebar({
  currentTab,
  onSelectTab,
  selectedProfessor,
  trackerCount,
  userProfile,
  isOpenMobile,
  onToggleMobile,
}: SidebarProps) {
  const completeness = storage.computeProfileCompleteness(userProfile);

  const navItems = [
    {
      id: 'discover' as NavigationTab,
      label: 'Discover',
      description: 'Find faculty & match papers',
      icon: Compass,
      badge: null,
    },
    {
      id: 'detail' as NavigationTab,
      label: 'Professor Detail',
      description: selectedProfessor ? selectedProfessor.name : 'Select a professor',
      icon: UserCheck,
      badge: selectedProfessor ? selectedProfessor.initials : null,
    },
    {
      id: 'tracker' as NavigationTab,
      label: 'Outreach Tracker',
      description: 'Pipelines, replies & follow-ups',
      icon: Send,
      badge: trackerCount > 0 ? `${trackerCount}` : null,
    },
    {
      id: 'profile' as NavigationTab,
      label: 'Profile',
      description: userProfile.fullName || 'Candidate settings',
      icon: User,
      badge: `${completeness.percent}%`,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onToggleMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-[#0c121e] border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 px-6 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white font-sans">Scout</span>
                <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
                  Research
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Academic Outreach Assistant</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onToggleMobile}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
              Navigation
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => {
                  onSelectTab(item.id);
                  if (isOpenMobile) onToggleMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/15 text-white border border-indigo-500/30 shadow-sm shadow-indigo-950/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                        : 'bg-slate-800/80 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p
                      className={`text-sm font-semibold tracking-tight leading-none ${
                        isActive ? 'text-white' : 'text-slate-200'
                      }`}
                    >
                      {item.label}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-1 leading-tight font-normal">
                      {item.description}
                    </p>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`shrink-0 ml-2 text-xs font-mono font-medium px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Profile Completeness Box (computed dynamically from filled fields, replacing 'Corpus readiness') */}
        <div className="p-4 mx-3 mb-4 rounded-xl bg-[#111927] border border-slate-800/90 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Profile Completeness
            </span>
            <span className="text-xs font-mono font-bold text-indigo-400">
              {completeness.percent}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${completeness.percent}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-400 leading-snug">
            {completeness.percent === 100 ? (
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3" /> All candidate fields complete
              </span>
            ) : (
              <span>
                {completeness.missing[0] ? `Tip: Add ${completeness.missing[0]}` : 'Complete fields to improve match'}
              </span>
            )}
          </p>

          <button
            onClick={() => {
              onSelectTab('profile');
              if (isOpenMobile) onToggleMobile();
            }}
            className="mt-2.5 text-xs text-indigo-300 hover:text-indigo-200 font-medium flex items-center gap-1 group cursor-pointer"
          >
            <span>Edit Profile</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* User Footer info */}
        <div className="p-4 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-xs font-bold text-indigo-300 shrink-0">
              {userProfile.fullName ? userProfile.fullName.slice(0, 2).toUpperCase() : 'AC'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {userProfile.fullName || 'Alex Chen'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {userProfile.currentInstitution || 'UC Berkeley'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
