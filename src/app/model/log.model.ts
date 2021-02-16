// Log related classes

/**
 * The various types of log messages.
 * When any numeric value is changed, update log.component.html.
 */
export enum LogType {
  EnterZone,
  OppositionAppear,
  StartRound,
  Advance,
  Wait,
  Inhale,
  Defend,
  Damage,
  Heal,
  Revive,
  EnemyDefeated,
  PartyVictory,
  PauseDurationChanged,
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
