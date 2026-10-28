import { readFileSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { parse } from 'yaml';

import { ConfigError } from '@/errors/ConfigError';
import { ProjectLintConfig } from '@/types/config';

import { mergeDeep } from './mergeDeep';

type ReadConfigContext = {
  loadedPaths: Set<string>;
  activePaths: string[];
};

export function readConfigFile(configPath: string, cwd: string = process.cwd()): ProjectLintConfig {
  const context: ReadConfigContext = {
    loadedPaths: new Set(),
    activePaths: [],
  };

  return readConfigFileWithContext(configPath, cwd, context, true) as ProjectLintConfig;
}

function readConfigFileWithContext(
  configPath: string,
  cwd: string,
  context: ReadConfigContext,
  isRootConfig: boolean,
): ProjectLintConfig | undefined {
  const filePath = resolveConfigFilePath(configPath, cwd);

  const cycleStartIndex = context.activePaths.indexOf(filePath);
  if (cycleStartIndex !== -1) {
    const cycle = [...context.activePaths.slice(cycleStartIndex), filePath].join(' -> ');
    throw new ConfigError(`Circular extends detected: ${cycle}`, filePath);
  }

  if (context.loadedPaths.has(filePath)) {
    return undefined;
  }

  context.activePaths.push(filePath);

  try {
    const file = readFileSync(filePath, 'utf8');
    // it is also parsing JSON data
    const config = parse(file) as ProjectLintConfig;

    if (!config || typeof config !== 'object' || Array.isArray(config)) {
      throw new ConfigError('Invalid config file format', configPath);
    }

    if (isRootConfig) {
      config.gitignore = config.gitignore || false;
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
      const extendsConfig = filePaths
        .map((path) => readConfigFileWithContext(path, dirname(filePath), context, false))
        .filter((extendedConfig): extendedConfig is ProjectLintConfig => extendedConfig !== undefined);
      extendsConfig.push(config);

      const mergedConfig = extendsConfig.reduce((acc, current) => mergeDeep(acc, current), {} as ProjectLintConfig);
      context.loadedPaths.add(filePath);

      return mergedConfig;
    }

    context.loadedPaths.add(filePath);
    return config;
  } catch (error) {
    if (error instanceof ConfigError) {
      throw error;
    }

    throw new ConfigError('Invalid config file', configPath);
  } finally {
    context.activePaths.pop();
  }
}

function resolveConfigFilePath(configPath: string, cwd: string): string {
  try {
    const resolvedPath = configPath.startsWith('project-lint/extends/')
      ? createRequire(resolve(cwd, 'package.json')).resolve(configPath)
      : resolve(cwd, configPath);

    return realpathSync(resolvedPath);
  } catch (error) {
    if (error instanceof ConfigError) {
      throw error;
    }

    throw new ConfigError('Invalid config file', configPath);
  }
}
