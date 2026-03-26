"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { ReviewRating } from "@/lib/srs";

interface KanjiData {
  id: string;
  character: string;
  level: string;
  onyomi: string[];
  kunyomi: string[];
  meanings: string[];
  strokeCount: number;
  exampleWords: { word: string; reading: string; meaning: string }[];
}

interface DeckKanjiItem {
  kanjiId: string;
  kanji: KanjiData | null;
}

interface Deck {
  id: string;
  name: string;
  kanjiItems: DeckKanjiItem[];
}

type StudyPhase = "learning" | "review" | "complete";

const LEVEL_COLORS: Record<string, string> = {
  N5: "#22C55E", N4: "#3B82F6", N3: "#F59E0B", N2: "#F97316", N1: "#DC2626",
};

const RATING_CONFIG: { label: string; shortcut: string; color: string; bg: string; rating: ReviewRating }[] = [
  { label: "Again", shortcut: "1", color: "#DC2626", bg: "#FEE2E2", rating: 0 },
  { label: "Hard", shortcut: "2", color: "#F97316", bg: "#FFF7ED", rating: 1 },
  { label: "Good", shortcut: "3", color: "#3B82F6", bg: "#EFF6FF", rating: 2 },
  { label: "Easy", shortcut: "4", color: "#22C55E", bg: "#F0FDF4", rating: 3 },
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

export default function DeckStudyPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.deckId as string;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [kanjiList, setKanjiList] = useState<KanjiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<StudyPhase>("learning");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sessionStats, setSessionStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [reviewQueue, setReviewQueue] = useState<KanjiData[]>([]);

  useEffect(() => {
    const fetchDeck = async () => {
      try {
        const res = await fetch(`/api/decks/${deckId}`);
        if (!res.ok) { router.push("/decks"); return; }
        const data: Deck = await res.json();
        setDeck(data);
        const validKanji = data.kanjiItems.map(ki => ki.kanji).filter((k): k is KanjiData => k !== null);
        setKanjiList(validKanji);
      } finally {
        setLoading(false);
      }
    };
    fetchDeck();
  }, [deckId]);

  useEffect(() => {
    if (phase === "review" && reviewQueue.length === 0) {
      setReviewQueue([...kanjiList]);
    }
  }, [phase, kanjiList]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (phase === "learning") {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          if (!isFlipped) setIsFlipped(true);
          else nextLearningCard();
        }
      } else if (phase === "review" && isFlipped) {
        const ratingMap: Record<string, ReviewRating> = { "1": 0, "2": 1, "3": 2, "4": 3 };
        if (ratingMap[e.key] !== undefined) handleRating(ratingMap[e.key]);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase, isFlipped, currentIdx, reviewQueue]);

  const currentKanji = phase === "learning" ? kanjiList[currentIdx] : reviewQueue[currentIdx];

  const nextLearningCard = useCallback(() => {
    if (currentIdx < kanjiList.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setIsFlipped(false);
    } else {
      setPhase("review");
      setCurrentIdx(0);
      setIsFlipped(false);
    }
  }, [currentIdx, kanjiList.length]);

  const handleRating = async (rating: ReviewRating) => {
    if (!currentKanji || submitting) return;
    setSubmitting(true);
    try {
      await fetch("/api/progress/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kanjiId: currentKanji.id, rating, deckId }),
      });
      const labelMap: Record<ReviewRating, keyof typeof sessionStats> = { 0: "again", 1: "hard", 2: "good", 3: "easy" };
      setSessionStats(prev => ({ ...prev, [labelMap[rating]]: prev[labelMap[rating]] + 1 }));

      const newQueue = [...reviewQueue];
      newQueue.splice(currentIdx, 1);
      if (rating === 0) newQueue.push(currentKanji);

      if (newQueue.length === 0) {
        setPhase("complete");
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
          <p style={{ color: "#6B7280", fontSize: 14 }}>Loading deck...</p>
        </div>
      </div>
    );
  }

  if (!deck || kanjiList.length === 0) {
    return (
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAFA", padding: 24 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "48px 40px", maxWidth: 400, width: "100%", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <h3 style={{ fontSize: 20, color: "#374151", margin: "0 0 10px" }}>This deck is empty</h3>
          <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 24px" }}>Add some kanji to this deck before studying.</p>
          <Link href={`/decks/${deckId}`} style={{ background: "#DC2626", color: "#fff", textDecoration: "none", borderRadius: 12, padding: "12px 24px", fontSize: 15, fontWeight: 700 }}>
            Add Kanji →
          </Link>
        </div>
      </div>
    );
  }

  // Complete
  if (phase === "complete") {
    const total = sessionStats.again + sessionStats.hard + sessionStats.good + sessionStats.easy;
    const correct = sessionStats.good + sessionStats.easy;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    return (
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAFA", padding: 24 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "48px 40px", maxWidth: 480, width: "100%", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #F3F4F6", animation: "fadeUp 0.4s ease forwards" }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>{pct >= 80 ? "🎉" : pct >= 60 ? "💪" : "📚"}</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>Deck Complete!</h2>
          <p style={{ fontSize: 15, color: "#6B7280", margin: "0 0 28px" }}>
            Reviewed all {kanjiList.length} kanji from &quot;{deck.name}&quot;
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
            <button
              onClick={() => { setPhase("learning"); setCurrentIdx(0); setIsFlipped(false); setSessionStats({ again: 0, hard: 0, good: 0, easy: 0 }); setReviewQueue([]); }}
              style={{ background: "#DC2626", color: "#fff", border: "none", borderRadius: 12, padding: "13px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
            >
              Study Again
            </button>
            <Link href={`/decks/${deckId}`} style={{ background: "#FAFAFA", color: "#6B7280", textDecoration: "none", border: "1px solid #E5E7EB", borderRadius: 12, padding: "12px", fontSize: 14, display: "block" }}>
              Back to Deck
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
          <Link href={`/decks/${deckId}`} style={{ color: "#6B7280", textDecoration: "none", fontSize: 14 }}>
            ← {deck.name}
          </Link>
          <div style={{ background: phase === "learning" ? "#FEE2E2" : "#EFF6FF", color: phase === "learning" ? "#DC2626" : "#3B82F6", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 100 }}>
            {phase === "learning" ? "Learning" : "Review"}
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: "#6B7280" }}>
              {phase === "learning" ? `${currentIdx + 1} / ${kanjiList.length}` : `${reviewQueue.length} remaining`}
            </span>
            <span style={{ fontSize: 13, color: "#DC2626", fontWeight: 600 }}>
              {phase === "learning" ? Math.round((currentIdx / kanjiList.length) * 100) : Math.round(((kanjiList.length - reviewQueue.length) / kanjiList.length) * 100)}%
            </span>
          </div>
          <div style={{ height: 6, background: "#F3F4F6", borderRadius: 100, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: phase === "learning" ? `${(currentIdx / kanjiList.length) * 100}%` : `${((kanjiList.length - reviewQueue.length) / kanjiList.length) * 100}%`,
                background: "#DC2626",
                borderRadius: 100,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {currentKanji && (
          <>
            <FlashCard kanji={currentKanji} isFlipped={isFlipped} onFlip={() => setIsFlipped(!isFlipped)} />

            <div style={{ marginTop: 24, textAlign: "center" }}>
              {!isFlipped ? (
                <button
                  onClick={() => setIsFlipped(true)}
                  style={{ background: "#111827", color: "#fff", border: "none", borderRadius: 12, padding: "14px 40px", fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%", maxWidth: 320 }}
                >
                  Reveal ↩ (Space)
                </button>
              ) : phase === "learning" ? (
                <button
                  onClick={nextLearningCard}
                  style={{ background: "#DC2626", color: "#fff", border: "none", borderRadius: 12, padding: "14px 40px", fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%", maxWidth: 320 }}
                >
                  {currentIdx < kanjiList.length - 1 ? "Next Card →" : "Start Review →"}
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
                  <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 4px" }}>How well did you know this?</p>
                  <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 400 }}>
                    {RATING_CONFIG.map(r => (
                      <button
                        key={r.label}
                        onClick={() => handleRating(r.rating)}
                        disabled={submitting}
                        style={{
                          flex: 1,
                          background: r.bg,
                          color: r.color,
                          border: `1px solid ${r.color}30`,
                          borderRadius: 12,
                          padding: "12px 8px",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: submitting ? "not-allowed" : "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 2,
                          opacity: submitting ? 0.6 : 1,
                        }}
                        onMouseEnter={e => { if (!submitting) e.currentTarget.style.transform = "scale(1.04)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                      >
                        {r.label}
                        <span style={{ fontSize: 10, opacity: 0.6 }}>[{r.shortcut}]</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
