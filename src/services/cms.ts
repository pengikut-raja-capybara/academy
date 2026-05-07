import type { Module } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CmsSourceConfig {
  owner: string;
  repo: string;
  branch?: string;
}

// ─── Source Configuration ─────────────────────────────────────────────────────

export const ACADEMY_CMS_SOURCE: CmsSourceConfig = {
  owner: 'pengikut-raja-capybara',
  repo: 'academy-content',
  branch: 'main',
};

export const IMAGE_PROXY_CONFIG = {
  proxy: 'weserv' as const,
  quality: 80,
  width: 1200,
};

const CACHE_CONFIG = {
  latestRefTtlMs: 60 * 1000, // 1 minute
  latestRefMaxHitsPerHour: 10,
  latestRefWindowMs: 60 * 60 * 1000,
};

// ─── URL Builders ─────────────────────────────────────────────────────────────

function getSourceBranch(source: CmsSourceConfig): string {
  return source.branch ?? 'main';
}

function getSourceKey(source: CmsSourceConfig): string {
  return `${source.owner}/${source.repo}@${getSourceBranch(source)}`;
}

function encodePath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}

function buildJsDelivrRawUrl(path: string, source: CmsSourceConfig, ref: string): string {
  return `https://cdn.jsdelivr.net/gh/${source.owner}/${source.repo}@${encodeURIComponent(ref)}/${encodePath(path)}`;
}

function buildGitHubRawUrl(path: string, source: CmsSourceConfig, ref: string): string {
  return `https://raw.githubusercontent.com/${source.owner}/${source.repo}/${encodeURIComponent(ref)}/${encodePath(path)}`;
}

function buildBranchApiUrl(source: CmsSourceConfig): string {
  return `https://api.github.com/repos/${source.owner}/${source.repo}/branches/${encodeURIComponent(getSourceBranch(source))}`;
}

function buildJsDelivrFlatApiUrl(source: CmsSourceConfig, ref: string): string {
  return `https://data.jsdelivr.com/v1/package/gh/${source.owner}/${source.repo}@${encodeURIComponent(ref)}/flat`;
}

// ─── HTTP Utilities ───────────────────────────────────────────────────────────

async function assertResponse(url: string): Promise<Response> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) to ${url}`);
  }
  return response;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await assertResponse(url);
  return (await response.json()) as T;
}

async function fetchText(url: string): Promise<string> {
  const response = await assertResponse(url);
  return response.text();
}

// ─── Asset Resolver ──────────────────────────────────────────────────────────

export function resolveAssetUrl(assetPath: string, source: CmsSourceConfig = ACADEMY_CMS_SOURCE): string {
  if (!assetPath) return '';
  if (/^https?:\/\//i.test(assetPath)) return assetPath;

  const normalizedPath = assetPath.replace(/^\/+/, '');
  // Mapping public/uploads from CMS to actual path in repo
  const repoPath = normalizedPath.startsWith('public/') ? normalizedPath : `public/${normalizedPath}`;
  
  const url = buildJsDelivrRawUrl(repoPath, source, getSourceBranch(source));
  
  // Use weserv for image optimization
  const params = new URLSearchParams({
    url,
    q: String(IMAGE_PROXY_CONFIG.quality),
    output: 'webp'
  });
  return `https://wsrv.nl/?${params.toString()}`;
}

// ─── Commit SHA Cache ─────────────────────────────────────────────────────────

const latestContentRefCacheBySource = new Map<string, { ref: string; fetchedAt: number }>();
const latestRefRequestWindowCacheBySource = new Map<string, { startsAt: number; hits: number }>();

