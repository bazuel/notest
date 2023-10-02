import { currentTabId } from '../chrome/functions/current-tab.util';
import { getStorage, setStorage } from '../content_scripts/storage';
import { NTMessage, sendMessage } from '../content_scripts/message.api';

const recordingKey = 'recording';

export async function isRecordingBG() {
  const rec = JSON.parse((await getStorage(recordingKey)) || '{}') as Record<string, boolean>;
  const id = await currentTabId();
  return rec[id];
}

export async function setRecording(value: boolean) {
  const rec = JSON.parse((await getStorage(recordingKey)) || '{}') as Record<string, boolean>;
  const id = await currentTabId();
  rec[id] = value;
  setStorage(recordingKey, JSON.stringify(rec));
}

export async function isRecordingES() {
  const res = await new Promise<{ recording: boolean }>((resolve) => {
    sendMessage({ type: 'recording-state' }, undefined, false, resolve);
  });
  return res.recording;
}

export async function isRecording() {
  if (chrome.tabs) return await isRecordingBG();
  else return await isRecordingES();
}
