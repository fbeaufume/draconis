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
  Leave,
  Defend,
  Damage,
  DamageAndHeal,
  DamageAndDamage,
  Heal,
  Revive,
  Dot,
  Hot,
  EnemyDefeated,
  PartyVictory,
  PartyDefeat,
  PauseDurationChanged,
  OldManTransformation,
}

/**
 * A log message.
 */
export class Log {

  constructor(public type: LogType, public args: any[]) {
  }
}

/**
 * The log messages.
 */
export class Logs {

  logs: Log[] = [];

  add(type: LogType, ...args: any[]) {
    this.logs.push(new Log(type, args));
  }

  clear() {
    this.logs = [];
  }
}

export const logs: Logs = new Logs();
