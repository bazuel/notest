import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {
  transform(input: string, query?: string): any {
    try {
      if (!query || query == '') return input;
      //'i' for case insensitive. Remove 'i' if you  want the search to be case sensitive
      const re = new RegExp(`(${query})`, 'gi');
      return input.replace(re, '<b>$1</b>');
    } catch (e) {
      return input;
    }
  }
}
