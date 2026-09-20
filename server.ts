import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';
const TRUST_PROXY_HOPS = Number.isFinite(Number.parseInt(process.env.TRUST_PROXY_HOPS || '0', 10))
  ? Math.max(0, Number.parseInt(process.env.TRUST_PROXY_HOPS || '0', 10))
  : 0;
const OPENALEX_BASE_URL = 'https://api.openalex.org';
const CACHE_TTL_MS = 5 * 60 * 1000;
export const RATE_LIMIT_WINDOW_MS = 60 * 1000;
export const RATE_LIMIT_MAX = 20;
const cache = new Map<string, { expiresAt: number; payload: unknown }>();

export interface RateLimitEntry {
  startedAt: number;
  count: number;
}

export class RateLimiter {
  private readonly entries = new Map<string, RateLimitEntry>();

  isAllowed(ip: string, now = Date.now()): boolean {
    const current = this.entries.get(ip);
    if (!current || now - current.startedAt >= RATE_LIMIT_WINDOW_MS) {
      this.entries.set(ip, { startedAt: now, count: 1 });
      return true;
    }
    if (current.count >= RATE_LIMIT_MAX) return false;
    current.count += 1;
    return true;
  }

  prune(now = Date.now()): void {
    for (const [ip, entry] of this.entries) {
      if (now - entry.startedAt >= RATE_LIMIT_WINDOW_MS) this.entries.delete(ip);
    }
  }

  get size(): number {
    return this.entries.size;
  }
}

export function collectLastAuthorIds(works: OpenAlexWork[]): string[] {
  return Array.from(new Set(
    works
      .map((work) => work.authorships?.at(-1)?.author?.id)
      .filter((id): id is string => Boolean(id))
      .map((id) => id.replace('https://openalex.org/', ''))
  )).slice(0, 100);
}

export const app = express();
app.set('trust proxy', TRUST_PROXY_HOPS);
app.use(express.json({ limit: '16kb' }));

function proxyError(status: number, code: string, message: string) {
  return { error: { code, message } };
}

const rateLimiter = new RateLimiter();
const rateLimitPruneTimer = setInterval(() => rateLimiter.prune(), RATE_LIMIT_WINDOW_MS);
rateLimitPruneTimer.unref();

export function rateLimitKey(req: express.Request): string {
  return req.ip || 'unknown';
}

app.get('/api/openalex/search', async (req, res) => {
  if (!rateLimiter.isAllowed(rateLimitKey(req))) {
    return res.status(429).json(proxyError(429, 'rate_limit', 'Too many search requests. Please wait a minute and try again.'));
  }

  const query = typeof req.query.query === 'string' ? req.query.query.trim() : '';
  if (!query) return res.status(400).json(proxyError(400, 'invalid_query', 'A search query is required.'));
  if (query.length > 200) return res.status(400).json(proxyError(400, 'invalid_query', 'Search queries must be 200 characters or fewer.'));

  const visitorKey = req.header('X-OpenAlex-Key')?.trim();
  const serverKey = process.env.ALLOW_SERVER_KEY === 'true' ? process.env.OPENALEX_API_KEY?.trim() : undefined;
  const apiKey = visitorKey || serverKey;
  if (!apiKey) {
    return res.status(401).json(proxyError(401, 'missing_key', 'Add your free OpenAlex API key in Settings to search live data.'));
  }
  if (apiKey.length < 8 || apiKey.length > 200 || /\s/.test(apiKey)) {
    return res.status(400).json(proxyError(400, 'invalid_key', 'The OpenAlex API key format is invalid.'));
  }

  const cacheKey = query.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return res.json({ ...(cached.payload as object), cached: true, apiCalls: 0 });
  }

  const worksUrl = new URL(`${OPENALEX_BASE_URL}/works`);
  worksUrl.searchParams.set('search', query);
  worksUrl.searchParams.set('filter', `from_publication_date:${new Date().getFullYear() - 2}-01-01,to_publication_date:${new Date().getFullYear()}-12-31,type:article`);
  worksUrl.searchParams.set('per-page', '100');
  worksUrl.searchParams.set('select', 'id,title,publication_year,publication_date,cited_by_count,doi,abstract_inverted_index,authorships,primary_location,primary_topic');
  worksUrl.searchParams.set('api_key', apiKey);

  try {
    const worksResponse = await fetch(worksUrl);
    if (!worksResponse.ok) {
      const code = worksResponse.status === 429 ? 'rate_limit' : 'openalex_error';
      const message = worksResponse.status === 401 || worksResponse.status === 403
        ? 'OpenAlex rejected this key. Check it in Settings and try again.'
        : worksResponse.status === 429
          ? 'OpenAlex rate limit reached. Please wait before trying again.'
          : `OpenAlex works search failed (${worksResponse.status}).`;
      return res.status(worksResponse.status).json(proxyError(worksResponse.status, code, message));
    }

    const worksData = await worksResponse.json() as { results?: OpenAlexWork[] };
    const works = worksData.results || [];
    const authorIds = collectLastAuthorIds(works);

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
        const message = authorsResponse.status === 401 || authorsResponse.status === 403
          ? 'OpenAlex rejected this key. Check it in Settings and try again.'
          : authorsResponse.status === 429
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
  } catch {
    console.error('OpenAlex proxy request failed');
    return res.status(502).json(proxyError(502, 'network', 'Could not reach OpenAlex. Check your network connection and try again.'));
  }
});

export interface OpenAlexWork {
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

export async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
    return app.listen(PORT, HOST, () => console.log(`Scout server listening on http://${HOST}:${PORT}`));
  }
  if (process.env.NODE_ENV === 'test') return app.listen(PORT, HOST);
  const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
  return app.listen(PORT, HOST, () => console.log(`Scout dev server listening on http://${HOST}:${PORT}`));
}

if (process.env.NODE_ENV !== 'test') {
  await startServer();
}
