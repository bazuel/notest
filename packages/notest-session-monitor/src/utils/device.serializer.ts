import { DeviceInfo } from '@notest/common';

export class DeviceSerializer {
  serialize() {
    const userAgent = navigator.userAgent;

    const screen = JSON.parse(
      JSON.stringify(window.screen, [
        'availHeight',
        'availWidth',
        'colorDepth',
        'height',
        'width',
        'pixelDepth'
      ])
    );
    try {
      screen.orientation = window.screen.orientation.type + ' ' + window.screen.orientation.angle;
    } catch (e) {}
    const dpi = window.devicePixelRatio;

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timeZoneOffset = new Date().getTimezoneOffset();

    const language = navigator.language;
    const platform = navigator.platform;
    const vendor = navigator.vendor;
    const cpuCores = navigator.hardwareConcurrency;
    const gpu = this.gpuInfo();

    let info: DeviceInfo = {
      userAgent,
      screen,
      dpi,
      timeZone,
      timeZoneOffset,
      language,
      platform,
      vendor,
      cpuCores,
      gpu
    };
    return info;
  }

  private gpuInfo(): DeviceInfo['gpu'] {
    try {
      let w = window as any;
      const performance =
        w.performance || w.mozPerformance || w.msPerformance || w.webkitPerformance || {};

      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('experimental-webgl') as any;

      const renderer = gl.getParameter(gl.RENDERER);
      const vendor = gl.getParameter(gl.VENDOR);

      const getUnmaskedInfo = (gl) => {
        var unMaskedInfo = {
          renderer: '',
          vendor: ''
        };

        var dbgRenderInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (dbgRenderInfo != null) {
          unMaskedInfo.renderer = gl.getParameter(dbgRenderInfo.UNMASKED_RENDERER_WEBGL);
          unMaskedInfo.vendor = gl.getParameter(dbgRenderInfo.UNMASKED_VENDOR_WEBGL);
        }

        return unMaskedInfo;
      };

      const vendor2 = getUnmaskedInfo(gl).vendor;
      const renderer2 = getUnmaskedInfo(gl).renderer;

      return { performance, renderer, renderer2, vendor, vendor2 };
    } catch (e) {
      return {} as any;
    }
  }
}
