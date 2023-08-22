import { extensionService } from '../services/extension.service';

export async function getUrlImage(reference: string) {
  const baseUrl =
    (await extensionService.getCustomBackendUrl()) || import.meta.env.VITE_SSO_BACKEND_URL;
  return `${baseUrl}/api/media/screenshot-download?reference=${reference}&name=shot`;
}
