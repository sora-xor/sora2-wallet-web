import { TextEncoder, TextDecoder } from 'util';

import { jest } from '@jest/globals';

jest.mock('@walletconnect/modal');
jest.mock('@walletconnect/universal-provider');

Object.assign(global, { TextDecoder, TextEncoder });

const constantDate = new Date(2020, 10, 27, 23, 59, 59);
global.Date = class extends Date {
  constructor() {
    return constantDate;
  }
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
