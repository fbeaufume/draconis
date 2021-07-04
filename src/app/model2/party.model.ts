import {Character} from "./character.model";
import {CharacterRow} from "./character-row.model";

/**
 * The characters party. The characters are organized in rows.
 */
export class Party {

  /**
   * The characters rows. The first row is the front row.
   */
  rows: CharacterRow[] = [];

  constructor(
    frontRow: Character[],
    backRow: Character[]) {
    this.rows.push(new CharacterRow(frontRow));
    this.rows.push(new CharacterRow(backRow));
  }
}
