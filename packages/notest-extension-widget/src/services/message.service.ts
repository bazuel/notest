class MessageService {
  async sendMessage<T>(
    type: string,
    message: { [key: string]: any },
    waitForResponse = false
  ): Promise<T> {
    if (waitForResponse) {
      return await this.sendMessageWithResponse<T>(type, message);
    }
    postMessage({ type, message }, "*");
  }

  waitForMessage<T>(type: string): Promise<T> {
    return new Promise((r) => {
      const responseListener = (ev: MessageEvent) => {
        console.log(ev.data.type);
        if (ev.data.type == type) {
          r(ev.data);
          removeEventListener("message", responseListener);
        }
      };
      addEventListener("message", responseListener);
    });
  }

  private async sendMessageWithResponse<T>(
    type: string,
    message: { [key: string]: any }
  ) {
    const id = Math.random().toString(36).substring(7);
    return new Promise<T>((r) => {
      const responseListener = (ev: MessageEvent) => {
        if (ev.data.type == `${type}-response` && ev.data.id == id) {
          r(ev.data);
          removeEventListener("message", responseListener);
        }
      };
      addEventListener("message", responseListener);
      postMessage({ type, ...message, id }, "*");
    });
  }
}

export const messageService = new MessageService();
