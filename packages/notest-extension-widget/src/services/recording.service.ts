class RecordingService {
  private _reference: string;

  constructor() {
    //add event listener on sessionStorage
    window.addEventListener("message", (ev: MessageEvent) => {
      if (ev.data.type === "reference") this.saveReference(ev.data.data);
    });
  }

  start() {
    window.localStorage.setItem("nt-recording", "1");
    window.postMessage({ type: "start-recording" }, "*");
  }

  stop() {
    window.localStorage.setItem("nt-recording", "0");
    window.postMessage({ type: "stop-recording" }, "*");
  }

  cancel() {
    window.localStorage.setItem("nt-recording", "0");
    window.postMessage({ type: "cancel-recording" }, "*");
  }

  save(sessionInfo: {
    title: string;
    description: string;
    targetList: any[];
    isLogin: boolean;
  }) {
    window.postMessage({ type: "save-session", data: sessionInfo }, "*");
  }

  get recording() {
    return window.localStorage.getItem("nt-recording") === "1";
  }

  saveReference(reference: string) {
    this._reference = reference;
  }

  get reference() {
    return this._reference;
  }

  async referenceAvailable() {
    return new Promise<boolean>((resolve, reject) => {
      setTimeout(() => {
        if (this._reference) resolve(true);
        else reject("Reference not found");
      }, 1000);
    });
  }
}

export const recordingService = new RecordingService();
