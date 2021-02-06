// Skill related classes of the application

/**
 * The type of target of a skill
 */
export enum SkillTarget {
  NONE,
  CHARACTER,
  ENEMY
}


/**
 * A character skill.
 */
export class Skill {

  constructor(
    public name: string,
    public target: SkillTarget,
    // Skill cost, in energy points
    public cost: number,
    // Skill range in number of rows, 0 if not applicable
    public range: number,
    public coolDown: number,
    // Generic power of the skill, i.e. damage amount for offensive skill, heal amount for heal skill, etc
    public power: number,
    public description: string
  ) {
  }
}

/**
 * The default single target attack.
 */
export const attack = new Skill(
  'Attack',
  SkillTarget.ENEMY,
  0,
  1,
  0,
  10,
  'Basic attack, does 10 damage.');

/**
 * The default single target attack.
 */
export const defend = new Skill(
  'Defend',
  SkillTarget.NONE,
  0,
  1,
  0,
  0,
  'Defend against attacks.');

/**
 * A bigger attack.
 */
export const bigAttack = new Skill(
  'Special Attack',
  SkillTarget.ENEMY,
  10,
  1,
  0,
  15,
  'Special attack, does 15 damage.');

/**
 * Even bigger attack, only used to ensure that too expensive skills cannot be used.
 */
export const ultimateAttack = new Skill(
  'Ultimate Attack',
  SkillTarget.ENEMY,
  60,
  1,
  0,
  40,
  'Ultimate attack, does 40 damage.');

/**
 * A single target heal.
 */
export const heal: Skill = new Skill(
  'Heal',
  SkillTarget.CHARACTER,
  5,
  0,
  0,
  10,
  'Heal a party member for 10 HP.');

// TODO FBE add other skills
// new Skill('Defend', 0, 1, 0, 'Reduce taken damage by 30% until next turn.'),
// new Skill('Venom', 15, 1, 0, 'Hits the target for 100% damage and inflicts 60% poison damage over 3 turns.'),
// new Skill('Vanish', 10, 0, 4, 'Disappear and become immune to attacks.'),
// new Skill('Back Stab', 10, 1, 0, 'Hits the target for 180% damage.')
