import {
  SNAKE_CASE,
  KEBAB_CASE,
  PASCAL_CASE,
  CAMEL_CASE,
  applyRegexParameters,
  getDefaultRegexParameters,
  lowerCaseFirstLetter,
  upperCaseFirstLetter,
} from '../regexp';

describe('regexp', () => {
  describe('constants', () => {
    it('SNAKE_CASE should match snake_case strings', () => {
      const match = new RegExp(SNAKE_CASE, 'g');
      expect('snake_case').toMatch(match);
      expect('snake_case_123').toMatch(match);
      expect('123_snake_case').toMatch(match);
    });

    it('KEBAB_CASE should match kebab-case strings', () => {
      const match = new RegExp(KEBAB_CASE, 'g');
      expect('kebab-case').toMatch(match);
      expect('kebab-case-123').toMatch(match);
      expect('123-kebab-case').toMatch(match);
    });

    it('PASCAL_CASE should match PascalCase strings', () => {
      const match = new RegExp(PASCAL_CASE, 'g');
      expect('PascalCase').toMatch(match);
      expect('PascalCase123').toMatch(match);
      expect('123PascalCase').toMatch(match);
    });

    it('CAMEL_CASE should match camelCase strings', () => {
      const match = new RegExp(CAMEL_CASE, 'g');
      expect('camelCase').toMatch(match);
      expect('camelCase123').toMatch(match);
      expect('123camelCase').toMatch(match);
    });

    it('should not match invalid strings for SNAKE_CASE', () => {
      const match = new RegExp(`/^${SNAKE_CASE}$/`, 'g');
      expect('kebab-case').not.toMatch(match);
      expect('PascalCase').not.toMatch(match);
      expect('camelCase').not.toMatch(match);
    });
    it('should not match invalid strings for KEBAB_CASE', () => {
      const match = new RegExp(`/^${KEBAB_CASE}$/`, 'g');
      expect('snake_case').not.toMatch(match);
      expect('PascalCase').not.toMatch(match);
      expect('camelCase').not.toMatch(match);
    });
    it('should not match invalid strings for PASCAL_CASE', () => {
      const match = new RegExp(`/^${PASCAL_CASE}$/`, 'g');
      expect('snake_case').not.toMatch(match);
      expect('kebab-case').not.toMatch(match);
      expect('camelCase').not.toMatch(match);
    });
    it('should not match invalid strings for CAMEL_CASE', () => {
      const match = new RegExp(`/^${CAMEL_CASE}$/`, 'g');
      expect('snake_case').not.toMatch(match);
      expect('kebab-case').not.toMatch(match);
      expect('PascalCase').not.toMatch(match);
    });
  });

  describe('applyRegexParameters', () => {
    it('should apply regex parameters correctly', () => {
      const regex = '/^file(\\..+)?\\.ts$/';
      const parentName = 'file.test.ts';
      expect(`file.test.ts`).toMatch(applyRegexParameters(regex, parentName));
      expect(`file.ts`).toMatch(applyRegexParameters(regex, parentName));
    });

    it('supports regexp with params', () => {
      const regex = '/^${{PascalCase}}\\.ts$/';
      const parentName = 'John';
      expect(`FileTest.ts`).toMatch(applyRegexParameters(regex, parentName));
    });

    it('supports regexp with multiple params', () => {
      const regex = '/^${{PascalCase}}--${{camelCase}}\\.ts$/';
      const parentName = 'John';
      expect(`FileFile--fileFile.ts`).toMatch(applyRegexParameters(regex, parentName));
    });

    it('supports regexp with custom params', () => {
      const regex = '/^${{numbersAndWordKebab}}\\.ts$/';
      const parentName = 'John';
      const regexParameters = { numbersAndWordKebab: `((([0-9]|\\d)+-)*([a-z]|\\d)+)` };
      expect(`1234-file.ts`).toMatch(applyRegexParameters(regex, parentName, regexParameters));
    });

    it('supports param with parent name', () => {
      const regex = '/^${{ParentName}}\\.ts$/';
      const parentName = 'john';
      expect(`John.ts`).toMatch(applyRegexParameters(regex, parentName));
    });
    it('supports param with parent name lowercased', () => {
      const regex = '/^${{parentName}}\\.ts$/';
      const parentName = 'John';
      expect(`john.ts`).toMatch(applyRegexParameters(regex, parentName));
    });

    it('unmatched regex should not match', () => {
      const regex = '/^file\\..+\\.ts$/';
      const parentName = 'file.test.ts';
      expect(`file.ts`).not.toMatch(applyRegexParameters(regex, parentName));
    });
  });

  describe('getDefaultRegexParameters', () => {
    it('should return default regex parameters', () => {
      const parentName = 'John';
      const regexParameters = { name: 'World' };
      expect(getDefaultRegexParameters(parentName, regexParameters)).toStrictEqual(
        expect.objectContaining(regexParameters),
      );
    });
  });

  describe('getLowerCaseFirstLetter', () => {
    it('should return the lowercased first letter', () => {
      expect(lowerCaseFirstLetter('Hello')).toBe('hello');
      expect(lowerCaseFirstLetter('HelloWorld')).toBe('helloWorld');
    });
  });

  describe('getUpperCaseFirstLetter', () => {
    it('should return the uppercased first letter', () => {
      expect(upperCaseFirstLetter('helloWorld')).toBe('HelloWorld');
      expect(upperCaseFirstLetter('world')).toBe('World');
    });
  });
});
