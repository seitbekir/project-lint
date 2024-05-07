import { Command } from 'commander';
import { globbySync } from 'globby';

import { ValidationError } from '../errors/ValidationError';
import { Type } from '../types/config';
import { readConfigFile } from '../utils/readConfigFile';
import { checkConfig } from '../utils/checkConfig';
import { runOnFiles } from '../utils/runOnFiles';

import { defineCLI, main, Options } from '../runner';

jest.mock('../runner', () => ({
  ...jest.requireActual('../runner'),
  main: jest.fn(),
}));

jest.mock('globby', () => ({
  globbySync: jest.fn(),
}));

jest.mock('../utils/readConfigFile', () => ({
  readConfigFile: jest.fn(),
}));

jest.mock('../utils/checkConfig', () => ({
  checkConfig: jest.fn(),
}));

jest.mock('../utils/runOnFiles', () => ({
  runOnFiles: jest.fn(),
}));

describe('CLI', () => {
  let program: Command;

  beforeEach(() => {
    program = new Command();
    defineCLI(program);
  });

  it('should call main function with correct options', async () => {
    (main as jest.Mock).mockImplementation(() => Promise.resolve());

    program.parse(['node', 'cli.js', '-c', './custom-config.json', '-i', 'dist/**', '-d', '2', '-s', 'file.js']);

    const options = program.opts() as Options;
    const paths = program.args;

    await main(paths, options);

    expect(main).toHaveBeenCalledWith(
      paths,
      expect.objectContaining({ config: './custom-config.json', ignore: ['dist/**'], debug: 2 }),
    );
  });

  it('should call main function with default options', async () => {
    (main as jest.Mock).mockImplementation(() => Promise.resolve());

    program.parse(['node', 'cli.js']);

    const options = program.opts() as Options;
    const paths = program.args;

    await main(paths, options);

    expect(main).toHaveBeenCalledWith(
      paths,
      expect.objectContaining({ config: './.projectlintrc', ignore: ['node_modules/**'], debug: 0 }),
    );
  });
});

describe('main', () => {
  beforeEach(() => {
    (main as jest.Mock).mockImplementation(jest.requireActual('../runner').main);
    (globbySync as jest.Mock).mockImplementation(() => Promise.resolve(['file.js']));
    (readConfigFile as jest.Mock).mockImplementation(() => ({
      workdir: '.',
      root: [
        {
          name: 'file.js',
          type: 'file',
        },
      ],
    }));
    (checkConfig as jest.Mock).mockImplementation(() => ({
      workdir: '.',
      rules: {},
      root: [
        {
          name: 'file.js',
          type: 'file',
        },
      ],
      gitignore: false,
      ignorePatterns: [],
    }));

    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(process, 'exit').mockImplementation();
  });

  it('should log success files', async () => {
    const options = { config: './.projectlintrc', ignore: ['node_modules/**'], debug: 1 } as Options;
    const paths = ['file.js'];

    (runOnFiles as jest.Mock).mockImplementation(() => ({
      errors: [],
      successPaths: ['file.js'],
    }));

    await main(paths, options);

    expect(console.log).toHaveBeenCalledWith('✔️   file.js');
    expect(console.error).not.toHaveBeenCalled();
    expect(process.exit).not.toHaveBeenCalled();
  });

  it('should log final result for multiple paths', async () => {
    const options = { config: './.projectlintrc', ignore: ['node_modules/**'], debug: 0 } as Options;
    const paths = ['file1.js', 'file2.js'];
    const error = new ValidationError('error');
    error.setPath('file2.js');
    error.setRules([{ name: 'no-file2', type: Type.file }]);

    (runOnFiles as jest.Mock).mockImplementation(() => ({
      errors: [error],
      successPaths: ['file.js'],
    }));

    await main(paths, options);

    expect(console.log).toHaveBeenCalledWith('Final result: 1 success, 1 errors');
  });

  it('should exit with code 1 if there are errors', async () => {
    const options = { config: './.projectlintrc', ignore: ['node_modules/**'], debug: 0 } as Options;
    const paths = ['file.js'];
    const error = new ValidationError('error');
    error.setPath('file2.js');
    error.setRules([{ name: 'no-file', type: Type.file }]);

    (runOnFiles as jest.Mock).mockImplementation(() => ({
      errors: [error],
      successPaths: [],
    }));

    await main(paths, options);

    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should log error', async () => {
    const options = { config: './.projectlintrc', ignore: ['node_modules/**'], debug: 0 } as Options;
    const paths = ['file.js'];
    const error = new ValidationError('error');
    error.setPath('file2.js');
    error.setRules([{ name: 'no-file', type: Type.file }]);

    (runOnFiles as jest.Mock).mockImplementation(() => ({
      errors: [error],
      successPaths: [],
    }));

    await main(paths, options);

    expect(console.error).toHaveBeenCalledWith(error.toString());
  });
});
