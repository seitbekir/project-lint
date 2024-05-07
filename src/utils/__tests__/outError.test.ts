import { ConfigError } from '@/errors/ConfigError';
import { ValidationError } from '@/errors/ValidationError';

import { outError } from '../outError';

describe('outError', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation().mockReset();
  });

  it('should handle ConfigError', () => {
    const error = new ConfigError('Some error message');
    error.path = '/path/to/file.txt';
    const workdir = '/path/to';
    const minimalistic = true;

    outError(error, workdir, minimalistic);

    expect(console.error).toHaveBeenNthCalledWith(1, '❌  file.txt');
  });

  it('should handle ConfigError with configPath', () => {
    const error = new ConfigError('Some error message', '/path/to/config');
    const workdir = '/path/to';
    const minimalistic = true;

    outError(error, workdir, minimalistic);

    expect(console.error).toHaveBeenNthCalledWith(1, '❌  error in /path/to/config');
  });

  it('should handle ConfigError without paths', () => {
    const error = new ConfigError('Some error message');
    const workdir = '/path/to';
    const minimalistic = true;

    outError(error, workdir, minimalistic);

    expect(console.error).toHaveBeenNthCalledWith(1, '❌  Config error');
  });

  it('should handle ValidationError', () => {
    const error = new ValidationError('Some error message');
    error.path = '/path/to/file.txt';
    const workdir = '/path/to';
    const minimalistic = true;

    outError(error, workdir, minimalistic);

    expect(console.error).toHaveBeenNthCalledWith(1, '❌  file.txt');
  });

  it('should handle other errors', () => {
    const error = new Error('Some error message');
    const workdir = '/path/to';
    const minimalistic = true;

    outError(error, workdir, minimalistic);

    expect(console.error).toHaveBeenCalledWith(error);
  });

  it('should handle ConfigError with minimalistic false', () => {
    const error = new ConfigError('Some error message');
    error.path = '/path/to/file.txt';
    const errorToStringSpy = jest.spyOn(error, 'toString').mockReturnValue('Some error message');

    const workdir = '/path/to';
    const minimalistic = false;

    outError(error, workdir, minimalistic);

    expect(errorToStringSpy).toHaveBeenCalled();
  });

  it('should handle ValidationError with minimalistic false', () => {
    const error = new ValidationError('Some error message');
    error.path = '/path/to/file.txt';
    const errorToStringSpy = jest.spyOn(error, 'toString').mockReturnValue('Some error message');

    const workdir = '/path/to';
    const minimalistic = false;

    outError(error, workdir, minimalistic);

    expect(errorToStringSpy).toHaveBeenCalled();
  });
});
