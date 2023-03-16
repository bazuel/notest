import { environment } from '../../environments/environment';
import { getStorage } from '../../content_scripts/storage';

class HttpService {
  constructor(private baseUrl: string) {}

  async get(url: string) {
    return await this.makeRequest({ method: 'GET', url: this.baseUrl + url });
  }

  async post(url: string, body: any) {
    return await this.makeRequest({ method: 'POST', url: this.baseUrl + url, body });
  }

  async makeRequest(request: { method: 'GET' | 'POST'; headers?: any; body?; url: string }) {
    const options: any = {
      method: request.method,
      headers: { ...request.headers }
    };
    if (request.body instanceof FormData) {
      options.body = request.body;
      delete options.headers['Content-Type'];
    } else {
      options.body = JSON.stringify(request.body);
      options.headers['Content-Type'] = 'application/json';
    }
    let token = await getStorage('NOTEST_TOKEN');
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    return await fetch(request.url, options).then(async (res) => await res.json());
  }
}
export const http = new HttpService(environment.api + '/api');
