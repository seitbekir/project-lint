import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { parse } from 'yaml';

import { ConfigError } from '@/errors/ConfigError';
import { ProjectLintConfig } from '@/types/config';

import { mergeDeep } from './mergeDeep';

export function readConfigFile(configPath: string, cwd: string = process.cwd()): ProjectLintConfig {
  try {
    const filePath = configPath.startsWith('/') ? configPath : resolve(cwd, configPath);
    const file = readFileSync(filePath, 'utf8');
    // it is also parsing JSON data
    const config = parse(file) as ProjectLintConfig;

    if (!config || typeof config !== 'object' || Array.isArray(config)) {
      throw new ConfigError('Invalid config file format', configPath);
    }

    if (config.gitignore && cwd === process.cwd()) {
      try {
        config.gitignore = config.gitignore || false;
      } catch (error) {
        throw new ConfigError('Invalid config file format', configPath);
      }
    } else {
      config.gitignore = false;
    }

    const { extends: extendsFromFilePath } = config;
    const filePaths = Array.isArray(extendsFromFilePath)
      ? extendsFromFilePath
      : ([extendsFromFilePath].filter((v) => v) as string[]);

    if (
      extendsFromFilePath &&
      (filePaths.length === 0 || filePaths.some((path) => typeof path !== 'string' || path.trim() === ''))
    ) {
      throw new ConfigError('Invalid extends parameter in config file', configPath);
    }

    if (filePaths.length > 0) {
      const extendsConfig = filePaths.map((path) => readConfigFile(path, dirname(filePath)));
      extendsConfig.push(config);
      return extendsConfig.reduce((acc, current) => mergeDeep(acc, current), {} as ProjectLintConfig);
    }

    return config;
  } catch (error) {
    if (error instanceof ConfigError) {
      throw error;
    }

    throw new ConfigError('Invalid config file', configPath);
  }
}
