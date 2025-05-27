import { describe, it, expect } from 'vitest';
import { formatWithReplacements } from '../../../src/utils/formatWithReplacements';

describe('formatWithReplacements', () => {
  it('returns original if fmt is not a string', () => {
    expect(formatWithReplacements(123 as any, [1, 2])).toEqual([123, 1, 2]);
  });

  it('replaces %s with string', () => {
    expect(formatWithReplacements('hello %s', ['world'])).toEqual(['hello world']);
  });

  it('replaces %d and %i with integer', () => {
    expect(formatWithReplacements('num: %d %i', [42, '7'])).toEqual(['num: 42 7']);
  });

  it('replaces %f with float', () => {
    expect(formatWithReplacements('float: %f', [3.14])).toEqual(['float: 3.14']);
  });

  it('replaces %o and %O with JSON for objects', () => {
    expect(formatWithReplacements('obj: %o %O', [{ a: 1 }, [1, 2]])).toEqual([
      'obj: {"a":1} [1,2]'
    ]);
  });

  it('returns unused args after formatting', () => {
    expect(formatWithReplacements('a: %s', ['x', 'y', 'z'])).toEqual(['a: x', 'y', 'z']);
  });

  it('leaves unmatched tokens if not enough args', () => {
    expect(formatWithReplacements('a: %s %d %f', ['x'])).toEqual(['a: x %d %f']);
  });

  it('handles unknown tokens by leaving them unchanged', () => {
    expect(formatWithReplacements('a: %q %s', ['x'])).toEqual(['a: %q x']);
  });
});
