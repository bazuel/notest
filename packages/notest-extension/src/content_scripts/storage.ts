import { addMessageListener, NTStorageMessage, sendMessage } from './message.api';

addMessageListener((message: NTStorageMessage) => {
  if (message.type === 'set-storage') setStorage(message.data!.key, message.data!.value);
  if (message.type === 'get-storage') sendStorage(message.data!.key, message.data!.id);
}, true);

function setStorage(key: string, value: string) {
  chrome.storage.local.set({ [key]: value });
}

function sendStorage(key: string, id: string) {
  chrome.storage.local.get(key, (data) => {
    sendMessage(
      { type: 'get-storage-response', data: { key, value: data[key], id } },
      undefined,
      true
    );
  });
}

export function getStorage(key: string): Promise<string | undefined> {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (data) => resolve(data[key]));
  });
}
