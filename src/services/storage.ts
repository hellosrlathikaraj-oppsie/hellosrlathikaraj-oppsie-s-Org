import { UserProfile, TrackerEntry, OutreachStatus } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'scout_user_profile',
  TRACKER: 'scout_tracker_entries',
  CUSTOM_EMAILS: 'scout_custom_emails',
  SAVED_PROFS: 'scout_saved_professors',
};

export const DEFAULT_PROFILE: UserProfile = {
  fullName: 'Alex Chen',
  email: 'alex.chen@cs.university.edu',
  currentInstitution: 'UC Berkeley',
  currentDegree: 'B.S. in Computer Science',
  graduationYear: '2026',
  targetOpportunity: 'PhD Fall 2027 / Research Assistant',
  primaryInterests: [
    'Distributed Systems',
    'Fault Tolerance',
    'Consensus Protocols',
    'ML Systems (LLM Serving)',
    'Formal Verification'
  ],
  technicalSkills: [
    'Rust',
    'C++',
    'Go',
    'Distributed KV Stores',
    'Raft/Paxos',
    'PyTorch',
    'TLA+'
  ],
  researchStatement: 'Passionate about building highly reliable, low-latency distributed primitives for modern data-intensive workloads and distributed model serving. Previous experience implementing a multi-Paxos replicated log with dynamic reconfiguration.',
  cvUrl: 'https://alexchen.dev/cv.pdf',
  githubUrl: 'https://github.com/alexchen',
  portfolioUrl: 'https://alexchen.dev'
};

export const DEFAULT_TRACKER_ENTRIES: TrackerEntry[] = [
  {
    id: 'trk-1',
    professorId: 'prof-1',
    professorName: 'Dr. Sarah Mitchell',
    institution: 'Stanford University',
    email: 'smitchell@cs.stanford.edu',
    subject: 'Inquiry on Distributed Systems & Disaggregated Memory (Prospective PhD)',
    dateSent: '2026-09-12',
    status: 'Replied',
    lastContactDate: '2026-09-15',
    followUpDue: false,
    followUpDays: 0,
    notes: 'Replied mentioning their upcoming OSDI submission and suggested chatting after workshop.',
    hookSnippet: 'Re: Disaggregated Memory Architecture in CXL clusters'
  },
  {
    id: 'trk-2',
    professorId: 'prof-2',
    professorName: 'Prof. David K. Reed',
    institution: 'MIT CSAIL',
    email: 'dkreed@mit.edu',
    subject: 'Research Collaboration on Fault-Tolerant Consensus',
    dateSent: '2026-09-14',
    status: 'Sent',
    lastContactDate: '2026-09-14',
    followUpDue: true,
    followUpDays: 6,
    notes: 'Sent personalized hook on Paxos state-machine replication improvements. Need to follow up next Tuesday.',
    hookSnippet: 'Re: Asynchronous BFT Protocols under Network Partitions'
  },
  {
    id: 'trk-3',
    professorId: 'prof-3',
    professorName: 'Dr. Elena Rostova',
    institution: 'Carnegie Mellon University',
    email: 'erostova@cs.cmu.edu',
    subject: 'Inquiry regarding Systems for ML & GPU Memory Paging',
    dateSent: '2026-09-08',
    status: 'Followed Up',
    lastContactDate: '2026-09-16',
    followUpDue: false,
    followUpDays: 0,
    notes: 'Followed up citing her recent EuroSys paper on speculative paging. Waiting for second response.',
    hookSnippet: 'Re: Unified Virtual Memory optimizations for Mixture-of-Experts'
  },
  {
    id: 'trk-4',
    professorId: 'prof-4',
    professorName: 'Prof. Marcus Vance',
    institution: 'University of Washington',
    email: 'mvance@cs.washington.edu',
    subject: 'Prospective Graduate Researcher - Formal Verification of Microkernels',
    dateSent: '2026-09-05',
    status: 'Meeting Booked',
    lastContactDate: '2026-09-17',
    followUpDue: false,
    followUpDays: 0,
    notes: 'Zoom screening call set for next Thursday at 2 PM PST. Reviewed lab recent SOSP paper.',
    hookSnippet: 'Re: Automated proofs for concurrent lock-free data structures'
  },
  {
    id: 'trk-5',
    professorId: 'prof-5',
    professorName: 'Dr. Jennifer Lin',
    institution: 'UC San Diego',
    email: 'jenniferlin@ucsd.edu',
    subject: 'Summer Research Internship / Systems Group',
    dateSent: '2026-08-28',
    status: 'Not Interested',
    lastContactDate: '2026-09-02',
    followUpDue: false,
    followUpDays: 0,
    notes: 'Polite reply stating lab is at capacity for 2026-2027 intake, advised applying in general PhD cycle.',
    hookSnippet: 'Re: Persistent memory file systems in heterogeneous clusters'
  }
];

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
    // Seed initial
    this.saveTrackerEntries(DEFAULT_TRACKER_ENTRIES);
    return DEFAULT_TRACKER_ENTRIES;
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
