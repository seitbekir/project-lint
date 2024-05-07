export class ConfigError extends Error {
  public path?: string;

  constructor(
    message: string,
    public configPath?: string,
  ) {
    super(message);
    this.name = 'ConfigError';

    Object.setPrototypeOf(this, ConfigError.prototype);
  }

  public setPath(path: string) {
    this.path = path;
  }

  public toString = () => this.message;
}

export function isConfigError(error: Error): error is ConfigError {
  return error instanceof ConfigError || error.name === 'ConfigError';
}
