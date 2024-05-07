import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

import { readConfigFile } from '../readConfigFile';

jest.mock('node:fs', () => ({
  readFileSync: jest.fn(),
}));
jest.mock('yaml', () => ({
  parse: jest.fn(),
}));

describe('readConfigFile', () => {
  it('should read and parse the config file', () => {
    const configPath = '/path/to/config.yaml';
    const mockConfig = {};
    const mockFileContent = 'config content';

    (readFileSync as jest.Mock).mockReturnValue(mockFileContent);
    (parse as jest.Mock).mockReturnValue(mockConfig);

    const result = readConfigFile(configPath);

    expect(result).toStrictEqual(mockConfig);
    expect(readFileSync).toHaveBeenCalledWith(configPath, 'utf8');
    expect(parse).toHaveBeenCalledWith(mockFileContent);
  });

  it('should throw an error if the config file is not found', () => {
    const configPath = '/path/to/nonexistent-config.yaml';

    (readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error('File not found');
    });

    expect(() => readConfigFile(configPath)).toThrow('Invalid config file');
  });

  it('should throw an error if the config file is invalid', () => {
    const configPath = '/path/to/invalid-config.yaml';

    (readFileSync as jest.Mock).mockReturnValue('invalid config');
    (parse as jest.Mock).mockImplementation(() => []);

    expect(() => readConfigFile(configPath)).toThrow('Invalid config file format');
  });

  it.each([true, 1, [1], [''], [true]])(
    'should throw an error if the extends parameter is invalid (%s)',
    (extendFiles) => {
      const configPath = '/path/to/invalid-extends-config.yaml';

      (readFileSync as jest.Mock).mockReturnValue('extends: invalid');
      (parse as jest.Mock).mockReturnValue({ extends: extendFiles });

      expect(() => readConfigFile(configPath)).toThrow('Invalid extends parameter in config file');
    },
  );

  it('should merge the config files if extends is an array of strings', () => {
    const configPath = '/path/to/extends-config.yaml';
    const mockConfig = { extends: ['/path/to/extends1.yaml', '/path/to/extends2.yaml'] };
    const mockConfig1 = { root: ['root1'] };
    const mockConfig2 = { root: ['root2'] };

    (parse as jest.Mock).mockReturnValueOnce(mockConfig);
    (parse as jest.Mock).mockReturnValueOnce(mockConfig1);
    (parse as jest.Mock).mockReturnValueOnce(mockConfig2);

    const result = readConfigFile(configPath);

    expect(result).toStrictEqual({ root: ['root1', 'root2'], gitignore: false, extends: expect.any(Array) });
  });

  it('should add gitignore patterns if gitignore is enabled', () => {
    const configPath = '/path/to/gitignore-config.yaml';
    const mockConfig = { gitignore: true };

    (parse as jest.Mock).mockReturnValue(mockConfig);

    const result = readConfigFile(configPath);

    expect(result).toStrictEqual({ gitignore: true });
  });

  it('should not add gitignore patterns if gitignore is disabled', () => {
    const configPath = '/path/to/gitignore-config.yaml';
    const mockConfig = { gitignore: false };

    (parse as jest.Mock).mockReturnValue(mockConfig);

    const result = readConfigFile(configPath);

    expect(result).toStrictEqual({ gitignore: false });
  });

  it('should not add nested gitignore patterns', () => {
    const configPath = '/path/to/gitignore-config.yaml';
    const mockConfig1 = { extends: ['/path/to/extends.yaml'] };
    const mockConfig2 = { gitignore: true };

    (parse as jest.Mock).mockReturnValueOnce(mockConfig1);
    (parse as jest.Mock).mockReturnValueOnce(mockConfig2);

    const result = readConfigFile(configPath);

    expect(result).toStrictEqual(expect.objectContaining({ gitignore: false }));
  });
});
