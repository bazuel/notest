import { NTUser } from '@notest/common';
import { http } from './chrome/services/http.service';
import { getCurrentTab } from './chrome/functions/current-tab.util';

const switchElement = window.document.getElementById('switch') as HTMLInputElement;
let currentUrl = '';
getCurrentTab().then((tab) => {
  currentUrl = new URL(tab.url!).hostname;
  http.get('/user/get-user').then((user: NTUser) => {
    if (user?.domains?.includes(currentUrl)) {
      switchElement.checked = true;
    }
  });
});

switchElement.addEventListener('change', () => {
  http.get('/user/get-user').then((user: NTUser) => {
    if (switchElement.checked) {
      if (user.domains) user.domains!.push(currentUrl);
      else {
        user.domains = [];
        user.domains.push(currentUrl);
      }
      http.post('/user/update', { user });
    } else {
      user.domains = user.domains!.filter((domain) => domain != currentUrl);
      http.post('/user/update', { user });
    }
  });
});
