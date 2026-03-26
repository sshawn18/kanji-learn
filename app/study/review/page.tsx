"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { JLPTLevel } from "@/lib/kanji-data/types";
import type { ReviewRating, SM2Card } from "@/lib/srs";
import { previewNextInterval } from "@/lib/srs";

interface KanjiData {
  id: string;
  character: string;
  level: JLPTLevel;
  onyomi: string[];
  kunyomi: string[];
  meanings: string[];
  strokeCount: number;
  exampleWords: { word: string; reading: string; meaning: string }[];
}

interface ProgressItem {
  kanjiId: string;
  nextReviewAt: string;
  repetitions: number;
  easeFactor: number;
  interval: number;
}

const LEVEL_COLORS: Record<string, string> = {
  N5: "#22C55E", N4: "#3B82F6", N3: "#F59E0B", N2: "#F97316", N1: "#DC2626",
};

const RATING_CONFIG: { label: string; shortcut: string; color: string; bg: string; border: string; rating: ReviewRating }[] = [
  { label: "Again", shortcut: "1", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", rating: 0 },
  { label: "Hard",  shortcut: "2", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", rating: 1 },
  { label: "Good",  shortcut: "3", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", rating: 2 },
  { label: "Easy",  shortcut: "4", color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0", rating: 3 },
];

function FlashCard({ kanji, isFlipped, onFlip }: { kanji: KanjiData; isFlipped: boolean; onFlip: () => void }) {
  const levelColor = LEVEL_COLORS[kanji.level] ?? "#DC2626";
  return (
    <div
      className="card-container"
      style={{ width: "100%", maxWidth: 480, height: 340, cursor: "pointer", margin: "0 auto" }}
      onClick={onFlip}
    >
      <div className={`card-inner ${isFlipped ? "flipped" : ""}`}>
        <div
          className="card-front"
          style={{
            background: "#fff",
            border: `2px solid ${levelColor}30`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: levelColor, background: `${levelColor}15`, padding: "3px 10px", borderRadius: 100, marginBottom: 20 }}>
            {kanji.level}
          </div>
          <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: 100, fontWeight: 900, color: "#111827", lineHeight: 1, marginBottom: 20 }}>
            {kanji.character}
          </div>
          <div style={{ fontSize: 13, color: "#9CA3AF" }}>Tap to reveal · {kanji.strokeCount} strokes</div>
        </div>

        <div
          className="card-back"
          style={{
            background: "#fff",
            border: `2px solid ${levelColor}40`,
            padding: "20px 28px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            overflowY: "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: 44, fontWeight: 900, color: "#111827" }}>
              {kanji.character}
            </div>
            <div>
              <div style={{ fontSize: 11, color: levelColor, fontWeight: 700, marginBottom: 2 }}>{kanji.level} · {kanji.strokeCount} strokes</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{kanji.meanings.slice(0, 3).join(", ")}</div>
            </div>
          </div>
          <div style={{ height: 1, background: "#F3F4F6", marginBottom: 14 }} />
          <div style={{ display: "flex", gap: 20, marginBottom: 14 }}>
            {kanji.onyomi.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, marginBottom: 3 }}>ON</div>
                <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: 14, color: "#374151", fontWeight: 600 }}>{kanji.onyomi.join("、")}</div>
              </div>
            )}
            {kanji.kunyomi.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, marginBottom: 3 }}>KUN</div>
                <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: 14, color: "#374151", fontWeight: 600 }}>{kanji.kunyomi.join("、")}</div>
              </div>
            )}
          </div>
          {kanji.exampleWords.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, marginBottom: 6 }}>EXAMPLES</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {kanji.exampleWords.slice(0, 2).map((ex, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "#374151" }}>
                    <span style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 600 }}>{ex.word}</span>
                    <span style={{ color: "#9CA3AF" }}>({ex.reading})</span>
                    <span>— {ex.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RatingButtons({
  cardState,
  onRate,
  submitting,
}: {
  cardState: SM2Card;
  onRate: (r: ReviewRating) => void;
  submitting: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
      <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 2px" }}>How well did you know this?</p>
      <div style={{ display: "flex", gap: 8, width: "100%", maxWidth: 420 }}>
        {RATING_CONFIG.map(r => {
          const intervalLabel = previewNextInterval(cardState, r.rating);
          return (
            <button
              key={r.label}
              onClick={() => onRate(r.rating)}
              disabled={submitting}
              style={{
                flex: 1,
                background: r.bg,
                color: r.color,
                border: `1.5px solid ${r.border}`,
                borderRadius: 12,
                padding: "10px 4px 8px",
                fontSize: 14,
                fontWeight: 700,
                cursor: submitting ? "not-allowed" : "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                transition: "transform 0.12s, box-shadow 0.12s",
                opacity: submitting ? 0.6 : 1,
              }}
              onMouseEnter={e => {
                if (!submitting) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 4px 12px ${r.color}30`;
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700 }}>{r.label}</span>
              <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.75 }}>{intervalLabel}</span>
              <span style={{ fontSize: 10, opacity: 0.4, marginTop: 1 }}>[{r.shortcut}]</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ReviewPage() {
  const [dueItems, setDueItems] = useState<ProgressItem[]>([]);
  const [kanjiMap, setKanjiMap] = useState<Map<string, KanjiData>>(new Map());
  const [cardStateMap, setCardStateMap] = useState<Map<string, SM2Card>>(new Map());
  const [reviewQueue, setReviewQueue] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sessionStats, setSessionStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dueRes = await fetch("/api/progress?dueOnly=true");
        const dueData: ProgressItem[] = await dueRes.json();

        if (!Array.isArray(dueData) || dueData.length === 0) {
          setLoading(false);
          return;
        }

        setDueItems(dueData);
        setReviewQueue(dueData.map(d => d.kanjiId));

        // Build card state map
        const stateMap = new Map<string, SM2Card>();
        dueData.forEach(p => {
          stateMap.set(p.kanjiId, {
            easeFactor: p.easeFactor,
            interval: p.interval,
            repetitions: p.repetitions,
            nextReviewAt: new Date(p.nextReviewAt),
          });
        });
        setCardStateMap(stateMap);

        // Fetch all kanji data
        const levels: JLPTLevel[] = ["N5", "N4", "N3", "N2", "N1"];
        const allKanjiArrays = await Promise.all(
          levels.map(l => fetch(`/api/kanji?level=${l}`).then(r => r.json()))
        );
        const allKanji: KanjiData[] = allKanjiArrays.flat();
        const map = new Map<string, KanjiData>();
        allKanji.forEach((k: KanjiData) => map.set(k.id, k));
        setKanjiMap(map);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isFlipped && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        setIsFlipped(true);
      } else if (isFlipped) {
        const ratingMap: Record<string, ReviewRating> = { "1": 0, "2": 1, "3": 2, "4": 3 };
        if (ratingMap[e.key] !== undefined) {
          handleRating(ratingMap[e.key]);
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isFlipped, currentIdx, reviewQueue]);

  const currentKanjiId = reviewQueue[currentIdx];
  const currentKanji = currentKanjiId ? kanjiMap.get(currentKanjiId) : undefined;
  const currentCardState = currentKanjiId
    ? (cardStateMap.get(currentKanjiId) ?? { easeFactor: 2.5, interval: 0, repetitions: 0, nextReviewAt: new Date() })
    : { easeFactor: 2.5, interval: 0, repetitions: 0, nextReviewAt: new Date() };

  const handleRating = async (rating: ReviewRating) => {
    if (!currentKanjiId || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/progress/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kanjiId: currentKanjiId, rating }),
      });
      // Update local card state
      if (res.ok) {
        const updated = await res.json();
        if (updated?.easeFactor !== undefined) {
          setCardStateMap(prev => new Map(prev).set(currentKanjiId, {
            easeFactor: updated.easeFactor,
            interval: updated.interval,
            repetitions: updated.repetitions,
            nextReviewAt: new Date(updated.nextReviewAt),
          }));
        }
      }

      const labelMap: Record<ReviewRating, keyof typeof sessionStats> = { 0: "again", 1: "hard", 2: "good", 3: "easy" };
      setSessionStats(prev => ({ ...prev, [labelMap[rating]]: prev[labelMap[rating]] + 1 }));

      const newQueue = [...reviewQueue];
      newQueue.splice(currentIdx, 1);
      if (rating === 0) newQueue.push(currentKanjiId);

      if (newQueue.length === 0) {
        setComplete(true);
      } else {
        setReviewQueue(newQueue);
        setCurrentIdx(Math.min(currentIdx, newQueue.length - 1));
        setIsFlipped(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAFA" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #FEE2E2", borderTopColor: "#DC2626", borderRadius: "50%", margin: "0 auto 12px" }} className="spinner" />
          <p style={{ color: "#6B7280", fontSize: 14 }}>Loading review cards...</p>
        </div>
      </div>
    );
  }

  if (dueItems.length === 0) {
    return (
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAFA", padding: 24 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "56px 40px", maxWidth: 420, width: "100%", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #F3F4F6" }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🎉</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "0 0 10px" }}>All caught up!</h2>
          <p style={{ fontSize: 15, color: "#6B7280", margin: "0 0 28px", lineHeight: 1.6 }}>
            No kanji are due for review right now. Come back later or learn some new kanji.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="/study" style={{ background: "#DC2626", color: "#fff", textDecoration: "none", borderRadius: 12, padding: "13px", fontSize: 15, fontWeight: 700, display: "block" }}>
              Study New Kanji
            </Link>
            <Link href="/dashboard" style={{ background: "#FAFAFA", color: "#6B7280", textDecoration: "none", border: "1px solid #E5E7EB", borderRadius: 12, padding: "12px", fontSize: 14, display: "block" }}>
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (complete) {
    const total = sessionStats.again + sessionStats.hard + sessionStats.good + sessionStats.easy;
    const correct = sessionStats.good + sessionStats.easy;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    return (
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAFA", padding: 24 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "48px 40px", maxWidth: 480, width: "100%", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #F3F4F6" }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>{pct >= 80 ? "🏆" : pct >= 60 ? "💪" : "📚"}</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>Review Complete!</h2>
          <p style={{ fontSize: 15, color: "#6B7280", margin: "0 0 28px" }}>
            Reviewed {dueItems.length} kanji
          </p>
          <div style={{ background: "#FAFAFA", borderRadius: 14, padding: "20px", marginBottom: 28 }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: "#DC2626", marginBottom: 4 }}>{pct}%</div>
            <div style={{ fontSize: 14, color: "#6B7280" }}>accuracy</div>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 16 }}>
              {RATING_CONFIG.map(r => (
                <div key={r.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: r.color }}>
                    {sessionStats[r.label.toLowerCase() as keyof typeof sessionStats]}
                  </div>
                  <div style={{ fontSize: 11, color: "#9CA3AF" }}>{r.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="/study" style={{ background: "#DC2626", color: "#fff", textDecoration: "none", borderRadius: 12, padding: "13px", fontSize: 15, fontWeight: 700, display: "block" }}>
              Study More →
            </Link>
            <Link href="/dashboard" style={{ background: "#FAFAFA", color: "#6B7280", textDecoration: "none", border: "1px solid #E5E7EB", borderRadius: 12, padding: "12px", fontSize: 14, display: "block" }}>
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#FAFAFA", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <Link href="/study" style={{ color: "#6B7280", textDecoration: "none", fontSize: 14 }}>
            ← Study
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ background: "#FEF3C7", color: "#D97706", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 100 }}>
              SRS Review
            </div>
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: "#6B7280" }}>{reviewQueue.length} remaining</span>
            <span style={{ fontSize: 13, color: "#DC2626", fontWeight: 600 }}>
              {Math.round(((dueItems.length - reviewQueue.length) / dueItems.length) * 100)}%
            </span>
          </div>
          <div style={{ height: 6, background: "#F3F4F6", borderRadius: 100, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${((dueItems.length - reviewQueue.length) / dueItems.length) * 100}%`,
                background: "#F59E0B",
                borderRadius: 100,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {currentKanji ? (
          <>
            <FlashCard kanji={currentKanji} isFlipped={isFlipped} onFlip={() => setIsFlipped(!isFlipped)} />

            <div style={{ marginTop: 24, textAlign: "center" }}>
              {!isFlipped ? (
                <button
                  onClick={() => setIsFlipped(true)}
                  style={{ background: "#111827", color: "#fff", border: "none", borderRadius: 12, padding: "14px 40px", fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%", maxWidth: 320 }}
                >
                  Show Answer ↩ (Space)
                </button>
              ) : (
                <RatingButtons
                  cardState={currentCardState}
                  onRate={handleRating}
                  submitting={submitting}
                />
              )}
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: 40 }}>
            <p style={{ color: "#9CA3AF" }}>Loading kanji data...</p>
          </div>
        )}
      </div>
    </div>
  );
}
