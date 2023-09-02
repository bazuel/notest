class MessageService {
  async sendMessage<T>(
    type: string,
    data: { [key: string]: any },
    waitForResponse = false
  ): Promise<T> {
    if (waitForResponse) {
      return await this.sendMessageWithResponse<T>(type, data);
    }
    postMessage({ type, data }, '*');
  }

  waitForMessage<T>(type: string): Promise<T> {
    return new Promise((r) => {
      const responseListener = (ev: MessageEvent) => {
        if (ev.type == type) {
          r(ev.data);
          removeEventListener('message', responseListener);
        }
      };
      this.addMessageListener(responseListener);
    });
  }

  private async sendMessageWithResponse<T>(type: string, data: { [key: string]: any }) {
    const id = Math.random().toString(36).substring(7);
    return new Promise<T>((r) => {
      const responseListener = (ev: MessageEvent) => {
        if (ev.type == `${type}-response` && ev.data.id == id) {
          r(ev.data);
          removeEventListener('message', responseListener);
        }
      };
      this.addMessageListener(responseListener);
      data.id = id;
      postMessage({ type, data }, '*');
    });
  }

  addMessageListener(callback: (message) => any | Promise<any>) {
    addEventListener('message', (ev) => callback(ev.data));
  }
}

export const messageService = new MessageService();
