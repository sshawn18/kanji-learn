"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ASSESSMENT_QUESTIONS } from "@/lib/assessment-questions";
import type { JLPTLevel } from "@/lib/kanji-data/types";

const LEVEL_INFO: Record<JLPTLevel, { description: string; kanjiCount: number; color: string; examples: string[] }> = {
  N5: { description: "Absolute beginner. Basic everyday kanji.", kanjiCount: 80, color: "#22C55E", examples: ["日", "月", "山", "水", "火"] },
  N4: { description: "Elementary. Common school-level kanji.", kanjiCount: 170, color: "#3B82F6", examples: ["電", "話", "食", "学", "校"] },
  N3: { description: "Intermediate. Newspaper-level kanji.", kanjiCount: 370, color: "#F59E0B", examples: ["経", "済", "政", "治", "法"] },
  N2: { description: "Upper intermediate. Business kanji.", kanjiCount: 367, color: "#F97316", examples: ["継", "続", "訓", "練", "技"] },
  N1: { description: "Advanced. Literary and specialized kanji.", kanjiCount: 1232, color: "#DC2626", examples: ["鑑", "憧", "翻", "醸", "蒸"] },
};

const LEVELS: JLPTLevel[] = ["N5", "N4", "N3", "N2", "N1"];

export default function OnboardingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"choose" | "assessment" | "manual">("choose");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ recommended: JLPTLevel } | null>(null);

  const questions = ASSESSMENT_QUESTIONS.slice(0, 15);

  const handleAnswer = (questionId: string, idx: number) => {
    const newAnswers = { ...answers, [questionId]: idx };
    setAnswers(newAnswers);
    if (currentQ < questions.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 300);
    } else {
      submitAssessment(newAnswers);
    }
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

  const handleManualLevel = async (level: JLPTLevel) => {
    setSelectedLevel(level);
    setLoading(true);
    try {
      await fetch("/api/user/level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level }),
      });
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleStartWithResult = () => {
    router.push("/dashboard");
  };

  // Assessment in progress
  if (mode === "assessment") {
    if (loading) {
      return (
        <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAFA" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 40, height: 40, border: "3px solid #FEE2E2", borderTopColor: "#DC2626", borderRadius: "50%", margin: "0 auto 16px" }} className="spinner" />
            <p style={{ color: "#6B7280", fontSize: 15 }}>Analyzing your results...</p>
          </div>
        </div>
      );
    }

    if (result) {
      const levelInfo = LEVEL_INFO[result.recommended];
      return (
        <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAFA", padding: 24 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "48px 40px", maxWidth: 480, width: "100%", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #F3F4F6", animation: "fadeUp 0.4s ease forwards" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: `${levelInfo.color}15`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 32, fontWeight: 900, color: levelInfo.color }}>
              {result.recommended}
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: "0 0 10px" }}>Your Level: {result.recommended}</h2>
            <p style={{ fontSize: 15, color: "#6B7280", margin: "0 0 8px" }}>{levelInfo.description}</p>
            <p style={{ fontSize: 14, color: "#9CA3AF", margin: "0 0 32px" }}>
              You&apos;ll start with {levelInfo.kanjiCount} kanji at this level
            </p>
            <button
              onClick={handleStartWithResult}
              style={{ background: "#DC2626", color: "#fff", border: "none", borderRadius: 12, padding: "14px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer", width: "100%" }}
            >
              Start Studying {result.recommended} →
            </button>
          </div>
        </div>
      );
    }

    const q = questions[currentQ];
    const progress = ((currentQ) / questions.length) * 100;

    return (
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAFA", padding: 24 }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "40px", maxWidth: 520, width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #F3F4F6" }}>
          {/* Progress */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>Question {currentQ + 1} of {questions.length}</span>
              <span style={{ fontSize: 13, color: "#DC2626", fontWeight: 600 }}>{Math.round(progress)}%</span>
            </div>
            <div style={{ height: 6, background: "#F3F4F6", borderRadius: 100, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "#DC2626", borderRadius: 100, transition: "width 0.3s ease" }} />
            </div>
          </div>

          {/* Question */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div
              style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: 72,
                fontWeight: 900,
                color: "#111827",
                lineHeight: 1.1,
                marginBottom: 12,
              }}
            >
              {q.character}
            </div>
            <p style={{ fontSize: 16, color: "#374151", margin: 0, fontWeight: 500 }}>{q.question}</p>
          </div>

          {/* Options */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(q.id, idx)}
                style={{
                  background: "#FAFAFA",
                  border: "1px solid #E5E7EB",
                  borderRadius: 12,
                  padding: "14px 16px",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#374151",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  textAlign: "left",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "#FEE2E2";
                  e.currentTarget.style.borderColor = "#DC2626";
                  e.currentTarget.style.color = "#DC2626";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "#FAFAFA";
                  e.currentTarget.style.borderColor = "#E5E7EB";
                  e.currentTarget.style.color = "#374151";
                }}
              >
                <span style={{ color: "#9CA3AF", marginRight: 8, fontWeight: 600 }}>
                  {String.fromCharCode(65 + idx)}.
                </span>
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Manual level picker
  if (mode === "manual") {
    return (
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAFA", padding: 24 }}>
        <div style={{ maxWidth: 600, width: "100%", animation: "fadeUp 0.4s ease forwards" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>Choose your starting level</h2>
            <p style={{ fontSize: 15, color: "#6B7280", margin: 0 }}>Select the JLPT level you want to study</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {LEVELS.map(level => {
              const info = LEVEL_INFO[level];
              const isSelected = selectedLevel === level;
              return (
                <button
                  key={level}
                  onClick={() => handleManualLevel(level)}
                  disabled={loading}
                  style={{
                    background: isSelected ? `${info.color}10` : "#fff",
                    border: `2px solid ${isSelected ? info.color : "#E5E7EB"}`,
                    borderRadius: 14,
                    padding: "18px 20px",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    transition: "all 0.15s",
                    textAlign: "left",
                    width: "100%",
                  }}
                  onMouseEnter={e => {
                    if (!loading) {
                      e.currentTarget.style.borderColor = info.color;
                      e.currentTarget.style.background = `${info.color}08`;
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = "#E5E7EB";
                      e.currentTarget.style.background = "#fff";
                    }
                  }}
                >
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: `${info.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: info.color, flexShrink: 0 }}>
                    {level}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 2 }}>{info.description}</div>
                    <div style={{ fontSize: 13, color: "#6B7280" }}>{info.kanjiCount} kanji</div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {info.examples.map(k => (
                      <span key={k} style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: 18, color: "#374151" }}>{k}</span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setMode("choose")}
            style={{ background: "none", border: "none", color: "#6B7280", fontSize: 14, cursor: "pointer", marginTop: 16, display: "block", width: "100%", textAlign: "center" }}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // Initial choice screen
  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAFA", padding: 24 }}>
      <div style={{ maxWidth: 680, width: "100%", animation: "fadeUp 0.4s ease forwards" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#111827", margin: "0 0 12px", letterSpacing: "-0.5px" }}>
            Let&apos;s find your level
          </h1>
          <p style={{ fontSize: 16, color: "#6B7280", margin: 0 }}>
            We&apos;ll set up your personalized study plan
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Assessment card */}
          <button
            onClick={() => setMode("assessment")}
            style={{
              background: "#fff",
              border: "2px solid #E5E7EB",
              borderRadius: 20,
              padding: "36px 28px",
              cursor: "pointer",
              textAlign: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "#DC2626";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(220,38,38,0.12)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "#E5E7EB";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ width: 64, height: 64, borderRadius: 18, background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 20px" }}>
              📝
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>Quick Assessment</h3>
            <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 16px", lineHeight: 1.5 }}>
              15 questions, ~3 minutes. We&apos;ll find your exact level.
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#FEE2E2", color: "#DC2626", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 100 }}>
              Recommended
            </div>
          </button>

          {/* Manual pick card */}
          <button
            onClick={() => setMode("manual")}
            style={{
              background: "#fff",
              border: "2px solid #E5E7EB",
              borderRadius: 20,
              padding: "36px 28px",
              cursor: "pointer",
              textAlign: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "#3B82F6";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(59,130,246,0.12)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "#E5E7EB";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ width: 64, height: 64, borderRadius: 18, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 20px" }}>
              🎯
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>Choose Your Level</h3>
            <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 16px", lineHeight: 1.5 }}>
              Already know your JLPT level? Pick it directly and start right away.
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#EFF6FF", color: "#3B82F6", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 100 }}>
              Quick Start
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
