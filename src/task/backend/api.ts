import {
  getPaintingFromDB,
} from "../../api/back-server/api";
export async function getExtendedBackendPaintingByPainting(
  painting: Painting
): Promise<IPaginationResult<ExtendedBackendPainting>> {
  const dto = createSearchDTO(painting);
  const result = await getPaintingFromDB(dto);

  return result;
}

export function createSearchDTO(painting: Painting) {
  const dto: SearchPaintingDTO = {
    title: painting.title,
    artistName: painting.artistName,
    tags: painting.tags,
    styles: painting.styles,
  };

  return dto;
}
