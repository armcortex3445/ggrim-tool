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

  image_s3_key?: string;
}

export interface ReplacePaintingDTO {
  title: string;

  image_url: string;

  description: string;

  artistName?: string;

  width?: number;

  height?: number;

  completition_year?: number;

  tags?: string[];

  styles?: string[];

  image_s3_key?: string;
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

export interface CreateArtistDTO {
  name: string;
  image_url?: string;
  info_url?: string;
  birth_date?: Date;
  death_date?: Date;
}

export interface CreateQuizDTO {
  answerPaintingIds: string[];

  distractorPaintingIds: string[];

  examplePaintingId?: string;

  title: string;

  timeLimit: number;

  type: "ONE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE";

  description: string;
}

export interface SearchQuizDTO {
  artist: string;

  /*형식 
      JSON 문자열 
        - 예시) url?tags=["1","2"]
        - 서버쪽에서 파싱 로직을 사용해야함
      */

  tags: string;

  /*형식 
      JSON 문자열 
        - 예시) url?tags=["1","2"]
        - 서버쪽에서 파싱 로직을 사용해야함
      */

  styles: string;
}
