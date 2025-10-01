import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';

import { sanitizeNftBlacklistPayload, sanitizeWhitelistPayload } from '@/util/security';

const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

afterEach(() => {
  warnSpy.mockClear();
  errorSpy.mockClear();
});

afterAll(() => {
  warnSpy.mockRestore();
  errorSpy.mockRestore();
});

describe('sanitizeWhitelistPayload', () => {
  it('keeps valid entries and strips unsafe characters', () => {
    const payload = JSON.stringify([
      {
        address: ' 0x1234567890abcdef ',
        symbol: 'XOR<',
        name: 'SORA <Token>',
        decimals: 18.9,
        icon: 'https://example.com/icon.png',
        extraField: 'ignored',
      },
    ]);

    const result = sanitizeWhitelistPayload(payload);

    expect(result).toEqual([
      {
        address: '0x1234567890abcdef',
        symbol: 'XOR',
        name: 'SORA Token',
        decimals: 18,
        icon: 'https://example.com/icon.png',
      },
    ]);
  });

  it('drops entries missing required fields or with unsupported protocols', () => {
    const payload = JSON.stringify([
      {
        address: '0xabc',
        symbol: 'VALID',
        name: 'Valid Token',
        decimals: '18',
        icon: 'javascript:alert(1)',
      },
      {
        address: '',
        symbol: 'MISSING',
        name: 'Missing Address',
        decimals: 12,
        icon: 'https://example.com/icon.png',
      },
    ]);

    const result = sanitizeWhitelistPayload(payload);

    expect(result).toEqual([
      {
        address: '0xabc',
        symbol: 'VALID',
        name: 'Valid Token',
        decimals: 18,
        icon: '',
      },
    ]);
  });

  it('returns empty array for malformed payloads', () => {
    const malformed = '{ not json }';

    expect(sanitizeWhitelistPayload(malformed)).toEqual([]);
    expect(sanitizeWhitelistPayload(JSON.stringify({ foo: 'bar' }))).toEqual([]);
  });
});

describe('sanitizeNftBlacklistPayload', () => {
  it('keeps only non-empty string values', () => {
    const payload = JSON.stringify([' 0x123 ', '', null, 100, '0x456']);

    expect(sanitizeNftBlacklistPayload(payload)).toEqual(['0x123', '0x456']);
  });

  it('returns empty array for malformed payloads', () => {
    expect(sanitizeNftBlacklistPayload('invalid json')).toEqual([]);
    expect(sanitizeNftBlacklistPayload(JSON.stringify({ value: '0x123' }))).toEqual([]);
  });
});
