import { ConfigError, isConfigError } from '../ConfigError';

describe('ConfigError', () => {
  it('should create an instance of ConfigError', () => {
    const error = new ConfigError('Test error');
    expect(error).toBeInstanceOf(ConfigError);
    expect(error.message).toBe('Test error');
    expect(error.path).toBeUndefined();
    expect(error.configPath).toBeUndefined();
  });

  it('should create an instance of ConfigError with configPath', () => {
    const error = new ConfigError('Test error', '/path/to/config');
    expect(error).toBeInstanceOf(ConfigError);
    expect(error.message).toBe('Test error');
    expect(error.path).toBeUndefined();
    expect(error.configPath).toBe('/path/to/config');
  });

  it('should set path', () => {
    const error = new ConfigError('Test error');
    error.setPath('/path/to/file');
    expect(error.path).toBe('/path/to/file');
  });

  it('should convert to string without configPath', () => {
    const error = new ConfigError('Test error');
    expect(error.toString()).toBe('Test error');
  });

  it('should convert to string with configPath', () => {
    const error = new ConfigError('Test error', '/path/to/config');
    expect(error.toString()).toBe('Test error');
  });

  it('should be recognized as a ConfigError', () => {
    const error = new ConfigError('Invalid value');
    expect(isConfigError(error)).toBe(true);
    expect(error instanceof ConfigError).toBe(true);
  });

  it('should not be recognized as a ConfigError', () => {
    const error = new Error('Some other error');
    expect(isConfigError(error)).toBe(false);
    expect(error instanceof ConfigError).toBe(false);
  });
});
