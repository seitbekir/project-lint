import { resolve } from 'node:path';

import { Type } from '@/types/config';
import { ValidationError } from '@/errors/ValidationError';
import { validatePath } from '@/validators/validatePath';
import { checkConfig } from '../checkConfig';
import { getPathType } from '../getPathType';
import { readConfigFile } from '../readConfigFile';

jest.mock('../getPathType', () => ({
  getPathType: jest.fn(),
}));

type PresetCase = [preset: string, ruleId: string, paths: string[]];

const javascriptPresets: PresetCase[] = [
  [
    'oxc',
    'oxc_root',
    [
      '.oxlintrc.json',
      '.oxlintrc.jsonc',
      'oxlint.config.ts',
      'oxlint.config.mts',
      '.oxfmtrc.json',
      '.oxfmtrc.jsonc',
      'oxfmt.config.ts',
      'oxfmt.config.mts',
    ],
  ],
  [
    'rsbuild',
    'rsbuild_root',
    [
      'rsbuild.config.js',
      'rsbuild.config.mjs',
      'rsbuild.config.cjs',
      'rsbuild.config.ts',
      'rsbuild.config.mts',
      'rsbuild.config.cts',
    ],
  ],
  [
    'rspack',
    'rspack_root',
    [
      'rspack.config.js',
      'rspack.config.mjs',
      'rspack.config.cjs',
      'rspack.config.ts',
      'rspack.config.mts',
      'rspack.config.cts',
    ],
  ],
  ['node', 'node_root', ['package.json', 'node_modules/', 'node_modules/example/index.js']],
  ['npm', 'npm_root', ['package.json', 'package-lock.json', 'npm-shrinkwrap.json', '.npmrc', '.npmignore']],
  [
    'pnpm',
    'pnpm_root',
    ['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', 'pnpmfile.cjs', '.pnpmfile.cjs', '.npmrc'],
  ],
  [
    'yarn',
    'yarn_root',
    [
      'package.json',
      'yarn.lock',
      '.yarnrc',
      '.yarnrc.yml',
      '.pnp.cjs',
      '.pnp.loader.mjs',
      '.pnp.data.json',
      '.yarn/cache/package.zip',
    ],
  ],
  ['bun', 'bun_root', ['package.json', 'bunfig.toml', 'bun.lock', 'bun.lockb', 'bun-lock.json']],
  ['deno', 'deno_root', ['deno.json', 'deno.jsonc', 'deno.lock', 'import_map.json']],
  ['biome', 'biome_root', ['biome.json', 'biome.jsonc']],
  [
    'eslint',
    'eslint_root',
    [
      '.eslintrc',
      '.eslintrc.cjs',
      'eslint.config.js',
      'eslint.config.mts',
      'eslint.config.cts',
      '.eslintignore',
      '.eslintcache',
    ],
  ],
  ['prettier', 'prettier_root', ['.prettierrc.json', 'prettier.config.cjs', 'prettier.config.mts', '.prettierignore']],
  [
    'stylelint',
    'stylelint_root',
    ['.stylelintrc.yaml', 'stylelint.config.mjs', 'stylelint.config.ts', '.stylelintignore'],
  ],
  ['typescript', 'ts_root', ['tsconfig.json', 'tsconfig.build.json', 'tsconfig.tsbuildinfo', 'build.tsbuildinfo']],
  [
    'jest',
    'jest_root',
    ['jest.config.ts', 'jest.config.mts', 'jest.config.cts', 'jest.config.json', 'coverage/lcov.info'],
  ],
  ['vitest', 'vitest_root', ['vitest.config.ts', 'vitest.config.mts', 'vitest.workspace.ts', 'coverage/lcov.info']],
  ['vite', 'vite_root', ['vite.config.ts', 'vite.config.mjs', 'vite.config.mts', 'vite.config.cts']],
  ['webpack', 'webpack_root', ['webpack.config.js', 'webpack.production.cjs', 'webpack.config.mts']],
  ['babel', 'babel_root', ['babel.config.js', 'babel.config.cjs', '.babelrc', '.babelrc.json']],
  ['husky', 'husky_root', ['.husky/', '.husky/pre-commit']],
  [
    'lint-staged',
    'lintstaged_root',
    ['.lintstagedrc', '.lintstagedrc.json', 'lint-staged.config.mts', '.husky/pre-commit'],
  ],
  ['nvm', 'nvm_root', ['.nvmrc', '.node-version']],
];

const idePresets: PresetCase[] = [
  ['vscode', 'vscode_root', ['.vscode/', '.vscode/settings.json', 'project.code-workspace']],
  ['idea', 'idea_root', ['.idea/', '.idea/codeStyles/Project.xml', 'project.iml', 'project.ipr', 'project.iws']],
  ['zed', 'zed_root', ['.zed/', '.zed/settings.json', '.zed/tasks.json']],
];

