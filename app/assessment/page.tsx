"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ASSESSMENT_QUESTIONS } from "@/lib/assessment-questions";
import type { JLPTLevel } from "@/lib/kanji-data/types";

const LEVEL_COLORS: Record<JLPTLevel, string> = {
  N5: "#22C55E",
  N4: "#3B82F6",
  N3: "#F59E0B",
  N2: "#F97316",
  N1: "#DC2626",
};

const LEVEL_DESCRIPTIONS: Record<JLPTLevel, string> = {
  N5: "Beginner — Basic everyday kanji",
  N4: "Elementary — Common school-level kanji",
  N3: "Intermediate — Newspaper-level kanji",
  N2: "Upper Intermediate — Business kanji",
  N1: "Advanced — Literary and specialized kanji",
};

export default function AssessmentPage() {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    recommended: JLPTLevel;
    scoreByLevel: Record<string, { correct: number; total: number }>;
  } | null>(null);

  const questions = ASSESSMENT_QUESTIONS;

  const handleAnswer = (idx: number) => {
    setSelectedAnswer(idx);
    const q = questions[currentQ];
    const newAnswers = { ...answers, [q.id]: idx };
    setAnswers(newAnswers);

    setTimeout(() => {
      setSelectedAnswer(null);
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        submitAssessment(newAnswers);
      }
    }, 400);
  };

  const submitAssessment = async (finalAnswers: Record<string, number>) => {
    setLoading(true);
    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  // Start screen
  if (!started) {
    return (
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAFA", padding: 24 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "56px 48px", maxWidth: 520, width: "100%", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #F3F4F6", animation: "fadeUp 0.4s ease forwards" }}>
          <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: 64, fontWeight: 900, color: "#DC2626", opacity: 0.1, marginBottom: -10 }}>
            漢字
          </div>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 24px" }}>
            📊
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: "0 0 12px", letterSpacing: "-0.3px" }}>
            JLPT Level Assessment
          </h1>
          <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.65, margin: "0 0 32px" }}>
            Answer {questions.length} multiple-choice questions about kanji meanings, readings, and usage. We&apos;ll determine your JLPT level automatically.
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 36 }}>
            {[
              { icon: "⏱️", label: `~${Math.ceil(questions.length / 5)} min` },
              { icon: "📝", label: `${questions.length} questions` },
              { icon: "🎯", label: "N5–N1 range" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStarted(true)}
            style={{ background: "#DC2626", color: "#fff", border: "none", borderRadius: 12, padding: "14px 36px", fontSize: 16, fontWeight: 700, cursor: "pointer", width: "100%", marginBottom: 12 }}
          >
            Start Assessment
          </button>
          <Link href="/" style={{ fontSize: 14, color: "#6B7280", textDecoration: "none" }}>
            Cancel
          </Link>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAFA" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "3px solid #FEE2E2", borderTopColor: "#DC2626", borderRadius: "50%", margin: "0 auto 20px" }} className="spinner" />
          <p style={{ color: "#374151", fontSize: 17, fontWeight: 600 }}>Analyzing your results...</p>
          <p style={{ color: "#6B7280", fontSize: 14, margin: "4px 0 0" }}>Computing your optimal JLPT level</p>
        </div>
      </div>
    );
  }

  // Results
  if (result) {
    const color = LEVEL_COLORS[result.recommended];
    const levels: JLPTLevel[] = ["N5", "N4", "N3", "N2", "N1"];
    return (
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAFA", padding: 24 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "48px 40px", maxWidth: 520, width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #F3F4F6", animation: "fadeUp 0.4s ease forwards" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28, fontWeight: 900, color }}>
              {result.recommended}
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>
              Recommended Level: {result.recommended}
            </h2>
            <p style={{ fontSize: 15, color: "#6B7280", margin: 0 }}>
              {LEVEL_DESCRIPTIONS[result.recommended]}
            </p>
          </div>

          {/* Score breakdown */}
          <div style={{ background: "#FAFAFA", borderRadius: 12, padding: "20px", marginBottom: 28 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#374151", margin: "0 0 14px" }}>Score Breakdown</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {levels.map(level => {
                const score = result.scoreByLevel[level];
                if (!score || score.total === 0) return null;
                const pct = Math.round((score.correct / score.total) * 100);
                const lColor = LEVEL_COLORS[level];
                return (
                  <div key={level} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, fontSize: 13, fontWeight: 700, color: lColor }}>{level}</div>
                    <div style={{ flex: 1, height: 8, background: "#E5E7EB", borderRadius: 100, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: lColor, borderRadius: 100, transition: "width 0.6s ease" }} />
                    </div>
                    <div style={{ fontSize: 13, color: "#6B7280", width: 60, textAlign: "right" }}>
                      {score.correct}/{score.total} ({pct}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={() => router.push("/dashboard")}
              style={{ background: "#DC2626", color: "#fff", border: "none", borderRadius: 12, padding: "13px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
            >
              Start Studying {result.recommended} →
            </button>
            <button
              onClick={() => {
                setStarted(false);
                setCurrentQ(0);
                setAnswers({});
                setResult(null);
              }}
              style={{ background: "#FAFAFA", color: "#6B7280", border: "1px solid #E5E7EB", borderRadius: 12, padding: "12px", fontSize: 14, cursor: "pointer" }}
            >
              Retake Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz in progress
  const q = questions[currentQ];
  const progress = ((currentQ) / questions.length) * 100;

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAFA", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "40px", maxWidth: 540, width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #F3F4F6" }}>
        {/* Progress bar */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>
              Question {currentQ + 1} of {questions.length}
            </span>
            <span style={{ fontSize: 12, color: "#9CA3AF", background: "#F3F4F6", padding: "2px 8px", borderRadius: 100 }}>
              {q.level}
            </span>
          </div>
          <div style={{ height: 6, background: "#F3F4F6", borderRadius: 100, overflow: "hidden" }}>
            <div
              style={{ height: "100%", width: `${progress}%`, background: "#DC2626", borderRadius: 100, transition: "width 0.4s ease" }}
            />
          </div>
        </div>

        {/* Kanji character */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 88,
              fontWeight: 900,
              color: "#111827",
              lineHeight: 1,
              marginBottom: 14,
              padding: "20px",
              background: "#FAFAFA",
              borderRadius: 16,
              display: "inline-block",
              minWidth: 140,
            }}
          >
            {q.character}
          </div>
          <p style={{ fontSize: 16, color: "#374151", margin: 0, fontWeight: 600 }}>{q.question}</p>
        </div>

        {/* Options */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {q.options.map((opt, idx) => {
            const isSelected = selectedAnswer === idx;
            return (
              <button
                key={idx}
                onClick={() => !selectedAnswer && handleAnswer(idx)}
                style={{
                  background: isSelected ? "#FEE2E2" : "#FAFAFA",
                  border: `1px solid ${isSelected ? "#DC2626" : "#E5E7EB"}`,
                  borderRadius: 12,
                  padding: "14px 16px",
                  fontSize: 14,
                  fontWeight: 500,
                  color: isSelected ? "#DC2626" : "#374151",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
                onMouseEnter={e => {
                  if (selectedAnswer === null) {
                    e.currentTarget.style.background = "#FEF2F2";
                    e.currentTarget.style.borderColor = "#FECACA";
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "#FAFAFA";
                    e.currentTarget.style.borderColor = "#E5E7EB";
                    e.currentTarget.style.color = "#374151";
                  }
                }}
              >
                <span style={{ width: 22, height: 22, borderRadius: 6, background: isSelected ? "#DC2626" : "#E5E7EB", color: isSelected ? "#fff" : "#6B7280", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {String.fromCharCode(65 + idx)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>
            No time limit — take your time
          </span>
        </div>
      </div>
    </div>
  );
}
