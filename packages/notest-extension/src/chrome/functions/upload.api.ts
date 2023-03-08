import { JsonCompressor, BLEvent, NTSession } from '@notest/common';
import { environment } from '../../environments/environment';

export async function uploadEvents(url: string, events: BLEvent[], sessionInfo: NTSession['info']) {
  const zip = await new JsonCompressor().zip(events);
  const token = (await chrome.storage.local.get('NOTEST_TOKEN'))['NOTEST_TOKEN'];
  const formData = new FormData();
  // params should be sent before files otherwise they can be null at the backend since the file was not fully loaded
  formData.append('url', url);
  formData.append('session_info', JSON.stringify(sessionInfo));
  formData.append('file', new Blob([zip], { type: 'application/zip' }), Date.now() + '.zip');
  fetch(`${environment.api}/api/session/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
    .then(function (resp) {
      return resp.json();
    })
    .then(function (json) {
      console.log(json);
    });
}
