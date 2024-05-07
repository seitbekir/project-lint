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
- Default `extends`.
- Updatable `regexpPatterns`.

## Installation

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

extends: ./node_modules/project-lint/extends/rules.yml

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

List of other YAML or JSON files with the rules. It will be recursively included and overridden by the current file. You may extend <a href="#rules">`rules`</a>, <a href="#ignorePatterns">`ignorePatterns`</a>, but it won't include <a href="#gitignore">`gitignore: true`</a>.

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

## Contrubution

The more MB of a bundle we have -- the more features we deliver. It works that way, I believe.
