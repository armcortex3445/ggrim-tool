import axios from "axios";
import {
  Artist,
  DictionaryJson,
  ListWithPagination,
  Error404,
  PaintingShortJson,
  Painting,
} from "./interfaces"; // 인터페이스 경로에 맞게 수정

const API_BASE_URL = "https://www.wikiart.org/en/api/2";

export async function getSeesionId() {}

// 1. Updated Artists
export async function getUpdatedArtists(
  fromDate?: string,
  paginationToken?: string
): Promise<ListWithPagination<Artist> | Error404> {
  try {
    const url = `${API_BASE_URL}/UpdatedArtists?fromDate=${
      fromDate || ""
    }&paginationToken=${paginationToken || ""}`;
    const response = await axios.get<ListWithPagination<Artist>>(url);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return { message: "No updated artists found", status: 404 };
    }
    throw new Error(`Failed to fetch updated artists: ${error.message}`);
  }
}

// 2. Deleted Artists
export async function getDeletedArtists(
  fromDate?: string,
  paginationToken?: string
): Promise<ListWithPagination<string> | Error404> {
  try {
    const url = `${API_BASE_URL}/DeletedArtists?fromDate=${
      fromDate || ""
    }&paginationToken=${paginationToken || ""}`;
    const response = await axios.get<ListWithPagination<string>>(url);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return { message: "No deleted artists found", status: 404 };
    }
    throw new Error(`Failed to fetch deleted artists: ${error.message}`);
  }
}

// 3. Artists by Dictionary
export async function getArtistsByDictionary(
  group: number,
  dictUrl: string,
  fromDate?: string,
  paginationToken?: string
): Promise<ListWithPagination<Artist> | Error404> {
  try {
    const url = `${API_BASE_URL}/ArtistsByDictionary?group=${group}&dictUrl=${dictUrl}&fromDate=${
      fromDate || ""
    }&paginationToken=${paginationToken || ""}`;
    const response = await axios.get<ListWithPagination<Artist>>(url);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return { message: "Dictionary not found", status: 404 };
    }
    throw new Error(`Failed to fetch artists by dictionary: ${error.message}`);
  }
}

// 4. Updated Dictionaries
export async function getUpdatedDictionaries(
  group: number,
  fromDate?: string,
  paginationToken?: string
): Promise<ListWithPagination<DictionaryJson> | Error404> {
  try {
    const url = `${API_BASE_URL}/UpdatedDictionaries?group=${group}&fromDate=${
      fromDate || ""
    }&paginationToken=${paginationToken || ""}`;
    const response = await axios.get<ListWithPagination<DictionaryJson>>(url);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return { message: "No updated dictionaries found", status: 404 };
    }
    throw new Error(`Failed to fetch updated dictionaries: ${error.message}`);
  }
}

// 5. Deleted Dictionaries
export async function getDeletedDictionaries(
  fromDate?: string,
  paginationToken?: string
): Promise<ListWithPagination<string> | Error404> {
  try {
    const url = `${API_BASE_URL}/DeletedDictionaries?fromDate=${
      fromDate || ""
    }&paginationToken=${paginationToken || ""}`;
    const response = await axios.get<ListWithPagination<string>>(url);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return { message: "No deleted dictionaries found", status: 404 };
    }
    throw new Error(`Failed to fetch deleted dictionaries: ${error.message}`);
  }
}

// 6. Dictionaries by Group
export async function getDictionariesByGroup(
  group: number,
  paginationToken?: string
): Promise<ListWithPagination<DictionaryJson> | Error404> {
  try {
    const url = `${API_BASE_URL}/DictionariesByGroup?group=${group}&paginationToken=${
      paginationToken || ""
    }`;
    const response = await axios.get<ListWithPagination<DictionaryJson>>(url);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return { message: "Dictionaries group not found", status: 404 };
    }
    throw new Error(`Failed to fetch dictionaries by group: ${error.message}`);
  }
}

// 7. Painting Search
export async function paintingSearch(
  term: string,
  paginationToken?: string,
  imageFormat: string = "Large"
): Promise<ListWithPagination<PaintingShortJson> | Error404> {
  try {
    const url = `${API_BASE_URL}/PaintingSearch?term=${term}&paginationToken=${
      paginationToken || ""
    }&imageFormat=${imageFormat}`;
    const response = await axios.get<ListWithPagination<PaintingShortJson>>(
      url
    );
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return { message: "No paintings found for this term", status: 404 };
    }
    throw new Error(`Failed to search paintings: ${error.message}`);
  }
}

// 8. Paintings by Artist
export async function getPaintingsByArtist(
  artistId: string,
  paginationToken?: string,
  imageFormat: string = "Large"
): Promise<ListWithPagination<PaintingShortJson> | Error404> {
  try {
    const url = `${API_BASE_URL}/PaintingsByArtist?id=${artistId}&paginationToken=${
      paginationToken || ""
    }&imageFormat=${imageFormat}`;
    const response = await axios.get<ListWithPagination<PaintingShortJson>>(
      url
    );
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return { message: "Artist not found", status: 404 };
    }
    throw new Error(`Failed to fetch paintings by artist: ${error.message}`);
  }
}

// 9. Most Viewed Paintings
export async function getMostViewedPaintings(
  sessionKey: string,
  paginationToken?: string,
  imageFormat: string = "Large"
): Promise<ListWithPagination<PaintingShortJson> | Error404> {
  try {
    const url = `${API_BASE_URL}/MostViewedPaintings?paginationToken=${
      paginationToken || ""
    }&imageFormat=${imageFormat}&authSessionKey=${sessionKey}`;
    const response = await axios.get<ListWithPagination<PaintingShortJson>>(
      url
    );
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return { message: "No most viewed paintings found", status: 404 };
    }
    throw new Error(`Failed to fetch most viewed paintings: ${error.message}`);
  }
}

// 10. Painting Details
export async function getPaintingDetails(
  sessionKey: string,
  paintingId: string,
  imageFormat: string = "Large"
): Promise<Painting | Error404> {
  try {
    const url = `${API_BASE_URL}/Painting?id=${paintingId}&imageFormat=${imageFormat}&authSessionKey=${sessionKey}`;
    const response = await axios.get<Painting>(url);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return { message: "Painting not found", status: 404 };
    }
    throw new Error(`Failed to fetch painting details: ${error.message}`);
  }
}
