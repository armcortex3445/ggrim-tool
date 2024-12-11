export interface CreatePaintingDTO {
  title: string;

  image_url: string;

  description: string;

  artistName?: string;

  width?: number;

  height?: number;

  completition_year?: number;

  tags?: string[];

  styles?: string[];
}

export interface SearchPaintingDTO {
  title?: string;
  artistName?: string;
  tags?: string[];
  styles?: string[];
}

export interface CreateTagDTO {
  name: string;
  info_url?: string;
}

export interface CreateStyleDTO {
  name: string;
  info_url?: string;
}
