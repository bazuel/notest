import { environment } from '../environments/environment';
import { Json } from '@notest/common/dist/model/json.type';

class HttpService {
  constructor(private _baseUrl: string) {}

  private url(path: string) {
    return this._baseUrl + path;
  }

  async get(url: string) {
    return await this.makeRequest({ method: 'GET', url: this.url(url) });
  }

  async gest(url: string, params: Record<string, string>) {
    const urlParams = new URLSearchParams(params);
    return await this.makeRequest({
      method: 'GET',
      url: this.url(url + '?' + urlParams.toString())
    });
  }

  async post(url: string, body: any) {
    return await this.makeRequest({ method: 'POST', url: this.url(url), body });
  }

  async makeRequest(request: {
    method: 'GET' | 'POST';
    headers?: Record<string, string>;
    body?: Json;
    url: string;
  }) {
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
    // options.headers['Authorization'] = `Bearer ${token}`;

    return await fetch(request.url, options).then(async (res) => await res.json());
  }
}

export const http = new HttpService(environment.api + '/api');
