import { isRuleAllowAny, isRuleNamed } from '@/helpers/rules';
import { type RuleMapped } from '@/types/config';

export class ValidationError extends Error {
  public path?: string;

  public rules?: RuleMapped[];

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';

    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  public setPath(path: string) {
    this.path = path;
  }

  public setRules(rules: RuleMapped[]) {
    this.rules = rules;
  }

  public toString = () =>
    `${this.message}\n  Must match one of the following rules:\n${this.rules
      // eslint-disable-next-line
      ?.map((rule) => {
        if (isRuleAllowAny(rule)) {
          return `  - allowAny`;
        }
        if (isRuleNamed(rule)) {
          return `  - name: ${rule.name}\n    type: ${rule.type}`;
        }
      })
      .join('\n')}`;
}

export function isValidationError(error: Error): error is ValidationError {
  return error instanceof ValidationError || error.name === 'ValidationError';
}
