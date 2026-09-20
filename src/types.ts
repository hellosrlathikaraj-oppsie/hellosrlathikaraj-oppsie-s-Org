export type NavigationTab = 'discover' | 'detail' | 'tracker' | 'profile';

export interface Publication {
  id: string;
  title: string;
  venue: string;
  year: number;
  citations: number;
  doi?: string;
  abstractSnippet: string;
  primaryTopic: string;
}

export interface Professor {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  title: string;
  institution: string;
  department: string;
  city: string;
  country: string;
  hIndex: number;
  totalCitations: number;
  primaryField: string;
  researchTopics: string[];
  bio: string;
  recentPublications: Publication[];
  email: string | null;
  isMockEmail?: boolean;
  isManualEmail?: boolean;
  googleScholarUrl?: string;
  labWebsiteUrl?: string;
  suggestedHookSnippet: string;
  matchingScore: number; // dynamically computed or base score
  matchReasons: string[];
}

export type OutreachStatus = 'Sent' | 'Followed Up' | 'Replied' | 'Meeting Booked' | 'Not Interested';

export interface TrackerEntry {
  id: string;
  professorId?: string;
  professorName: string;
  institution: string;
  email: string;
  subject: string;
  dateSent: string; // YYYY-MM-DD
  status: OutreachStatus;
  lastContactDate: string;
  followUpDue: boolean;
  followUpDays: number;
  notes: string;
  hookSnippet?: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  currentInstitution: string;
  currentDegree: string;
  graduationYear: string;
  targetOpportunity: string; // e.g., 'PhD Fall 2027', 'Summer 2026 Research Internship'
  primaryInterests: string[];
  technicalSkills: string[];
  researchStatement: string;
  cvUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

export interface ScoringFactors {
  topicAlignment: number; // 0-100
  recentMomentum: number; // 0-100
  methodologyFit: number; // 0-100
  totalScore: number; // 0-100
  reasons: string[];
}
