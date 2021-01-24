// Model classes for the log panel of the application

// The various types of log messages
export enum LogType {
  EnterZone,
  StartFight,
  EnemyHit,
  CharacterHit,
}

// A log message
export class Log {

  public args: any[];

  constructor(public type: LogType, ...args: any[]) {
    this.args = args;
  }
}
