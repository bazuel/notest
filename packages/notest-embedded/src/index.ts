import { monitor } from './services/monitoring.service';
import { configuration } from './services/configuration.service';
import { NTEmbeddedConfiguration } from '@notest/common';

async function initNotest() {
  const configurations: NTEmbeddedConfiguration = await configuration.get();

  if (configurations?.paths?.length) {
    const isEntered = (url: string) =>
      configurations.paths.some((path) => path.startsWith(url)) && !monitor.running;
    const isExited = (url: string) =>
      !configurations.paths.some((path) => path.startsWith(url)) && monitor.running;

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
