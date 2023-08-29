import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  imgSources: { [path: string]: string } = {};
  imgSourcesArray: { reference: string; name: string; loadImage: any; toLoad }[] = [];
  videoSources: { [path: string]: string } = {};
  private timeoutImageLoading: number = 125;

  constructor(private http: HttpService) {
    this.initImageLazyProcessing();
  }

  async getImgSource(reference: string, name: string) {
    const path = `${reference}&${name}`;
    if (this.imgSources[path]) return this.imgSources[path];
    this.imgSources[path] = await this.http.getStreamImg(
      await this.http.url(`/media/screenshot-download?reference=${reference}&name=${name}`)
    );
    return this.imgSources[path];
  }

  async getVideoSource(reference: string, name: string) {
    const path = `${reference}&${name}`;
    if (this.videoSources[path]) return this.videoSources[path];
    this.videoSources[path] = await this.http.getStreamImg(
      await this.http.url(`/media/video-download?reference=${reference}&name=${name}`)
    );
    return this.videoSources[path];
  }

  lazyloadImage(
    reference: string,
    name: string,
    loadImage: (img: string) => void,
    toLoad: () => boolean
  ) {
    this.imgSourcesArray.push({ reference, name, loadImage, toLoad });
  }

  private initImageLazyProcessing() {
    const checkImages = async () => {
      if (this.imgSourcesArray.length > 0) {
        const { reference, name, loadImage, toLoad } = this.imgSourcesArray.shift()!;
        if (!toLoad()) this.imgSourcesArray.push({ reference, name, loadImage, toLoad });
        else loadImage(await this.getImgSource(reference, name));
      }
      if (this.imgSourcesArray.length > 0) this.timeoutImageLoading = 10;
      else this.timeoutImageLoading = 125;
      setTimeout(checkImages, this.timeoutImageLoading);
    };
    checkImages();
  }
}
