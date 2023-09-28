import { loggedWritable } from '../shared/utils/store.util';

export let sessionStore = loggedWritable<SessionInfo>({
  title: '',
  description: '',
  targetList: [],
  images: [],
  screenshot: ''
});

export function updateSessionTitle(title: string) {
  sessionStore.update({ title });
}

export function updateSessionDescription(description: string) {
  sessionStore.update({ description });
}

export function updateSessionScreenshot(screenshot: string) {
  sessionStore.update({ screenshot });
}

export function updateSessionTargetList(target: DOMRect | DOMRect[]) {
  if (Array.isArray(target)) {
    sessionStore.update((prevStore) => ({
      targetList: [...prevStore.targetList, ...target]
    }));
  } else {
    sessionStore.update((prevStore) => ({
      targetList: [...prevStore.targetList, target]
    }));
  }
}

export function updateSessionImages(image: string | { name: string; reference: string }) {
  sessionStore.update((prevStore) => ({
    images: [...prevStore.images, image]
  }));
}

export function removeSessionImage(image: string) {
  sessionStore.update((prevStore) => ({
    images: prevStore.images.filter((img) => img !== image)
  }));
}

export function initSessionStore() {
  sessionStore.update({
    title: '',
    description: '',
    targetList: [],
    images: [],
    screenshot: ''
  });
}

export type SessionInfo = {
  title: string;
  description: string;
  targetList: DOMRect[];
  images: (string | { name: string; reference: string })[];
  screenshot: string;
};
