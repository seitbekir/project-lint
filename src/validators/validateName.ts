import { ConfigError } from '@/errors/ConfigError';
import { ValidationError } from '@/errors/ValidationError';
import { applyRegexParameters } from '@/helpers/regexp';
import { isRuleAllowAny } from '@/helpers/rules';
import { type RuleMapped, type RuleNamed } from '@/types/config';

export function isRegexInvalid(regex: string): boolean {
  try {
    new RegExp(regex);
  } catch (e) {
    return true;
  }

  return false;
}

export function isRegex(regex: string): boolean {
  return /^\/(.+)\/$/.test(regex);
}

export function validateName(appliableRules: RuleMapped[], tail: string[], index: number): RuleMapped | void {
  const allowAnyRule = appliableRules.find(isRuleAllowAny);

  const sortedRules = (appliableRules.filter((rule) => !isRuleAllowAny(rule)) as RuleNamed[]).sort((a, b) => {
    // first must be non-regex
    if (isRegex(a.name) && !isRegex(b.name)) {
      return 1;
    }
    if (!isRegex(a.name) && isRegex(b.name)) {
      return -1;
    }
    return 0;
  });

  const rule = sortedRules.find((_rule) => {
    if (isRegex(_rule.name)) {
      if (isRegexInvalid(_rule.name)) {
        throw new ConfigError(`Invalid regex ${_rule.name}`);
      }

      return applyRegexParameters(_rule.name, tail[index - 1]).test(tail[index]);
    }
    return _rule.name === tail[index];
  });

  if (rule) {
    return rule;
  }

  if (allowAnyRule) {
    return allowAnyRule;
  }

  throw new ValidationError(`No rule for the path`);
}
