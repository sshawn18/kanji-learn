"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Deck {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  _count: { kanjiItems: number };
}

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      const res = await fetch("/api/decks");
      const data = await res.json();
      setDecks(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (deckId: string) => {
    if (!confirm("Delete this deck? This cannot be undone.")) return;
    setDeleting(deckId);
    try {
      await fetch(`/api/decks/${deckId}`, { method: "DELETE" });
      setDecks(decks.filter(d => d.id !== deckId));
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAFA" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #FEE2E2", borderTopColor: "#DC2626", borderRadius: "50%", margin: "0 auto 12px" }} className="spinner" />
          <p style={{ color: "#6B7280", fontSize: 14 }}>Loading decks...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#FAFAFA", padding: "40px 24px 80px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: "0 0 6px", letterSpacing: "-0.5px" }}>
              My Decks
            </h1>
            <p style={{ fontSize: 15, color: "#6B7280", margin: 0 }}>
              {decks.length > 0 ? `${decks.length} custom deck${decks.length !== 1 ? "s" : ""}` : "Create custom kanji collections"}
            </p>
          </div>
          <Link
            href="/decks/new"
            style={{
              background: "#DC2626",
              color: "#fff",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 700,
              padding: "10px 20px",
              borderRadius: 10,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            + New Deck
          </Link>
        </div>

        {/* Empty state */}
        {decks.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: "2px dashed #E5E7EB",
              borderRadius: 20,
              padding: "72px 32px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 20 }}>📚</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#374151", margin: "0 0 10px" }}>
              No decks yet
            </h3>
            <p style={{ fontSize: 15, color: "#6B7280", margin: "0 0 28px", maxWidth: 360, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
              Create custom decks to organize kanji by topic, JLPT prep, or any theme you like.
            </p>
            <Link
              href="/decks/new"
              style={{
                background: "#DC2626",
                color: "#fff",
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 700,
                padding: "13px 28px",
                borderRadius: 12,
                display: "inline-block",
              }}
            >
              Create Your First Deck
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {decks.map(deck => (
              <div
                key={deck.id}
                style={{
                  background: "#fff",
                  border: "1px solid #F3F4F6",
                  borderRadius: 16,
                  padding: "22px",
                  transition: "all 0.2s",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Accent bar */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #DC2626, #F97316)" }} />

                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 12, marginTop: 4 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {deck.name}
                    </h3>
                    {deck.description && (
                      <p style={{ fontSize: 13, color: "#6B7280", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {deck.description}
                      </p>
                    )}
                  </div>
                  <div style={{ background: "#FEE2E2", color: "#DC2626", fontSize: 13, fontWeight: 700, padding: "3px 8px", borderRadius: 100, flexShrink: 0 }}>
                    {deck._count.kanjiItems}
                  </div>
                </div>

                <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 16 }}>
                  {deck._count.kanjiItems} kanji · Created {new Date(deck.createdAt).toLocaleDateString()}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <Link
                    href={`/decks/${deck.id}/study`}
                    style={{
                      flex: 1,
                      background: "#DC2626",
                      color: "#fff",
                      textDecoration: "none",
                      fontSize: 13,
                      fontWeight: 700,
                      padding: "9px 14px",
                      borderRadius: 9,
                      textAlign: "center",
                      display: "block",
                    }}
                  >
                    Study
                  </Link>
                  <Link
                    href={`/decks/${deck.id}`}
                    style={{
                      flex: 1,
                      background: "#F9FAFB",
                      color: "#374151",
                      textDecoration: "none",
                      fontSize: 13,
                      fontWeight: 600,
                      padding: "9px 14px",
                      borderRadius: 9,
                      textAlign: "center",
                      border: "1px solid #E5E7EB",
                      display: "block",
                    }}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(deck.id)}
                    disabled={deleting === deck.id}
                    style={{
                      background: "#FEF2F2",
                      color: "#DC2626",
                      border: "none",
                      borderRadius: 9,
                      padding: "9px 10px",
                      fontSize: 14,
                      cursor: deleting === deck.id ? "not-allowed" : "pointer",
                      opacity: deleting === deck.id ? 0.5 : 1,
                    }}
                    title="Delete deck"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
