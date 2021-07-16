// Log related classes

import {Creature} from './creature.model';
import {LogType} from "./common.model";
import {StatusApplication} from "./status.model";
import {LifeChange} from "./life-change.model";

/**
 * A log message.
 */
export class Log {

  constructor(
    public type: LogType,
    public string: string | null,
    public number: number | null,
    public creature1: Creature | null,
    public creature2: Creature | null,
    public lifeChange1: LifeChange | null,
    public lifeChange2: LifeChange | null,
    public statusApplication: StatusApplication | null) {
  }
}

/**
 * The log messages.
 */
export class Logs {

  logs: Log[] = [];

  addLog(type: LogType) {
    this.logs.push(new Log(type, null, null, null, null, null, null, null));
  }

  addStringLog(type: LogType, string: string) {
    this.logs.push(new Log(type, string, null, null, null, null, null, null));
  }

  addNumberLog(type: LogType, number: number) {
    this.logs.push(new Log(type, null, number, null, null, null, null, null));
  }

  addCreatureLog(type: LogType, creature1: Creature | null, creature2: Creature | null, lifeChange1: LifeChange | null, lifeChange2: LifeChange | null, statusApplication: StatusApplication | null = null) {
    this.logs.push(new Log(type, null, null, creature1, creature2, lifeChange1, lifeChange2, statusApplication));
  }

  clear() {
    this.logs = [];
  }
}

/**
 * The singleton containing the logs.
 */
export const logs: Logs = new Logs();
