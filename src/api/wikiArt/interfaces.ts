// Artist Interface
export interface Artist {
  id: string; // unique object identifier
  artistName: string; // Name + Surname of an artist
  url: string; // unique object identifier made of artistName
  image: string; // absolute url for artist image
  lastNameFirst: string; // Surname + Name of an artist, default: ""
  birthDay: Date | null; // artist birthdate, format: Date([milliseconds]), default: null
  deathDay: Date | null; // artist deathdate, format: Date([milliseconds]), default: null
  birthDayAsString: string; // artist birth date in string representation, default: ""
  deathDayAsString: string; // artist death date in string representation, default: ""
  wikipediaUrl: string; // absolute url for artist wikipedia page, default: ""
  dictionaries: string[]; // dictionaries ids, default: [""]
  periods: ArtistDictionaryJson[] | null; // artist’s periods of work, default: null
  series: ArtistDictionaryJson[] | null; // artist’s paintings series, default: null
  activeYearsStart: number | null; // artist's active years left component, default: null
  activeYearsCompletion: number | null; // artist's active years right component, default: null
  biography: string; // artist biography, default: ""
  gender: string; // artist's sex, "female" | "male", default: ""
  originalArtistName: string; // artist name in native language, default: ""
}

// ArtistDictionaryJson Interface
export interface ArtistDictionaryJson {
  id: string; // unique object identifier
  title: string; // title
}

// Painting Interface
export interface Painting {
  id: string; // unique object identifier
  title: string; // painting title
  url: string; // unique object identifier made of title
  artistName: string; // artist Name + Surname
  artistUrl: string; // unique artist identifier made of artistName
  artistId: string; // unique artist identifier
  image: string; // absolute url for painting image
  width: number; // original image width
  height: number; // original image height
  completitionYear: number | null; // painting completition year, default: null
  dictionaries: string[]; // dictionaries ids, default: [""]
  location: string; // location (country + city), default: ""
  period: ArtistDictionaryJson | null; // artist’s period of work, default: null
  serie: ArtistDictionaryJson | null; // artist’s paintings series, default: null
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

// PaintingShortJson Interface
export interface PaintingShortJson {
  id: string; // unique object identifier
  title: string; // painting title
  url: string; // unique object identifier made of title
  artistUrl: string; // unique artist identifier made of artistName
  artistName: string; // artist Name + Surname
  artistId: string; // unique artist identifier
  completitionYear: number | null; // painting completition year, default: null
  image: string;
  width: number; // original image width
  height: number; // original image height
}

// DictionaryJson Interface
export interface DictionaryJson {
  id: string; // unique object identifier
  title: string; // title
  url: string; // unique object identifier made of title
  group: number; // dictionary group
}

// ListWithPagination Interface
export interface ListWithPagination<T> {
  data: T[]; // array of <T>, default: []
  paginationToken: string | null; // token for next page portion, default: null
  hasMore: boolean; // indicates whether next page exists, default: false
}

// Error404 Interface
export interface Error404 {
  message: string; // error message
  status: number; // 404 status
}
