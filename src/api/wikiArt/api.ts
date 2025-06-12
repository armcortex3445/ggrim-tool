import axios, { AxiosResponse } from "axios";
import {
  Artist,
  DictionaryJson,
  ListWithPagination,
  Error404,
  PaintingShortJson,
  Painting,
} from "./interfaces"; // 인터페이스 경로에 맞게 수정
import { Logger } from "../../utils/logger";
import { checkResponseHeader } from "../../utils/validation";
import { CustomError } from "../../utils/error";
import { Scriptor } from "../../utils/scriptor";

import * as fs from "fs";
import * as path from "path";
import { setTimeout } from "timers/promises";

const API_BASE_URL = "https://www.wikiart.org/en/api/2";

const _scriptor = new Scriptor();

interface IAuthInfo {
  SessionKey: string;
  MaxRequestsPerHour: number;
  MaxSessionsPerHour: number;
}

export async function getSessionId() {
  Logger.debug("start Auth");
  try {
    /*TODO
    - 실행시 실패.
    - 빌드시 .evn 파일 로드하여 환경변수 접근 하도록 로직 수정 필요
    */
    const keys = {
      access: process.env[`WIKIART_ACCESS_KEY`],
      secret: process.env[`WIKIART_SECRET_KEY`],
    };
    Logger.info("getSessionId");
    Logger.info(`keys : ` + JSON.stringify(keys));

    const url = `${API_BASE_URL}/en/Api/2/login?accessCode=${
      process.env[`WIKIART_ACCESS_KEY`]
    }&secretCode=${process.env[`WIKIART_SECRET_KEY`]}`;

    const response = await axios.get<IAuthInfo>(url);
    Logger.info("session : " + JSON.stringify(response));
    return response.data.SessionKey;
  } catch (e: any) {
    if (e.response && e.response.status === 404) {
      return { message: "No Authorization key found", status: 404 };
    }
    throw new Error(`Failed to Authorization ${e.message}`);
  }
}

// 1. Updated Artists
export async function getUpdatedArtists(
  fromDate?: string,
  paginationToken?: string
): Promise<ListWithPagination<Artist>> {
  try {
    const url = `${API_BASE_URL}/UpdatedArtists?fromDate=${
      fromDate || ""
    }&paginationToken=${paginationToken || ""}`;
    const response = await axios.get<ListWithPagination<Artist>>(url);
    checkResponseHeader(response);
    return response.data;
  } catch (error: any) {
    Logger.error(
      `[${getUpdatedArtists.name}] Failed to fetch detailed painting.\n${error.message}\n status : ${error.response.status}`
    );
    throw new CustomError(
      getUpdatedArtists.name,
      "REST_API",
      `Failed to fetch fetch most viewed painting: ${error.message}. status : ${error.response.status}`
    );
  }
}

// 2. Deleted Artists
export async function getDeletedArtists(
  fromDate?: string,
  paginationToken?: string
): Promise<ListWithPagination<string>> {
  try {
    const url = `${API_BASE_URL}/DeletedArtists?fromDate=${
      fromDate || ""
    }&paginationToken=${paginationToken || ""}`;
    const response = await axios.get<ListWithPagination<string>>(url);
    checkResponseHeader(response);
    return response.data;
  } catch (error: any) {
    Logger.error(
      `[${getDeletedArtists.name}] Failed to fetch detailed painting.\n${error.message}\n status : ${error.response.status}`
    );
    throw new CustomError(
      getDeletedArtists.name,
      "REST_API",
      `Failed to fetch fetch most viewed painting: ${error.message}. status : ${error.response.status}`
    );
  }
}

// 3. Artists by Dictionary
export async function getArtistsByDictionary(
  group: number,
  dictUrl: string,
  fromDate?: string,
  paginationToken?: string
): Promise<ListWithPagination<Artist>> {
  try {
    const url = `${API_BASE_URL}/ArtistsByDictionary?group=${group}&dictUrl=${dictUrl}&fromDate=${
      fromDate || ""
    }&paginationToken=${paginationToken || ""}`;
    const response = await axios.get<ListWithPagination<Artist>>(url);
    checkResponseHeader(response);
    return response.data;
  } catch (error: any) {
    Logger.error(
      `[${getArtistsByDictionary.name}] Failed to fetch detailed painting.\ngroup : ${group}\ndictUrl : ${dictUrl} \n${error.message}\n status : ${error.response.status}`
    );
    throw new CustomError(
      getArtistsByDictionary.name,
      "REST_API",
      `Failed to fetch fetch most viewed painting: ${error.message}. status : ${error.response.status}`
    );
  }
}

