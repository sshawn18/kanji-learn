import type { Kanji, JLPTLevel } from "./types";
import { N5_KANJI } from "./n5";
import { N4_KANJI } from "./n4";
import { N3_KANJI } from "./n3";
import { N2_KANJI } from "./n2";
import { N1_KANJI } from "./n1";

const ALL_KANJI: Record<JLPTLevel, Kanji[]> = {
  N5: N5_KANJI,
  N4: N4_KANJI,
  N3: N3_KANJI,
  N2: N2_KANJI,
  N1: N1_KANJI,
};

export function getKanjiByLevel(level: JLPTLevel): Kanji[] {
  return ALL_KANJI[level];
}

export function getKanjiSet(level: JLPTLevel, setIndex: number): Kanji[] {
  return ALL_KANJI[level].filter((k) => k.setIndex === setIndex);
}

export function getKanjiById(id: string): Kanji | undefined {
  const level = id.split("-")[0].toUpperCase() as JLPTLevel;
  return ALL_KANJI[level]?.find((k) => k.id === id);
}

export function getSetCount(level: JLPTLevel): number {
  const kanji = ALL_KANJI[level];
  if (kanji.length === 0) return 0;
  return Math.max(...kanji.map((k) => k.setIndex)) + 1;
}

export const LEVEL_META: Record<JLPTLevel, { totalKanji: number; description: string; color: string }> = {
  N5: { totalKanji: N5_KANJI.length, description: "Absolute beginner — basic daily kanji", color: "#22c55e" },
  N4: { totalKanji: N4_KANJI.length, description: "Elementary — common vocabulary kanji", color: "#3b82f6" },
  N3: { totalKanji: N3_KANJI.length, description: "Intermediate — newspaper reading ability", color: "#f59e0b" },
  N2: { totalKanji: N2_KANJI.length, description: "Upper intermediate — near business level", color: "#ef4444" },
  N1: { totalKanji: N1_KANJI.length, description: "Advanced — near-native proficiency", color: "#8b5cf6" },
};

export function getAllKanji(): Kanji[] {
  return Object.values(ALL_KANJI).flat();
}
