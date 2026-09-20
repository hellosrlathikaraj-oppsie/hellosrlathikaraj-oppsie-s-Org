import { UserProfile, TrackerEntry, OutreachStatus } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'scout_user_profile',
  TRACKER: 'scout_tracker_entries',
  CUSTOM_EMAILS: 'scout_custom_emails',
  OPENALEX_KEY: 'scout_openalex_key',
  SAVED_PROFS: 'scout_saved_professors',
};

export const DEFAULT_PROFILE: UserProfile = {
  fullName: '',
  email: '',
  currentInstitution: '',
  currentDegree: '',
  graduationYear: '',
  targetOpportunity: '',
  primaryInterests: [],
  technicalSkills: [],
  researchStatement: '',
  cvUrl: '',
  githubUrl: '',
  portfolioUrl: ''
};

export const DEFAULT_TRACKER_ENTRIES: TrackerEntry[] = [];

export const storage = {
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to parse user profile from localStorage', e);
    }
    return DEFAULT_PROFILE;
  },

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile to localStorage', e);
    }
  },

  computeProfileCompleteness(profile: UserProfile): {
    percent: number;
    filledFields: number;
    totalFields: number;
    missing: string[];
  } {
    const checks: { key: string; label: string; filled: boolean }[] = [
      { key: 'fullName', label: 'Full Name', filled: !!profile.fullName?.trim() },
      { key: 'email', label: 'Contact Email', filled: !!profile.email?.trim() },
      { key: 'currentInstitution', label: 'Current Institution', filled: !!profile.currentInstitution?.trim() },
      { key: 'currentDegree', label: 'Degree & Program', filled: !!profile.currentDegree?.trim() },
      { key: 'graduationYear', label: 'Graduation Year', filled: !!profile.graduationYear?.trim() },
      { key: 'targetOpportunity', label: 'Target Opportunity', filled: !!profile.targetOpportunity?.trim() },
      { key: 'primaryInterests', label: 'Research Interests (min 2)', filled: (profile.primaryInterests?.length || 0) >= 2 },
      { key: 'technicalSkills', label: 'Technical Skills (min 2)', filled: (profile.technicalSkills?.length || 0) >= 2 },
      { key: 'researchStatement', label: 'Research Statement (>30 chars)', filled: (profile.researchStatement?.trim().length || 0) > 30 },
      { key: 'cvUrl', label: 'CV / Resume or Web Link', filled: !!(profile.cvUrl || profile.portfolioUrl || profile.githubUrl) },
    ];

    const filledCount = checks.filter(c => c.filled).length;
    const total = checks.length;
    const percent = Math.round((filledCount / total) * 100);
    const missing = checks.filter(c => !c.filled).map(c => c.label);

    return {
      percent,
      filledFields: filledCount,
      totalFields: total,
      missing,
    };
  },

  getTrackerEntries(): TrackerEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRACKER);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to read tracker entries from localStorage', e);
    }
    return [];
  },

  saveTrackerEntries(entries: TrackerEntry[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TRACKER, JSON.stringify(entries));
    } catch (e) {
      console.error('Failed to save tracker entries to localStorage', e);
    }
  },

  addTrackerEntry(entryData: Omit<TrackerEntry, 'id'>): TrackerEntry {
    const entries = this.getTrackerEntries();
    const newEntry: TrackerEntry = {
      ...entryData,
      id: `trk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [newEntry, ...entries];
    this.saveTrackerEntries(updated);
    return newEntry;
  },

  updateTrackerEntry(id: string, updates: Partial<TrackerEntry>): TrackerEntry[] {
    const entries = this.getTrackerEntries();
    const updated = entries.map(item => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      return item;
    });
    this.saveTrackerEntries(updated);
    return updated;
  },

  deleteTrackerEntry(id: string): TrackerEntry[] {
    const entries = this.getTrackerEntries();
    const updated = entries.filter(item => item.id !== id);
    this.saveTrackerEntries(updated);
    return updated;
  },

  getCustomEmail(professorId: string): string | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_EMAILS);
      if (data) {
        const map = JSON.parse(data);
        return map[professorId] || null;
      }
    } catch (e) {
      console.error('Failed to read custom emails', e);
    }
    return null;
  },

  saveCustomEmail(professorId: string, email: string): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_EMAILS);
      const map = data ? JSON.parse(data) : {};
      map[professorId] = email;
      localStorage.setItem(STORAGE_KEYS.CUSTOM_EMAILS, JSON.stringify(map));
    } catch (e) {
      console.error('Failed to save custom email', e);
    }
  },

  getOpenAlexKey(): string {
    try {
      return localStorage.getItem(STORAGE_KEYS.OPENALEX_KEY) || '';
    } catch {
      return '';
    }
  },

  saveOpenAlexKey(key: string): void {
    try {
      if (key.trim()) localStorage.setItem(STORAGE_KEYS.OPENALEX_KEY, key.trim());
      else localStorage.removeItem(STORAGE_KEYS.OPENALEX_KEY);
    } catch (e) {
      console.error('Failed to save OpenAlex key', e);
    }
  },

  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  },

  exportData(): string {
    const customEmails = localStorage.getItem(STORAGE_KEYS.CUSTOM_EMAILS);
    return JSON.stringify({
      version: 1,
      profile: this.getProfile(),
      trackerEntries: this.getTrackerEntries(),
      customEmails: customEmails ? JSON.parse(customEmails) : {},
    }, null, 2);
  },

  importData(raw: string): void {
    const data = JSON.parse(raw) as { profile?: UserProfile; trackerEntries?: TrackerEntry[]; customEmails?: Record<string, string> };
    if (!data || typeof data !== 'object') throw new Error('Invalid Scout data file.');
    if (data.profile) this.saveProfile(data.profile);
    if (Array.isArray(data.trackerEntries)) this.saveTrackerEntries(data.trackerEntries);
    if (data.customEmails && typeof data.customEmails === 'object') localStorage.setItem(STORAGE_KEYS.CUSTOM_EMAILS, JSON.stringify(data.customEmails));
  },

  exportTrackerToCSV(entries: TrackerEntry[]): void {
    if (!entries || entries.length === 0) return;

    const headers = ['Professor', 'Institution', 'Email', 'Subject', 'Date Sent', 'Status', 'Last Contact', 'Notes'];
    const rows = entries.map(e => [
      `"${e.professorName.replace(/"/g, '""')}"`,
      `"${e.institution.replace(/"/g, '""')}"`,
      `"${e.email.replace(/"/g, '""')}"`,
      `"${(e.subject || '').replace(/"/g, '""')}"`,
      `"${e.dateSent}"`,
      `"${e.status}"`,
      `"${e.lastContactDate || e.dateSent}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `scout-outreach-tracker-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
