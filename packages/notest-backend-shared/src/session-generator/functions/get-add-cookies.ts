export function getAddCookies(
  cookieDetails: { name: string; value: string; path: string; domain: string }[]
) {
  let scripts: string[] = [];
  scripts.push(`\nasync function addCookies(context) {`);
  cookieDetails.forEach((cookie) => {
    scripts.push(
      `await context.addCookies([{name:'${cookie.name}',value:'${cookie.value}',path:'${cookie.path}',domain:'${cookie.domain}'}]);`
    );
  });
  scripts.push(`}`);
  return scripts.join('\n');
}
