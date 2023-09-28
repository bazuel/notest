import { extensionService } from '../services/extension.service';

export async function getUrlImage(reference: string) {
  const baseUrl =
    (await extensionService.getCustomBackendUrl()) || import.meta.env.VITE_SSO_BACKEND_URL;
  console.log('getUrlImage', baseUrl);
  return `${baseUrl}/api/media/screenshot-download?reference=${reference}&name=shot`;
}

export function getPathImage(reference: string, name: string) {
  return `/media/screenshot-download?reference=${reference}&name=${name}&base64=true`;
}
