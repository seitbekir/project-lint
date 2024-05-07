import { ValidationError } from '@/errors/ValidationError';
import { Type, ValidationConfig } from '@/types/config';

import { validatePath } from '../validatePath';

jest.mock('@/utils/getPathType', () => ({
  getPathType: jest.fn().mockReturnValue('file'),
}));

describe('validatePath', () => {
  const config: ValidationConfig = {
    workdir: '/home/user/work',
    root: [
      {
        name: 'src',
        type: Type.dir,
        children: [
          {
            ruleId: 'validators',
          },
          {
            name: 'helpers',
            type: Type.dir,
          },
        ],
      },
    ],
    rules: {
      validators: [
        {
          name: 'validators',
          type: Type.dir,
          children: [{ name: '/^${{camelCase}}\\.ts$/', type: Type.file }],
        },
      ],
    },
    ignorePatterns: [],
    gitignore: false,
  };

  it('should return true for valid paths', () => {
    const path = '/home/user/work/src/validators/validateTest.ts';

    expect(() => validatePath(path, config)).not.toThrow();
  });

  it('should throw a ValidationError for invalid paths', () => {
    const path = '/home/user/work/src/helpers/helpTest.ts';

    expect(() => {
      validatePath(path, config);
    }).toThrow(ValidationError);
  });
  it('should throw a ValidationError for no rules', () => {
    const path = '/home/user/work/src/helpers/helpTest.ts';

    const configLocal = {
      ...config,
      root: [
        {
          name: 'index.ts',
          type: Type.file,
        },
      ],
    };

    expect(() => {
      validatePath(path, configLocal);
    }).toThrow(ValidationError);
  });

  it('should pass if allow any rule is present', () => {
    const path = '/home/user/work/src/helpTest.ts';

    const configLocal = {
      ...config,
      root: [
        {
          name: 'src',
          type: Type.dir,
          children: [{ allowAny: true }],
        },
      ],
    };

    expect(() => validatePath(path, configLocal)).not.toThrow();
  });

  it('should pass if allow any rule is present in the middle', () => {
    const path = '/home/user/work/src/validators/helpTest.ts';

    const configLocal = {
      ...config,
      root: [
        {
          name: 'src',
          type: Type.dir,
          children: [
            {
              name: 'helpers',
              type: Type.dir,
            },
            { allowAny: true },
          ],
        },
      ],
    };

    expect(() => validatePath(path, configLocal)).not.toThrow();
  });

  it('should pass if children are ignored', () => {
    const path = '/home/user/work/src/helpers/helpTest.ts';

    const configLocal = {
      ...config,
      root: [
        {
          name: 'src',
          type: Type.dir,
          ignoreChildren: true,
        },
      ],
    };

    expect(() => validatePath(path, configLocal)).not.toThrow();
  });

  it('should throw a ConfigError if rule by id is not defined', () => {
    const path = '/home/user/work/src/helpers/helpTest.ts';
    const ruleId = 'invalid';

    const configLocal = {
      ...config,
      root: [
        {
          name: 'src',
          type: Type.dir,
          children: [{ ruleId }],
        },
      ],
    };

    expect(() => {
      validatePath(path, configLocal);
    }).toThrow(`Rule "${ruleId}" not defined in "rules"`);
  });
});
