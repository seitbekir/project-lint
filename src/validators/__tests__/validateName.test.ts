import { ValidationError } from '@/errors/ValidationError';
import { ConfigError } from '@/errors/ConfigError';
import { Type } from '@/types/config';

import { validateName } from '../validateName';

describe('validateName', () => {
  it('should return the correct RuleMapped object when the name is valid', () => {
    const appliableRules = [
      { name: '/^rule1$/', type: Type.file },
      { name: '/^rule2$/', type: Type.file },
    ];
    const tail = ['rule1'];
    const index = 0;

    const result = validateName(appliableRules, tail, index);

    expect(result).toStrictEqual(appliableRules[0]);
  });

  it('should return allow any rule if it is allowed', () => {
    const appliableRules = [
      { name: '/^rule1$/', type: Type.file },
      { name: '/^rule2$/', type: Type.file },
      { allowAny: true },
    ];
    const tail = ['rule3'];
    const index = 0;

    const result = validateName(appliableRules, tail, index);

    expect(result).toStrictEqual(appliableRules[2]);
  });

  it('should throw a ConfigError when the regex is invalid', () => {
    const appliableRules = [
      { name: '/^(rule1$/', type: Type.file },
      { name: '/^rule2$/', type: Type.file },
    ];
    const tail = ['rule1'];
    const index = 0;

    expect(() => {
      validateName(appliableRules, tail, index);
    }).toThrow(ConfigError);
  });

  it('should throw a ValidationError when the name does not match the regex', () => {
    const appliableRules = [
      { name: '/^rule1$/', type: Type.file },
      { name: '/^rule2$/', type: Type.file },
    ];
    const tail = ['invalidRule'];
    const index = 0;

    expect(() => {
      validateName(appliableRules, tail, index);
    }).toThrow(ValidationError);
  });

  it('should sort the rules by regex and non-regex', () => {
    const appliableRules = [
      { name: '/^rule1$/', type: Type.file },
      { name: 'rule2', type: Type.file },
      { name: 'rule3', type: Type.file },
      { name: '/^rule4$/', type: Type.file },
    ];
    const tail = ['rule2'];
    const index = 0;

    const result = validateName(appliableRules, tail, index);

    expect(result).toStrictEqual(appliableRules[1]);
  });
});
