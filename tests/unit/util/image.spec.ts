import { describe, expect, it } from 'vitest';

import { buildCssUrl, sanitizeIconSource } from '@/util/image';

const toBase64 = (value: string) => Buffer.from(value, 'utf8').toString('base64');
const fromBase64 = (value: string) => Buffer.from(value, 'base64').toString('utf8');

describe('sanitizeIconSource', () => {
  it('allows https icon URLs', () => {
    expect(sanitizeIconSource(' https://cdn.example/icon.png ')).toBe('https://cdn.example/icon.png');
  });

  it('rejects javascript URLs', () => {
    expect(sanitizeIconSource('javascript:alert(1)')).toBe('');
  });

  it('rejects malformed data URIs', () => {
    expect(sanitizeIconSource('data:image/png;base64,not-base64?!')).toBe('');
  });

  it('removes script elements from svg data URIs', () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><rect width="10" height="10" /></svg>`;
    const sanitized = sanitizeIconSource(`data:image/svg+xml;base64,${toBase64(svg)}`);

    expect(sanitized).not.toBe('');
    const decoded = fromBase64(sanitized.split(',')[1]);
    expect(decoded).not.toMatch(/<script/i);
  });

  it('strips event attributes from svg data URIs', () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><rect width="10" height="10" /></svg>`;
    const sanitized = sanitizeIconSource(`data:image/svg+xml;base64,${toBase64(svg)}`);

    expect(sanitized).not.toBe('');
    const decoded = fromBase64(sanitized.split(',')[1]);
    expect(decoded).not.toMatch(/onload=/i);
  });
});

describe('buildCssUrl', () => {
  it('wraps icon path into a css url', () => {
    expect(buildCssUrl('https://cdn.example/icon.png')).toBe('url("https://cdn.example/icon.png")');
  });
});
