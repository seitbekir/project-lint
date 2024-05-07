import { Type } from '@/types/config';
import { isRuleRuleId, isRuleMapped, isRuleNamed, isRuleDir, isRuleFile, isRuleAllowAny } from '../rules';

describe('isRuleRuleId', () => {
  it('should return true for RuleRuleId', () => {
    expect(isRuleRuleId({ ruleId: 'ruleId' })).toBe(true);
  });

  it('should return false for other rule types', () => {
    expect(isRuleRuleId({ name: 'test', type: Type.file })).toBe(false);
    expect(isRuleRuleId({ name: 'test', type: Type.dir, children: [] })).toBe(false);
    expect(isRuleRuleId({ allowAny: true })).toBe(false);
  });
});

describe('isRuleMapped', () => {
  it('should return true for RuleMapped', () => {
    expect(isRuleMapped({ name: 'test', type: Type.file })).toBe(true);
    expect(isRuleMapped({ name: 'test', type: Type.dir, children: [] })).toBe(true);
    expect(isRuleMapped({ allowAny: true })).toBe(true);
  });

  it('should return false for other rule types', () => {
    expect(isRuleMapped({ ruleId: 'ruleId' })).toBe(false);
  });
});

describe('isRuleNamed', () => {
  it('should return true for RuleNamed', () => {
    expect(isRuleNamed({ name: 'test', type: Type.file })).toBe(true);
    expect(isRuleNamed({ name: 'test', type: Type.dir, children: [] })).toBe(true);
  });

  it('should return false for other rule types', () => {
    expect(isRuleNamed({ allowAny: true })).toBe(false);
    expect(isRuleNamed({ ruleId: 'ruleId' })).toBe(false);
  });
});

describe('isRuleDir', () => {
  it('should return true for RuleDir', () => {
    expect(isRuleDir({ name: 'test', type: Type.dir, children: [] })).toBe(true);
  });

  it('should return false for other rule types', () => {
    expect(isRuleDir({ name: 'test', type: Type.file })).toBe(false);
    expect(isRuleDir({ allowAny: true })).toBe(false);
    expect(isRuleDir({ ruleId: 'ruleId' })).toBe(false);
  });
});

describe('isRuleFile', () => {
  it('should return true for RuleFile', () => {
    expect(isRuleFile({ name: 'test', type: Type.file })).toBe(true);
  });

  it('should return false for other rule types', () => {
    expect(isRuleFile({ name: 'test', type: Type.dir, children: [] })).toBe(false);
    expect(isRuleFile({ allowAny: true })).toBe(false);
    expect(isRuleFile({ ruleId: 'ruleId' })).toBe(false);
  });
});

describe('isRuleAllowAny', () => {
  it('should return true for RuleAllowAny', () => {
    expect(isRuleAllowAny({ allowAny: true })).toBe(true);
  });

  it('should return false for other rule types', () => {
    expect(isRuleAllowAny({ name: 'test', type: Type.file })).toBe(false);
    expect(isRuleAllowAny({ name: 'test', type: Type.dir, children: [] })).toBe(false);
    expect(isRuleAllowAny({ ruleId: 'ruleId' })).toBe(false);
  });
});
