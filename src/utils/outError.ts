import { isConfigError } from '@/errors/ConfigError';
import { isValidationError } from '@/errors/ValidationError';

export function outError(error: Error, workdir: string, minimalistic: boolean) {
  if (isConfigError(error)) {
    if (error.path) {
      console.error(`❌  ${error.path.replace(`${workdir}/`, '')}`);
    } else if (error.configPath) {
      console.error(`❌  error in ${error.configPath}`);
    } else {
      console.error('❌  Config error');
    }
    if (!minimalistic) {
      console.error(error.toString());
    }
    return;
  }

  if (isValidationError(error)) {
    console.error(`❌  ${error.path?.replace(`${workdir}/`, '')}`);
    if (!minimalistic) {
      console.error(error.toString());
    }
    return;
  }

  console.error(error);
}