const generalPresets: PresetCase[] = [
  ['editorconfig', 'editorconfig_root', ['.editorconfig']],
  ['git', 'git_root', ['.gitignore', '.gitattributes', '.gitmodules', '.git/config']],
  ['basic', 'basic_root', ['README.md', 'LICENSE', 'CHANGELOG.md', 'CONTRIBUTING.md', 'AUTHORS']],
  ['moon', 'moon_root', ['moon.yml', 'moon.yaml', 'moon.json', '.moon/workspace.yml']],
  [
    'projectlint',
    'projectlint_root',
    ['.projectlintrc', '.projectlintrc.json', '.projectlintrc.yaml', '.projectlintrc.yml'],
  ],
];

const ciPresets: PresetCase[] = [
  ['gitlab', 'gitlab_root', ['.gitlab-ci.yml', '.gitlab-ci.yaml', '.gitlab/ci/build.yml']],
  [
    'github',
    'github_root',
    ['.github/', '.github/workflows/build.yml', '.github/workflows/deploy.yaml', '.github/CODEOWNERS'],
  ],
  ['bitbucket', 'bitbucket_root', ['bitbucket-pipelines.yml']],
  ['circleci', 'circleci_root', ['.circleci/config.yml']],
  ['jenkins', 'jenkins_root', ['Jenkinsfile', 'Jenkinsfile.deploy']],
  ['drone', 'drone_root', ['.drone.yml', '.drone.yaml', '.drone.jsonnet', '.drone.star']],
  ['travis', 'travis_root', ['.travis.yml']],
  ['teamcity', 'teamcity_root', ['.teamcity/settings.kts']],
  ['bamboo', 'bamboo_root', ['bamboo-specs/bamboo.yml']],
  ['buddy', 'buddy_root', ['.buddy.yml', 'buddy.yml', '.buddy/pipelines/build.yml']],
  ['codeship', 'codeship_root', ['codeship-services.yml', 'codeship-steps.yml']],
  ['gocd', 'gocd_root', ['build.gocd.yml', 'deploy.gocd.yaml', 'pipeline.gocd.json']],
  ['wercker', 'wercker_root', ['wercker.yml']],
  ['semaphore', 'semaphore_root', ['.semaphore/semaphore.yml', '.semaphore/deploy.yml']],
  ['nevercode', 'nevercode_root', ['nevercode.yml']],
  ['spinnaker', 'spinnaker_root', ['.spinnaker/pipeline.json', 'spinnaker/pipeline.json']],
  ['buildbot', 'buildbot_root', ['master.cfg', 'buildbot.tac']],
];

function loadPreset(directory: string, preset: string, ruleId: string) {
  const presetPath = resolve(process.cwd(), 'extends', directory, `${preset}.yaml`);
  const config = readConfigFile(presetPath);

  return checkConfig({ ...config, root: [{ ruleId }] }, resolve(process.cwd(), '.projectlintrc'));
}

describe.each([
  ['javascript', javascriptPresets],
  ['', generalPresets],
  ['ci-cd', ciPresets],
  ['ides', idePresets],
] as const)('%s presets', (directory, presets) => {
  it.each(presets)('%s works as an independent import', (preset, ruleId, paths) => {
    const config = loadPreset(directory, preset, ruleId);

    for (const path of paths) {
      const pathType = path.endsWith('/') ? Type.dir : Type.file;
      jest.mocked(getPathType).mockReturnValue(pathType);

      expect(() => validatePath(`${config.workdir}/${path}`, config)).not.toThrow();
    }

    jest.mocked(getPathType).mockReturnValue(Type.file);
    expect(() => validatePath(`${config.workdir}/unrelated-file.txt`, config)).toThrow(ValidationError);
  });
});

it('does not activate other tools or package managers through the pnpm preset', () => {
  const config = loadPreset('javascript', 'pnpm', 'pnpm_root');
  jest.mocked(getPathType).mockReturnValue(Type.file);

  for (const path of ['yarn.lock', 'biome.json', 'package-lock.json', 'bitbucket-pipelines.yml']) {
    expect(() => validatePath(`${config.workdir}/${path}`, config)).toThrow(ValidationError);
  }
});

it('rejects configuration filenames with unsupported extensions or extra suffixes', () => {
  const config = loadPreset('javascript', 'biome', 'biome_root');
  jest.mocked(getPathType).mockReturnValue(Type.file);

  for (const path of ['biome.json.bak', 'biome.yaml', 'not-biome.json']) {
    expect(() => validatePath(`${config.workdir}/${path}`, config)).toThrow(ValidationError);
  }
});
