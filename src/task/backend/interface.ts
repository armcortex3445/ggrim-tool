import { Painting } from "../../api/wikiArt/interfaces";

export interface PrimitiveQuiz {
  answer: Painting[];
  distractor: Painting[];
  type: "artist";
  description: string;
}
