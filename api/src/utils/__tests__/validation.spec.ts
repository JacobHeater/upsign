import { describe, expect, it } from '@jest/globals';
import { isValidPhoneNumber, normalizePhoneNumber } from '../validation';

describe('normalizePhoneNumber', () => {
  it('should normalize valid US phone numbers', () => {
    expect(normalizePhoneNumber('5555551212')).toBe('5555551212');
    expect(normalizePhoneNumber('+15555551212')).toBe('5555551212');
    expect(normalizePhoneNumber('(555) 555-1212')).toBe('5555551212');
    expect(normalizePhoneNumber('555 555 1212')).toBe('5555551212');
    expect(normalizePhoneNumber('555.555.1212')).toBe('5555551212');
    expect(normalizePhoneNumber('12345678901')).toBe('2345678901'); // 11 digits starting with 1
  });

  it('should return null for invalid phone numbers', () => {
    expect(normalizePhoneNumber('')).toBe(null);
    expect(normalizePhoneNumber('123')).toBe(null);
    expect(normalizePhoneNumber('123456789012')).toBe(null); // 12 digits
    expect(normalizePhoneNumber('+441234567890')).toBe(null); // International
    expect(normalizePhoneNumber('abc123')).toBe(null);
    expect(normalizePhoneNumber('55555512123')).toBe(null); // 11 digits not starting with 1
  });

  it('should handle null or undefined', () => {
    expect(normalizePhoneNumber(null as any)).toBe(null);
    expect(normalizePhoneNumber(undefined as any)).toBe(null);
  });
});

describe('isValidPhoneNumber', () => {
  it('should return true for valid US phone numbers', () => {
    expect(isValidPhoneNumber('5555551212')).toBe(true);
    expect(isValidPhoneNumber('+15555551212')).toBe(true);
    expect(isValidPhoneNumber('(555) 555-1212')).toBe(true);
    expect(isValidPhoneNumber('555 555 1212')).toBe(true);
    expect(isValidPhoneNumber('555.555.1212')).toBe(true);
    expect(isValidPhoneNumber('12345678901')).toBe(true);
  });

  it('should return false for invalid phone numbers', () => {
    expect(isValidPhoneNumber('')).toBe(false);
    expect(isValidPhoneNumber('123')).toBe(false);
    expect(isValidPhoneNumber('123456789012')).toBe(false);
    expect(isValidPhoneNumber('+441234567890')).toBe(false);
    expect(isValidPhoneNumber('abc123')).toBe(false);
    expect(isValidPhoneNumber('55555512123')).toBe(false);
  });

  it('should return false for null or undefined inputs', () => {
    expect(isValidPhoneNumber(null as any)).toBe(false);
    expect(isValidPhoneNumber(undefined as any)).toBe(false);
  });
});
