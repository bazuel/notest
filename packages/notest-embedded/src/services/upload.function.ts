import { BLEvent, DOMJson, JsonCompressor, NTSession } from '@notest/common';
import { environment } from '../environments/environment';

export async function uploadEvents(events: BLEvent[], url: string, sessionInfo: NTSession['info']) {
  const zip = await new JsonCompressor().zip(events);
  const formData = new FormData();
  // params should be sent before files otherwise they can be null at the backend since the file was not fully loaded
  formData.append('url', url);
  formData.append('session_info', JSON.stringify(sessionInfo));
  formData.append('file', new Blob([zip], { type: 'application/zip' }), Date.now() + '.zip');
  fetch(`${environment.api}/api/session/upload`, {
    method: 'POST',
    body: formData
  })
    .then(async function (resp) {
      try {
        return await resp.json();
      } catch {
        console.log(await resp.text());
      }
    })
    .then(function (json) {
      console.log(json);
    });
}

export async function uploadShot(data: { fullDom: DOMJson; reference: string }) {
  const zip = await new JsonCompressor().zip(data);
  const formData = new FormData();
  formData.append('file', new Blob([zip], { type: 'application/zip' }), Date.now() + '.zip');
  return await fetch(`${environment.api}/api/session/shot`, {
    method: 'POST',
    body: formData
  });
}
