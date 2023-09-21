let originalWebSocket = window.WebSocket;

class CustomWebSocket extends originalWebSocket {
  originalSend;

  revertFunctions = [];

  constructor(url, protocols) {
    super('ws://localhost:3005' + url, protocols);

    this.originalSend = this.send;

    const revertSend = observeMethod(this, 'send', (data) => {});

    const revertAddEventListener = observeMethod(this, 'addEventListener', (event, callback) => {});

    this.revertFunctions.push(revertSend);
    this.revertFunctions.push(revertAddEventListener);
  }
}

window.WebSocket = CustomWebSocket;
