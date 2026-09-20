import { Professor, Publication, UserProfile } from '../types';
import { storage } from './storage';
import { buildMatchReasons, calculateMatchScore, MatchWork } from './matching';

export const MOCK_PROFESSORS: Professor[] = [
  {
    id: 'sample-1', name: 'Dr. Mira Vale', initials: 'MV', avatarBg: 'bg-indigo-600',
    title: 'Illustrative sample faculty', institution: 'Northstar Institute (fictional)', department: 'Computational Biology', city: 'Example City', country: 'Example Country',
    hIndex: 0, totalCitations: 0, primaryField: 'Computational Biology',
    researchTopics: ['Single-cell Genomics', 'Protein Design', 'Scientific Computing'], bio: 'Illustrative sample data for demonstrating Scout.',
    email: 'mira.vale@example.edu', isMockEmail: true, suggestedHookSnippet: 'Single-cell analysis and protein design workflows.', matchingScore: 78,
    matchReasons: ['Illustrative sample data'], recentPublications: [
      { id: 'sample-pub-1', title: 'Graph Methods for Single-cell Atlas Integration', venue: 'Illustrative Journal', year: 2025, citations: 0, primaryTopic: 'Single-cell Genomics', abstractSnippet: 'A fictional example abstract about graph methods for integrating single-cell measurements.' },
      { id: 'sample-pub-2', title: 'Constraint-guided Protein Design in Heterogeneous Data', venue: 'Illustrative Conference', year: 2024, citations: 0, primaryTopic: 'Protein Design', abstractSnippet: 'A fictional example abstract about constraint-guided protein design.' },
    ],
  },
  {
    id: 'sample-2', name: 'Prof. Jonah Quill', initials: 'JQ', avatarBg: 'bg-emerald-600',
    title: 'Illustrative sample faculty', institution: 'Blue Harbor University (fictional)', department: 'Climate Informatics', city: 'Example Bay', country: 'Example Country',
    hIndex: 0, totalCitations: 0, primaryField: 'Climate Informatics',
    researchTopics: ['Climate Modeling', 'Remote Sensing', 'Extreme Events'], bio: 'Illustrative sample data for demonstrating Scout.',
    email: 'jonah.quill@example.edu', isMockEmail: true, suggestedHookSnippet: 'Remote sensing for extreme-event forecasting.', matchingScore: 72,
    matchReasons: ['Illustrative sample data'], recentPublications: [
      { id: 'sample-pub-3', title: 'Sparse Satellite Signals for Coastal Heat Forecasts', venue: 'Illustrative Journal', year: 2025, citations: 0, primaryTopic: 'Remote Sensing', abstractSnippet: 'A fictional example abstract about satellite signals and coastal heat forecasting.' },
      { id: 'sample-pub-4', title: 'Uncertainty Calibration for Regional Climate Ensembles', venue: 'Illustrative Conference', year: 2023, citations: 0, primaryTopic: 'Climate Modeling', abstractSnippet: 'A fictional example abstract about uncertainty calibration in climate ensembles.' },
    ],
  },
  {
    id: 'sample-3', name: 'Dr. Lila Rowan', initials: 'LR', avatarBg: 'bg-amber-600',
    title: 'Illustrative sample faculty', institution: 'Cedar Grove College (fictional)', department: 'Human-Computer Interaction', city: 'Example Hills', country: 'Example Country',
    hIndex: 0, totalCitations: 0, primaryField: 'Human-Computer Interaction',
    researchTopics: ['Accessible Design', 'Collaborative Interfaces', 'Civic Technology'], bio: 'Illustrative sample data for demonstrating Scout.',
    email: 'lila.rowan@example.edu', isMockEmail: true, suggestedHookSnippet: 'Accessible collaborative interfaces for civic participation.', matchingScore: 69,
    matchReasons: ['Illustrative sample data'], recentPublications: [
      { id: 'sample-pub-5', title: 'Designing Accessible Interfaces for Community Deliberation', venue: 'Illustrative Journal', year: 2025, citations: 0, primaryTopic: 'Accessible Design', abstractSnippet: 'A fictional example abstract about accessible interfaces for community deliberation.' },
      { id: 'sample-pub-6', title: 'Trust Cues in Collaborative Civic Dashboards', venue: 'Illustrative Conference', year: 2024, citations: 0, primaryTopic: 'Civic Technology', abstractSnippet: 'A fictional example abstract about trust cues in collaborative civic dashboards.' },
    ],
  },
  {
    id: 'sample-4', name: 'Dr. Theo North', initials: 'TN', avatarBg: 'bg-purple-600',
    title: 'Illustrative sample faculty', institution: 'Northstar Institute (fictional)', department: 'Robotics and Embodied AI', city: 'Example City', country: 'Example Country',
    hIndex: 0, totalCitations: 0, primaryField: 'Robotics and Embodied AI',
    researchTopics: ['Robot Learning', 'Multi-Agent Planning', 'Safe Autonomy'], bio: 'Illustrative sample data for demonstrating Scout.',
    email: 'theo.north@example.edu', isMockEmail: true, suggestedHookSnippet: 'Safe multi-agent planning for embodied robots.', matchingScore: 66,
    matchReasons: ['Illustrative sample data'], recentPublications: [
      { id: 'sample-pub-7', title: 'Safe Task Allocation for Warehouse Robot Teams', venue: 'Illustrative Journal', year: 2025, citations: 0, primaryTopic: 'Multi-Agent Planning', abstractSnippet: 'A fictional example abstract about safe task allocation for robot teams.' },
      { id: 'sample-pub-8', title: 'Learning Visual Policies under Sparse Feedback', venue: 'Illustrative Conference', year: 2024, citations: 0, primaryTopic: 'Robot Learning', abstractSnippet: 'A fictional example abstract about visual policy learning under sparse feedback.' },
    ],
  },
];

