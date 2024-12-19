import {
  BackendArtist,
  ExtendedBackendPainting,
  IPaginationResult,
} from "../../api/back-server/type";
import { Painting } from "../../api/wikiArt/interfaces";

export function validatePaintingFromDB(
  origin: Painting,
  serverResult: IPaginationResult<ExtendedBackendPainting>
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
