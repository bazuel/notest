import { monitor } from './services/monitoring.service';
import { configuration } from './services/configuration.service';
import { NTMonitorConfiguration } from '@notest/common';

async function initNotest() {
  const configurations: NTMonitorConfiguration = await configuration.get();

  if (configurations?.urlStart) {
    const isEntered = (url: string) => url.startsWith(configurations.urlStart!) && !monitor.running;
    const isExited = (url: string) => !url.startsWith(configurations.urlStart!) && monitor.running;

    setInterval(() => {
      const url = window.location.href;
      if (isEntered(url)) monitor.start();
      if (isExited(url)) monitor.stop().then((r) => console.log('stopped, events saved:', r));
    });

    window.addEventListener('beforeunload', () => {
      if (monitor.running) monitor.stop().then((r) => console.log('stopped, events saved:', r));
    });
  }
}

initNotest();
