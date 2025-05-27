import { describe, it, expect } from 'vitest';
import { globalLogOptions } from '../../../../src/core/globalLogOptions';

describe('globalLogOptions', () => {
  it('should have default options', () => {
    expect(globalLogOptions).toMatchObject({
      levelShort: true,
      timestamp: false,
    });
  });
});
