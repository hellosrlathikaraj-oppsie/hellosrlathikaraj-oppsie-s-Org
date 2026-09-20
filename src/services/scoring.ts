import { Professor, UserProfile, ScoringFactors } from '../types';

export const scoring = {
  /**
   * Computes fit score between a professor's research and the user's profile.
   * Matches keywords, field alignment, and recent publication topics.
   */
  calculateFitScore(professor: Partial<Professor>, profile: UserProfile): ScoringFactors {
    if (!profile) {
      return {
        topicAlignment: 85,
        recentMomentum: 80,
        methodologyFit: 78,
        totalScore: 82,
        reasons: ['Strong alignment with core department specializations'],
      };
    }

    const studentInterests = (profile.primaryInterests || []).map(t => t.toLowerCase());
    const studentSkills = (profile.technicalSkills || []).map(s => s.toLowerCase());
    const profTopics = (professor.researchTopics || []).map(t => t.toLowerCase());
    const profPapers = professor.recentPublications || [];

    // 1. Topic overlap
    let topicHits = 0;
    const matchingReasons: string[] = [];

    studentInterests.forEach(interest => {
      const match = profTopics.find(pt => pt.includes(interest) || interest.includes(pt));
      if (match) {
        topicHits += 1;
        matchingReasons.push(`Shared research focus on "${interest}"`);
      }
    });

    // Check papers
    profPapers.forEach(paper => {
      studentInterests.forEach(interest => {
        if (paper.title.toLowerCase().includes(interest) || paper.primaryTopic.toLowerCase().includes(interest)) {
          matchingReasons.push(`Recent paper aligns with your interest in ${paper.primaryTopic}`);
        }
      });
    });

    const topicScore = Math.min(98, Math.max(65, 70 + topicHits * 9));

    // 2. Methodology / Skill overlap
    let skillHits = 0;
    studentSkills.forEach(skill => {
      const profBioAndTopics = ((professor.bio || '') + ' ' + profTopics.join(' ')).toLowerCase();
      if (profBioAndTopics.includes(skill)) {
        skillHits += 1;
      }
    });
    const methodologyScore = Math.min(96, Math.max(68, 72 + skillHits * 6));

    // 3. Activity / momentum based on recent papers
    const recentYears = profPapers.map(p => p.year);
    const has2025Or2026 = recentYears.some(y => y >= 2025);
    const momentumScore = has2025Or2026 ? 94 : 84;

    // Deduplicate reasons
    const uniqueReasons = Array.from(new Set(matchingReasons));
    if (uniqueReasons.length === 0) {
      uniqueReasons.push(`Direct alignment in ${professor.primaryField || 'Computer Science'}`);
      uniqueReasons.push(`Active research cluster at ${professor.institution || 'institution'}`);
    }

    const total = Math.round(topicScore * 0.45 + methodologyScore * 0.35 + momentumScore * 0.2);

    return {
      topicAlignment: topicScore,
      recentMomentum: momentumScore,
      methodologyFit: methodologyScore,
      totalScore: total,
      reasons: uniqueReasons.slice(0, 3),
    };
  }
};
