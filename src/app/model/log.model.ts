// Log related classes

import {Creature} from './creature.model';
import {BasicLogType, LogType} from './common.model';
import {LifeChange} from './life-change.model';
import {StatusApplication} from './status-application.model';
import {Constants} from './constants.model';
import {Skill} from './skill.model';

/**
 * A log message.
 */
export class Log {

  constructor(
    public type: LogType,
    // A generic string placeholder, for skill messages this is the skill name
    public string: string | null,
    public number: number | null,
    public activeCreature: Creature | null,
    public skill: Skill | null,
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

  /**
   * Display a simple, static log.
   */
  addBasicLog(type: BasicLogType) {
    this.addLogInternal(new Log(LogType.BASIC_LOG, type, null, null, null, null, null, null, null));
  }

  addStringLog(type: LogType, string: string) {
    this.addLogInternal(new Log(type, string, null, null, null, null, null, null, null));
  }

  addNumberLog(type: LogType, number: number) {
    this.addLogInternal(new Log(type, null, number, null, null, null, null, null, null));
  }

  addCreatureLog(type: LogType, creature1: Creature | null, creature2: Creature | null, lifeChange1: LifeChange | null, lifeChange2: LifeChange | null, statusApplication: StatusApplication | null = null) {
    this.addLogInternal(new Log(type, null, null, creature1, null, creature2, lifeChange1, lifeChange2, statusApplication));
  }

  /**
   * Display a skill execution log.
   */
  addSkillExecutionLog(skill: Skill, activeCreature: Creature | null, targetCreature: Creature | null, lifeChange1: LifeChange | null) {
    if (targetCreature == null) {
      this.addLogInternal(new Log(LogType.SKILL, null, null, activeCreature, skill, null, null, null, null));
    } else if (lifeChange1 == null) {
      this.addLogInternal(new Log(LogType.SKILL_WITH_TARGET, null, null, activeCreature, skill, targetCreature, null, null, null));
    } else {
      this.addLogInternal(new Log(LogType.SKILL_WITH_TARGET_AND_LIFE_CHANGE, null, null, activeCreature, skill, targetCreature, lifeChange1, null, null));
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
