"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { JLPTLevel } from "@/lib/kanji-data/types";

interface KanjiData {
  id: string;
  character: string;
  level: JLPTLevel;
  setIndex: number;
  meanings: string[];
}

interface ProgressItem {
  kanjiId: string;
  repetitions: number;
  nextReviewAt: string;
}

const LEVEL_META: Record<string, { color: string; description: string }> = {
  N5: { color: "#22C55E", description: "Beginner" },
  N4: { color: "#3B82F6", description: "Elementary" },
  N3: { color: "#F59E0B", description: "Intermediate" },
  N2: { color: "#F97316", description: "Upper Intermediate" },
  N1: { color: "#DC2626", description: "Advanced" },
};

export default function LevelPage() {
  const params = useParams();
  const level = (params.level as string).toUpperCase() as JLPTLevel;
  const [kanji, setKanji] = useState<KanjiData[]>([]);
  const [progress, setProgress] = useState<Map<string, ProgressItem>>(new Map());
  const [loading, setLoading] = useState(true);

  const meta = LEVEL_META[level] ?? { color: "#6B7280", description: "Unknown" };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kanjiRes, progressRes] = await Promise.all([
          fetch(`/api/kanji?level=${level}`),
          fetch("/api/progress"),
        ]);
        const [kanjiData, progressData] = await Promise.all([
          kanjiRes.json(),
          progressRes.json(),
        ]);
        setKanji(Array.isArray(kanjiData) ? kanjiData : []);
        const progressMap = new Map<string, ProgressItem>();
        if (Array.isArray(progressData)) {
          progressData.forEach((p: ProgressItem) => progressMap.set(p.kanjiId, p));
        }
        setProgress(progressMap);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [level]);

  // Group kanji by set
  const setMap = new Map<number, KanjiData[]>();
  kanji.forEach(k => {
    const setIdx = k.setIndex ?? 0;
    if (!setMap.has(setIdx)) setMap.set(setIdx, []);
    setMap.get(setIdx)!.push(k);
  });
  const sets = Array.from(setMap.entries()).sort(([a], [b]) => a - b);

  const getSetStatus = (setKanji: KanjiData[]): "locked" | "new" | "in-progress" | "complete" => {
    const learned = setKanji.filter(k => (progress.get(k.id)?.repetitions ?? 0) > 0).length;
    if (learned === 0) return "new";
    if (learned === setKanji.length) return "complete";
    return "in-progress";
  };

  if (loading) {
    return (
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAFA" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #FEE2E2", borderTopColor: "#DC2626", borderRadius: "50%", margin: "0 auto 12px" }} className="spinner" />
          <p style={{ color: "#6B7280", fontSize: 14 }}>Loading {level} kanji...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#FAFAFA", padding: "40px 24px 80px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 14, color: "#6B7280" }}>
          <Link href="/study" style={{ color: "#6B7280", textDecoration: "none" }}>Study</Link>
          <span>›</span>
          <span style={{ color: meta.color, fontWeight: 600 }}>{level}</span>
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 36 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: `${meta.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: meta.color, flexShrink: 0 }}>
            {level}
          </div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: "0 0 6px", letterSpacing: "-0.5px" }}>
              JLPT {level} — {meta.description}
            </h1>
            <p style={{ fontSize: 15, color: "#6B7280", margin: 0 }}>
              {sets.length} sets · {kanji.length} total kanji
            </p>
          </div>
        </div>

        {/* Sets Grid */}
        {sets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px", background: "#fff", borderRadius: 16, border: "1px solid #F3F4F6" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
            <h3 style={{ fontSize: 18, color: "#374151", margin: "0 0 8px" }}>Kanji data loading</h3>
            <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>The kanji data for this level will be available soon.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {sets.map(([setIndex, setKanji]) => {
              const status = getSetStatus(setKanji);
              const learnedCount = setKanji.filter(k => (progress.get(k.id)?.repetitions ?? 0) > 0).length;
              const pct = Math.round((learnedCount / setKanji.length) * 100);
              const firstKanji = setKanji.slice(0, 5);
              const startPos = setIndex * 20 + 1;
              const endPos = startPos + setKanji.length - 1;

              const statusStyles = {
                new: { bg: "#fff", border: "#F3F4F6", badge: { bg: "#F3F4F6", color: "#6B7280", text: "New" } },
                "in-progress": { bg: "#fff", border: `${meta.color}40`, badge: { bg: `${meta.color}15`, color: meta.color, text: "In Progress" } },
                complete: { bg: "#F0FDF4", border: "#86EFAC", badge: { bg: "#DCFCE7", color: "#16A34A", text: "Complete ✓" } },
                locked: { bg: "#FAFAFA", border: "#F3F4F6", badge: { bg: "#F3F4F6", color: "#9CA3AF", text: "Locked" } },
              }[status];

              return (
                <Link key={setIndex} href={`/study/${level}/${setIndex}`} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      background: statusStyles.bg,
                      border: `2px solid ${statusStyles.border}`,
                      borderRadius: 16,
                      padding: "20px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = `0 6px 18px ${meta.color}18`;
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.borderColor = meta.color;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.borderColor = statusStyles.border;
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 2 }}>
                          Set {setIndex + 1}
                        </div>
                        <div style={{ fontSize: 12, color: "#9CA3AF" }}>
                          #{startPos}–{endPos}
                        </div>
                      </div>
                      <div style={{ background: statusStyles.badge.bg, color: statusStyles.badge.color, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 100 }}>
                        {statusStyles.badge.text}
                      </div>
                    </div>

                    {/* Kanji preview */}
                    <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
                      {firstKanji.map(k => (
                        <div
                          key={k.id}
                          style={{
                            width: 34,
                            height: 34,
                            background: progress.has(k.id) ? `${meta.color}10` : "#F9FAFB",
                            border: `1px solid ${progress.has(k.id) ? `${meta.color}40` : "#E5E7EB"}`,
                            borderRadius: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "'Noto Sans JP', sans-serif",
                            fontSize: 17,
                            color: "#374151",
                          }}
                        >
                          {k.character}
                        </div>
                      ))}
                      {setKanji.length > 5 && (
                        <div style={{ width: 34, height: 34, background: "#F3F4F6", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#9CA3AF", fontWeight: 600 }}>
                          +{setKanji.length - 5}
                        </div>
                      )}
                    </div>

                    {/* Progress bar */}
                    {status !== "new" && (
                      <div>
                        <div style={{ height: 4, background: "#F3F4F6", borderRadius: 100, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: status === "complete" ? "#22C55E" : meta.color, borderRadius: 100 }} />
                        </div>
                        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 5 }}>
                          {learnedCount}/{setKanji.length} kanji
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
