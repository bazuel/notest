import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl'
})
export class SafeUrlPipe implements PipeTransform {
  constructor(protected sanitizer: DomSanitizer) {}
  transform(value: any): unknown {
    return this.sanitizer.bypassSecurityTrustUrl(value);
  }
}

@Pipe({
  name: 'safeResourceUrl'
})
export class SafeResourceUrlPipe implements PipeTransform {
  constructor(protected sanitizer: DomSanitizer) {}
  transform(value: any): unknown {
    return this.sanitizer.bypassSecurityTrustResourceUrl(value);
  }
}

@Pipe({
  name: 'safeHtml'
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(protected sanitizer: DomSanitizer) {}
  transform(value: any): unknown {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}
