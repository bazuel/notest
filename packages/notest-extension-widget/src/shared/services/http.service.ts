import { tokenService } from "./token.service";
import { messageService } from "../../services/message.service";

class HttpService {
  constructor(private baseUrl: string) {}

  get(url: string) {
    return messageService.sendMessage("fetch", { method: "GET", url }, true);
  }

  post(url: string, body: any) {
    return messageService.sendMessage(
      "fetch",
      { method: "POST", url, body },
      true
    );
  }
}

export const http = new HttpService(
  import.meta.env.VITE_SSO_BACKEND_URL + "/api"
);
