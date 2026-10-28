# Project Lint

A small tool for setting up project structure linting configuration and running checks to ensure all files fit the requirements.

The code was inspired by [the dead project](https://github.com/Igorkowalski94/eslint-plugin-project-structure) (MIT License)

## Features

- Validation of project structure (Any files/folders outside the structure will be considered an error).
- Name case validation.
- Name regex validation.
- Inheriting the parent's name (The child inherits the name of the folder in which it is located).
- Folder recursion (You can nest a given folder structure recursively).
- Forcing a nested/flat structure for a given folder.
- Ignoring by pattern or via `.gitignore`.

## To Do

- Sub-folder level `.projectlintrc`.
- URL based `extends`.
- Updatable `regexpPatterns`.

## Installation

Requires Node.js 22.12 or newer. Use Node.js 24 for development (see `.nvmrc`).

```bash
$ npm i project-lint
```

## Usage

### Run

```bash
$ project-lint -c ./project-structure.yml "./**/*"
```

### Help

```bash
$ project-lint -h
Usage: project-lint [options] [pathnames...]

File Structure Validator

Arguments:
  pathnames                   Paths to the files to validate

Options:
  -v, --version               Current project-linter version
  -c, --config <path>         Path to the config file (default: "./.projectlintrc")
  -i, --ignore <patterns...>  Ignore patterns (default: ["node_modules/**"])
  -d, --debug [level]         output extra debugging (default: 0)
  -s, --minimalistic          Minimalistic mode
  -h, --help                  display help for command
```

### Lint Staged

```js
module.export = {
  '**/*': ['project-lint -s'],
};
```

## Examples

### Simple example for the structure below:

```
.
├── ...
├── 📄 .projectlintrc
├── 📄 .eslintrc.json
└── 📂 src
    ├── 📄 index.tsx
    └── 📂 components
        ├── ...
        └── 📄 ComponentName.tsx
```

```yaml
root:
  - name: .projectlintrc
    type: file
  - name: .eslintrc.json
    type: file
  - name: src
    type: dir
    children:
      - name: index.tsx
        type: file
      - name: components
        type: dir
        children:
          - name: /^${{PascalCase}}\.tsx$/
            type: file
```

### Advanced example for the structure below, containing all key features:

```
.
├── ...
├── 📄 .gitignore (contains node_modules and etc...)
├── 📄 .projectlintrc
├── 📄 .eslintrc.json
└── 📂 src
    ├── 📂 legacy
    │   ├── ...
    ├── 📂 hooks
    │   ├── ...
    │   ├── 📄 useSimpleGlobalHook.test.ts
    │   ├── 📄 useSimpleGlobalHook.ts
    │   └── 📂 useComplexGlobalHook
    │       ├── 📁 hooks (recursion)
    │       ├── 📄 useComplexGlobalHook.api.ts
    │       ├── 📄 useComplexGlobalHook.types.ts
    │       ├── 📄 useComplexGlobalHook.test.ts
    │       └── 📄 useComplexGlobalHook.ts
    └── 📂 components
        ├── ...
        └── 📂 ParentComponent
            ├── 📄 parentComponent.api.ts
            ├── 📄 parentComponent.types.ts
            ├── 📄 ParentComponent.context.tsx
            ├── 📄 ParentComponent.test.tsx
            ├── 📄 ParentComponent.tsx
            ├── 📂 components
            │   ├── ...
            │   └── 📂 ChildComponent
            │       ├── 📁 components (recursion)
            │       ├── 📁 hooks (recursion)
            │       ├── 📄 childComponent.types.ts
            │       ├── 📄 childComponent.api.ts
            │       ├── 📄 ChildComponent.context.tsx
            │       ├── 📄 ChildComponent.test.tsx
            │       └── 📄 ChildComponent.tsx
            └── 📂 hooks
                ├── ...
                ├── 📄 useSimpleParentComponentHook.test.ts
                ├── 📄 useSimpleParentComponentHook.ts
                └── 📂 useComplexParentComponentHook
                    ├── 📁 hooks (recursion)
                    ├── 📄 useComplexParentComponentHook.api.ts
                    ├── 📄 useComplexParentComponentHook.types.ts
                    ├── 📄 useComplexParentComponentHook.test.ts
                    └── 📄 useComplexParentComponentHook.ts
```

```yaml
$schema: ./node_modules/project-lint/projectlintrc.schema.json
workdir: .
gitignore: true

extends:
  - project-lint/extends/basic.yaml
  - project-lint/extends/projectlint.yaml
  - project-lint/extends/git.yaml
  - project-lint/extends/javascript/eslint.yaml
  - project-lint/extends/javascript/webpack.yaml

ignorePatterns:
  - src/legacy

root:
  - ruleId: basic_root
  - name: src
    type: dir
    children:
      - ruleId: hooks_folder
      - ruleId: components_folder

rules:
  basic_root:
    - ruleId: projectlint_root
    - ruleId: git_root
    - ruleId: eslint_root
    - ruleId: webpack_root
    # ... etc, check in `extends` file

  hooks_folder:
    - name: hooks
      type: dir
      children:
        - name: /^use${{PascalCase}}(\.(test|api|types))?\.ts$/
          type: file
        - name: /^use${{PascalCase}}$/
          type: dir
          children:
            - ruleId: hooks_folder # recursion
            - name: /^${{parentName}}(\.(test|api|types))?\.ts$/
              type: file

  component_folder:
    - name: /^${{PascalCase}}$/
      type: dir
      children:
        - name: /^${{parentName}}\.(api|types)\.tsx$/
          type: file
        - name: /^${{ParentName}}(\.(context|test))?\.tsx$/
          type: file
        - ruleId: hooks_folder # recursion
        - ruleId: components_folder # recursion

  components_folder:
    - name: components
      type: dir
      children:
        - ruleId: component_folder
```

## API:

### `$schema: <string>` (optional) <a id="schema"></a>

Type checking for your '.projectlintrc'. It helps to fill configuration correctly.

```jsonc
{
  "$schema": "./node_modules/project-lint/projectlintrc.schema.json",
  // ...
}
```

### `workdir: <string>` (default: `.`) <a id="workdir"></a>

Set workdir related to config file.

### `gitignore: <boolean>` (default: `false`) <a id="gitignore"></a>

Include `.gitignore` file to `ignorePatterns`.

### `ignorePatterns: <string[]>` (optional) <a id="ignorePatterns"></a>

`.gitignore` syntaxed list of files to ignore when running.

```yaml
ignorePatterns:
  - src/legacy
```

### `extends: <string | string[]>` (optional) <a id="extends"></a>

List of other YAML or JSON files with the rules. Local paths are resolved relative to the declaring config; built-in package specifiers such as `project-lint/extends/javascript/pnpm.yaml` are also supported. It will be recursively included and overridden by the current file. You may extend <a href="#rules">`rules`</a>, <a href="#ignorePatterns">`ignorePatterns`</a>, but it won't include <a href="#gitignore">`gitignore: true`</a>.

### Built-in presets

Import only the presets used by your project. Presets define named `rules`; activate them in `root` with `ruleId`.

```yaml
extends:
  - project-lint/extends/javascript/pnpm.yaml
  - project-lint/extends/javascript/biome.yaml
  - project-lint/extends/javascript/typescript.yaml
  - project-lint/extends/ci-cd/gitlab.yaml

root:
  - ruleId: pnpm_root
  - ruleId: biome_root
  - ruleId: ts_root
  - ruleId: gitlab_root
  - name: src
    type: dir
    ignoreChildren: true
```

Each package manager preset includes `node.yaml`, which defines `node_root` for `package.json` and `node_modules`. Shared extensions are loaded once per configuration, including when several package managers are imported. Circular extensions report a configuration error.

There are no aggregate JavaScript or CI/CD presets. Replace the old `extends/node.yml` import with the individual presets you need; existing rule identifiers remain unchanged except `ide_roots`, which is replaced by `editorconfig_root`, `vscode_root`, `idea_root`, and `zed_root`.

#### General project presets

These presets apply to any project and live directly in `node_modules/project-lint/extends/`.

| Preset              | Rule ID             | Supported files and directories                                      |
| ------------------- | ------------------- | -------------------------------------------------------------------- |
| `moon.yaml`         | `moon_root`         | `moon.yml`, `moon.yaml`, `moon.json`, `.moon/`                       |
| `git.yaml`          | `git_root`          | `.git/`, `.gitignore`, `.gitattributes`, `.gitmodules`               |
| `editorconfig.yaml` | `editorconfig_root` | `.editorconfig`                                                      |
| `basic.yaml`        | `basic_root`        | `README.md`, `LICENSE`, `CHANGELOG.md`, `CONTRIBUTING.md`, `AUTHORS` |
| `env.yaml`          | `env_root`          | Environment file names                                               |
| `projectlint.yaml`  | `projectlint_root`  | `.projectlintrc` and JSON/YAML variants                              |

#### JavaScript and TypeScript tools

All paths below are relative to `node_modules/project-lint/extends/javascript/`. The repository also provides the relative symlink `extends/typescript → javascript`; published packages expose the same presets through `project-lint/extends/typescript/*`. npm does not include directory symlinks in tarballs, so use package specifiers for the TypeScript alias.

| Preset             | Rule ID                                 | Supported files and directories                                                                   |
| ------------------ | --------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `node.yaml`        | `node_root`                             | `package.json`, `node_modules/`                                                                   |
| `npm.yaml`         | `npm_root`                              | Node.js files, npm lockfiles, `.npmrc`, `.npmignore`                                              |
| `pnpm.yaml`        | `pnpm_root`                             | Node.js files, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `pnpmfile.cjs`, `.pnpmfile.cjs`, `.npmrc` |
| `yarn.yaml`        | `yarn_root`                             | Node.js files, `yarn.lock`, `.yarnrc`, `.yarnrc.yml`, `.yarn/`, Plug'n'Play files                 |
| `bun.yaml`         | `bun_root`                              | Node.js files, `bunfig.toml`, `bun.lock`, `bun.lockb`, `bun-lock.json`                            |
| `deno.yaml`        | `deno_root`                             | `deno.json`, `deno.jsonc`, `deno.lock`, `import_map.json`                                         |
| `oxc.yaml`         | `oxc_root`, `oxlint_root`, `oxfmt_root` | Oxlint and Oxfmt JSON/JSONC configs and `*.config.ts` / `*.config.mts`                            |
| `rsbuild.yaml`     | `rsbuild_root`                          | `rsbuild.config.*` in JavaScript, ESM, CommonJS and TypeScript                                    |
| `rspack.yaml`      | `rspack_root`                           | `rspack.config.*` in JavaScript, ESM, CommonJS and TypeScript                                     |
| `biome.yaml`       | `biome_root`                            | `biome.json`, `biome.jsonc`                                                                       |
| `eslint.yaml`      | `eslint_root`                           | Legacy and flat configs, including TypeScript, ignore and cache files                             |
| `prettier.yaml`    | `prettier_root`                         | `.prettierrc*`, `prettier.config.*`, `.prettierignore`                                            |
| `stylelint.yaml`   | `stylelint_root`                        | `.stylelintrc*`, `stylelint.config.*`, ignore and cache files                                     |
| `typescript.yaml`  | `ts_root`                               | `tsconfig*.json`, `*.tsbuildinfo`                                                                 |
| `jest.yaml`        | `jest_root`                             | `jest.*` configs, including TypeScript and JSON, `coverage/`                                      |
| `vitest.yaml`      | `vitest_root`                           | `vitest.config.*`, `vitest.workspace.*`, `coverage/`                                              |
| `vite.yaml`        | `vite_root`                             | `vite.config.*`, including ESM, CommonJS and TypeScript variants                                  |
| `webpack.yaml`     | `webpack_root`                          | `webpack*.js`, `.mjs`, `.cjs`, `.ts`, `.mts`, `.cts`                                              |
| `babel.yaml`       | `babel_root`                            | `babel.*` configs and `.babelrc*`                                                                 |
| `husky.yaml`       | `husky_root`                            | `.husky/`                                                                                         |
| `lint-staged.yaml` | `lintstaged_root`                       | `.lintstagedrc*`, `lint-staged.config.*`, Husky files                                             |
| `nvm.yaml`         | `nvm_root`                              | `.nvmrc`, `.node-version`                                                                         |

#### IDEs

Import individual editor presets from `node_modules/project-lint/extends/ides/`.

| Preset        | Rule ID       | Supported files and directories     |
| ------------- | ------------- | ----------------------------------- |
| `vscode.yaml` | `vscode_root` | `.vscode/`, `*.code-workspace`      |
| `idea.yaml`   | `idea_root`   | `.idea/`, `*.iml`, `*.ipr`, `*.iws` |
| `zed.yaml`    | `zed_root`    | `.zed/`                             |

#### CI/CD

All paths below are relative to `node_modules/project-lint/extends/ci-cd/`. Each preset is independent. Configuration directories allow their contents without imposing a pipeline structure.

| Preset           | Rule ID          | Supported files and directories                                                                  |
| ---------------- | ---------------- | ------------------------------------------------------------------------------------------------ |
| `gitlab.yaml`    | `gitlab_root`    | `.gitlab-ci.yml`, `.gitlab-ci.yaml`, `.gitlab/`                                                  |
| `github.yaml`    | `github_root`    | `.github/`, including workflows and repository metadata                                          |
| `bitbucket.yaml` | `bitbucket_root` | `bitbucket-pipelines.yml`                                                                        |
| `circleci.yaml`  | `circleci_root`  | `.circleci/`                                                                                     |
| `jenkins.yaml`   | `jenkins_root`   | `Jenkinsfile`, `Jenkinsfile.*`                                                                   |
| `drone.yaml`     | `drone_root`     | `.drone.yml`, `.drone.yaml`, `.drone.jsonnet`, `.drone.star`                                     |
| `travis.yaml`    | `travis_root`    | `.travis.yml`                                                                                    |
| `teamcity.yaml`  | `teamcity_root`  | `.teamcity/`                                                                                     |
| `bamboo.yaml`    | `bamboo_root`    | `bamboo-specs/`                                                                                  |
| `buddy.yaml`     | `buddy_root`     | `.buddy.yml`, `buddy.yml`, `.buddy/`                                                             |
| `codeship.yaml`  | `codeship_root`  | `codeship-services.yml`, `codeship-steps.yml`                                                    |
| `gocd.yaml`      | `gocd_root`      | `*.gocd.yml`, `*.gocd.yaml`, `*.gocd.json`                                                       |
| `wercker.yaml`   | `wercker_root`   | `wercker.yml`                                                                                    |
| `semaphore.yaml` | `semaphore_root` | `.semaphore/`                                                                                    |
| `nevercode.yaml` | `nevercode_root` | `nevercode.yml`                                                                                  |
| `spinnaker.yaml` | `spinnaker_root` | `.spinnaker/`, `spinnaker/` (conventions; Spinnaker has no universal repository config filename) |
| `buildbot.yaml`  | `buildbot_root`  | `master.cfg`, `buildbot.tac`                                                                     |

### `root: <Rule[]>` <a id="root"></a>

Rules of the root of the project (related to workdir).

### `rules: <{ [ruleId]: Rule[] }>` <a id="rules"></a>

List of named rules may be used via `ruleId` rule. It may include itself recursively.

## Rules

### Named file <a id="rule-file"></a>

File rule must contain 2 fields: `name` and `type: file`.

#### `name: <string | RegExp>` <a id="rule-file-name"></a>

```yaml
- name: filename.ts
  type: file
- name: /^file${{PascalCase}}\.ts$/
  type: file
```

### Named folder/dir <a id="rule-dir"></a>

Folder rule must contain 2 fields: `name` and `type: file`.
All the included content may be described in other 2 fields: `ignoreChildren` or `children`.

#### `name: <string | RegExp>` <a id="rule-dir-name"></a>

```yaml
- name: dirname
  type: dir
- name: /^dir${{PascalCase}}\.ts$/
  type: dir
```

#### `ignoreChildren: <boolean>` <a id="rule-dir-ignoreChildren"></a>

All the included files will pass successfully.

```yaml
- name: dirname
  type: dir
  ignoreChildren: true
```

#### `children: <Rule[]>` <a id="rule-dir-children"></a>

All content describes as regular.

### `allowAny: <boolean>` <a id="rule-allowAny"></a>

All not described contents in folder will be ignored.
It is useful when we need to ignore a single level but need to check described folders.

```yaml
root:
  - name: src
    type: dir
    children:
      # rules...

  - allowAny: true
```

### `ruleId: <ruleId>` <a id="rule-ruleId"></a>

To get any of described in <a href="#rules">`rules`</a> section.

```yaml
root:
  - ruleId: test

rules:
  test:
    - name: src
      type: dir
      ignoreChildren: true
```

## Built-in regex parameters

### `${{PascalCase}}`

Define a pascal case in RegExp name.

```yaml
- name: /^use${{PascalCase}}\.ts$/
  type: file
```

Expecting any file called like `useMyHook.ts`.

### `${{camelCase}}`

Define a camel case in RegExp name.

```yaml
- name: /^${{camelCase}}Service\.ts$/
  type: file
```

Expecting any file called like `myApiService.ts`.

### `${{kebab-case}}` (alias `${{dash-case}}`)

Define a kebab case in RegExp name.

```yaml
- name: /^${{kebab-case}}\.d\.ts$/
  type: file
```

Expecting any file called like `module-federation.d.ts`.

### `${{snake_case}}`

Define a snake case in RegExp name.

```yaml
- name: /^${{snake_case}}\.css$/
  type: file
```

Expecting any file called like `i_am_beautiful.css`.

### `${{parentName}}`

Use the same name as the parent folder, but the first letter must be lowercase.

```yaml
- name: TheGodfather
  type: dir
  children:
    - name: /^${{parentName}}\.component\.tsx$/
      type: file
- name: theShavka
  type: dir
  children:
    - name: /^${{parentName}}\.test\.tsx$/
      type: file
```

Will expect the following:

```
.
├── 📂 TheGodfather
│   ├── 📄 theGodfather.component.ts
└── 📂 theShavka
    └── 📄 theShavka.test.ts
```

### `${{ParentName}}`

Use the same name as the parent folder, but the first letter must be uppercase.

```yaml
- name: Batman
  type: dir
  children:
    - name: /^${{ParentName}}\.must-suffer\.asm$/
      type: file
- name: robin
  type: dir
  children:
    - name: /^${{ParentName}}\.stay-strong\.yaml$/
      type: file
```

Will expect the following:

```
.
├── 📂 Batman
│   ├── 📄 Batman.must-suffer.asm
└── 📂 robin
    └── 📄 Robin.stay-strong.yaml
```

## Configuration file

It is YAML by default and must be called `.projectlintrc`. But you may use `json` syntax instead.

## Development

```bash
npm ci
npm run build
npm test -- --runInBand
npm run ci.typecheck
npm run ci.eslint -- src eslint.config.js jest.config.ts lint-staged.config.cjs
npm run ci.prettier -- --check .
npm start -- -s
```

TypeScript stays on the latest 5.x release to match the schema generator's compiler. ESLint uses flat configuration and the maintained `eslint-plugin-import-x` plugin.

## Contrubution

The more MB of a bundle we have -- the more features we deliver. It works that way, I believe.
