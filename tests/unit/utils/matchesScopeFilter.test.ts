import { describe, it, expect } from 'vitest';
import { matchesScopeFilter } from '../../../src/utils/matchesScopeFilter';

describe('matchesScopeFilter', () => {
  it('returns true if no filter is provided', () => {
    expect(matchesScopeFilter('foo', undefined)).toBe(true);
    expect(matchesScopeFilter('foo', null as any)).toBe(true);
  });

  it('returns true if filter is a string and matches', () => {
    expect(matchesScopeFilter('foo', 'foo')).toBe(true);
    expect(matchesScopeFilter('bar', 'foo')).toBe(false);
  });

  it('returns true if filter is a RegExp and matches', () => {
    expect(matchesScopeFilter('foo', /^f/)).toBe(true);
    expect(matchesScopeFilter('bar', /^f/)).toBe(false);
  });

  it('returns true if filter is a function and returns true', () => {
    expect(matchesScopeFilter('foo', (s) => s === 'foo')).toBe(true);
    expect(matchesScopeFilter('bar', (s) => s === 'foo')).toBe(false);
  });

  it('returns false for unknown filter type', () => {
    expect(matchesScopeFilter('foo', 123 as any)).toBe(false);
  });
});