const API_PATH = '/api/openalex/search';
const sessionCache = new Map<string, Professor[]>();
let sessionApiCalls = 0;

export class OpenAlexError extends Error {
  code: 'missing_key' | 'invalid_key' | 'invalid_query' | 'rate_limit' | 'network' | 'openalex_error' | 'unknown';
  constructor(code: OpenAlexError['code'], message: string) {
    super(message);
    this.name = 'OpenAlexError';
    this.code = code;
  }
}

interface OpenAlexWork {
  id?: string;
  title?: string;
  publication_year?: number;
  publication_date?: string;
  cited_by_count?: number;
  doi?: string | null;
  abstract_inverted_index?: Record<string, number[]> | null;
  authorships?: Array<{ author?: { id?: string; display_name?: string } }>;
  primary_location?: { source?: { display_name?: string } | null } | null;
  primary_topic?: { display_name?: string } | null;
}

interface OpenAlexAuthor {
  id?: string;
  display_name?: string;
  last_known_institutions?: Array<{ display_name?: string; country_code?: string }>;
  summary_stats?: { h_index?: number };
  cited_by_count?: number;
  topics?: Array<{ display_name?: string }>;
}

interface OpenAlexResponse {
  works: OpenAlexWork[];
  authors: OpenAlexAuthor[];
  apiCalls?: number;
  queryText?: string;
}

function abstractFromInvertedIndex(index?: Record<string, number[]> | null): string {
  if (!index) return '';
  return Object.entries(index)
    .flatMap(([word, positions]) => positions.map((position) => ({ word, position })))
    .sort((a, b) => a.position - b.position)
    .map(({ word }) => word)
    .join(' ')
    .slice(0, 280);
}

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '??';
}

