import { marked } from 'marked';
import DOMPurify from 'dompurify';

/**
 * Block-level HTML tags yang menandakan sebuah string adalah HTML murni.
 * Jika konten dimulai dengan tag ini, kita langsung sanitize tanpa convert markdown.
 */
const HTML_BLOCK_START_PATTERN =
  /^\s*<(p|div|h[1-6]|ul|ol|li|blockquote|pre|code|table|article|section|header|footer|nav|main|figure|aside|details|summary|br|hr|img|a)\b/i;

export type ContentFormat = 'markdown' | 'html';

/**
 * Deteksi apakah sebuah string adalah HTML murni atau markdown.
 */
export function detectContentFormat(content: string): ContentFormat {
  const trimmed = content.trim();
  if (!trimmed) return 'markdown';
  return HTML_BLOCK_START_PATTERN.test(trimmed) ? 'html' : 'markdown';
}

/**
 * Parse markdown string menjadi HTML string.
 */
function parseMarkdownToHtml(markdown: string): string {
  const result = marked.parse(markdown, {
    async: false,
    gfm: true,
    breaks: true,
  });
  return typeof result === 'string' ? result : '';
}

/**
 * Convert konten (markdown atau HTML) menjadi safe HTML yang siap dirender.
 * Sanitize menggunakan DOMPurify untuk mencegah XSS.
 */
export function toSafeHtml(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) return '';

  const format = detectContentFormat(trimmed);
  const rawHtml = format === 'html' ? trimmed : parseMarkdownToHtml(trimmed);

  return DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
  });
}
