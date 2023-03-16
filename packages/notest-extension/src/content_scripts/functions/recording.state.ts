export async function isRecording() {
  const rec = await chrome.storage.local.get('recording');
  return rec["recording"];
}

export async function setRecording(value: boolean) {
  await chrome.storage.local.set({ recording: value });
}
