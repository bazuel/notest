export function getUrlImage(reference : string) {
    return `${import.meta.env.VITE_SSO_BACKEND_URL}/api/media/screenshot-download?reference=${reference}&name=shot`
}