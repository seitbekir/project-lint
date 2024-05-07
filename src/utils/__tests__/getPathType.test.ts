import { lstatSync } from 'node:fs';

import { Type } from '@/types/config';
import { ValidationError } from '@/errors/ValidationError';

import { getPathType } from '../getPathType';

jest.mock('node:fs', () => ({
  lstatSync: jest.fn(),
}));

describe('getPathType', () => {
  it('should return the correct path type for file', () => {
    const path = '/path/to/file.txt';

    (lstatSync as jest.Mock).mockReturnValue({ isFile: () => true, isDirectory: () => false });

    const result = getPathType(path);

    expect(result).toStrictEqual(Type.file);
  });

  it('should return the correct path type for dir', () => {
    const path = '/path/to/file.txt';

    (lstatSync as jest.Mock).mockReturnValue({ isFile: () => false, isDirectory: () => true });

    const result = getPathType(path);

    expect(result).toStrictEqual(Type.dir);
  });

  it('should throw a ValidationError for invalid path', () => {
    (lstatSync as jest.Mock).mockReturnValue({ isFile: () => false, isDirectory: () => false });

    const path = '/path/to/invalid';

    expect(() => {
      getPathType(path);
    }).toThrow(ValidationError);
  });

  it('should throw a ValidationError for invalid path', () => {
    (lstatSync as jest.Mock).mockImplementation(() => {
      throw new Error('error');
    });

    const path = '/path/to/invalid';

    expect(() => {
      getPathType(path);
    }).toThrow(ValidationError);
  });
});
