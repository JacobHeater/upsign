import { describe, expect, it } from '@jest/globals';
import { isValidPhoneNumber } from '../validation';

describe('isValidPhoneNumber', () => {
  it('should return true for valid phone numbers with country code', () => {
    expect(isValidPhoneNumber('+1234567890')).toBe(true);
    expect(isValidPhoneNumber('+1 (234) 567-8901')).toBe(true);
    expect(isValidPhoneNumber('+44 20 7946 0958')).toBe(true);
  });

  it('should return true for valid phone numbers without country code', () => {
    expect(isValidPhoneNumber('1234567890')).toBe(true);
    expect(isValidPhoneNumber('123 456 7890')).toBe(true);
    expect(isValidPhoneNumber('123-456-7890')).toBe(true);
  });

  it('should return false for phone numbers starting with 0', () => {
    expect(isValidPhoneNumber('0123456789')).toBe(false);
    expect(isValidPhoneNumber('+0123456789')).toBe(false);
  });

  it('should return false for invalid formats', () => {
    expect(isValidPhoneNumber('')).toBe(false);
    expect(isValidPhoneNumber('abc123')).toBe(false);
    expect(isValidPhoneNumber('+')).toBe(false);
    expect(isValidPhoneNumber('123')).toBe(true); // Valid according to regex
    expect(isValidPhoneNumber('123.456.7890')).toBe(false); // dot not allowed
    expect(isValidPhoneNumber('123@456')).toBe(false); // @ not allowed
    expect(isValidPhoneNumber('++123')).toBe(false); // double +
    expect(isValidPhoneNumber('+0')).toBe(false); // starts with 0 after +
    expect(isValidPhoneNumber(' ')).toBe(false); // space only
    expect(isValidPhoneNumber('0')).toBe(false); // starts with 0
    expect(isValidPhoneNumber('+ 123')).toBe(false); // space after +
    expect(isValidPhoneNumber('123a')).toBe(false); // ends with letter
    expect(isValidPhoneNumber('a123')).toBe(false); // starts with letter
    expect(isValidPhoneNumber('+123a')).toBe(false); // has letter after valid start
    expect(isValidPhoneNumber('123-456-789a')).toBe(false); // has letter
    expect(isValidPhoneNumber('1(2)3')).toBe(true); // valid with parentheses
    expect(isValidPhoneNumber('1-2-3')).toBe(true); // valid with dashes
    expect(isValidPhoneNumber('1 2 3')).toBe(true); // valid with spaces
  });

  it('should return false for null or undefined inputs', () => {
    expect(isValidPhoneNumber(null as any)).toBe(false);
    expect(isValidPhoneNumber(undefined as any)).toBe(false);
  });
});
