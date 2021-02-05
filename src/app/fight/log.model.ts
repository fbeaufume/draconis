// Model classes for the log panel of the application

/**
 * The various types of log messages.
 * When any numeric value is changed, update log.component.html.
 */
export enum LogType {
  EnterZone,
  StartRound,
  EnemyHit,
  CharacterDefend,
  CharacterHit,
  CharacterHeal,
  DefeatedEnemy,
  PartyVictory,
}

/**
 * A log message.
 */
export class Log {

  public args: any[];

  constructor(public type: LogType, ...args: any[]) {
    this.args = args;
  }
}
