import { ConfigError } from '@/errors/ConfigError';
import { ValidationError } from '@/errors/ValidationError';
import { ValidationConfig } from '@/types/config';
import { validatePath } from '@/validators/validatePath';

import { runOnFiles } from '../runOnFiles';

jest.mock('@/validators/validatePath', () => ({
  validatePath: jest.fn(),
}));

describe('runOnFiles', () => {
  it('should return successPaths and errors', () => {
    const paths = ['/path/to/file1', '/path/to/file2', '/path/to/file3'];
    const config: ValidationConfig = {
      workdir: '.',
      rules: {},
      root: [],
      ignorePatterns: [],
      gitignore: false,
    };

    (validatePath as jest.Mock).mockImplementationOnce(() => {
      throw new ValidationError('Some error message');
    });
    (validatePath as jest.Mock).mockImplementationOnce(() => {
      throw new ConfigError('Some error message');
    });
    (validatePath as jest.Mock).mockImplementationOnce(() => undefined);

    const result = runOnFiles(paths, config);

    expect(result).toHaveProperty('successPaths');
    expect(result).toHaveProperty('errors');
    expect(Array.isArray(result.successPaths)).toBe(true);
    expect(Array.isArray(result.errors)).toBe(true);
    expect(result.successPaths).toHaveLength(1);
    expect(result.errors).toHaveLength(2);
    expect(result.successPaths).toContain(paths[2]);
    expect(result.errors[0]).toBeInstanceOf(ValidationError);
    expect(result.errors[1]).toBeInstanceOf(ConfigError);
    expect((result.errors[0] as ValidationError).path).toBe(paths[0]);
    expect((result.errors[1] as ConfigError).path).toBe(paths[1]);
  });
});
