import { resolve, dirname } from 'node:path';

import { ConfigError } from '@/errors/ConfigError';

import { ProjectLintConfig, ValidationConfig } from '@/types/config';

export function checkConfig(config: ProjectLintConfig, configPath: string): ValidationConfig {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new ConfigError('Config must be an object');
  }

  const { workdir, gitignore, rules, root, ignorePatterns } = config;

  if (workdir && typeof workdir !== 'string') {
    throw new ConfigError('Workspace must be a string');
  }

  if (gitignore && typeof gitignore !== 'boolean') {
    throw new ConfigError('Gitignore must be a boolean');
  }

  if (rules && (typeof rules !== 'object' || Array.isArray(rules))) {
    throw new ConfigError('Rules must be maped object');
  }

  if (!root || !Array.isArray(root)) {
    throw new ConfigError('Root must be an array of Rules');
  }

  if (ignorePatterns && !Array.isArray(ignorePatterns)) {
    throw new ConfigError('Ignore patterns must be an array of strings');
  }

  return {
    workdir: resolve(dirname(configPath), workdir || '.').replace(/\\/g, '/'),
    rules: rules || {},
    root,
    gitignore: gitignore || false,
    ignorePatterns: ignorePatterns || [],
  };
}
