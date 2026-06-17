import { describe, it, expect } from 'vitest';
import { buildTossAuthHeader } from '../auth';

describe('buildTossAuthHeader', () => {
  it('encodes "{secret}:" as Basic base64', () => {
    expect(buildTossAuthHeader('test_sk')).toBe(
      `Basic ${Buffer.from('test_sk:').toString('base64')}`
    );
  });
});
