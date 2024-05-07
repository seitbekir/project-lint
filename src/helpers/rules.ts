import {
  Type,
  type Rule,
  type RuleRuleId,
  type RuleMapped,
  type RuleNamed,
  type RuleDir,
  type RuleFile,
  type RuleAllowAny,
} from '@/types/config';

export function isRuleRuleId(rule: Rule): rule is RuleRuleId {
  return 'ruleId' in rule;
}
export function isRuleMapped(rule: Rule): rule is RuleMapped {
  return 'ruleId' in rule === false;
}
export function isRuleNamed(rule: Rule): rule is RuleNamed {
  return 'name' in rule;
}
export function isRuleDir(rule: Rule): rule is RuleDir {
  return 'type' in rule && rule.type === Type.dir;
}
export function isRuleFile(rule: Rule): rule is RuleFile {
  return 'type' in rule && rule.type === Type.file;
}
export function isRuleAllowAny(rule: Rule): rule is RuleAllowAny {
  return 'allowAny' in rule;
}
