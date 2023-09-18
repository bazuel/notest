import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AssetLoader {
  private alreadyLoaded(url: string, type: 'script' | 'style') {
    let selector = `script[src="${url}"]`;
    if (type == 'style') selector = `link[href="${url}"]`;
    return document.querySelectorAll(selector).length > 0;
  }

  loadScript(src: string, options = { loadAsync: false }) {
    return new Promise<any>((resolve, reject) => {
      if (this.alreadyLoaded(src, 'script')) {
        console.log('script already loaded. skipping ' + src);
        resolve('');
      } else {
        const script = document.createElement('script');
        document.head.appendChild(script);
        script.onload = resolve;
        script.onerror = reject;
        if (options.loadAsync) script.async = true;
        script.src = src;
      }
    });
  }
  loadStyle(url: string, options = { loadAsync: false }) {
    return new Promise<any>((resolve, reject) => {
      if (this.alreadyLoaded(url, 'style')) {
        console.log('style already loaded. skipping ' + url);
        resolve('');
      } else {
        const link = document.createElement('link');
        document.head.appendChild(link);
        link.onload = resolve;
        link.onerror = reject;
        link.rel = 'stylesheet';
        link.href = url;
      }
    });
  }
}
