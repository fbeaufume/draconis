// Log related classes

import {Creature} from './creature.model';
import {LogType} from "./common.model";
import {LifeChange} from "./life-change.model";
import {StatusApplication} from "./status-application.model";
import {Constants} from "./constants.model";
import {Skill} from "./skill.model";

/**
 * A log message.
 */
export class Log {

  constructor(
    public type: LogType,
    // A generic string placeholder, for skill messages this is the skill name
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

  addBasicLog(type: LogType) {
    this.addLogInternal(new Log(type, null, null, null, null, null, null, null));
  }

  addStringLog(type: LogType, string: string) {
    this.addLogInternal(new Log(type, string, null, null, null, null, null, null));
  }

  addNumberLog(type: LogType, number: number) {
    this.addLogInternal(new Log(type, null, number, null, null, null, null, null));
  }

  addCreatureLog(type: LogType, creature1: Creature | null, creature2: Creature | null, lifeChange1: LifeChange | null, lifeChange2: LifeChange | null, statusApplication: StatusApplication | null = null) {
    this.addLogInternal(new Log(type, null, null, creature1, creature2, lifeChange1, lifeChange2, statusApplication));
  }

  // TODO FBE use this instead of addCreatureLog whenever possible
  addSkillExecutionLog(skill: Skill, creature1: Creature | null, creature2: Creature | null, lifeChange1: LifeChange | null) {
    if (creature2 == null) {
      this.addLogInternal(new Log(LogType.SKILL, skill.name, null, creature1, null, null, null, null));
    } else if (lifeChange1 == null) {
      this.addLogInternal(new Log(LogType.SKILL_WITH_TARGET, skill.name, null, creature1, creature2, lifeChange1, null, null));
    } else {
      this.addLogInternal(new Log(LogType.SKILL_WITH_TARGET_AND_LIFE_CHANGE, skill.name, null, creature1, creature2, lifeChange1, null, null));
    }
  }

  private addLogInternal(log: Log) {
    this.logs.push(log);
    if (this.logs.length > Constants.LOG_MAX) {
      this.logs.shift();
    }
  }

  clear() {
    this.logs = [];
  }
}

/**
 * The singleton containing the logs.
 */
export const logs: Logs = new Logs();
