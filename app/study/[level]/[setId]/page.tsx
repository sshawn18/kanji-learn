"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { JLPTLevel } from "@/lib/kanji-data/types";
import type { ReviewRating, SM2Card } from "@/lib/srs";
import { previewNextInterval } from "@/lib/srs";

interface KanjiData {
  id: string;
  character: string;
  level: JLPTLevel;
  setIndex: number;
  positionInSet: number;
  onyomi: string[];
  kunyomi: string[];
  meanings: string[];
  strokeCount: number;
  exampleWords: { word: string; reading: string; meaning: string }[];
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

const DEFAULT_STATE: SM2Card = { easeFactor: 2.5, interval: 0, repetitions: 0, nextReviewAt: new Date() };

function FlashCard({ kanji, isFlipped, onFlip }: { kanji: KanjiData; isFlipped: boolean; onFlip: () => void }) {
  const levelColor = LEVEL_COLORS[kanji.level] ?? "#DC2626";
  return (
    <div
      className="card-container"
      style={{ width: "100%", maxWidth: 480, height: 340, cursor: "pointer", margin: "0 auto" }}
      onClick={onFlip}
    >
      <div className={`card-inner ${isFlipped ? "flipped" : ""}`}>
        <div className="card-front" style={{ background: "#fff", border: `2px solid ${levelColor}30`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: levelColor, background: `${levelColor}15`, padding: "3px 10px", borderRadius: 100, marginBottom: 20 }}>
            {kanji.level}
          </div>
          <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: 100, fontWeight: 900, color: "#111827", lineHeight: 1, marginBottom: 20 }}>
            {kanji.character}
          </div>
          <div style={{ fontSize: 13, color: "#9CA3AF" }}>Tap to reveal · {kanji.strokeCount} strokes</div>
        </div>

