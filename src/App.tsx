import React, { useState, useEffect } from 'react';
import { NavigationTab, Professor, TrackerEntry, UserProfile } from './types';
import { DEFAULT_PROFILE, storage } from './services/storage';
import { openalex, MOCK_PROFESSORS } from './services/openalex';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DiscoverView } from './components/DiscoverView';
import { ProfessorDetailView } from './components/ProfessorDetailView';
import { TrackerView } from './components/TrackerView';
import { ProfileView } from './components/ProfileView';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('discover');
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(MOCK_PROFESSORS[0]);
  const [userProfile, setUserProfile] = useState<UserProfile>(() => storage.getProfile());
  const [trackerEntries, setTrackerEntries] = useState<TrackerEntry[]>(() => storage.getTrackerEntries());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [discoverSearch, setDiscoverSearch] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab]);

  // Toast Helper
  const showToast = (
    title: string,
    message?: string,
    type: 'success' | 'error' | 'info' = 'success',
    action?: { label: string; onClick: () => void }
  ) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      type,
      action,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Navigating to Professor Detail from Discover
  const handleSelectProfessor = (prof: Professor) => {
    setSelectedProfessor(prof);
    setCurrentTab('detail');
  };

  // Navigating to Professor by ID (e.g. from Tracker)
  const handleSelectProfessorById = async (id: string) => {
    const prof = await openalex.getProfessorById(id);
    if (prof) {
      setSelectedProfessor(prof);
      setCurrentTab('detail');
    }
  };

  const handleClearData = () => {
    storage.clearAllData();
    setUserProfile(DEFAULT_PROFILE);
    setTrackerEntries([]);
    setDiscoverSearch('');
    setSelectedProfessor(null);
    setCurrentTab('profile');
    showToast('Local data cleared', 'Your profile, tracker, manual emails, and saved OpenAlex key were removed from this browser.', 'success');
  };

  const handleDataImported = () => {
    setUserProfile(storage.getProfile());
    setTrackerEntries(storage.getTrackerEntries());
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans">
      {/* Persistent Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        selectedProfessor={selectedProfessor}
        trackerCount={trackerEntries.length}
        userProfile={userProfile}
        isOpenMobile={isMobileOpen}
        onToggleMobile={() => setIsMobileOpen((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        {/* Sticky Header */}
        <Header
          currentTab={currentTab}
          onToggleMobileMenu={() => setIsMobileOpen(true)}
          selectedProfessor={selectedProfessor}
          onSelectTab={(tab) => setCurrentTab(tab)}
          searchQuery={discoverSearch}
          onSearchChange={setDiscoverSearch}
        />

        {/* View Switcher Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {currentTab === 'discover' && (
            <DiscoverView
              onSelectProfessor={handleSelectProfessor}
              searchQuery={discoverSearch}
              onSearchChange={setDiscoverSearch}
              userProfile={userProfile}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'detail' && (
            <ProfessorDetailView
              professor={selectedProfessor}
              onBackToDiscover={() => setCurrentTab('discover')}
              onNavigateToTracker={() => setCurrentTab('tracker')}
              userProfile={userProfile}
              onShowToast={showToast}
              onSelectProfessorById={handleSelectProfessorById}
            />
          )}

          {currentTab === 'tracker' && (
            <TrackerView
              entries={trackerEntries}
              onUpdateEntries={(updated) => setTrackerEntries(updated)}
              onNavigateToProfessor={handleSelectProfessorById}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileView
              profile={userProfile}
              onUpdateProfile={(updated) => setUserProfile(updated)}
              onDataImported={handleDataImported}
              onClearData={handleClearData}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Floating Notifications Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
