import { BLMonitor } from '@notest/common';
import { blevent } from '../model/dispatched.events';

export class SocketMonitor implements BLMonitor {
  private OriginalWebSocket!: typeof WebSocket;

  disable(): void {
    window.WebSocket = this.OriginalWebSocket;
  }

  enable(): void {
    this.OriginalWebSocket = WebSocket;

    class CustomWebSocket extends WebSocket {
      constructor(url: string, protocols?: string | string[]) {
        super(url, protocols);

        this.addEventListener('message', function (event) {
          console.log('message', event, this.url);
          // const [topic, message] = parseSocketData(event.data);
          blevent.socket.message({ value: { url: this.url, data: event.data } });
        });

        this.addEventListener('open', function () {
          console.log('open', this.url);
          blevent.socket.open({ value: { url: this.url } });
        });

        this.addEventListener('close', function (event) {
          console.log('close', event);
          blevent.socket.close({
            value: {
              code: event.code,
              reason: event.reason,
              url: this.url
            }
          });
        });

        this.addEventListener('error', () => blevent.socket.error({}));

        const originalSend = this.send;

        this.send = function (this, data: string) {
          console.log('send', data);
          // const [topic, message] = parseSocketData(data);

          blevent.socket.send({ value: { url: this.url, data } });
          originalSend.call(this, data);
        };
      }
    }

    window.WebSocket = CustomWebSocket as any;
  }
}

function parseSocketData(data: string) {
  try {
    if (data.includes('[')) {
      const cleanedMessage = data.replace(/^\d+\[/, '[');
      return JSON.parse(cleanedMessage);
    }
    return ['', data];
  } catch (e) {
    console.log('error: ', data);
    return ['', data];
  }
}
