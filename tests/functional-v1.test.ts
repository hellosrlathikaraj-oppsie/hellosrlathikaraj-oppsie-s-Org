import assert from 'node:assert/strict';
import test from 'node:test';
import { collectLastAuthorIds } from '../server';
import { mapResults } from '../src/services/openalex';
import { calculateMatchScore, MatchWork } from '../src/services/matching';

const work = (id: string, authors: Array<[string, string]>, title: string): {
  id: string;
  title: string;
  publication_year: number;
  publication_date: string;
  cited_by_count: number;
  abstract_inverted_index: null;
  authorships: Array<{ author: { id: string; display_name: string } }>;
  primary_location: { source: { display_name: string } };
  primary_topic: { display_name: string };
} => ({
  id,
  title,
  publication_year: 2025,
  publication_date: '2025-01-01',
  cited_by_count: 1,
  abstract_inverted_index: null,
  authorships: authors.map(([authorId, displayName]) => ({ author: { id: `https://openalex.org/${authorId}`, display_name: displayName } })),
  primary_location: { source: { display_name: 'Example Journal' } },
  primary_topic: { display_name: 'Example Topic' },
});

test('only last authors become candidates while their coauthored appearances are retained', () => {
  const works = [
    work('W1', [['A2', 'Coauthor'], ['A1', 'Last Author']], 'Last-author paper'),
    work('W2', [['A2', 'Coauthor'], ['A1', 'Last Author']], 'Coauthor appearance'),
  ];
  assert.deepEqual(collectLastAuthorIds(works), ['A1']);
  const professors = mapResults({
    works,
    authors: [{ id: 'A1', display_name: 'Last Author', topics: [] }, { id: 'A2', display_name: 'Coauthor', topics: [] }],
    queryText: 'last author',
  });
  assert.deepEqual(professors.map((professor) => professor.name), ['Last Author']);
  assert.equal(professors[0].recentPublications.length, 2);
});

test('forged X-Forwarded-For cannot bypass the HTTP rate limit', async () => {
  const { startServer } = await import('../server');
  const server = await startServer();
  if (!server.listening) await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address();
  assert(address && typeof address !== 'string');
  try {
    const statuses: number[] = [];
    for (let index = 0; index < 25; index += 1) {
      const response = await fetch(`http://127.0.0.1:${address.port}/api/openalex/search?query=rate-limit-${index}`, {
        headers: { 'X-Forwarded-For': `203.0.113.${index + 1}` },
      });
      statuses.push(response.status);
    }
    assert.deepEqual(statuses.slice(0, 20).every((status) => status === 401), true);
    assert.deepEqual(statuses.slice(20).every((status) => status === 429), true);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test('topic scoring ranks a relevant professor above an irrelevant professor', () => {
  const relevant: MatchWork[] = [{ title: 'Distributed systems consensus', year: 2025, abstractSnippet: 'Fault tolerant replicated logs and consensus protocols', primaryTopic: 'Distributed Systems' }];
  const irrelevant: MatchWork[] = [{ title: 'Marine ecology survey', year: 2025, abstractSnippet: 'Coral reef biodiversity and ocean habitats', primaryTopic: 'Marine Biology' }];
  const corpus = [relevant, irrelevant];
  const relevantScore = calculateMatchScore('distributed systems consensus', relevant, relevant, relevant, 2026, corpus);
  const irrelevantScore = calculateMatchScore('distributed systems consensus', irrelevant, irrelevant, irrelevant, 2026, corpus);
  assert.ok(relevantScore.score > irrelevantScore.score);
});