async function getLatestContentRef(source: CmsSourceConfig): Promise<string> {
  const sourceKey = getSourceKey(source);
  const sourceBranch = getSourceBranch(source);
  const now = Date.now();

  const latestContentRefCache = latestContentRefCacheBySource.get(sourceKey);
  const latestRefRequestWindowCache = latestRefRequestWindowCacheBySource.get(sourceKey);

  if (latestContentRefCache && now - latestContentRefCache.fetchedAt < CACHE_CONFIG.latestRefTtlMs) {
    return latestContentRefCache.ref;
  }

  if (!latestRefRequestWindowCache || now - latestRefRequestWindowCache.startsAt >= CACHE_CONFIG.latestRefWindowMs) {
    latestRefRequestWindowCacheBySource.set(sourceKey, { startsAt: now, hits: 0 });
  }

  const currentWindowCache = latestRefRequestWindowCacheBySource.get(sourceKey);
  if (currentWindowCache && currentWindowCache.hits >= CACHE_CONFIG.latestRefMaxHitsPerHour) {
    return latestContentRefCache?.ref ?? sourceBranch;
  }

  if (currentWindowCache) currentWindowCache.hits += 1;

  try {
    const branchResponse = await fetchJson<{ commit: { sha: string } }>(buildBranchApiUrl(source));
    const ref = branchResponse.commit.sha;
    latestContentRefCacheBySource.set(sourceKey, { ref, fetchedAt: now });
    return ref;
  } catch (error) {
    console.warn('Fallback to branch ref', error);
    return sourceBranch;
  }
}

// ─── CmsFetcher ───────────────────────────────────────────────────────────────

export class CmsFetcher {
  defaultSource: CmsSourceConfig;
  basePath: string;

  constructor(defaultSource: CmsSourceConfig, basePath: string = 'content') {
    this.defaultSource = defaultSource;
    this.basePath = basePath;
  }

  async fetchIndex(source: CmsSourceConfig = this.defaultSource): Promise<any[]> {
    const latestRef = await getLatestContentRef(source);
    try {
      const index = await this.fetchFile<{ modules: any[] }>('content-index.json', source, latestRef);
      return index?.modules || [];
    } catch (error) {
      console.warn('Failed to fetch index, falling back to empty list');
      return [];
    }
  }

  async fetchCollection<T>(folder: string, source: CmsSourceConfig = this.defaultSource): Promise<T[]> {
    const latestRef = await getLatestContentRef(source);
    
    // 1. Coba ambil dari content-index.json dulu (lebih efisien)
    try {
      const index = await this.fetchFile<{ modules: { path: string }[] }>('content-index.json', source, latestRef);
      if (index && Array.isArray(index.modules)) {
        console.log('Fetching modules from index...');
        return Promise.all(
          index.modules.map((m) => this.fetchFile<T>(m.path, source, latestRef))
        );
      }
    } catch (error) {
      console.warn('content-index.json not found or invalid, falling back to folder scan');
    }

    // 2. Fallback: Scan folder manual via jsDelivr API
    const response = await fetchJson<{ files: { name: string }[] }>(buildJsDelivrFlatApiUrl(source, latestRef));
    const folderPath = `/${this.basePath}/${folder.replace(/^\/+|\/+$/g, '')}/`;
    
    const entryFiles = response.files
      .filter((file) => file.name.startsWith(folderPath) && file.name.endsWith('.json'))
      .map(file => file.name.replace(/^\/+/, ''));

    return Promise.all(
      entryFiles.map((path) => this.fetchFile<T>(path, source, latestRef))
    );
  }

  async fetchEntry<T>(folder: string, slug: string, source: CmsSourceConfig = this.defaultSource): Promise<T> {
    const safeSlug = slug.trim();
    if (!safeSlug) throw new Error('Invalid entry slug.');
    const folderPath = `${this.basePath}/${folder}`.replace(/^\/+|\/+$/g, '');
    const path = `${folderPath}/${safeSlug}.json`;
    return this.fetchFile<T>(path, source);
  }

  async fetchFile<T>(path: string, source: CmsSourceConfig = this.defaultSource, ref?: string): Promise<T> {
    const targetRef = ref ?? (await getLatestContentRef(source));
    try {
      const rawText = await fetchText(buildJsDelivrRawUrl(path, source, targetRef));
      return JSON.parse(rawText) as T;
    } catch (error) {
      const rawText = await fetchText(buildGitHubRawUrl(path, source, targetRef));
      return JSON.parse(rawText) as T;
    }
  }
}

export const academyCms = new CmsFetcher(ACADEMY_CMS_SOURCE, 'content');

export async function fetchModuleIndex(): Promise<any[]> {
  return academyCms.fetchIndex();
}

export async function fetchAllModules(): Promise<Module[]> {
  return academyCms.fetchCollection<Module>('modules');
}

export async function fetchModuleBySlug(slug: string): Promise<Module> {
  return academyCms.fetchEntry<Module>('modules', slug);
}