function toMatchWork(work: OpenAlexWork): MatchWork {
  return {
    title: work.title || '',
    year: work.publication_year || new Date().getFullYear(),
    abstractSnippet: abstractFromInvertedIndex(work.abstract_inverted_index),
    primaryTopic: work.primary_topic?.display_name || '',
  };
}

function avatarFor(name: string): string {
  const colors = ['bg-indigo-600', 'bg-emerald-600', 'bg-amber-600', 'bg-purple-600', 'bg-cyan-600', 'bg-rose-600', 'bg-teal-600'];
  return colors[name.length % colors.length];
}

function mapResults(response: OpenAlexResponse): Professor[] {
  const authorsById = new Map(response.authors.map((author) => [author.id?.replace('https://openalex.org/', ''), author]));
  const worksByAuthor = new Map<string, OpenAlexWork[]>();
  for (const work of response.works) {
    for (const authorship of work.authorships || []) {
      const authorId = authorship.author?.id?.replace('https://openalex.org/', '');
      if (authorId) worksByAuthor.set(authorId, [...(worksByAuthor.get(authorId) || []), work]);
    }
  }

  return Array.from(worksByAuthor.entries())
    .map(([authorId, works]) => {
      const author = authorsById.get(authorId);
      const authorWork = works.find((work) => work.authorships?.some((authorship) => authorship.author?.id?.endsWith(authorId)));
      const authorName = authorWork?.authorships?.find((authorship) => authorship.author?.id?.endsWith(authorId))?.author?.display_name;
      const name = author?.display_name || authorName || 'Unknown author';
      const institution = author?.last_known_institutions?.[0];
      const topics = Array.from(new Set([
        ...(author?.topics || []).map((topic) => topic.display_name).filter((topic): topic is string => Boolean(topic)),
        ...works.map((work) => work.primary_topic?.display_name).filter((topic): topic is string => Boolean(topic)),
      ])).slice(0, 6);
      const publications: Publication[] = works.slice(0, 5).map((work) => ({
        id: work.id || `${authorId}-${work.publication_date || work.publication_year || 'work'}`,
        title: work.title || 'Untitled work',
        venue: work.primary_location?.source?.display_name || 'OpenAlex indexed article',
        year: work.publication_year || new Date().getFullYear(),
        citations: work.cited_by_count || 0,
        doi: work.doi || undefined,
        abstractSnippet: abstractFromInvertedIndex(work.abstract_inverted_index),
        primaryTopic: work.primary_topic?.display_name || topics[0] || 'Research',
      }));
      const matchWorks = works.map(toMatchWork);
      const lastAuthorWorks = works.filter((work) => work.authorships?.at(-1)?.author?.id?.endsWith(authorId)).map(toMatchWork);
      const matchScore = calculateMatchScore(response.queryText || '', matchWorks, matchWorks, lastAuthorWorks);
      return {
        id: authorId,
        name,
        initials: initials(name),
        avatarBg: avatarFor(name),
        title: '',
        institution: institution?.display_name || '',
        department: '',
        city: '',
        country: institution?.country_code || '',
        hIndex: author?.summary_stats?.h_index || 0,
        totalCitations: author?.cited_by_count || 0,
        primaryField: topics[0] || 'Research',
        researchTopics: topics,
        bio: '',
        email: null,
        isProvisionalScore: true,
        recentPublications: publications,
        suggestedHookSnippet: publications[0]?.title || '',
        matchingScore: matchScore.score,
        matchReasons: buildMatchReasons(matchScore),
      } satisfies Professor;
    })
    .sort((a, b) => b.matchingScore - a.matchingScore)
    .slice(0, 30);
}

