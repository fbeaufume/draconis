import {Character} from "./character.model";

/**
 * A row of characters in the party.
 */
export class PartyRow {

  /**
   * The characters of the row.
   */
  characters: Character[];

  constructor(characters: Character[]) {
    this.characters = characters
  }

  /**
   * Return true if there is at least one alive character in this row.
   */
  hasAliveCharacter(): boolean {
    for (let i = 0; i < this.characters.length; i++) {
      if (this.characters[i].isAlive()) {
        return true;
      }
    }
    return false;
  }
}
