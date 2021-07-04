import {Character} from "./character.model";

/**
 * A row of characters.
 */
export class CharacterRow {

  /**
   * The characters of the row.
   */
  characters: Character[];

  constructor(characters: Character[]) {
    this.characters = characters;
  }
}
