import { StringLiteral } from "typescript";

export interface BackendWikiArtPainting {
  wikiArtId: string;
  title: string;
  url: string;
  artistName: string;
  artistUrl: string;

  //   @ManyToOne(() => wikiArtArtist, (artist) => artist.works)
  //   artist: wikiArtArtist;
  image: string;
  width: number;
  height: number;
  completitionYear: number | null; // painting completition year, default: null
  location: string; // location (country + city), default: ""
  //period: ArtistDictionaryJson | null; // artist’s period of work, default: null
  //serie: ArtistDictionaryJson | null; // artist’s paintings series, default: null
  genres: string[]; // array of genres names, default: [""]
  styles: string[]; // array of styles names, default: [""]
  media: string[]; // array of media names, default: [""]
  galleries: string[]; // array of galleries names, default: [""]
  tags: string[]; // array of tags names, default: [""]
  sizeX: number | null; // original painting dimension X, default: null
  sizeY: number | null; // original painting dimension Y, default: null
  diameter: number | null; // original painting diameter, default: null
  description: string; // painting description, default: ""
}

export interface BackendTag {
  id: string;
  name: string;
  info_url: string;
  paintings?: BackendPainting[];
}

export interface BackendStyle {
  id: string;
  name: string;
  info_url: string;
  paintings?: BackendPainting[];
}

export interface BackendArtist {
  id: string;
  name: string;
  // image_url: string;
  birth_date: Date | null;
  death_date: Date | null;
  info_url?: string | null;
  search_name: string;
  paintings?: BackendPainting[];
}

export interface BackendPainting {
  id: string;
  title: string;

  image_url: string;
  description: string;

  completition_year?: number;
  width: number;

  height: number;
}

export interface ExtendedBackendPainting extends BackendPainting {
  artist: BackendArtist;
  tags: BackendTag[];

  styles: BackendStyle[];
}

export interface BackendPagination<T> {
  data: T[];
  count: number;
  total: number;
  page: number;
  pageCount: number;
}

export interface IPaginationResult<T> {
  data: T[];
  count: number;
  pagination: number;
  isMore?: boolean;
}

export interface Quiz {
  id: string;

  title: string;

  distractor_paintings: BackendPainting[];

  answer_paintings: BackendPainting[];

  example_painting: BackendPainting | undefined;

  correct_count: number;

  incorrect_count: number;

  time_limit: number;

  description: string;

  type: "ONE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE";

  artists: BackendArtist[];

  tags: BackendTag[];

  styles: BackendStyle[];
}
