import { lstatSync } from 'node:fs';
import { ValidationError } from '@/errors/ValidationError';
import { Type } from '@/types/config';

export function getPathType(path: string): Type {
  try {
    const state = lstatSync(path);

    if (state.isDirectory()) {
      return Type.dir;
    }

    if (state.isFile()) {
      return Type.file;
    }

    throw new ValidationError('Only files or directories allowed');
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }

    throw new ValidationError('Path cannot be validated');
  }
}
