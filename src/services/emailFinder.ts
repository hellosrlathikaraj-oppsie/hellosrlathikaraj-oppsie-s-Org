import { storage } from './storage';

export interface EmailFinderResult {
  email: string | null;
  status: 'manual' | 'not_found';
  source?: string;
  isCustomManual?: boolean;
}

export const emailFinder = {
  /**
   * Academic email lookup.
   * Strictly never fabricates email addresses.
   * Returns 'manual' only if the user has saved a manual email, otherwise 'not_found'.
   */
  async findEmail(professorId: string): Promise<EmailFinderResult> {
    // Check if user previously manually entered an email
    const custom = storage.getCustomEmail(professorId);
    if (custom) {
      return {
        email: custom,
        status: 'manual',
        source: 'Manually added by user',
        isCustomManual: true,
      };
    }

    // Never fabricate an address
    return {
      email: null,
      status: 'not_found',
      source: 'Not in directory',
      isCustomManual: false,
    };
  },

  /**
   * Save a manual email entered by the user
   */
  saveManualEmail(professorId: string, email: string): EmailFinderResult {
    storage.saveCustomEmail(professorId, email.trim());
    return {
      email: email.trim(),
      status: 'manual',
      source: 'User manually saved',
      isCustomManual: true,
    };
  }
};