async function searchLive(query: string): Promise<Professor[]> {
  const profile = storage.getProfile();
  const typedQuery = query.trim();
  const fullQuery = typedQuery || profile.primaryInterests.join(' ').trim() || 'research';
  const cacheKey = fullQuery.toLowerCase();
  const cached = sessionCache.get(cacheKey);
  if (cached) return cached;

  const visitorKey = storage.getOpenAlexKey();
  const response = await fetch(`${API_PATH}?query=${encodeURIComponent(fullQuery)}`, {
    headers: visitorKey ? { 'X-OpenAlex-Key': visitorKey } : undefined,
  });
  let body: OpenAlexResponse & { error?: { code?: OpenAlexError['code']; message?: string } } = {} as OpenAlexResponse;
  try { body = await response.json(); } catch { /* handled below */ }
  if (!response.ok || body.error) {
    const code = body.error?.code || (response.status === 429 ? 'rate_limit' : response.status >= 500 ? 'network' : 'unknown');
    throw new OpenAlexError(code, body.error?.message || 'OpenAlex search failed.');
  }
  sessionApiCalls += body.apiCalls || 0;
  const results = mapResults({ ...body, queryText: fullQuery });
  sessionCache.set(cacheKey, results);
  return results;
}

function mapSample(prof: Professor, userText: string): Professor {
  const customEmail = storage.getCustomEmail(prof.id);
  const works = prof.recentPublications.map((publication) => ({
    title: publication.title,
    year: publication.year,
    abstractSnippet: publication.abstractSnippet,
    primaryTopic: publication.primaryTopic,
  }));
  const score = calculateMatchScore(userText, works, works, works);
  return {
    ...prof,
    email: customEmail || prof.email,
    isManualEmail: Boolean(customEmail),
    isMockEmail: !customEmail && Boolean(prof.isMockEmail),
    matchingScore: score.score,
    matchReasons: buildMatchReasons(score),
  };
}

