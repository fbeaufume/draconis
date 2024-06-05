import {Creature} from './creature.model';
import {BasicMessageType, MessageType} from './common.model';
import {LifeChange} from './life-change.model';
import {Constants} from './constants.model';
import {Skill} from './skill.model';

// Message related classes

/**
 * A message.
 */
export class Message {

  /**
   * The message template type.
   */
  type: MessageType;

  /**
   * The items in the message displayed using specific formatting.
   */
  items: any[];

  constructor(type: MessageType, ...items: any[]) {
    this.type = type;
    this.items = items;
  }

  getItem(position: number): any {
    return this.items[position];
  }
}

/**
 * The displayed messages.
 */
export class Messages {

  messages: Message[] = [];

  /**
   * Display a simple, static message.
   */
  addBasicMessage(type: BasicMessageType) {
    this.addMessageInternal(new Message(MessageType.BASIC_MESSAGE, type));
  }

  /**
   * Display a parameterized message.
   */
  addParameterizedMessage(type: MessageType, ...items: any[]) {
    this.addMessageInternal(new Message(type, ...items));
  }

  /**
   * Display a skill execution message.
   */
  addSkillExecutionMessage(activeCreature: Creature, skill: Skill, targetCreature: Creature | null, lifeChange: LifeChange | null) {
    if (targetCreature == null) {
      this.addMessageInternal(new Message(MessageType.SKILL, activeCreature, skill));
    } else if (lifeChange == null) {
      this.addMessageInternal(new Message(MessageType.SKILL_WITH_TARGET, activeCreature, skill, targetCreature));
    } else {
      this.addMessageInternal(new Message(MessageType.SKILL_WITH_TARGET_AND_LIFE_CHANGE, activeCreature, skill, targetCreature, lifeChange));
    }
  }

  private addMessageInternal(message: Message) {
    this.messages.push(message);
    if (this.messages.length > Constants.MESSAGE_MAX) {
      this.messages.shift();
    }
  }

  clear() {
    this.messages = [];
  }
}

/**
 * The singleton containing the messages.
 */
export const messages: Messages = new Messages();
