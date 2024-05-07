export enum Type {
  file = 'file',
  dir = 'dir',
}

export type RuleRuleId = {
  /**
   * Including dedicated rules by id (from `rules` object)
   */
  ruleId: string;
};

export type RuleAllowAny = {
  /**
   * If no rule matched, allow any file/folder on this dir
   */
  allowAny: boolean;
};

export type RuleFile = {
  /**
   * Rule name for file instances
   */
  name: string;
  type: Type.file;
};

export type RuleDir = {
  /**
   * Rule name for folder instances
   */
  name: string;
  type: Type.dir;
  /**
   * Ignore children for this folder, except explained in `children`
   */
  ignoreChildren?: boolean;
  /**
   * Rules for children of this folder
   */
  children?: Rule[];
};

export type Rule = RuleRuleId | RuleAllowAny | RuleFile | RuleDir;

export type RuleMapped = RuleAllowAny | RuleFile | RuleDir;

export type RuleNamed = RuleFile | RuleDir;

export type DedicatedRules = {
  /**
   * Rules by id
   */
  [ruleId: string]: RuleMapped[];
};

export type ProjectLintConfig = {
  /**
   * Working directory
   * @default process.cwd()
   */
  workdir?: string;
  /**
   * Include `.gitignore` file to ignore patterns
   * @default false
   */
  gitignore?: boolean;
  /**
   * Include external configuration to be overridden
   * @example
   * ```json
   * {
   *     "extends": "@/configs/base.json"
   * }
   * ```
   * @example
   * ```json
   * {
   *     "extends": ["@/configs/rules-react.json", "@/configs/rules-typescript.json"]
   * }
   * ```
   */
  extends?: string | string[];
  /**
   * Root rules (in working directory)
   */
  root: Rule[];
  /**
   * Dedicated rules definitions
   */
  rules?: DedicatedRules;
  /**
   * Ignore patterns
   */
  ignorePatterns?: string[];
};

export type ValidationConfig = {
  workdir: string;
  root: Rule[];
  rules: DedicatedRules;
  gitignore: boolean;
  ignorePatterns: string[];
};
