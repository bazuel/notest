export async function getCurrentTab() {
  let active = { active: true, currentWindow: true };
  let lastFocused = { active: true, lastFocusedWindow: true };

  let [tab] = await chrome.tabs.query(active);
  if (!tab) [tab] = await chrome.tabs.query(lastFocused);

  return tab;
}
