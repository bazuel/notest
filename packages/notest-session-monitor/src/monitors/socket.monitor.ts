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

        this.addEventListener('message', (event) => {
          const [topic, message] = parseSocketData(event.data);
          blevent.socket.message({ value: { topic, message } });
        });

        this.addEventListener('open', () => {
          blevent.socket.open({ value: { url: this.url, protocol: this.protocol } });
        });

        this.addEventListener('close', (event) => {
          blevent.socket.close({
            value: {
              code: event.code,
              reason: event.reason,
              url: this.url,
              protocol: this.protocol
            }
          });
        });

        this.addEventListener('error', () => blevent.socket.error({}));

        const originalSend = this.send;

        this.send = function (this, data: string) {
          const [topic, message] = parseSocketData(data);

          blevent.socket.send({ value: { topic, message } });
          originalSend.call(this, data);
        };
      }
    }

    console.log('WebSocketProxy initialized', window.WebSocket);

    window.WebSocket = CustomWebSocket as any;
  }
}

function parseSocketData(data: string) {
  try {
    if (data.includes('[')) {
      const cleanedMessage = data.replace(/^\d+\[/, '[');
      return JSON.parse(cleanedMessage);
    }
    console.log('data: ', data);
    return ['', data];
  } catch (e) {
    console.log('error: ', data);
    return ['', data];
  }
}
