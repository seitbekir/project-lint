import { checkConfig } from '../checkConfig';

jest.mock('node:path', () => ({
  ...jest.requireActual('node:path'),
  dirname: jest.fn(() => '/path/to'),
}));

describe('checkConfig', () => {
  it('should throw ConfigError if config is invalid', () => {
    // @ts-expect-error test purpose
    expect(() => checkConfig([])).toThrow('Config must be an object');
    // @ts-expect-error test purpose
    expect(() => checkConfig(null)).toThrow('Config must be an object');
  });

  it('should throw ConfigError if workdir is not a string', () => {
    const invalidConfig = {
      workdir: 123,
    };
    const configPath = '/path/to/config';

    // @ts-expect-error test purpose
    expect(() => checkConfig(invalidConfig, configPath)).toThrow('Workspace must be a string');
  });

  it('should throw ConfigError if rules is not a mapped object', () => {
    const invalidConfig = {
      rules: 'invalid',
    };
    const configPath = '/path/to/config';

    // @ts-expect-error test purpose
    expect(() => checkConfig(invalidConfig, configPath)).toThrow('Rules must be maped object');
  });

  it('should throw ConfigError if no root or root is not an array', () => {
    const invalidConfig = {
      root: 'invalid',
    };
    const configPath = '/path/to/config';

    // @ts-expect-error test purpose
    expect(() => checkConfig(invalidConfig, configPath)).toThrow('Root must be an array of Rules');

    const invalidConfig2 = {
      root: { path: '/path/to/root' },
    };

    // @ts-expect-error test purpose
    expect(() => checkConfig(invalidConfig2, configPath)).toThrow('Root must be an array of Rules');
  });

  it('should throw ConfigError if ignorePatterns is not an array of strings', () => {
    const invalidConfig = {
      ignorePatterns: 'invalid',
      root: [],
    };
    const configPath = '/path/to/config';

    // @ts-expect-error test purpose
    expect(() => checkConfig(invalidConfig, configPath)).toThrow('Ignore patterns must be an array of strings');
  });

  it('should return a valid ValidationConfig if config is valid', () => {
    const validConfig = {
      workdir: '.',
      rules: {
        ruleName: { name: 'rule-name', type: 'file' },
      },
      root: [{ ruleId: 'ruleName' }, { name: 'index.ts', type: 'file' }],
      ignorePatterns: ['node_modules'],
    };
    const configPath = '/path/to/config';

    // @ts-expect-error test purpose
    const result = checkConfig(validConfig, configPath);

    expect(result).toStrictEqual({
      workdir: '/path/to',
      rules: { ruleName: { name: 'rule-name', type: 'file' } },
      root: [{ ruleId: 'ruleName' }, { name: 'index.ts', type: 'file' }],
      ignorePatterns: ['node_modules'],
      gitignore: false,
    });
  });
});
