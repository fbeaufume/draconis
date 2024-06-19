// Logging utilities

enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR,
}

export class Logger {

  constructor(private category: string) {
  }

  debug(message: string) {
    this.log(LogLevel.DEBUG, message);
  }

  info(message: string) {
    this.log(LogLevel.INFO, message);
  }

  warn(message: string) {
    this.log(LogLevel.WARN, message);

  }

  error(message: string) {
    this.log(LogLevel.ERROR, message);
  }

  log(level: LogLevel, message: string) {
    console.log(`[Draconis] ${this.category} [${LogLevel[level]}] ${message}`);
  }
}
