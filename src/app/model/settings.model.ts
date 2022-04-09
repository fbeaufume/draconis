import {Constants} from "./constants.model";
import {logs} from "./log.model";
import {LogType} from "./common.model";

/**
 * Get the value of a query string parameter (empty string if the param is present without a value) or null.
 */
function getQueryStringParameterByName(name: string, url: string = window.location.href) {
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(url);
  if (!results) {
    return null;
  }
  if (!results[2]) {
    return '';
  }
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
 * Global application settings.
 */
export class Settings {

  /**
   * This parameter can be used to change the game difficulty.
   * 0 means no difficulty change. 1 means enemies have 10% more health and power (meaning more damage and heals).
   * 2 means 20%, etc. Can be negative to make the game easier. For example -3 means -30%.
   */
  difficulty: number = parseInt(getQueryStringParameterByName('difficulty') || '0');

  /**
   * The health and power bonus or malus for enemies computed from the difficulty parameter.
   */
  enemyHealthAndPowerCoefficient: number = 1;

  /**
   * This parameter can be used to select the played dungeon.
   * 0 for the test dungeon, 1 for the first real dungeon, 2 for the second real dungeon, etc.
   */
  dungeon: number = parseInt(getQueryStringParameterByName('dungeon') || '1');

  /**
   * This parameter can be used to select the starting fight in a dungeon.
   * 1 for the first fight, 2 for the second, etc.
   */
  fight: number = parseInt(getQueryStringParameterByName('fight') || '1');

  /**
   * This parameter can be used to disable the random part of damages and heals.
   */
  useRandom: boolean = getQueryStringParameterByName('random') == null;

  /**
   * Pause in msec in the UI between actions.
   */
  pauseDuration: number = Constants.PAUSE_LONG;

  constructor() {
    this.enemyHealthAndPowerCoefficient = 1 + this.difficulty / 10;
  }

  togglePauseDuration() {
    if (this.pauseDuration == Constants.PAUSE_LONG) {
      this.pauseDuration = Constants.PAUSE_SHORT;
    } else {
      this.pauseDuration = Constants.PAUSE_LONG;
    }
    logs.addNumberLog(LogType.PAUSE_DURATION_CHANGED, this.pauseDuration);
  }
}

export const settings: Settings = new Settings();
