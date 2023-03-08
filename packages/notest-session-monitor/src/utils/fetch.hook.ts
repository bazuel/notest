export function buildFetchHook(): { fetch } {
  const support = {
    searchParams: "URLSearchParams" in self,
    iterable: "Symbol" in self && "iterator" in Symbol,
    blob:
      "FileReader" in self &&
      "Blob" in self &&
      (function () {
        try {
          new Blob();
          return true;
        } catch (e) {
          return false;
        }
      })(),
    formData: "FormData" in self,
    arrayBuffer: "ArrayBuffer" in self,
  };

  function parseHeaders(rawHeaders) {
    let headers = new Headers();
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    let preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, " ");
    preProcessedHeaders.split(/\r?\n/).forEach(function (line) {
      let parts = line.split(":");
      let key = parts.shift().trim();
      if (key) {
        let value = parts.join(":").trim();
        headers.append(key, value);
      }
    });
    return headers;
  }

  function fetch(input, init) {
    return new Promise(async function (resolve, reject) {
      const inputIsRequest = input instanceof Request;
      let request = inputIsRequest ? input : new Request(input, init);

      if (request.signal && request.signal.aborted) {
        return reject(new DOMException("Aborted", "AbortError"));
      }

      let xhr: any = new XMLHttpRequest();

      function abortXhr() {
        xhr.abort();
      }

      xhr.onload = function () {
        let options: any = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || ""),
        };
        options.url =
          "responseURL" in xhr
            ? xhr.responseURL
            : options.headers.get("X-Request-URL");
        let body = "response" in xhr ? xhr.response : xhr.responseText;
        setTimeout(function () {
          let rs = new Response(body, options);
          Object.defineProperty(rs, "url", { value: request.url });
          resolve(rs);
        }, 0);
      };

      xhr.onerror = function () {
        setTimeout(function () {
          reject(new TypeError("Network request failed"));
        }, 0);
      };

      xhr.ontimeout = function () {
        setTimeout(function () {
          reject(new TypeError("Network request failed"));
        }, 0);
      };

      xhr.onabort = function () {
        setTimeout(function () {
          reject(new DOMException("Aborted", "AbortError"));
        }, 0);
      };

      function fixUrl(url) {
        try {
          return url === "" && self.location.href ? self.location.href : url;
        } catch (e) {
          return url;
        }
      }

      xhr.open(request.method, fixUrl(request.url), true);

      if (request.credentials === "include") {
        xhr.withCredentials = true;
      } else if (request.credentials === "omit") {
        xhr.withCredentials = false;
      }

      if ("responseType" in xhr) {
        if (support.blob) {
          xhr.responseType = "blob";
        } else if (
          support.arrayBuffer &&
          (request.headers?.get("Content-Type") ?? "").indexOf(
            "application/octet-stream"
          ) !== -1
        ) {
          xhr.responseType = "arraybuffer";
        }
      }

      request.headers.forEach(function (value, name) {
        const skipIfFormData =
          init && init.body instanceof FormData && name.toLowerCase() == "content-type";
        if (!skipIfFormData) xhr.setRequestHeader(name, value);
      });

      if (request.signal) {
        request.signal.addEventListener("abort", abortXhr);

        xhr.onreadystatechange = function () {
          // DONE (success or failure)
          if (xhr.readyState === 4) {
            request.signal.removeEventListener("abort", abortXhr);
          }
        };
      }

      let body = init?.body ?? undefined;
      if (inputIsRequest) body = await input.blob();
      xhr.send(body);
    });
  }

  fetch.polyfill = true;

  return {
    fetch,
  };
}
