import { addMessageListener, NTStorageMessage, sendMessage } from './message.api';

addMessageListener((message: NTStorageMessage) => {
  console.log('storage message', message);
  if (message.type === 'set-storage') setStorage(message.data!.key, message.data!.value);
  if (message.type === 'get-storage') getStorage(message.data!.key, message.data!.id);
}, true);

function setStorage(key: string, value: string) {
  chrome.storage.local.set({ [key]: value });
}

function getStorage(key: string, id: string) {
  chrome.storage.local.get(key, (data) => {
    sendMessage(
      { type: 'get-storage-response', data: { key, value: data[key], id } },
      undefined,
      true
    );
  });
}
