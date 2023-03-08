import { BLSessionEvent, BLStorageEvent } from '@notest/common';
import { findEventsByName } from '../../shared/functions/find-events-by-name';

export function getAddInitScript(session: BLSessionEvent[]) {
  const localStorage = findEventsByName<BLStorageEvent>(session, 'local-full');
  const sessionStorage = findEventsByName<BLSessionEvent>(session, 'session-full');
  let scripts: string[] = [];
  scripts.push(`await page.addInitScript(() => {`);
  if (localStorage)
    Object.entries(localStorage.storage).forEach(([key, value]) => {
      scripts.push(`localStorage.setItem('${key}', '${value}')`);
    });
  if (sessionStorage)
    Object.entries(sessionStorage.storage).forEach(([key, value]) => {
      scripts.push(`sessionStorage.setItem('${key}', '${value}')`);
    });
  scripts.push(`});`);
  return scripts.join('\n');
}
