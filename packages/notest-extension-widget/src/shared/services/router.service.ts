class RouterService {
  async navigateByUrl(url: string, params?: { [k: string]: string }) {
    const query = Object.entries(params || {})
      .map(([k, v]) => `${k}=${v}`)
      .join("&");
    window.open(`${url}?${query}`);
  }
}

export const router = new RouterService();
