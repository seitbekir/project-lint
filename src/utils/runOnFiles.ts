import { ValidationConfig } from '@/types/config';
import { validatePath } from '@/validators/validatePath';
import { isValidationError } from '@/errors/ValidationError';
import { isConfigError } from '@/errors/ConfigError';

type RunResult = {
  successPaths: string[];
  errors: Error[];
};

export function runOnFiles(paths: string[], config: ValidationConfig): RunResult {
  const errors: Error[] = [];
  const successPaths: string[] = [];

  for (const path of paths) {
    try {
      validatePath(path, config);
      successPaths.push(path);
    } catch (error) {
      if (error instanceof Error && (isValidationError(error) || isConfigError(error))) {
        error.setPath(path);
      }

      errors.push(error as Error);
    }
  }

  return { errors, successPaths };
}
