import {strFromU8, unzip} from "fflate";

export async function unzipJson<T>(
  zipBuffer: Buffer
): Promise<T> {
  return await new Promise(async (s, e) => {
    unzip(new Uint8Array(zipBuffer), async (err, data) => {
      if (err) e(err);
      const filename = Object.keys(data)[0];
      const raw = strFromU8(data[filename]);
      s(JSON.parse(raw) as T);
    });
  });
}
