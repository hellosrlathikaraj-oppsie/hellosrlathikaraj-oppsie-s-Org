import { storage } from './storage';

export interface EmailFinderResult {
  email: string | null;
  status: 'found' | 'verified' | 'not_found';
  confidence: number;
  source?: string;
  isCustomManual?: boolean;
}

export const emailFinder = {
  /**
   * Mock lookup for professor email.
   * Checks custom saved emails in localStorage first, then returns mock pattern or 'not_found'
   */
  async findEmail(professorId: string, professorName: string, institution: string): Promise<EmailFinderResult> {
    // Simulate slight network delay for realistic loading state
    await new Promise(resolve => setTimeout(resolve, 350));

    // Check if user previously manually entered an email
    const custom = storage.getCustomEmail(professorId);
    if (custom) {
      return {
        email: custom,
        status: 'verified',
        confidence: 100,
        source: 'User manually verified',
        isCustomManual: true,
      };
    }

    // Specific professor configured as "no email found" to demonstrate the manual add state
    if (professorId === 'prof-6' || professorName.toLowerCase().includes('morris')) {
      return {
        email: null,
        status: 'not_found',
        confidence: 0,
        source: 'Department directory unlisted',
      };
    }

    // Default predictable mock emails based on institution
    const domainMap: Record<string, string> = {
      'Stanford University': 'stanford.edu',
      'MIT CSAIL': 'csail.mit.edu',
      'Carnegie Mellon University': 'cs.cmu.edu',
      'University of Washington': 'cs.washington.edu',
      'UC San Diego': 'ucsd.edu',
      'UC Berkeley': 'berkeley.edu',
      'Cornell University': 'cornell.edu',
      'Princeton University': 'princeton.edu',
      'Harvard SEAS': 'harvard.edu',
    };

    const parts = professorName.replace(/^(Dr\.|Prof\.)\s+/i, '').trim().toLowerCase().split(/\s+/);
    const domain = domainMap[institution] || 'university.edu';
    const generatedEmail = parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1]}@${domain}`
      : `${parts[0]}@${domain}`;

    return {
      email: generatedEmail,
      status: 'verified',
      confidence: 94,
      source: `${institution} Faculty Directory (OpenAlex verified)`,
    };
  },

  /**
   * Save a manual email entered by the user
   */
  saveManualEmail(professorId: string, email: string): EmailFinderResult {
    storage.saveCustomEmail(professorId, email.trim());
    return {
      email: email.trim(),
      status: 'verified',
      confidence: 100,
      source: 'User manually saved',
      isCustomManual: true,
    };
  }
};
