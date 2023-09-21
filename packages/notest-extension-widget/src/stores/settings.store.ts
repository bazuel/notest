import { loggedWritable } from '../shared/utils/store.util';
import { tokenService } from '../shared/services/token.service';

export interface AppStateStore extends NTSettings {
  logged: boolean;
}

export let appStore = loggedWritable<AppStateStore>({
  ...getSettings(),
  logged: false
});

initAppStore();

async function initAppStore() {
  appStore.update({ logged: await tokenService.logged() });
  setInterval(async () => {
    appStore.update({ logged: await tokenService.logged() });
  }, 1000);
}

export function updateRecButtonOnScreen(recButtonOnScreen: boolean) {
  const settingsData = getSettings();
  settingsData.recButtonOnScreen = recButtonOnScreen;
  appStore.update({ recButtonOnScreen });
  setSettings(settingsData);
}

export function updateSidebarState(sidebarState: 'start' | 'end') {
  const settingsData = getSettings();
  settingsData.sidebarState = sidebarState;
  appStore.update({ sidebarState });
  setSettings(settingsData);
}

export function updateLogged(logged: boolean) {
  appStore.update({ logged });
}

export function updateIsLoginSession(isLoginSession: boolean) {
  const settingsData = getSettings();
  settingsData.isLoginSession = isLoginSession;
  appStore.update({ isLoginSession });
  setSettings(settingsData);
}

export function updateSessionSaved(sessionSaved: boolean) {
  const settingsData = getSettings();
  settingsData.sessionSaved = sessionSaved;
  appStore.update({ sessionSaved });
  setSettings(settingsData);
}

export function updateRerunSession(rerun: boolean) {
  const settingsData = getSettings();
  settingsData.rerun = rerun;
  appStore.update({ rerun });
  setSettings(settingsData);
}

function setSettings(settings: NTSettings) {
  if (settings) {
    localStorage.setItem('nt-settings', JSON.stringify(settings));
  }
}

function getSettings(): NTSettings {
  return JSON.parse(localStorage.getItem('nt-settings') || '{}');
}

type NTSettings = {
  rerun: boolean;
  recButtonOnScreen: boolean;
  isLoginSession: boolean;
  sidebarState: 'start' | 'end';
  sessionSaved: boolean;
};
