import { Publication } from '../types';

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'in', 'is', 'it',
  'of', 'on', 'or', 'that', 'the', 'their', 'this', 'to', 'with', 'within', 'via',
  'we', 'work', 'works', 'using', 'use', 'our', 'new', 'paper', 'research', 'study',
]);

export interface MatchWork extends Pick<Publication, 'title' | 'year' | 'abstractSnippet' | 'primaryTopic'> {}

export interface MatchScore {
  score: number;
  sharedTerms: string[];
  matchingWorks: number;
  lastAuthorWorks: number;
  newestYear: number | null;
}

function stem(token: string): string {
  if (token.length > 5 && token.endsWith('ies')) return `${token.slice(0, -3)}y`;
  if (token.length > 5 && token.endsWith('ing')) return token.slice(0, -3);
  if (token.length > 4 && token.endsWith('ed')) return token.slice(0, -2);
  if (token.length > 4 && token.endsWith('es')) return token.slice(0, -2);
  if (token.length > 3 && token.endsWith('s')) return token.slice(0, -1);
  return token;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.-]+/g, ' ')
    .split(/\s+/)
    .map((token) => stem(token.replace(/^[.]+|[.]+$/g, '')))
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

function termFrequency(tokens: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  tokens.forEach((token) => counts.set(token, (counts.get(token) || 0) + 1));
  return counts;
}

function cosineSimilarity(
  left: string[],
  right: string[],
  candidateDocuments: string[][],
): { value: number; sharedTerms: string[] } {
  const leftTf = termFrequency(left);
  const rightTf = termFrequency(right);
  const documentFrequency = new Map<string, number>();
  for (const document of candidateDocuments) {
    for (const term of new Set(document)) documentFrequency.set(term, (documentFrequency.get(term) || 0) + 1);
  }
  const documentCount = Math.max(candidateDocuments.length, 1);
  const vocabulary = new Set([...leftTf.keys(), ...rightTf.keys()]);
  const leftVector: number[] = [];
  const rightVector: number[] = [];

  vocabulary.forEach((term) => {
    const idf = Math.log((documentCount + 1) / ((documentFrequency.get(term) || 0) + 1)) + 1;
    leftVector.push((leftTf.get(term) || 0) * idf);
    rightVector.push((rightTf.get(term) || 0) * idf);
  });

  const dot = leftVector.reduce((sum, value, index) => sum + value * rightVector[index], 0);
  const leftMagnitude = Math.sqrt(leftVector.reduce((sum, value) => sum + value * value, 0));
  const rightMagnitude = Math.sqrt(rightVector.reduce((sum, value) => sum + value * value, 0));
  const sharedTerms = Array.from(leftTf.keys())
    .filter((term) => rightTf.has(term))
    .sort((a, b) => ((leftTf.get(b) || 0) + (rightTf.get(b) || 0)) - ((leftTf.get(a) || 0) + (rightTf.get(a) || 0)))
    .slice(0, 3);

  return {
    value: leftMagnitude && rightMagnitude ? dot / (leftMagnitude * rightMagnitude) : 0,
    sharedTerms,
  };
}

export function calculateMatchScore(
  userText: string,
  matchingWorks: MatchWork[],
  allAuthorWorks: MatchWork[],
  lastAuthorWorks: MatchWork[],
  currentYear = new Date().getFullYear(),
  candidateCorpus: MatchWork[][] = [matchingWorks],
): MatchScore {
  const professorText = matchingWorks
    .map((work) => `${work.title} ${work.abstractSnippet} ${work.primaryTopic}`)
    .join(' ');
  const corpusTexts = candidateCorpus.map((works) => tokenize(works.map((work) => `${work.title} ${work.abstractSnippet} ${work.primaryTopic}`).join(' ')));
  const topic = cosineSimilarity(tokenize(userText), tokenize(professorText), corpusTexts);
  const workCount = matchingWorks.length;
  const newestYear = allAuthorWorks.reduce<number | null>((latest, work) => {
    if (!work.year) return latest;
    return latest === null ? work.year : Math.max(latest, work.year);
  }, null);
  const countSignal = Math.min(1, Math.log1p(workCount) / Math.log1p(10));
  const recencySignal = newestYear === null ? 0 : Math.max(0, Math.min(1, 1 - (currentYear - newestYear) / 3));
  const recentActivity = countSignal * 0.7 + recencySignal * 0.3;
  const piSignal = allAuthorWorks.length ? lastAuthorWorks.length / allAuthorWorks.length : 0;
  const score = Math.round(Math.max(0, Math.min(100, topic.value * 60 + recentActivity * 25 + piSignal * 15)));

  return {
    score,
    sharedTerms: topic.sharedTerms,
    matchingWorks: workCount,
    lastAuthorWorks: lastAuthorWorks.length,
    newestYear,
  };
}

export function buildMatchReasons(result: MatchScore, currentYear = new Date().getFullYear()): string[] {
  const reasons: string[] = [];
  if (result.sharedTerms.length) reasons.push(`Shared terms: ${result.sharedTerms.join(', ')}`);
  reasons.push(`${result.matchingWorks} matching papers since ${currentYear - 2}`);
  if (result.lastAuthorWorks || result.matchingWorks) {
    const denominator = Math.max(result.matchingWorks, result.lastAuthorWorks);
    const share = denominator ? Math.round((result.lastAuthorWorks / denominator) * 100) : 0;
    reasons.push(`Last-author share: ${share}% (${result.lastAuthorWorks}/${denominator})`);
  }
  if (result.newestYear !== null) reasons.push(`Newest matching work: ${result.newestYear}`);
  return reasons.slice(0, 4);
}
