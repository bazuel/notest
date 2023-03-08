import { BLEvent, BLSessionEvent } from '@notest/common';
import { BrowserContext } from 'playwright';

let sid = new Date().getTime();
let tabId = 0;
export const newTab = () => {
    tabId += 1;
};

export async function setupMonitor(
    context: BrowserContext,
    eventsCollected: BLSessionEvent[],
    monitorScript: string
) {
    await context.exposeFunction('nt_collect', (ntEvent) => eventsCollected.push(ntEvent));
    await context.exposeFunction('nt_tabId', () => tabId);
    await context.exposeFunction('nt_sid', () => sid);
    await context.addInitScript(monitorScript);
    await context.addInitScript(async () => {
        window.sendTo = async (blEvent) => {
            const tab = await window.nt_tabId();
            const sid = await window.nt_sid();
            const url = document.URL;
            const title = document.title;
            const timestamp = Date.now();
            await window.nt_collect({ ...blEvent, data: title, timestamp, tab, sid, url });
            console.log('collected', { name: blEvent.name });
            if (blEvent.name == 'referrer') {
                const cookieEvent: BLEvent = { name: 'cookie-details', type: 'cookie', timestamp };
                await window.nt_collect({ ...cookieEvent, details: document.cookie, url, sid, tab });
            }
        };
        window.nt_monitorInstance = new window.SessionMonitor(window.sendTo);
        window.nt_monitorInstance.enable();
    });
}


declare global {
    interface Window {
        blSerializer: any;
        controlMock: () => Promise<{ date: boolean; storage: boolean }>;
        setMockDateTrue: () => void;
        setMockStorageTrue: () => void;
        getActualMockedTimestamp: () => Promise<number>;
        nt_monitorInstance: SessionMonitor;
        SessionMonitor: SessionMonitor;
        sendTo: (event: BLEvent) => Promise<void>;
        createNewMonitor: () => {};
        nt_collect: (event: BLSessionEvent) => Promise<void>;
        nt_tabId: () => Promise<number>;
        nt_sid: () => Promise<number>;
    }
}

export interface SessionMonitor {
    new (sendTo: (event: BLEvent) => Promise<void>);
    enable: () => {};
    disable: () => {};
}