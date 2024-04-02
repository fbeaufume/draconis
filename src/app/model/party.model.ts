import {PartyRow} from "./party-row.model";
import {Character, Hunter, Mage, Paladin, Warrior} from "./character.model";

/**
 * The player party.
 */
export class Party {

  /**
   * The characters rows. The first row in the array is the front row.
   */
  rows: PartyRow[] = [];

  constructor(
    // Front row characters
    row1Characters: Character[],
    // Back row characters
    row2Characters: Character[]) {
    this.rows.push(new PartyRow(row1Characters));
    this.rows.push(new PartyRow(row2Characters));

    this.updateDistances();
  }

  /**
   * Give each character his distance to the opposition.
   */
  private updateDistances() {
    for (let i = 0; i < this.rows.length; i++) {
      const row = this.rows[i];
      row.characters.forEach(character => {
        character.distance = i + 1;
      });
    }
  }

  /**
   * Execute a callback on each character that validates an optional filter.
   */
  forEachCharacter(callback: (character: Character) => void, filter: (character: Character) => boolean = _ => true) {
    this.rows.forEach(row => row.characters.filter(c => filter(c)).forEach(c => callback(c)));
  }

  /**
   * Return the number of alive creatures
   */
  countAliveCreatures(): number {
    let count = 0;

    this.forEachCharacter(_ => count++, c => c.isAlive());

    return count;
  }

  /**
   * Return true is there is no alive character.
   */
  isWiped() {
    return this.countAliveCreatures() <= 0;
  }

  /**
   * Restore all tech points. Called at the beginning of a new encounter for example.
   */
  restoreTechPoints() {
    this.forEachCharacter(c => c.restoreEnergy(), c => c.isAlive() && !c.useMana);
  }

  /**
   * Restore some mana to mana users, for example after an enemy died.
   */
  restoreManaPoints(amount: number) {
    this.forEachCharacter(c => c.spendEnergy(-amount), c => c.isAlive() && c.useMana);
  }

  /**
   * Target one random alive character from the first accessible row (i.e. the first row unless all characters from first row are dead).
   */
  targetOneFrontRowAliveCharacter(): Character[] {
    let rowIndex = 0;

    if (!this.rows[0].hasAliveCharacter()) {
      // No alive character on the front row, use the back row
      rowIndex = 1;
    }

    const aliveCharacters: Character[] = this.rows[rowIndex].characters.filter(c => c.isAlive());

    return [aliveCharacters[Math.floor(Math.random() * aliveCharacters.length)]];
  }

  /**
   * Target one random alive character.
   */
  targetOneAliveCharacter(): Character[] {
    const aliveCharacters: Character[] = this.targetAllAliveCharacters();

    return [aliveCharacters[Math.floor(Math.random() * aliveCharacters.length)]];
  }

  /**
   * Target all alive party characters.
   */
  targetAllAliveCharacters(): Character[] {
    const characters: Character[] = [];

    this.forEachCharacter(c => characters.push(c), c => c.isAlive());

    return characters;
  }

  /**
   * Get the character at the left of a given character.
   */
  getLeftCharacter(character: Character): Character | null {
    const row = this.getRowOfCharacter(character);

    // Position of the creature in its row
    const position: number = row.characters.indexOf(character);

    if (position > 0) {
      return row.characters[position - 1];
    } else {
      return null;
    }
  }

  /**
   * Get the character at the right of a given character.
   */
  getRightCharacter(character: Character): Character | null {
    const row = this.getRowOfCharacter(character);

    // Position of the creature in its row
    const position: number = row.characters.indexOf(character);

    if (position >= 0 && row.characters.length > position + 1) {
      return row.characters[position + 1];
    } else {
      return null;
    }
  }

  getRowOfCharacter(character: Character): PartyRow {
    return this.rows[character.distance - 1];
  }
}

/**
 * A standard balanced party.
 */
export class StandardParty extends Party {

  constructor() {
    super([
      new Warrior('Melkan'),
      new Paladin('Arwin')
    ], [
      new Hunter('Faren'),
      new Mage('Harika')]);
  }
}