// 4. Updated Dictionaries
export async function getUpdatedDictionaries(
  group: number,
  fromDate?: string,
  paginationToken?: string
): Promise<ListWithPagination<DictionaryJson>> {
  try {
    const url = `${API_BASE_URL}/UpdatedDictionaries?group=${group}&fromDate=${
      fromDate || ""
    }&paginationToken=${paginationToken || ""}`;
    const response = await axios.get<ListWithPagination<DictionaryJson>>(url);
    checkResponseHeader(response);
    return response.data;
  } catch (error: any) {
    Logger.error(
      `[${getUpdatedDictionaries.name}] Failed to fetch detailed painting.\ngroup : ${group}\n${error.message}\n status : ${error.response.status}`
    );
    throw new CustomError(
      getUpdatedDictionaries.name,
      "REST_API",
      `Failed to fetch fetch most viewed painting: ${error.message}. status : ${error.response.status}`
    );
  }
}

// 5. Deleted Dictionaries
export async function getDeletedDictionaries(
  fromDate?: string,
  paginationToken?: string
): Promise<ListWithPagination<string>> {
  try {
    const url = `${API_BASE_URL}/DeletedDictionaries?fromDate=${
      fromDate || ""
    }&paginationToken=${paginationToken || ""}`;
    const response = await axios.get<ListWithPagination<string>>(url);
    checkResponseHeader(response);
    return response.data;
  } catch (error: any) {
    Logger.error(
      `[${getDeletedDictionaries.name}] Failed to fetch detailed painting.\n${error.message}\n status : ${error.response.status}`
    );
    throw new CustomError(
      getDeletedDictionaries.name,
      "REST_API",
      `Failed to fetch fetch most viewed painting: ${error.message}. status : ${error.response.status}`
    );
  }
}

// 6. Dictionaries by Group
export async function getDictionariesByGroup(
  group: number,
  paginationToken?: string
): Promise<ListWithPagination<DictionaryJson>> {
  try {
    const url = `${API_BASE_URL}/DictionariesByGroup?group=${group}&paginationToken=${
      paginationToken || ""
    }`;
    const response = await axios.get<ListWithPagination<DictionaryJson>>(url);
    checkResponseHeader(response);
    return response.data;
  } catch (error: any) {
    Logger.error(
      `[${getDictionariesByGroup.name}] Failed to fetch detailed painting.\n group : ${group} \n${error.message}\n status : ${error.response.status}`
    );
    throw new CustomError(
      getDictionariesByGroup.name,
      "REST_API",
      `Failed to fetch fetch most viewed painting: ${error.message}. status : ${error.response.status}`
    );
  }
}

// 7. Painting Search
export async function paintingSearch(
  term: string,
  paginationToken?: string,
  imageFormat: string = "Large"
): Promise<ListWithPagination<PaintingShortJson>> {
  try {
    const url = `${API_BASE_URL}/PaintingSearch?term=${term}&paginationToken=${
      paginationToken || ""
    }&imageFormat=${imageFormat}`;
    const response = await axios.get<ListWithPagination<PaintingShortJson>>(
      url
    );
    checkResponseHeader(response);
    return response.data;
  } catch (error: any) {
    Logger.error(
      `[${paintingSearch.name}] Failed to fetch detailed painting.\n term : ${term} \n${error.message}\n status : ${error.response.status}`
    );
    throw new CustomError(
      paintingSearch.name,
      "REST_API",
      `Failed to fetch fetch painting: ${error.message}. status : ${error.response.status}`
    );
  }
}

function checkWhetherException(data: any) {
  if (data.Exception || data.status) {
    /* check below exception from wikiArt Api
    {
  Exception: {
    Message: "API limit of 400 operations per hour exceeded",
    Stacktrace: null,
    InnerException: null,
  },
  Status: 500,
  RequestTime: "/Date(1734004589345)/",
} */
    Logger.error(`${JSON.stringify(data, null, 2)}`);
    throw new CustomError(
      checkWhetherException.name,
      "REST_API",
      JSON.stringify(data, null, 2)
    );
  }
}

// 8. Paintings by Artist
export async function getPaintingsByArtist(
  artistId: string,
  sessionKey: string,
  paginationToken?: string,
  imageFormat: string = "Large"
): Promise<ListWithPagination<PaintingShortJson>> {
  try {
    const url = `${API_BASE_URL}/PaintingsByArtist?id=${artistId}&paginationToken=${
      paginationToken || ""
    }&imageFormat=${imageFormat}&authSessionKey=${sessionKey}`;
    const data = (await _scriptor.getDataBypassAntiBot(
      url,
      _scriptor.getBrowserInnerText
    )) as string;

    checkWhetherException(data);

    return JSON.parse(data) as ListWithPagination<PaintingShortJson>;
  } catch (error: any) {
    Logger.error(
      `[${getPaintingsByArtist.name}] Failed to fetch detailed painting.\n artistId : ${artistId}`
    );
    throw new CustomError(
      getPaintingsByArtist.name,
      "REST_API",
      `Failed to fetch fetch most paintings by artist: ${JSON.stringify(error)}`
    );
  }
}

