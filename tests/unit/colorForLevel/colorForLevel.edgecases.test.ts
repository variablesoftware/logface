import { describe, it, expect } from 'vitest';
import { __test_internals } from '../../../src/utils/colorForLevels/colorForLevel';

describe('colorForLevel: emoji and color config edge cases', () => {
  it('getEmoji returns empty string if userEmojis[level] is empty array', () => {
    __test_internals.setUserEmojis({ info: [] });
    expect(__test_internals.getEmoji('info')).toBe('');
  });

  it('getEmoji returns empty string if userEmojis[level] is undefined', () => {
    __test_internals.setUserEmojis({ info: undefined });
    expect(__test_internals.getEmoji('info')).toBe('');
  });

  it('getEmoji returns empty string if userEmojis is empty object and level is unknown', () => {
    __test_internals.setUserEmojis({});
    expect(__test_internals.getEmoji('notalevel')).toBe('');
  });

  it('getEmoji returns empty string if userEmojis[level] is not an array', () => {
    __test_internals.setUserEmojis({ info: undefined as any });
    expect(__test_internals.getEmoji('info')).toBe('');
  });

  it('styleWith returns identity if lib is not an object', () => {
    const fn = __test_internals.styleWith(null as any, 'gray');
    expect(fn('x')).toBe('x');
  });

  it('styleWith returns identity if method is not a function', () => {
    const fn = __test_internals.styleWith({ gray: 123 as any }, 'gray');
    expect(fn('x')).toBe('x');
  });

  it('styleWith returns identity if chained style is not a function', () => {
    const gray = (s: string) => `g:${s}`;
    (gray as any).bold = 123;
    const lib = { gray };
    const fn = __test_internals.styleWith(lib, 'gray', 'bold');
    expect(fn('x')).toBe('g:x');
  });
});
