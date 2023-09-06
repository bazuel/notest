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

export interface NTBattery {
  nt_batteryid?: string;
  name: string;
  userid: number;
  active: boolean;
  scheduled_time: string;
  type: NTTest;
  session_list: string[];
  backend_type: "full" | "mock";
  created?: Date | null;
}

/**
 * Represents a session for the NoTest app.
 *
 * @interface
 * @name NTSession
 *
 * @property {string} nt_sessionid - The session ID.
 * @property {string} url - The URL associated with the session.
 * @property {number} userid - The user ID associated with the session.
 * @property {string} reference - A reference string associated with the session.
 * @property {object} info - Additional information about the session.
 * @property {string} info.title - The title of the session.
 * @property {string} info.description - The description of the session.
 * @property {DOMRect[]} [info.targetList] - A list of target DOMRect objects used for visual assertion captured during the session.
 * @property {string} [info.loginReference] - A login reference string.
 * @property {boolean} [info.isLogin] - Indicates if the session is a login session.
 * @property {boolean} info.session_logged - Indicates if the session is logged.
 * @property {boolean} info.internal_error - Indicates if there was an internal error in the session.
 * @property {string} info.backend_type - The backend type associated with the session.
 * @property {Date | null} [created] - The date and time when the session was created.
 */
export interface NTSession {
  nt_sessionid?: string;
  url: string;
  userid: number;
  reference: string;
  info: {
    e2eScript: string;
    title: string;
    description: string;
    targetList?: DOMRect[];
    loginReference?: string;
    isLogin?: boolean;
    session_logged: boolean;
    internal_error: boolean;
    backend_type: NTRunnerConfig["backendType"];
  };
  created?: Date | null;
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
  batteryId?: string;
  runTimestamp?: number;
};

export type NTTest = "e2e" | "unit";

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
  type: "image" | "video" | "assertion";
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

export type NTRole = "ADMIN" | "USER" | "DEVELOPER" | "TESTER";

export const NTRoleMap: { name: string; value: NTRole }[] = [
  { name: "Administrator", value: "ADMIN" },
  { name: "User", value: "USER" },
  { name: "Developer", value: "DEVELOPER" },
  { name: "Tester", value: "TESTER" },
];

export const NTRoleLabelsMap: Record<NTRole, string> = {
  ADMIN: "Administrator",
  USER: "User",
  DEVELOPER: "Developer",
  TESTER: "Tester",
};

export interface NTUser {
  nt_userid: string;
  name: string;
  surname: string;
  email: string;
  password: string;
  roles: NTRole[];
  state: string;
  phone: string;
  domains?: string[];
  created: Date;
  api_token: string;
}

export type NTScreenshot = {
  name: string;
  data: Buffer;
  fired: Date;
  type: "image" | "assertion";
};