// 9. Most Viewed Paintings
export async function getMostViewedPaintings(
  sessionKey: string,
  paginationToken?: string,
  imageFormat: string = "Large"
): Promise<ListWithPagination<PaintingShortJson>> {
  try {
    const url = `${API_BASE_URL}/MostViewedPaintings?paginationToken=${
      paginationToken || ""
    }&imageFormat=${imageFormat}&authSessionKey=${sessionKey}`;
    const response = await axios.get<ListWithPagination<PaintingShortJson>>(
      url
    );
    checkResponseHeader(response);
    return response.data;
  } catch (error: any) {
    Logger.error(
      `[${getMostViewedPaintings.name}] Failed to fetch detailed painting.\n${error.message}\n status : ${error.response.status}`
    );
    throw new CustomError(
      getMostViewedPaintings.name,
      "REST_API",
      `Failed to fetch fetch most viewed painting: ${error.message}. status : ${error.response.status}`
    );
  }
}

// 10. Painting Details
export async function getPaintingDetails(
  sessionKey: string,
  paintingId: string,
  imageFormat: string = "Large"
): Promise<Painting> {
  try {
    const url = `${API_BASE_URL}/Painting?id=${paintingId}&imageFormat=${imageFormat}&authSessionKey=${sessionKey}`;
    const data = (await _scriptor.getDataBypassAntiBot(
      url,
      _scriptor.getBrowserInnerText
    )) as string;

    checkWhetherException(data);

    const detailPainting: Painting = JSON.parse(data) as Painting;
    return detailPainting;
  } catch (error: any) {
    Logger.error(
      `[getPaintingDetails] Failed to fetch detailed painting.\npaintingId : ${paintingId} \n${error.message}`
    );
    throw new CustomError(
      getPaintingDetails.name,
      "REST_API",
      `Failed to fetch fetch detailed painting: ${error.message}. status : ${error.response}`
    );
  }
}

//@deprecated. it is not work on to cloudflare bot detection
export async function downloadWikiArtImage(
  browser: any,
  pageUrl: string,
  outputDir: string
) {
  const page = await browser.newPage();
  // 실제 브라우저처럼 보이기 위해 User-Agent 설정

  await page.setViewport({ width: 1920, height: 1080 });
  // await page.setUserAgent(
  //   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
  // );

  const randomDelay = (min: number, max: number) =>
    Math.random() * (max - min) + min;

  try {
    // [개선] "워밍업" 단계: 타겟 사이트 방문 전 구글 방문
    Logger.info("워밍업: 구글 방문 중...");
    await page.goto("https://www.google.com", { waitUntil: "networkidle2" });
    await setTimeout(randomDelay(3000, 5000));

    await page.goto(pageUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    await setTimeout(randomDelay(10000, 15000));
    Logger.info(`Entry page : ${pageUrl}`);

    const captchaFrame = await page.$(
      'iframe[src*="captcha"], iframe[src*="cf-challenge"]'
    );
    if (captchaFrame) {
      Logger.info("⚠️ CAPTCHA 감지됨! 수동 해결 대기 중 (최대 60초)...");
      await setTimeout(60000);
    }

    // 이미지 src 추출
    const imageUrl = pageUrl;
    for (let i = 0; i < 10; i++) {
      const temp = await page.evaluate(() => {
        const img = document.querySelector("img") as HTMLImageElement | null;
        return img?.src || null;
      });

      if (temp === imageUrl) break;
      await setTimeout(3000); // 3초 간격으로 재시도
    }

    // [개선 2] axios 대신 Puppeteer 컨텍스트를 사용하여 이미지 다운로드
    // 새로운 페이지를 열거나, 기존 페이지에서 이미지 URL로 직접 이동하여 데이터를 가져옵니다.
    Logger.info(`Load ImageSrc : ${pageUrl}`);
    const imagePage = await browser.newPage();
    const response = await imagePage.goto(imageUrl, {
      waitUntil: "networkidle0",
    }); // 이미지가 완전히 로드될 때까지 대기
    const imageData = await response?.buffer();
    if (!imageData) {
      Logger.error("imageData is undefined");
      return;
    }

    // 저장 디렉토리 준비

    const parts = pageUrl.split("/");
    const fileName = parts.slice(-2).join("/");
    const finalOutPutDir = `${outputDir}/${parts.slice(-2, -1)}`;

    if (!fs.existsSync(finalOutPutDir)) {
      fs.mkdirSync(finalOutPutDir, { recursive: true });
    }

    const filePath = path.join(finalOutPutDir, fileName);
    fs.writeFileSync(filePath, imageData);

    Logger.info("✅ 이미지 저장 완료:", filePath);
  } catch (err) {
    Logger.error("❌ 오류 발생:", err);
  }
}
