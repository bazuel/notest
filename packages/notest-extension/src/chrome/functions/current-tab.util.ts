export async function getCurrentTab() {
  let active = { active: true, currentWindow: true };
  let lastFocused = { active: true, lastFocusedWindow: true };

  let [tab] = await chrome.tabs.query(active);
  if (!tab) [tab] = await chrome.tabs.query(lastFocused);

  return tab;
}

export async function currentUrl() {
  const tab = await getCurrentTab();
  return tab.url;
}

export async function currentTabId() {
  const tab = await getCurrentTab();
  return tab.id!;
}
