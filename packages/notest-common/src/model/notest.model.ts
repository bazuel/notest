import { BLEventName, BLEventType, BLSessionEvent } from "./events";

export interface NTInstrumentedEvent {
  project_name: string;
  script_type: "method" | "function";
  event_type:
    | "input"
    | "output"
    | "constructor"
    | "variable"
    | "expression"
    | "exception"
    | "text";
  event_value: any;
  line: number;
  script_name: string;
  filepath: string;
  fired: number;
  other?: any;
  created?: Date;
}

export type NTScriptType = "method" | "function";

export interface NTStatementInstrumenter {
  addCollector(
    script: NTScriptType,
    statement: any,
    filepath: string,
    functionName: string
  ): void;
}

export interface NTSession {
  nt_sessionid?: string;
  url: string;
  userid: number;
  reference: string;
  info: {
    title: string;
    description: string;
    targetList?: string[];
    loginReference?: string;
    isLogin?: boolean;
    session_logged: boolean;
    internal_error: boolean;
    backend_type: NTRunnerConfig["backendType"];
  };
  created?: Date | null;
}

export interface NTAssertion {
  original_reference: string;
  new_reference: string;
  info?: {
    last_event: BLSessionEvent;
    test_failed: boolean;
  };
}

export interface NTRunnerConfig {
  backendType: "mock" | "full";
  monitoring?: boolean;
  recordVideo?: boolean;
  isLoginSession?: boolean;
  takeScreenshot?: boolean;
  loginEvents?: BLSessionEvent[];
  sessionDomain?: string;
}

export type NTClusterMessage = {
  reference: string;
  backendType: "mock" | "full";
  sessionDomain?: string;
};

export interface NTEvent {
  nt_eventid: number;
  reference: string;
  url: string;
  name: BLEventName;
  type: BLEventType;
  sid: number;
  tab: number;
  timestamp: number;
  scope?: { [key: string]: any };
  data?: (BLSessionEvent & { [key: string]: any }) | {};
  data_path?: string; // a url pointing to a (BLSessionEvent & { [key: string]: any });
  created: Date | null;
}

export interface NTMedia {
  nt_media_id: number;
  reference: string;
  name: string;
  type: "image" | "video";
  created: Date | null;
  start: Date | null;
}

export const NTEventLabelsMap = {
  "after-response": "Request to server",
  "cookie-data": "Initial cookie data",
  "cookie-details": "Initial cookie details",
  "dom-change": "Dom changed",
  "dom-full": "Full dom loaded",
  "local-full": "Initial local Storage",
  "session-full": "Initial session Storage ",
  elementscroll: "Scroll on element",
  keydown: "Keydown on keyboard",
  keyup: "Keyup on keyboard",
  mousedown: "Mouse down on element",
  mousemove: "Mouse move",
  mouseup: "Mouse up on element",
  referrer: "Navigation",
  value: "Input on element",
  visibility: "Visibility change",
  click: "Click on element",
  input: "Input in element",
  scroll: "Scroll in element",
  resize: "Resize window",
};

export interface NTUser {
  nt_userid: string;
  name: string;
  surname: string;
  email: string;
  password: string;
  roles: string[];
  state: string;
  phone: string;
  created: Date;
}
