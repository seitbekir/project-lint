import { Command } from 'commander';
import { globbySync } from 'globby';

import { readConfigFile } from './utils/readConfigFile';
import { checkConfig } from './utils/checkConfig';
import { runOnFiles } from './utils/runOnFiles';
import { outError } from './utils/outError';

const version = '0.0.1';

export type Options = {
  config: string;
  ignore: string[];
  minimalistic: boolean;
  debug: 0 | 1 | 2 | 3;
};

/* eslint-disable no-console */
export function main(paths: string[], options: Options): void {
  try {
    if (options.debug >= 1) {
      console.log('Options: ', options);
    }
    if (options.debug >= 2) {
      console.log('Paths: ', paths);
    }

    const configCombined = readConfigFile(options.config);
    const config = checkConfig(configCombined, options.config);

    const realPaths = globbySync(paths, {
      absolute: true,
      dot: true,
      ignore: [...options.ignore, ...config.ignorePatterns],
      gitignore: config.gitignore,
      cwd: config.workdir,
    });

    if (options.debug >= 3) {
      console.log('Config: ', config);
    }
    if (options.debug >= 2) {
      console.log('Parsed paths: ', realPaths);
    }

    const { errors, successPaths } = runOnFiles(realPaths, config);

    if (options.debug >= 1) {
      successPaths.forEach((path: string) => console.log(`✔️   ${path.replace(`${config.workdir}/`, '')}`));
    }

    errors.forEach((error) => outError(error, config.workdir, options.minimalistic));

    if (errors.length + successPaths.length > 1) {
      console.log(`Final result: ${successPaths.length} success, ${errors.length} errors`);
    }

    if (errors.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    outError(error as Error, '.', options.minimalistic);
    process.exit(1);
  }
}

export function defineCLI(program: Command): Command {
  return program
    .version(version, '-v, --version', 'Current project-linter version')
    .description('File Structure Validator')
    .option('-c, --config <path>', 'Path to the config file', './.projectlintrc')
    .option('-i, --ignore <patterns...>', 'Ignore patterns', (v) => (Array.isArray(v) ? v : [v]), ['node_modules/**'])
    .option('-d, --debug [level]', 'output extra debugging', parseInt, 0)
    .option('-s, --minimalistic', 'Minimalistic mode')
    .argument('[pathnames...]', 'Paths to the files to validate')
    .showHelpAfterError('(add --help for additional information)');
}

export function run(program: Command): void {
  program.parse();
  const options = program.opts() as Options;
  const paths: string[] = program.args;

  main(paths, options);
}
