export async function getCookiesFromDomain(url: string) {
  const domain = getMainDomain(url);
  const cookieEvent = { name: 'cookie-details', type: 'cookie', details: {} };
  cookieEvent.details = await chrome.cookies.getAll({ domain });
  return cookieEvent;
}

function getMainDomain(url: string) {
  const { hostname } = new URL(url);
  const parts = hostname.split('.');
  const slice = parts.length > 2 ? -2 : -parts.length;
  return parts.slice(slice).join('.');
}

export async function cleanDomainCookies(tabId: number) {
  const tab = await chrome.tabs.get(tabId);
  const url = new URL(tab.url!);
  chrome.cookies.getAll({ domain: getMainDomain(tab.url!) }, function (cookies) {
    for (let i = 0; i < cookies.length; i++) {
      chrome.cookies.remove({ url: url.origin + cookies[i].path, name: cookies[i].name });
    }
  });
}

//TODO in clean session add all cookies after finish the session
