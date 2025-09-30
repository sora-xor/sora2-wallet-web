import 'vitest';

declare global {
  namespace Chai {
    interface Assertion {
      toBe(expected: unknown): Assertion;
      toEqual(expected: unknown): Assertion;
      toMatch(expected: unknown): Assertion;
      toMatchSnapshot(...args: unknown[]): Assertion;
      toMatchInlineSnapshot(...args: unknown[]): Assertion;
      toHaveBeenCalled(): Assertion;
      toHaveBeenCalledTimes(expected: number): Assertion;
      toHaveBeenCalledWith(...args: unknown[]): Assertion;
      toBeTruthy(): Assertion;
      toBeUndefined(): Assertion;
    }
  }
}

export {};
