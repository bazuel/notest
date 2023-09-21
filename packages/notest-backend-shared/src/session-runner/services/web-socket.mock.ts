export function mockSocket() {
  const originalWebSocket = window.WebSocket;

  class CustomWebSocket extends originalWebSocket {
    originalSend: (data: string) => void;

    constructor(url: string, protocols?: string | string[]) {
      super(url, protocols);

      this.originalSend = this.send;

      // Overwrite the `send` function to prevent actual sending
      this.send = function (this, data: string) {
        console.log('Block sending message', data);
      };

      this.addEventListener('message', function (event) {
        console.log('Mocked message from', this.url);
        this.dispatchEvent(new MessageEvent('message', { data: '' }));
      });

      this.addEventListener('open', function () {
        console.log('Mocked open from', this.url);
        // this.dispatchEvent(new Event('open'));
      });

      this.addEventListener('close', function (event) {
        console.log('Mocked close from', event);
        this.dispatchEvent(new CloseEvent('close'));
      });

      this.addEventListener('error', function (event) {
        console.log('error', event);
      });
    }
  }

  window.WebSocket = CustomWebSocket as any;

  // To revert to the original WebSocket implementation, you can do `window.WebSocket = originalWebSocket;`
}
