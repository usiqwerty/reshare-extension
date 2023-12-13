import browser from "webextension-polyfill";

let PREFIX = typeof browser === "object" && typeof importScripts === "undefined"
    ? `[${browser.runtime.getManifest().name}]` : '';

let debugCount = 0;

function info(msg, ...rest) {
    console.log(`${PREFIX} ${msg}`, ...rest);
}

function warn(msg, ...rest) {
    console.warn(`${PREFIX} ${msg}`, ...rest);
}

function debug(msg, ...rest) {
    console.debug(`${PREFIX}:${debugCount++} ${msg}`, ...rest);
}

function error(e, msg, ...rest) {
    console.error(`${PREFIX} ${msg}`, ...rest, e, e.message, e.stack);
}

export default { info, warn, debug, error };