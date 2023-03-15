import { tokenService } from "./token.service";

class HttpService {
  constructor(private baseUrl: string) {}

  get<T>(
    url: string,
    progress?: (percentage, loaded?, total?) => void
  ): Promise<T> {
    return this.makeRequest(
      { method: "GET", url: this.baseUrl + url },
      true,
      progress
    );
  }

  post(url: string, body: any) {
    return this.makeRequest(
      { method: "POST", url: this.baseUrl + url, body },
      true
    );
  }

  async makeRequest(
    request: { method: "GET" | "POST"; headers?: any; body?; url: string },
    loginRequired = false,
    progress?: (percentage, loaded?, total?) => void
  ) {
    const options: any = {
      method: request.method,
      headers: { ...request.headers },
    };

    if (request.method == "POST") {
      if (request.body instanceof FormData) {
        options.body = request.body;
        delete options.headers["Content-Type"];
      } else {
        options.body = JSON.stringify(request.body);
        options.headers["Content-Type"] = "application/json";
      }
    }
    let token = await tokenService.getToken();
    console.log("token request", token);
    if (loginRequired && token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    let promise: Promise<any> = new Promise((res, rej) => {
      let xhr = new XMLHttpRequest();
      xhr.open(options.method || "GET", request.url, true);
      if (options.headers) {
        Object.keys(options.headers).forEach((key) => {
          xhr.setRequestHeader(key, options.headers[key]);
        });
      }
      xhr.onprogress = (e) => {
        if (progress && e.lengthComputable) {
          progress(e.loaded / e.total, e.loaded, e.total);
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          let result = xhr.response;
          try {
            result =
              typeof xhr.response === "string"
                ? JSON.parse(xhr.response)
                : xhr.response;
          } catch (e) {
            //ignore
          }
          if (progress) {
            progress(1); // indicate request has finished to non supported progress requests
          }
          res(result);
        } else {
          rej(xhr.statusText);
        }
      };
      xhr.onerror = () => rej(xhr.statusText);
      request.method == "POST" ? xhr.send(options.body) : xhr.send();
    });

    return promise;
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
