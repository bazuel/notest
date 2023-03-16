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

  async getStreamImg(path: string, filename: string = "") {
    const fullPath = this.baseUrl + path;
    return await fetch(fullPath, {
      method: "GET",
      headers: new Headers({
        Authorization: "Bearer " + (await tokenService.getToken()),
      }),
    })
      .then((response) => {
        let cd = response.headers.get("Content-Disposition");
        if (cd) {
          cd = cd.replace("attachment; filename=", "");
          cd = cd.replace(/"/g, "");
          filename = cd;
        }
        return response.blob();
      })
      .then((blob) => {
        return window.URL.createObjectURL(blob);
      });
  }
}

export const http = new HttpService(
  import.meta.env.VITE_SSO_BACKEND_URL + "/api"
);
