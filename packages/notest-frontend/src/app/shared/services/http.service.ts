import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenService } from './token.service';
import { environment } from '../../../environments/environment';
import { extensionService } from '../../notest-shared/services/extension.service';

@Injectable({ providedIn: 'root' })
export class HttpService {
  private prefix = '/api';

  constructor(private http: HttpClient, private token: TokenService) {}

  async rootUrl() {
    return (await extensionService.getCustomBackendUrl()) || environment.api;
  }

  setCustomBackendUrl(url: string) {
    extensionService.customBackendUrl = url;
  }

  async getCustomBackendUrl() {
    return (await extensionService.getCustomBackendUrl()) || '';
  }

  async backendIsCustom() {
    return (await this.rootUrl()) != environment.api;
  }

  client() {
    return this.http;
  }

  async url(path: string, usePrefix = true) {
    if (path.indexOf('http') == 0) return path;
    else return (await this.rootUrl()) + (usePrefix ? this.prefix : '') + path;
  }

  async gest<T>(
    path: string,
    payload,
    rawpath = false,
    usePrefix = true,
    additionalHeaders: { [h: string]: string } = {}
  ): Promise<T> {
    return this.get(
      `${path}${path.indexOf('?') > 0 && !path.endsWith('&') ? '&' : ''}${this.jsonToQueryString(
        payload,
        path.indexOf('?') > 0
      )}`,
      rawpath,
      usePrefix,
      additionalHeaders
    );
  }

  async get<T>(
    path: string,
    rawpath = false,
    usePrefix = true,
    additionalHeaders: { [h: string]: string } = {}
  ): Promise<T> {
    return this.makeRequest(async () => {
      return this.http
        .get<T>(
          rawpath ? path : await this.url(path, usePrefix),
          this.headerOptions(additionalHeaders)
        )
        .toPromise();
    });
  }

  downloadCSVFile(fullPath: string, filename: string) {
    const headers = {};
    headers['Authorization'] = 'Bearer ' + this.token.get();
    const options = {
      headers: new HttpHeaders(headers),
      observe: 'response',
      responseType: 'text'
    } as any;
    this.http.get(fullPath, options).subscribe((data: any) => {
      console.log('data: ', data.body);
      const aLink = document.createElement('a');
      aLink.download = filename + '.csv';
      aLink.href = 'data:text/csv;charset=UTF-8,' + encodeURIComponent(data.body);
      aLink.click();
    });
  }

  async getStreamImg(fullPath: string, filename: string = '') {
    return await fetch(fullPath, {
      method: 'GET',
      headers: new Headers({
        Authorization: 'Bearer ' + this.token.get()
      })
    })
      .then((response) => {
        let cd = response.headers.get('Content-Disposition');
        if (cd) {
          cd = cd.replace('attachment; filename=', '');
          cd = cd.replace(/"/g, '');
          filename = cd;
        }
        return response.blob();
      })
      .then((blob) => {
        return window.URL.createObjectURL(blob);
      });
  }

  downloadFile(fullPath: string, filename: string = '') {
    fetch(fullPath, {
      method: 'GET',
      headers: new Headers({
        Authorization: 'Bearer ' + this.token.get()
      })
    })
      .then((response) => {
        let cd = response.headers.get('Content-Disposition');
        if (cd) {
          cd = cd.replace('attachment; filename=', '');
          cd = cd.replace(/"/g, '');
          filename = cd;
        }
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        if (filename) a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
  }

  async rawGet(path: string, rawpath = false) {
    const headers = {};
    headers['Authorization'] = 'Bearer ' + this.token.get();
    const options = {
      headers: new HttpHeaders(headers),
      observe: 'response',
      responseType: 'blob'
    } as any;
    return this.makeRequest(async () => {
      return this.http.get(rawpath ? path : await this.url(path), options).toPromise();
    });
  }

  async delete(path: string, usePrefix = true) {
    return this.makeRequest(async () => {
      return this.http.delete(await this.url(path, usePrefix), this.headerOptions()).toPromise();
    });
  }

  async formPost<T>(path: string, params: { [p: string]: string } = {}, usePrefix = true) {
    const body = new URLSearchParams();
    for (const p in params) body.set(p, params[p]);

    const options = {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
    };

    return this.http
      .post(await this.url(path, usePrefix), body.toString(), options)
      .toPromise() as Promise<T>;
  }

  async post<T>(
    path: string,
    body,
    additionalHeaders: { [h: string]: string } = {},
    usePrefix = true
  ): Promise<any> {
    return this.makeRequest(async () => {
      return this.http
        .post(await this.url(path, usePrefix), body, {
          ...this.headerOptions(additionalHeaders)
        })
        .toPromise();
    });
  }

  async put(path: string, body, additionalHeaders: { [h: string]: string } = {}) {
    return this.makeRequest(async () => {
      return this.http
        .put(await this.url(path), body, this.headerOptions(additionalHeaders))
        .toPromise();
    });
  }

  async putWithOptions(path: string, body, options = {}) {
    return this.makeRequest(async () => {
      return this.http
        .put(await this.url(path), body, { ...this.headerOptions(), ...options })
        .toPromise();
    });
  }

  jsonToQueryString(json, excludeQuestionMark = false) {
    return (
      (excludeQuestionMark ? '' : '?') +
      Object.keys(json)
        .map((key) => {
          return encodeURIComponent(key) + '=' + encodeURIComponent(json[key]);
        })
        .join('&')
    );
  }

  async saveFile(url: string, name?) {
    const token = '';
    const postFix = `token=${token}`;
    if (url.indexOf('?') >= 0) url += '&' + postFix;
    else url += '?' + postFix;
    await saveFile(url, name);
  }

  private async makeRequest(r: () => Promise<any>) {
    try {
      const rawResult = await r();

      const result = rawResult.body;
      if (rawResult.status < 200 || rawResult.status >= 400) {
        console.log(result);
        throw new Error();
      } else {
        return result;
      }
    } catch (e: any) {
      let error;
      if (e instanceof Promise) {
        try {
          error = await e;
        } catch (er) {
          error = er;
        }
      } else error = e;
      if (e.error) error = e.error;
      console.error({ error: true, ...error });
      throw new Error(error);
    }
  }

  private headerOptions(customHeaders: { [h: string]: string } = {}) {
    const headers = { ...customHeaders };
    if (headers['token']) {
      headers['Authorization'] = 'Bearer ' + headers['token'];
    }

    const token = this.token.get();
    if (!headers['Authorization'] && token) headers['Authorization'] = 'Bearer ' + token;

    const options = {
      headers: new HttpHeaders(headers),
      observe: 'response'
    } as any;
    return options;
  }

  async upload(path: string, files: File[], extra: { [key: string]: string } = {}) {
    const formData = new FormData();
    for (let k in extra) formData.append(k, extra[k]);
    if (files.length == 1) formData.append('file', files[0]);
    else {
      for (let f = 0; f < files.length; f++) formData.append('file' + f, files[f]);
    }
    const response = await fetch(await this.url(path), {
      method: 'POST',
      body: formData
    });
    return await response.json();
  }
}

function saveFile(url, name) {
  return new Promise(function (resolve, reject) {
    // Get file name from url.
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function () {
      resolve(xhr);
    };
    xhr.onerror = reject;
    xhr.open('GET', url);
    xhr.send();
  }).then(function (xhr) {
    const filename = name ?? url.substring(url.lastIndexOf('/') + 1).split('?')[0];
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL((xhr as any).response); // xhr.response is a blob
    a.download = filename; // Set the file name.
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    return xhr;
  });
}
