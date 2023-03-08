import {BLCookieDetailsEvent, BLEvent} from "@notest/common"
import {BrowserContext} from "playwright";

export async function injectCookie(context: BrowserContext,jsonEvents: BLEvent[]) {
    let cookieAction = jsonEvents.find((ev) => ev.name == 'cookie-details') as BLCookieDetailsEvent;
    if (cookieAction.details.length) {
        cookieAction.details = cookieAction.details.map((detail) => {
            return { name: detail.name, value: detail.value, path: detail.path, domain: detail.domain };
        });
        await context.addCookies(cookieAction.details);
    }
}