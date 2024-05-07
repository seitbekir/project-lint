import { mergeDeep } from '../mergeDeep';

describe('mergeDeep', () => {
  it('should merge two objects deeply', () => {
    const target = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3,
        },
      },
    };

    const source = {
      b: {
        d: {
          f: 4,
        },
      },
      g: 5,
    };

    const expected = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3,
          f: 4,
        },
      },
      g: 5,
    };

    const result = mergeDeep(target, source);

    expect(result).toEqual(expected);
  });

  it('should merge arrays', () => {
    const target = {
      a: [1, 2],
    };

    const source = {
      a: [3, 4],
    };

    const expected = {
      a: [1, 2, 3, 4],
    };

    const result = mergeDeep(target, source);

    expect(result).toEqual(expected);
  });

  it('should merge arrays and objects', () => {
    const target = {
      a: {
        b: [1, 2],
      },
    };

    const source = {
      a: {
        b: [3, 4],
      },
    };

    const expected = {
      a: {
        b: [1, 2, 3, 4],
      },
    };

    const result = mergeDeep(target, source);

    expect(result).toEqual(expected);
  });

  it('should return the source object if target is not an object', () => {
    const target = 1;
    const source = { a: 1 };

    // @ts-expect-error test purpose
    const result = mergeDeep(target, source);

    expect(result).toEqual(source);
  });

  it('should return the target source if source is not an object', () => {
    const target = { a: 1 };
    const source = 1;

    // @ts-expect-error test purpose
    const result = mergeDeep(target, source);

    expect(result).toEqual(source);
  });
});
