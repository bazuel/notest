class RecordingService {
  private _reference: string;

  constructor() {
    //add event listener on sessionStorage
    addEventListener("message", (ev: MessageEvent) => {
      if (ev.data.type === "reference") this.saveReference(ev.data.data);
    });
  }

  start() {
    localStorage.setItem("nt-recording", "1");
    postMessage({ type: "start-recording" }, "*");
  }

  stop() {
    localStorage.setItem("nt-recording", "0");
    postMessage({ type: "stop-recording" }, "*");
  }

  cancel() {
    localStorage.setItem("nt-recording", "0");
    postMessage({ type: "cancel-recording" }, "*");
  }

  save(sessionInfo: {
    title: string;
    description: string;
    targetList: any[];
    isLogin: boolean;
    reference: string;
  }) {
    postMessage({ type: "save-session", data: sessionInfo }, "*");
  }

  get recording() {
    return localStorage.getItem("nt-recording") === "1";
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
