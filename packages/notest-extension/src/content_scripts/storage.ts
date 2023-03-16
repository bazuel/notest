addEventListener('message', (ev: MessageEvent) => {
  if (ev.data.type === 'set-storage') setStorage(ev.data.key, ev.data.value);
  if (ev.data.type === 'get-storage') getStorage(ev.data.key, ev.data.id);
});

function setStorage(key: string, value: string) {
  chrome.storage.local.set({ [key]: value });
}

function getStorage(key: string, id: string) {
  chrome.storage.local.get(key, (data) => {
    postMessage({ type: 'get-storage-response', key, value: data[key], id }, '*');
  });
}
