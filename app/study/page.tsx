"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { JLPTLevel } from "@/lib/kanji-data/types";

const LEVEL_META: Record<JLPTLevel, { totalKanji: number; description: string; color: string; sets: number; examples: string[] }> = {
  N5: { totalKanji: 103, description: "Absolute beginner — everyday kanji", color: "#22C55E", sets: 6, examples: ["日", "月", "山", "水", "火"] },
  N4: { totalKanji: 128, description: "Elementary — school-level kanji", color: "#3B82F6", sets: 7, examples: ["電", "話", "食", "学", "校"] },
  N3: { totalKanji: 124, description: "Intermediate — newspaper kanji", color: "#F59E0B", sets: 7, examples: ["経", "済", "政", "治", "法"] },
  N2: { totalKanji: 103, description: "Upper intermediate — business kanji", color: "#F97316", sets: 6, examples: ["継", "続", "訓", "練", "技"] },
  N1: { totalKanji: 129, description: "Advanced — literary kanji", color: "#DC2626", sets: 7, examples: ["鑑", "憧", "翻", "醸", "蒸"] },
};

const LEVELS: JLPTLevel[] = ["N5", "N4", "N3", "N2", "N1"];

interface ProgressItem {
  kanjiId: string;
  repetitions: number;
  nextReviewAt: string;
}

export default function StudyPage() {
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const [progressRes, dueRes] = await Promise.all([
          fetch("/api/progress"),
          fetch("/api/progress?dueOnly=true"),
        ]);
        const [progressData, dueData] = await Promise.all([
          progressRes.json(),
          dueRes.json(),
        ]);
        setProgress(Array.isArray(progressData) ? progressData : []);
        setDueCount(Array.isArray(dueData) ? dueData.length : 0);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  const totalLearned = progress.filter(p => p.repetitions > 0).length;

  if (loading) {
    return (
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAFA" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #FEE2E2", borderTopColor: "#DC2626", borderRadius: "50%", margin: "0 auto 12px" }} className="spinner" />
          <p style={{ color: "#6B7280", fontSize: 14 }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#FAFAFA", padding: "40px 24px 80px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: "#111827", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
            Choose a Level
          </h1>
          <p style={{ fontSize: 15, color: "#6B7280", margin: 0 }}>
            Select a JLPT level to start or continue studying
          </p>
        </div>

        {/* Due for review */}
        {dueCount > 0 && (
          <Link href="/study/review" style={{ textDecoration: "none" }}>
            <div
              style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                border: "1px solid #FCD34D",
                borderRadius: 14,
                padding: "16px 20px",
                marginBottom: 28,
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 22 }}>⏰</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#92400E" }}>
                  {dueCount} kanji due for review
                </div>
                <div style={{ fontSize: 13, color: "#B45309" }}>Click to review now</div>
              </div>
              <div style={{ fontSize: 18, color: "#D97706" }}>→</div>
            </div>
          </Link>
        )}

        {/* Level Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {LEVELS.map(level => {
            const meta = LEVEL_META[level];
            return (
              <Link key={level} href={`/study/${level}`} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #F3F4F6",
                    borderRadius: 18,
                    padding: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    transition: "all 0.2s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = `0 6px 20px ${meta.color}18`;
                    e.currentTarget.style.borderColor = `${meta.color}60`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = "#F3F4F6";
                  }}
                >
                  {/* Level badge */}
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      background: `${meta.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      fontWeight: 900,
                      color: meta.color,
                      flexShrink: 0,
                    }}
                  >
                    {level}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2, flexWrap: "wrap" }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>{level}</h3>
                      <span style={{ fontSize: 12, color: "#9CA3AF" }}>{meta.totalKanji} kanji · {meta.sets} sets</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {meta.description}
                    </div>
                    {/* Example kanji */}
                    <div style={{ display: "flex", gap: 5 }}>
                      {meta.examples.map(k => (
                        <span
                          key={k}
                          style={{
                            fontFamily: "'Noto Sans JP', sans-serif",
                            fontSize: 16,
                            width: 30,
                            height: 30,
                            background: "#FAFAFA",
                            border: "1px solid #E5E7EB",
                            borderRadius: 7,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div style={{ color: "#D1D5DB", fontSize: 18, flexShrink: 0 }}>→</div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Motivational note */}
        <div style={{
          marginTop: 8,
          marginBottom: 8,
          background: "#FFF7ED",
          border: "1px solid #FED7AA",
          borderRadius: 12,
          padding: "12px 16px",
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>🎯</span>
          <p style={{ fontSize: 13, color: "#B45309", margin: 0, lineHeight: 1.5 }}>
            Master these <strong>587 high-frequency kanji</strong> and you&apos;ll recognize over <strong>80% of kanji</strong> in everyday Japanese text.
          </p>
        </div>

        {/* Stats summary */}
        {totalLearned > 0 && (
          <div style={{ marginTop: 32, background: "#fff", border: "1px solid #F3F4F6", borderRadius: 14, padding: "20px 24px", display: "flex", gap: 32 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>{totalLearned}</div>
              <div style={{ fontSize: 13, color: "#6B7280" }}>Kanji learned</div>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#F59E0B" }}>{dueCount}</div>
              <div style={{ fontSize: 13, color: "#6B7280" }}>Due for review</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
