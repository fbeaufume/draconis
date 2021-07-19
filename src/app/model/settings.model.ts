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

    devMode: boolean = getQueryStringParameterByName('dev') != null;

    fight: number = parseInt(getQueryStringParameterByName('fight') || '1');

    // Add a random modification to damages and heals or not
    useRandom: boolean = getQueryStringParameterByName('random') == null;

    // Pause in msec in the UI between actions
    pauseDuration: number = Constants.PAUSE_LONG;

    togglePauseDuration() {
        if (this.pauseDuration == Constants.PAUSE_LONG) {
            this.pauseDuration = Constants.PAUSE_SHORT;
        } else {
            this.pauseDuration = Constants.PAUSE_LONG;
        }
        logs.addNumberLog(LogType.PauseDurationChanged, this.pauseDuration);
    }
}

export const settings: Settings = new Settings();
