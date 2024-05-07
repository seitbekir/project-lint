import { ConfigError } from '@/errors/ConfigError';
import { ValidationError } from '@/errors/ValidationError';
import { isRuleAllowAny, isRuleDir, isRuleMapped, isRuleRuleId } from '@/helpers/rules';
import {
  Type,
  type ValidationConfig,
  type Rule,
  type DedicatedRules,
  type RuleDir,
  type RuleMapped,
} from '@/types/config';
import { getPathType } from '@/utils/getPathType';
import { validateName } from './validateName';

function getLayerRules(root: Rule[], pastRules: Rule[]): Rule[] {
  if (pastRules.length === 0) {
    return root;
  }

  const lastRule = pastRules[pastRules.length - 1] as RuleDir;

  return lastRule.children ?? [];
}

function mapRules(layerRules: Rule[], rules: DedicatedRules, path: string): RuleMapped[] {
  const result: RuleMapped[] = [];

  for (const rule of layerRules) {
    if (isRuleMapped(rule)) {
      result.push(rule);
    }

    if (isRuleRuleId(rule)) {
      if (rule.ruleId in rules) {
        result.push(...mapRules(rules[rule.ruleId], rules, path));
      } else {
        throw new ConfigError(`Rule "${rule.ruleId}" not defined in "rules"`);
      }
    }
  }

  return result;
}

function getAppliableRules(layerRules: RuleMapped[], layerType: Type): RuleMapped[] {
  return layerRules.filter((rule) => {
    if (isRuleAllowAny(rule) || rule.type === layerType) {
      return true;
    }

    return false;
  });
}

export function validatePath(path: string, config: ValidationConfig) {
  const pathType = getPathType(path);
  const tail = path.replace(config.workdir, '').split('/').filter(Boolean);

  const pastRules: Rule[] = [];

  for (let i = 0; i < tail.length; i++) {
    const layerRules = getLayerRules(config.root, pastRules);
    const layerMappedRules = mapRules(layerRules, config.rules, path);
    const layerType = i === tail.length - 1 ? pathType : Type.dir;
    const appliableRules = getAppliableRules(layerMappedRules, layerType);

    let rule;
    try {
      if (appliableRules.length === 0) {
        throw new ValidationError(`No rules satisfies`);
      }

      rule = validateName(appliableRules, tail, i);
    } catch (error) {
      if (error instanceof ValidationError) {
        error.setRules(layerMappedRules);
      }

      throw error;
    }

    if (isRuleAllowAny(rule)) {
      return;
    }

    if (isRuleDir(rule) && rule.ignoreChildren) {
      return;
    }

    pastRules.push(rule);
  }
}
