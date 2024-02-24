import {describe, it} from 'node:test';
import {notEqual, deepStrictEqual} from 'node:assert';
import {default as types} from 'lintspaces/src/constants/types.js';

describe('lintspaces types import', () => {
  it('should import types from lintspaces/src/constants/types.js', () => {
    notEqual(types, undefined, 'types is undefined');
    notEqual(types, null, 'types is null');
  });

  it('should export the expected object', () => {
    const expected = {
      WARNING: 'warning',
      HINT: 'hint',
    };
    deepStrictEqual(types, expected, 'types does not export the expected object');
  });
});
