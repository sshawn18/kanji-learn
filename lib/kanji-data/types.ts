export interface ExampleWord {
  word: string;
  reading: string;
  meaning: string;
}

export interface Kanji {
  id: string;
  character: string;
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  setIndex: number;
  positionInSet: number;
  onyomi: string[];
  kunyomi: string[];
  meanings: string[];
  strokeCount: number;
  exampleWords: ExampleWord[];
}

export type JLPTLevel = "N5" | "N4" | "N3" | "N2" | "N1";
