import { monitor } from './services/monitoring.service';
import { configuration } from './services/configuration.service';
import { NTEmbeddedConfiguration } from '@notest/common';

async function initNotest() {
  const configurations: NTEmbeddedConfiguration = await configuration.get();

  if (configurations?.paths?.length) {
    const isEntered = (currentPath: string) =>
      configurations.paths.find((path) => path.startsWith(currentPath)) && !monitor.running;
    const isExited = (currentPath: string) =>
      !configurations.paths.find((path) => path.startsWith(currentPath)) && monitor.running;

    // @ts-ignore
    navigation.addEventListener('navigate', (nav: NavigateEvent) => {
      const path = new URL(nav.destination.url).pathname;
      console.log('page changed', path);
      setTimeout(() => {
        if (isEntered(path)) monitor.start();
        if (isExited(path)) monitor.stop();
      }, 100);
    });

    window.addEventListener('beforeunload', () => {
      if (monitor.running) monitor.stop();
    });
  }
}

initNotest();
