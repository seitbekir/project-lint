import { readFileSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { parse } from 'yaml';

import { ConfigError } from '@/errors/ConfigError';
import { readConfigFile } from '../readConfigFile';

jest.mock('node:fs', () => ({
  readFileSync: jest.fn(),
  realpathSync: jest.fn((path: string) => path),
}));
jest.mock('node:module', () => ({
  ...jest.requireActual('node:module'),
  createRequire: jest.fn(),
}));
jest.mock('yaml', () => ({
  parse: jest.fn(),
}));

describe('readConfigFile', () => {
  beforeEach(() => {
    (realpathSync as unknown as jest.Mock).mockImplementation((path: string) => path);
    (createRequire as jest.Mock).mockReset();
  });

  it('should read and parse the config file', () => {
    const configPath = resolve('/path/to/config.yaml');
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
    const configPath = resolve('/path/to/nonexistent-config.yaml');

    (readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error('File not found');
    });

    expect(() => readConfigFile(configPath)).toThrow('Invalid config file');
  });

  it('should throw an error if the config file is invalid', () => {
    const configPath = resolve('/path/to/invalid-config.yaml');

    (readFileSync as jest.Mock).mockReturnValue('invalid config');
    (parse as jest.Mock).mockImplementation(() => []);

    expect(() => readConfigFile(configPath)).toThrow('Invalid config file format');
  });

  it.each([true, 1, [1], [''], [true]])(
    'should throw an error if the extends parameter is invalid (%s)',
    (extendFiles) => {
      const configPath = resolve('/path/to/invalid-extends-config.yaml');

      (readFileSync as jest.Mock).mockReturnValue('extends: invalid');
      (parse as jest.Mock).mockReturnValue({ extends: extendFiles });

      expect(() => readConfigFile(configPath)).toThrow('Invalid extends parameter in config file');
    },
  );

  it('should merge the config files if extends is an array of strings', () => {
    const configPath = resolve('/path/to/extends-config.yaml');
    const mockConfig = { extends: [resolve('/path/to/extends1.yaml'), resolve('/path/to/extends2.yaml')] };
    const mockConfig1 = { root: ['root1'] };
    const mockConfig2 = { root: ['root2'] };

    (parse as jest.Mock).mockReturnValueOnce(mockConfig);
    (parse as jest.Mock).mockReturnValueOnce(mockConfig1);
    (parse as jest.Mock).mockReturnValueOnce(mockConfig2);

    const result = readConfigFile(configPath);

    expect(result).toStrictEqual({ root: ['root1', 'root2'], gitignore: false, extends: expect.any(Array) });
  });

  it('should merge shared extends only once in a diamond dependency graph', () => {
    const configPaths = {
      root: resolve('/project/project.yml'),
      npm: resolve('/project/presets/npm.yml'),
      pnpm: resolve('/project/presets/pnpm.yml'),
      nodeBase: resolve('/project/presets/node-base.yml'),
    };
    const configs = {
      [configPaths.root]: {
        extends: ['./presets/npm.yml', './presets/pnpm.yml'],
        root: [{ name: 'README.md', type: 'file' }],
      },
      [configPaths.npm]: {
        extends: './node-base.yml',
        rules: { npm_root: [{ name: 'package-lock.json', type: 'file' }] },
      },
      [configPaths.pnpm]: {
        extends: './node-base.yml',
        rules: { pnpm_root: [{ name: 'pnpm-lock.yaml', type: 'file' }] },
      },
      [configPaths.nodeBase]: {
        rules: { node_root: [{ name: 'package.json', type: 'file' }] },
      },
    };

    (readFileSync as jest.Mock).mockImplementation((path: string) => path);
    (parse as jest.Mock).mockImplementation((path: string) => configs[path]);

    const result = readConfigFile(configPaths.root);

    expect(result.rules?.node_root).toHaveLength(1);
    expect(result.rules?.npm_root).toHaveLength(1);
    expect(result.rules?.pnpm_root).toHaveLength(1);
    expect(readFileSync).toHaveBeenCalledTimes(4);
    expect(readFileSync).toHaveBeenCalledWith(configPaths.nodeBase, 'utf8');
  });

  it('should deduplicate extends paths that resolve to the same real file', () => {
    const configPaths = {
      root: resolve('/project/project.yml'),
      alias: resolve('/project/aliases/shared.yml'),
      shared: resolve('/project/presets/shared.yml'),
    };
    const configs = {
      [configPaths.root]: {
        extends: ['./aliases/shared.yml', './presets/shared.yml'],
      },
      [configPaths.shared]: {
        rules: { shared_root: [{ name: 'package.json', type: 'file' }] },
      },
    };

    (realpathSync as unknown as jest.Mock).mockImplementation((path: string) =>
      path === configPaths.alias ? configPaths.shared : path,
    );
    (readFileSync as jest.Mock).mockImplementation((path: string) => path);
    (parse as jest.Mock).mockImplementation((path: string) => configs[path]);

    const result = readConfigFile(configPaths.root);

    expect(result.rules?.shared_root).toHaveLength(1);
    expect(readFileSync).toHaveBeenCalledTimes(2);
    expect(readFileSync).toHaveBeenCalledWith(configPaths.shared, 'utf8');
  });

  it('should resolve built-in preset package subpaths', () => {
    const rootPath = resolve('/project/project.yml');
    const presetPath = resolve('/package/extends/javascript/pnpm.yaml');
    const presetSpecifier = 'project-lint/extends/javascript/pnpm.yaml';
    const configs = {
      [rootPath]: { extends: presetSpecifier },
      [presetPath]: { rules: { pnpm_root: [{ name: 'pnpm-lock.yaml', type: 'file' }] } },
    };
    const resolvePackagePath = jest.fn((specifier: string) => {
      if (specifier === presetSpecifier) {
        return presetPath;
      }

      throw new Error(`Unexpected package path: ${specifier}`);
    });

    (createRequire as jest.Mock).mockReturnValue({ resolve: resolvePackagePath });
    (readFileSync as jest.Mock).mockImplementation((path: string) => path);
    (parse as jest.Mock).mockImplementation((path: string) => configs[path]);

    const result = readConfigFile(rootPath);

    expect(result.rules?.pnpm_root).toHaveLength(1);
    expect(createRequire).toHaveBeenCalledWith(resolve(dirname(rootPath), 'package.json'));
    expect(resolvePackagePath).toHaveBeenCalledWith(presetSpecifier);
    expect(readFileSync).toHaveBeenCalledWith(presetPath, 'utf8');
  });

  it('should report a readable error when extends contains a cycle', () => {
    const configPaths = {
      first: resolve('/project/first.yml'),
      second: resolve('/project/second.yml'),
    };
    const configs = {
      [configPaths.first]: { extends: './second.yml' },
      [configPaths.second]: { extends: './first.yml' },
    };

    (readFileSync as jest.Mock).mockImplementation((path: string) => path);
    (parse as jest.Mock).mockImplementation((path: string) => configs[path]);

    let error: unknown;
    try {
      readConfigFile(configPaths.first);
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(ConfigError);
    expect((error as Error).message).toBe(
      `Circular extends detected: ${configPaths.first} -> ${configPaths.second} -> ${configPaths.first}`,
    );
  });

  it('should detect a self-cycle reached through a built-in preset alias', () => {
    const presetPath = resolve('/package/extends/javascript/node.yaml');
    const presetAlias = 'project-lint/extends/typescript/node.yaml';
    const resolvePackagePath = jest.fn(() => presetPath);

    (createRequire as jest.Mock).mockReturnValue({ resolve: resolvePackagePath });
    (readFileSync as jest.Mock).mockReturnValue(presetPath);
    (parse as jest.Mock).mockReturnValue({ extends: presetAlias });

    let error: unknown;
    try {
      readConfigFile(presetPath);
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(ConfigError);
    expect((error as Error).message).toBe(`Circular extends detected: ${presetPath} -> ${presetPath}`);
    expect(resolvePackagePath).toHaveBeenCalledWith(presetAlias);
  });

  it('should resolve nested extends paths relative to the declaring config', () => {
    const configPaths = {
      root: resolve('/project/configs/project.yml'),
      base: resolve('/project/shared/base.yml'),
      rules: resolve('/project/shared/nested/rules.yml'),
    };
    const configs = {
      [configPaths.root]: {
        extends: '../shared/base.yml',
        rules: { sequence: [{ name: 'project', type: 'file' }] },
      },
      [configPaths.base]: {
        extends: './nested/rules.yml',
        rules: { sequence: [{ name: 'base', type: 'file' }] },
      },
      [configPaths.rules]: {
        rules: { sequence: [{ name: 'nested', type: 'file' }] },
      },
    };

    (readFileSync as jest.Mock).mockImplementation((path: string) => path);
    (parse as jest.Mock).mockImplementation((path: string) => configs[path]);

    const result = readConfigFile(configPaths.root);

    expect(result.rules?.sequence.map((rule) => ('name' in rule ? rule.name : undefined))).toStrictEqual([
      'nested',
      'base',
      'project',
    ]);
    expect((readFileSync as jest.Mock).mock.calls.map(([path]) => path)).toStrictEqual([
      configPaths.root,
      configPaths.base,
      configPaths.rules,
    ]);
  });

  it('should keep extends deduplication local to each readConfigFile call', () => {
    const configPaths = {
      root: resolve('/project/project.yml'),
      shared: resolve('/project/shared.yml'),
    };
    const configs = {
      [configPaths.root]: {
        extends: './shared.yml',
        rules: { local_root: [{ name: 'README.md', type: 'file' }] },
      },
      [configPaths.shared]: {
        rules: { shared_root: [{ name: 'package.json', type: 'file' }] },
      },
    };

    (readFileSync as jest.Mock).mockImplementation((path: string) => path);
    (parse as jest.Mock).mockImplementation((path: string) => configs[path]);

    const firstResult = readConfigFile(configPaths.root);
    const secondResult = readConfigFile(configPaths.root);

    expect(firstResult.rules?.shared_root).toHaveLength(1);
    expect(secondResult.rules?.shared_root).toHaveLength(1);
    expect(readFileSync).toHaveBeenCalledTimes(4);
  });

  it('should add gitignore patterns if gitignore is enabled', () => {
    const configPath = resolve('/path/to/gitignore-config.yaml');
    const mockConfig = { gitignore: true };

    (parse as jest.Mock).mockReturnValue(mockConfig);

    const result = readConfigFile(configPath);

    expect(result).toStrictEqual({ gitignore: true });
  });

  it('should not add gitignore patterns if gitignore is disabled', () => {
    const configPath = resolve('/path/to/gitignore-config.yaml');
    const mockConfig = { gitignore: false };

    (parse as jest.Mock).mockReturnValue(mockConfig);

    const result = readConfigFile(configPath);

    expect(result).toStrictEqual({ gitignore: false });
  });

  it('should not add nested gitignore patterns', () => {
    const configPath = 'gitignore-config.yaml';
    const mockConfig1 = { extends: ['./extends.yaml'] };
    const mockConfig2 = { gitignore: true };

    (parse as jest.Mock).mockReturnValueOnce(mockConfig1);
    (parse as jest.Mock).mockReturnValueOnce(mockConfig2);

    const result = readConfigFile(configPath);

    expect(result).toStrictEqual(expect.objectContaining({ gitignore: false }));
  });
});
