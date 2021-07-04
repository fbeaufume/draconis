import {Character} from "./character.model";
import {CharacterRow} from "./character-row.model";

/**
 * The characters party, i.e. the characters organized in rows.
 */
export class Party {

  /**
   * The characters rows. The first row is the front row.
   */
  rows: CharacterRow[] = [];

  constructor(
    frontRowCharacters: Character[],
    backRowCharacters: Character[]) {
    this.rows.push(new CharacterRow(frontRowCharacters));
    this.rows.push(new CharacterRow(backRowCharacters);
  }
}