        <div className="card-back" style={{ background: "#fff", border: `2px solid ${levelColor}40`, padding: "20px 28px", display: "flex", flexDirection: "column", justifyContent: "center", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: 44, fontWeight: 900, color: "#111827" }}>{kanji.character}</div>
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

function RatingButtons({ cardState, onRate, submitting }: { cardState: SM2Card; onRate: (r: ReviewRating) => void; submitting: boolean }) {
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
              onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 4px 12px ${r.color}30`; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
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

export default function StudySessionPage() {
  const params = useParams();
  const level = (params.level as string).toUpperCase() as JLPTLevel;
  const setId = parseInt(params.setId as string);

  const [kanji, setKanji] = useState<KanjiData[]>([]);
  const [cardStates, setCardStates] = useState<Map<string, SM2Card>>(new Map());
  const [queue, setQueue] = useState<KanjiData[]>([]); // active queue (Again re-appends here)
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [complete, setComplete] = useState(false);

  const levelColor = LEVEL_COLORS[level] ?? "#DC2626";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kanjiRes, progressRes] = await Promise.all([
          fetch(`/api/kanji?level=${level}&set=${setId}`),
          fetch(`/api/progress`),
        ]);
        const kanjiData: KanjiData[] = await kanjiRes.json();
        const progressData: any[] = progressRes.ok ? await progressRes.json() : [];

        const data = Array.isArray(kanjiData) ? kanjiData : [];
        setKanji(data);
        setQueue(data);

        const stateMap = new Map<string, SM2Card>();
        if (Array.isArray(progressData)) {
          progressData.forEach((p: any) => {
            stateMap.set(p.kanjiId, {
              easeFactor: p.easeFactor,
              interval: p.interval,
              repetitions: p.repetitions,
              nextReviewAt: new Date(p.nextReviewAt),
            });
          });
        }
        setCardStates(stateMap);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [level, setId]);

  const currentKanji = queue[currentIdx];
  const currentCardState = currentKanji ? (cardStates.get(currentKanji.id) ?? DEFAULT_STATE) : DEFAULT_STATE;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.key === " " || e.key === "Enter") && !isFlipped) {
        e.preventDefault();
        setIsFlipped(true);
      } else if (isFlipped && !submitting) {
        const map: Record<string, ReviewRating> = { "1": 0, "2": 1, "3": 2, "4": 3 };
        if (map[e.key] !== undefined) handleRating(map[e.key]);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isFlipped, submitting, currentIdx, queue]);

  const handleRating = async (rating: ReviewRating) => {
    if (!currentKanji || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/progress/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kanjiId: currentKanji.id, rating }),
      });
      if (res.ok) {
        const updated = await res.json();
        if (updated?.easeFactor !== undefined) {
          setCardStates(prev => new Map(prev).set(currentKanji.id, {
            easeFactor: updated.easeFactor,
            interval: updated.interval,
            repetitions: updated.repetitions,
            nextReviewAt: new Date(updated.nextReviewAt),
          }));
        }
      }

      const labelMap: Record<ReviewRating, keyof typeof sessionStats> = { 0: "again", 1: "hard", 2: "good", 3: "easy" };
      setSessionStats(prev => ({ ...prev, [labelMap[rating]]: prev[labelMap[rating]] + 1 }));

      const newQueue = [...queue];
      newQueue.splice(currentIdx, 1);
      if (rating === 0) newQueue.push(currentKanji); // Again: re-add at end

      if (newQueue.length === 0) {
        setComplete(true);
      } else {
        setQueue(newQueue);
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
          <p style={{ color: "#6B7280", fontSize: 14 }}>Loading set...</p>
        </div>
      </div>
    );
  }

  if (kanji.length === 0) {
    return (
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAFA" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <h3 style={{ color: "#374151" }}>No kanji found for this set</h3>
          <Link href={`/study/${level}`} style={{ color: "#DC2626" }}>← Back to {level}</Link>
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
          <div style={{ fontSize: 56, marginBottom: 20 }}>{pct >= 80 ? "🎉" : pct >= 60 ? "💪" : "📚"}</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>Set {setId + 1} Complete!</h2>
          <p style={{ fontSize: 15, color: "#6B7280", margin: "0 0 28px" }}>
            You reviewed {kanji.length} kanji from {level} Set {setId + 1}
          </p>
          <div style={{ background: "#FAFAFA", borderRadius: 14, padding: "20px", marginBottom: 28 }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: levelColor, marginBottom: 4 }}>{pct}%</div>
            <div style={{ fontSize: 14, color: "#6B7280" }}>accuracy (Good + Easy)</div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
              {RATING_CONFIG.map(r => (
                <div key={r.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: r.color }}>{sessionStats[r.label.toLowerCase() as keyof typeof sessionStats]}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF" }}>{r.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href={`/study/${level}/${setId + 1}`} style={{ background: "#DC2626", color: "#fff", textDecoration: "none", borderRadius: 12, padding: "13px", fontSize: 15, fontWeight: 700, display: "block" }}>
              Next Set →
            </Link>
            <Link href={`/study/${level}`} style={{ background: "#FAFAFA", color: "#6B7280", textDecoration: "none", border: "1px solid #E5E7EB", borderRadius: 12, padding: "12px", fontSize: 14, display: "block" }}>
              Back to {level}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // How many of the original 20 have been cleared (not Again'd back in)
  const cleared = kanji.length - queue.filter(k => kanji.some(orig => orig.id === k.id && queue.indexOf(k) >= 0)).length;
  const progressPct = Math.round(((kanji.length - new Set(queue.map(k => k.id)).size + (kanji.length - new Set(queue.map(k=>k.id)).size)) / kanji.length) * 50);

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#FAFAFA", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <Link href={`/study/${level}`} style={{ color: "#6B7280", textDecoration: "none", fontSize: 14 }}>
            ← {level} Sets
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ background: "#EFF6FF", color: "#2563EB", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 100 }}>
              Study
            </div>
            <div style={{ fontSize: 13, color: "#9CA3AF" }}>Set {setId + 1}</div>
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: "#6B7280" }}>
              {queue.length} remaining · {sessionStats.again + sessionStats.hard + sessionStats.good + sessionStats.easy} reviewed
            </span>
            <span style={{ fontSize: 13, color: levelColor, fontWeight: 600 }}>
              {kanji.length} total
            </span>
          </div>
          <div style={{ height: 6, background: "#F3F4F6", borderRadius: 100, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${Math.round(((sessionStats.hard + sessionStats.good + sessionStats.easy) / Math.max(kanji.length, 1)) * 100)}%`,
              background: levelColor,
              borderRadius: 100,
              transition: "width 0.3s ease",
            }} />
          </div>
        </div>

        {/* Flashcard */}
        {currentKanji && (
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
                <RatingButtons cardState={currentCardState} onRate={handleRating} submitting={submitting} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
