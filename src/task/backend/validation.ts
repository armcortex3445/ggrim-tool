import {
  BackendArtist,
  BackendPagination,
  BackendPainting,
  ExtendedBackendPainting,
  IPaginationResult,
  Quiz,
} from "../../api/back-server/type";
import { Painting } from "../../api/wikiArt/interfaces";
import { PrimitiveQuiz } from "./interface";

export function validatePaintingFromDB(
  origin: Painting,
  serverResult: BackendPagination<ExtendedBackendPainting>
): string {
  let validateResult = "";

  const commonKeys: (keyof Painting | keyof ExtendedBackendPainting)[] = [
    "title",
    "width",
    "height",
    "description",
  ];
  const localKeys: (keyof Painting)[] = [
    "completitionYear",
    "tags",
    "styles",
    "image",
    "artistName",
  ];
  const serverKeys: (keyof ExtendedBackendPainting)[] = [
    "completition_year",
    "tags",
    "styles",
    "image_url",
    "artist",
  ];

  if (serverResult.data.length === 0) {
    return "\n\tnot found";
  }

  serverResult.data.forEach((server) => {
    const delimiter = ", ";
    validateResult += "\n\tserverPaintingId :" + server.id + delimiter;

    commonKeys.forEach((key) => {
      const value1 = JSON.stringify(origin[key as keyof Painting]);
      const value2 = JSON.stringify(
        server[key as keyof ExtendedBackendPainting]
      );
      const isValid = value1 === value2 ? "O" : "X";

      if (isValid === "X") {
        validateResult += key + " : " + isValid + delimiter;
      }
    });

    if (
      JSON.stringify(origin.completitionYear) !==
      JSON.stringify(server.completition_year)
    ) {
      validateResult += "completitionYear : X" + delimiter;
    }

    if (JSON.stringify(origin.image) !== JSON.stringify(server.image_url)) {
      validateResult += "image : X" + delimiter;
    }

    if (!isCorrectStyle(origin, server)) {
      validateResult += "styles : X" + delimiter;
    }

    if (!isCorrectTag(origin, server)) {
      validateResult += "tags : X" + delimiter;
    }

    if (!isCorrectArtist(origin, server)) {
      validateResult += "artist : X" + delimiter;
    }
  });

  return validateResult;
}
export function validateInsertedQuiz(
  primitiveQuiz: PrimitiveQuiz,
  quiz: Quiz
): string {
  /*사양
    - 초기
      - imageURL을 기반으로 string-painting Map 생성
      - 이름-artist|tag|style Map 생성
    - 유효성검증
      - 각 크기가 같은지 비교
      - 각 요소가 저장되어있는지 비교. 
  */
  let result: string = `${primitiveQuiz.description}\n\tquiz ID : ${quiz.id}`;

  const localPaintingMap: Map<string, Painting> = new Map();
  for (const painting of [
    ...primitiveQuiz.answer,
    ...primitiveQuiz.distractor,
  ]) {
    const key = painting.image;
    if (!localPaintingMap.has(key)) {
      localPaintingMap.set(key, painting);
    }
  }

  const serverPaintingMap: Map<string, BackendPainting> = new Map();
  for (const painting of [
    ...quiz.answer_paintings,
    ...quiz.distractor_paintings,
  ]) {
    const key = painting.image_url;
    if (!serverPaintingMap.has(key)) {
      serverPaintingMap.set(key, painting);
    }
  }

  if (localPaintingMap.size !== serverPaintingMap.size) {
    result += `\n\tPainting count is not matched`;
    localPaintingMap.forEach((value, key) => {
      if (!serverPaintingMap.has(key)) {
        result += `\n\t\tNot contained.${value.title}(${value.id})`;
      }
    });
    serverPaintingMap.forEach((value, key) => {
      if (!localPaintingMap.has(key)) {
        result += `\n\t\tUnintended inserted.${value.title}(${value.id})`;
      }
    });
  }

  const localTags: string[] = [];
  const localStyles: string[] = [];
  const localArtists: string[] = [];
  localPaintingMap.forEach((value) => {
    localArtists.push(value.artistName);
    localTags.push(...value.tags);
    localStyles.push(...value.styles);
  });

  const tabDepth = 1;
  result +=
    "\n\tValidate Artist" +
    compareSet(
      new Set(localArtists),
      new Set(quiz.artists.map((artist) => artist.name)),
      tabDepth
    );

  result +=
    "\n\tValidate Tag" +
    compareSet(
      new Set(localTags),
      new Set(quiz.tags.map((tag) => tag.name)),
      tabDepth
    );
  result +=
    "\n\tValidate Style" +
    compareSet(
      new Set(localStyles),
      new Set(quiz.styles.map((style) => style.name)),
      tabDepth
    );

  return result;
}

export function compareSet(
  origin: Set<string>,
  replica: Set<string>,
  tabDepth: number = 0
): string {
  let result: string = "";
  let tab: string = "";
  for (let i = 0; i < tabDepth; i++) {
    tab += "\t";
  }

  if (origin.size !== replica.size) {
    result += "\n" + tab + `Size is different`;
    origin.forEach((e) => {
      if (!replica.has(e)) {
        result += `\n\t` + tab + `Not Contained ${e}`;
      }
    });
    replica.forEach((e) => {
      if (!origin.has(e)) {
        result += `\n\t` + tab + `Unintended Value ${e}`;
      }
    });
  }

  return result;
}

function isCorrectTag(
  wikiArtPainting: Painting,
  serverPainting: ExtendedBackendPainting
): boolean {
  const serverTagNames: string[] = serverPainting.tags!.map((tag) => tag.name);

  if (serverTagNames.length !== wikiArtPainting.tags.length) {
    return false;
  }

  return serverTagNames.every((name) => wikiArtPainting.tags.includes(name));
}
function isCorrectStyle(
  wikiArtPainting: Painting,
  serverPainting: ExtendedBackendPainting
): boolean {
  const serverStyleNames: string[] = serverPainting.styles!.map(
    (style) => style.name
  );

  if (serverStyleNames.length !== wikiArtPainting.styles.length) {
    return false;
  }

  return serverStyleNames.every((name) =>
    wikiArtPainting.styles.includes(name)
  );
}

function isCorrectArtist(
  wikiArtPainting: Painting,
  serverPainting: ExtendedBackendPainting
): boolean {
  const artist: BackendArtist = serverPainting.artist;

  if (!artist) {
    throw new Error(
      `[isCorrectArtist] wikiArtPainting : ${wikiArtPainting.id}\n` +
        `serverPainting(${serverPainting.id}) has undefined artist`
    );
  }

  if (
    !wikiArtPainting.artistId ||
    !wikiArtPainting.artistName ||
    !wikiArtPainting.artistUrl
  ) {
    throw new Error(
      `[isCorrectArtist] wikiArtPainting : ${wikiArtPainting.id} has undefined artist`
    );
  }

  return (
    JSON.stringify(artist.name) === JSON.stringify(wikiArtPainting.artistName)
  );
}
