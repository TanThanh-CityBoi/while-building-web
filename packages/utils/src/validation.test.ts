import { describe, expect, it } from 'vitest';
import { isValidEmail, validatePassword } from './validation';

describe('isValidEmail', () => {
  it('accepts ordinary addresses', () => {
    expect(isValidEmail('ada@example.com')).toBe(true);
    expect(isValidEmail('  ada+cms@sub.example.co  ')).toBe(true);
  });

  it('rejects obvious typos', () => {
    expect(isValidEmail('ada@example')).toBe(false);
    expect(isValidEmail('ada example.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('enforces the minimum length', () => {
    expect(validatePassword('short')).toMatch(/at least 8/);
    expect(validatePassword('long-enough')).toBeNull();
  });
});
