export async function getCookiesFromDomain(url) {
  const domain = new URL(url).hostname;
  const cookieEvent = { name: 'cookie-details', type: 'cookie', details: {} };
  cookieEvent.details = await chrome.cookies.getAll({ domain: domain });
  return cookieEvent;
}