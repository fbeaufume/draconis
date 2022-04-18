// Log related classes

import {Creature} from './creature.model';
import {BasicLogType, LogType} from './common.model';
import {LifeChange} from './life-change.model';
import {Constants} from './constants.model';
import {Skill} from './skill.model';

/**
 * A log message.
 */
export class Log {

  /**
   * The log template type.
   */
  type: LogType;

  /**
   * The items in the log message displayed using specific formatting.
   */
  items: any[];

  constructor(type: LogType, ...items: any[]) {
    this.type = type;
    this.items = items;
  }

  getItem(position: number): any {
    return this.items[position];
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
    this.addLogInternal(new Log(LogType.BASIC_LOG, type));
  }

  /**
   * Display a parameterized log.
   */
  addParameterizedLog(type: LogType, ...items:any[]) {
    this.addLogInternal(new Log(type, items));
  }

  // TODO FBE remove this
  addCreatureLog(type: LogType, creature: Creature, lifeChange: LifeChange | null) {
    this.addLogInternal(new Log(type, creature, lifeChange));
  }

  /**
   * Display a skill execution log.
   */
  addSkillExecutionLog(activeCreature: Creature, skill: Skill, targetCreature: Creature | null, lifeChange: LifeChange | null) {
    if (targetCreature == null) {
      this.addLogInternal(new Log(LogType.SKILL, activeCreature, skill));
    } else if (lifeChange == null) {
      this.addLogInternal(new Log(LogType.SKILL_WITH_TARGET, activeCreature, skill, targetCreature));
    } else {
      this.addLogInternal(new Log(LogType.SKILL_WITH_TARGET_AND_LIFE_CHANGE, activeCreature, skill, targetCreature, lifeChange));
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
