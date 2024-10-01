import { AxiosResponse } from "axios";
import { Logger } from "./logger";

const validation = "validat.csv";

interface charInfo {
  char: string;
  position: number;
}

export function checkEncoding(src: string, encoding: string = "utf-8") {
  const regex =
    /^[a-zA-Z0-9\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~\u00C0-\u00FF\u2019\u014C\u2013\u016B]*$/;

  const ret = regex.test(src);

  if (!ret) {
    let result = "";
    const invalidChars: charInfo[] = [];
    for (let idx = 0; idx < src.length; idx++) {
      const char = src[idx];
      if (regex.test(char)) {
        result += char;
      } else {
        result += `[${char}]`;
        invalidChars.push({ char, position: idx });
      }
    }
    Logger.warn(
      `invalid Encoding by ${encoding} : ${result}\n` +
        JSON.stringify(invalidChars, null, 2)
    );
  }

  return ret;
}

export function checkResponseHeader(res: AxiosResponse) {
  const header = res.headers;
  //console.log(header);
  const contentType = header["content-type"] as string;
  const charset = contentType.toString().split("charset=")[1];

  if (charset !== "utf-8") {
    Logger.error(
      `[checkHeader] invalid encoding. ${JSON.stringify(res, null, 2)} `
    );
    throw new Error("invalid encoding");
  }
}
