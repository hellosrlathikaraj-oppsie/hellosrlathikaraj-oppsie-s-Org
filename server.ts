import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';
const OPENALEX_BASE_URL = 'https://api.openalex.org';
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { expiresAt: number; payload: unknown }>();

const app = express();
app.use(express.json());

function proxyError(status: number, code: string, message: string) {
  return { error: { code, message } };
}

app.get('/api/openalex/search', async (req, res) => {
  const apiKey = process.env.OPENALEX_API_KEY;
  if (!apiKey) {
    return res.status(503).json(proxyError(503, 'missing_key', 'OPENALEX_API_KEY is not configured on the server. Add it to your local environment before searching.'));
  }

  const query = typeof req.query.query === 'string' ? req.query.query.trim() : '';
  const cacheKey = query.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return res.json({ ...(cached.payload as object), cached: true, apiCalls: 0 });
  }

  const worksUrl = new URL(`${OPENALEX_BASE_URL}/works`);
  worksUrl.searchParams.set('search', query || 'research');
  worksUrl.searchParams.set('filter', `from_publication_date:${new Date().getFullYear() - 2}-01-01,to_publication_date:${new Date().getFullYear()}-12-31,type:article`);
  worksUrl.searchParams.set('per-page', '100');
  worksUrl.searchParams.set('select', 'id,title,publication_year,publication_date,cited_by_count,doi,abstract_inverted_index,authorships,primary_location,primary_topic');
  worksUrl.searchParams.set('api_key', apiKey);

  try {
    const worksResponse = await fetch(worksUrl);
    if (!worksResponse.ok) {
      const code = worksResponse.status === 429 ? 'rate_limit' : 'openalex_error';
      const message = worksResponse.status === 429
        ? 'OpenAlex rate limit reached. Please wait before trying again.'
        : `OpenAlex works search failed (${worksResponse.status}).`;
      return res.status(worksResponse.status).json(proxyError(worksResponse.status, code, message));
    }

    const worksData = await worksResponse.json() as { results?: OpenAlexWork[] };
    const works = worksData.results || [];
    const authorIds = Array.from(new Set(
      works
        .map((work) => work.authorships?.[work.authorships.length - 1]?.author?.id)
        .filter((id): id is string => Boolean(id))
        .map((id) => id.replace('https://openalex.org/', ''))
    ));

    let authors: OpenAlexAuthor[] = [];
    let apiCalls = 1;
    if (authorIds.length > 0) {
      const authorsUrl = new URL(`${OPENALEX_BASE_URL}/authors`);
      authorsUrl.searchParams.set('filter', `openalex:${authorIds.join('|')}`);
      authorsUrl.searchParams.set('select', 'id,display_name,last_known_institutions,summary_stats,cited_by_count,topics');
      authorsUrl.searchParams.set('per-page', String(Math.min(authorIds.length, 100)));
      authorsUrl.searchParams.set('api_key', apiKey);
      const authorsResponse = await fetch(authorsUrl);
      if (!authorsResponse.ok) {
        const code = authorsResponse.status === 429 ? 'rate_limit' : 'openalex_error';
        const message = authorsResponse.status === 429
          ? 'OpenAlex rate limit reached while loading author details. Please wait before trying again.'
          : `OpenAlex author lookup failed (${authorsResponse.status}).`;
        return res.status(authorsResponse.status).json(proxyError(authorsResponse.status, code, message));
      }
      const authorsData = await authorsResponse.json() as { results?: OpenAlexAuthor[] };
      authors = authorsData.results || [];
      apiCalls += 1;
    }

    const payload = { works, authors };
    cache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, payload });
    return res.json({ ...payload, cached: false, apiCalls });
  } catch (error) {
    console.error('OpenAlex proxy request failed', error instanceof Error ? error.message : 'unknown error');
    return res.status(502).json(proxyError(502, 'network', 'Could not reach OpenAlex. Check your network connection and try again.'));
  }
});

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

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
  app.listen(PORT, HOST, () => console.log(`Scout server listening on http://${HOST}:${PORT}`));
} else {
  const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
  app.listen(PORT, HOST, () => console.log(`Scout dev server listening on http://${HOST}:${PORT}`));
}