export const openalex = {
  async searchProfessors(query = '', filters?: { field?: string; institution?: string; minScore?: number; sortBy?: 'fit' | 'citations' | 'hIndex' }): Promise<Professor[]> {
    let list = await searchLive(query);
    if (filters?.field && filters.field !== 'All Fields') list = list.filter((prof) => prof.primaryField === filters.field || prof.researchTopics.includes(filters.field!));
    if (filters?.institution && filters.institution !== 'All Institutions') list = list.filter((prof) => prof.institution === filters.institution);
    if (filters?.minScore) list = list.filter((prof) => prof.matchingScore >= filters.minScore!);
    if (filters?.sortBy === 'citations') list.sort((a, b) => b.totalCitations - a.totalCitations);
    if (filters?.sortBy === 'hIndex') list.sort((a, b) => b.hIndex - a.hIndex);
    return list;
  },

  async searchSampleProfessors(query = '', filters?: { field?: string; institution?: string; sortBy?: 'fit' | 'citations' | 'hIndex' }): Promise<Professor[]> {
    const q = query.trim().toLowerCase();
    const userText = query.trim() || storage.getProfile().primaryInterests.join(' ');
    let list = MOCK_PROFESSORS.map((prof) => mapSample(prof, userText)).filter((prof) => !q || [prof.name, prof.institution, prof.department, prof.primaryField, ...prof.researchTopics, ...prof.recentPublications.map((pub) => pub.title)].join(' ').toLowerCase().includes(q));
    if (filters?.field && filters.field !== 'All Fields') list = list.filter((prof) => prof.primaryField === filters.field || prof.researchTopics.includes(filters.field!));
    if (filters?.institution && filters.institution !== 'All Institutions') list = list.filter((prof) => prof.institution === filters.institution);
    if (filters?.sortBy === 'citations') list.sort((a, b) => b.totalCitations - a.totalCitations);
    if (filters?.sortBy === 'hIndex') list.sort((a, b) => b.hIndex - a.hIndex);
    return list;
  },

  async getProfessorById(id: string): Promise<Professor | null> {
    const found = MOCK_PROFESSORS.find((prof) => prof.id === id);
    return found ? mapSample(found, storage.getProfile().primaryInterests.join(' ')) : null;
  },

  getInstitutions(): string[] {
    return ['All Institutions'];
  },

  getResearchFields(): string[] {
    return ['All Fields'];
  },

  getSessionApiCalls(): number {
    return sessionApiCalls;
  },

  /**
   * Generates a tailored cold outreach email draft and hook rationale.
   */
  generateEmailHook(
    professor: Professor,
    studentProfile: UserProfile,
    templateType: 'phd' | 'internship' | 'collaboration' = 'phd'
  ): {
    subject: string;
    hookRationale: string;
    body: string;
  } {
    const profLastName = professor.name.split(' ').slice(-1)[0];
    const topPaper = professor.recentPublications[0] || {
      title: 'Recent research on ' + professor.researchTopics[0],
      venue: 'recent publications',
      year: 2024
    };

    let subject = '';
    let goalStatement = '';

    if (templateType === 'phd') {
      subject = `Prospective PhD Applicant (${studentProfile.targetOpportunity || 'Fall 2027'}) - Research Inquiry on ${professor.researchTopics[0] || 'Distributed Systems'}`;
      goalStatement = `I am preparing applications for PhD programs in Computer Science for ${studentProfile.targetOpportunity || 'the upcoming academic cycle'} and would love to explore potential alignment with your lab's ongoing research directions.`;
    } else if (templateType === 'internship') {
      subject = `Research Internship Inquiry: ${studentProfile.fullName} (${studentProfile.currentInstitution || 'Undergraduate'}) - ${professor.researchTopics[0]}`;
      goalStatement = `I am writing to inquire about potential research assistantship or summer visiting student opportunities within your research group.`;
    } else {
      subject = `Inquiry regarding collaboration & paper on ${topPaper.title.slice(0, 45)}...`;
      goalStatement = `I have been studying your work on ${topPaper.title} and am reaching out to discuss potential collaboration and master's thesis research.`;
    }

    const hookRationale = `Connects your hands-on background in ${studentProfile.primaryInterests[0] || 'Distributed Systems'} and ${studentProfile.technicalSkills[0] || 'low-level systems'} directly with Dr. ${profLastName}'s ${topPaper.venue} paper ("${topPaper.title}"). It establishes immediate credibility through concrete technical grounding rather than generic flattery.`;

    const body = `Dear Dr. ${profLastName},

I hope this email finds you well.

My name is ${studentProfile.fullName || '[your name]'}, and I am currently a ${studentProfile.currentDegree || '[your degree]'} at ${studentProfile.currentInstitution || '[your institution]'}. ${goalStatement}

I recently read your ${topPaper.venue} paper, "${topPaper.title}," with great interest. In particular, I was fascinated by your approach to ${topPaper.primaryTopic || 'handling consistency and performance trade-offs'}. In my recent work, I built and verified an asynchronous consensus log, which sparked my deep interest in ${professor.researchTopics[0] || 'distributed systems'} and ${professor.researchTopics[1] || 'fault tolerance'}. 

Specifically, I would love to explore how your team plans to extend this approach to address ${professor.suggestedHookSnippet.toLowerCase()}

Given your group's leadership in this space, I would be deeply grateful for the opportunity to contribute to your research. I have attached my CV (${studentProfile.cvUrl || 'attached'}) and code repositories for your review.

If your schedule permits in the coming weeks, would you be open to a brief 10-15 minute conversation to discuss if my background might align with opportunities in your group?

Thank you very much for your time, consideration, and inspiring research.

Sincerely,

${studentProfile.fullName || '[your name]'}
${studentProfile.currentInstitution || '[your institution]'} | ${studentProfile.currentDegree || '[your degree]'}
${studentProfile.email || '[your email]'}
${studentProfile.githubUrl ? `GitHub: ${studentProfile.githubUrl}` : ''}
${studentProfile.portfolioUrl ? `Portfolio: ${studentProfile.portfolioUrl}` : ''}`.trim();

    return {
      subject,
      hookRationale,
      body,
    };
  }
};
