export async function getCookiesFromDomain(url) {
  const domain = new URL(url).hostname;
  const cookieEvent = { name: 'cookie-details', type: 'cookie', details: {} };
  cookieEvent.details = await chrome.cookies.getAll({ domain: domain });
  return cookieEvent;
}

export async function cleanDomainCookies(tabId: number) {
  const tab = await chrome.tabs.get(tabId);
  const url = new URL(tab.url!);
  chrome.cookies.getAll({ domain: url.hostname }, function (cookies) {
    for (let i = 0; i < cookies.length; i++) {
      chrome.cookies.remove({ url: url.origin + cookies[i].path, name: cookies[i].name });
    }
  });
}
