"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { JLPTLevel } from "@/lib/kanji-data/types";
import { InstallBanner } from "@/components/InstallBanner";

const LEVEL_META: Record<JLPTLevel, { totalKanji: number; description: string; color: string }> = {
  N5: { totalKanji: 80, description: "Beginner", color: "#22C55E" },
  N4: { totalKanji: 170, description: "Elementary", color: "#3B82F6" },
  N3: { totalKanji: 370, description: "Intermediate", color: "#F59E0B" },
  N2: { totalKanji: 367, description: "Upper Int.", color: "#F97316" },
  N1: { totalKanji: 1232, description: "Advanced", color: "#DC2626" },
};

const LEVELS: JLPTLevel[] = ["N5", "N4", "N3", "N2", "N1"];

interface UserData {
  id: string;
  email: string;
  displayName: string | null;
  assessedLevel: string | null;
  streak: number;
  lastStudyDate: string | null;
}

interface ProgressItem {
  kanjiId: string;
  nextReviewAt: string;
  repetitions: number;
  totalReviews: number;
  correctReviews: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<UserData | null>(null);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, progressRes, dueRes] = await Promise.all([
          fetch("/api/user"),
          fetch("/api/progress"),
          fetch("/api/progress?dueOnly=true"),
        ]);
        const [userData, progressData, dueData] = await Promise.all([
          userRes.json(),
          progressRes.json(),
          dueRes.json(),
        ]);
        setUser(userData);
        setProgress(progressData);
        setDueCount(Array.isArray(dueData) ? dueData.length : 0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const displayName = user?.displayName || session?.user?.name || session?.user?.email || "Learner";
  const totalLearned = progress.filter(p => p.repetitions > 0).length;
  const totalReviews = progress.reduce((s, p) => s + p.totalReviews, 0);

  // Calculate kanji per level from progress
  const learnedByLevel: Record<string, number> = {};
  // We just show the assessed level and general stats

  if (loading) {
    return (
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAFA" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #FEE2E2", borderTopColor: "#DC2626", borderRadius: "50%", margin: "0 auto 16px" }} className="spinner" />
          <p style={{ color: "#6B7280", fontSize: 15 }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#FAFAFA", padding: "32px 24px 64px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <InstallBanner />

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: "clamp(22px, 6vw, 28px)", fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.5px" }}>
                Welcome back, {displayName.split(" ")[0]}!
              </h1>
              {(user?.streak ?? 0) > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#FEF3C7", color: "#D97706", fontSize: 13, fontWeight: 700, padding: "4px 10px", borderRadius: 100 }}>
                  🔥 {user?.streak}-day streak
                </div>
              )}
            </div>
            <p style={{ fontSize: 15, color: "#6B7280", margin: "0 0 16px" }}>
              {user?.assessedLevel ? `Studying ${user.assessedLevel} level kanji` : "Set up your level to get started"}
            </p>
            <Link
              href="/study"
              style={{ background: "#DC2626", color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 700, padding: "10px 20px", borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              ▶ Study Now
            </Link>
          </div>
        </div>

        {/* Due for review banner */}
        {dueCount > 0 && (
          <div
            style={{
              background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
              border: "1px solid #F59E0B",
              borderRadius: 14,
              padding: "18px 24px",
              marginBottom: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 24 }}>⏰</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#92400E" }}>
                  {dueCount} kanji due for review
                </div>
                <div style={{ fontSize: 13, color: "#B45309" }}>
                  Review now to strengthen your memory
                </div>
              </div>
            </div>
            <Link
              href="/study/review"
              style={{ background: "#F59E0B", color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 700, padding: "10px 20px", borderRadius: 10 }}
            >
              Start Review →
            </Link>
          </div>
        )}

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 36 }}>
          {[
            { label: "Kanji Learned", value: totalLearned.toString(), icon: "📖", color: "#DC2626" },
            { label: "Due for Review", value: dueCount.toString(), icon: "⏰", color: "#F59E0B" },
            { label: "Current Streak", value: `${user?.streak ?? 0} days`, icon: "🔥", color: "#F97316" },
            { label: "Total Reviews", value: totalReviews.toString(), icon: "✅", color: "#22C55E" },
          ].map(stat => (
            <div
              key={stat.label}
              style={{
                background: "#fff",
                border: "1px solid #F3F4F6",
                borderRadius: 16,
                padding: "20px 24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>{stat.label}</span>
                <span style={{ fontSize: 20 }}>{stat.icon}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#111827", letterSpacing: "-0.5px" }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Level Grid */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>JLPT Levels</h2>
            <Link href="/study" style={{ fontSize: 14, color: "#DC2626", textDecoration: "none", fontWeight: 600 }}>
              View all →
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {LEVELS.map(level => {
              const meta = LEVEL_META[level];
              const levelProgress = progress.filter(p => {
                // We'd need kanjiId to level mapping — approximate with 0 for now
                return false;
              });
              const isCurrentLevel = user?.assessedLevel === level;
              const pct = 0; // Will show real data when kanji-data index is available

              return (
                <Link
                  key={level}
                  href={`/study/${level}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      background: "#fff",
                      border: `2px solid ${isCurrentLevel ? meta.color : "#F3F4F6"}`,
                      borderRadius: 16,
                      padding: "20px",
                      transition: "all 0.2s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = `0 6px 20px ${meta.color}20`;
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.borderColor = meta.color;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.borderColor = isCurrentLevel ? meta.color : "#F3F4F6";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 900, color: meta.color, marginBottom: 2 }}>{level}</div>
                        <div style={{ fontSize: 12, color: "#6B7280" }}>{meta.description}</div>
                      </div>
                      {isCurrentLevel && (
                        <div style={{ background: `${meta.color}15`, color: meta.color, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 100 }}>
                          Current
                        </div>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ height: 6, background: "#F3F4F6", borderRadius: 100, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: meta.color, borderRadius: 100 }} />
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#9CA3AF" }}>{meta.totalKanji} kanji</span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: meta.color,
                          background: `${meta.color}10`,
                          padding: "3px 8px",
                          borderRadius: 100,
                        }}
                      >
                        {isCurrentLevel ? "Continue →" : "Start →"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: "0 0 20px" }}>Quick Actions</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            {[
              { href: "/study/review", icon: "⏰", label: "Review Due Cards", desc: `${dueCount} cards waiting`, color: "#F59E0B" },
              { href: "/decks/new", icon: "➕", label: "Create Deck", desc: "Organize your study", color: "#3B82F6" },
              { href: "/assessment", icon: "📊", label: "Take Assessment", desc: "Test your level", color: "#22C55E" },
              { href: "/decks", icon: "📚", label: "My Decks", desc: "View custom decks", color: "#F97316" },
            ].map(action => (
              <Link
                key={action.href}
                href={action.href}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #F3F4F6",
                    borderRadius: 14,
                    padding: "18px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    transition: "all 0.15s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${action.color}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                    {action.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 2 }}>{action.label}</div>
                    <div style={{ fontSize: 12, color: "#6B7280" }}>{action.desc}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* No level set warning */}
        {!user?.assessedLevel && (
          <div style={{ marginTop: 24, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 14, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1E40AF" }}>Set your level to get started</div>
              <div style={{ fontSize: 13, color: "#3B82F6" }}>Take a quick assessment to find your JLPT level</div>
            </div>
            <Link href="/onboarding" style={{ background: "#3B82F6", color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 700, padding: "10px 20px", borderRadius: 10 }}>
              Set Level →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
