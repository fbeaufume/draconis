import {Character} from "./character.model";

/**
 * A row of characters.
 */
export class CharacterRow {

  constructor(public characters: Character[]) {
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
