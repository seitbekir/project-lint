import { type RuleNamed, Type, RuleAllowAny, RuleMapped } from '@/types/config';
import { ValidationError, isValidationError } from '../ValidationError';

describe('ValidationError', () => {
  it('should set the path correctly', () => {
    const error = new ValidationError('Invalid value');
    error.setPath('/path/to/file');
    expect(error.path).toBe('/path/to/file');
  });

  it('should set the rules correctly', () => {
    const error = new ValidationError('Invalid value');
    const rules: RuleNamed[] = [
      { name: 'rule1', type: Type.file },
      { name: 'rule2', type: Type.file },
    ];
    error.setRules(rules);
    expect(error.rules).toStrictEqual(rules);
  });

  it('should convert to string correctly', () => {
    const error = new ValidationError('Invalid value');
    const rule1: RuleNamed = { name: 'rule1', type: Type.file };
    const rule2: RuleAllowAny = { allowAny: true };
    const rules: RuleMapped[] = [rule1, rule2];
    error.setRules(rules);
    const expectedString = `Invalid value\n  Must match one of the following rules:\n  - name: ${rule1.name}\n    type: ${rule1.type}\n  - allowAny`;
    expect(error.toString()).toBe(expectedString);
  });

  it('should be recognized as a ValidationError', () => {
    const error = new ValidationError('Invalid value');
    expect(isValidationError(error)).toBe(true);
    expect(error instanceof ValidationError).toBe(true);
  });

  it('should not be recognized as a ValidationError', () => {
    const error = new Error('Some other error');
    expect(isValidationError(error)).toBe(false);
    expect(error instanceof ValidationError).toBe(false);
  });
});
