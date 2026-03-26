"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface KanjiData {
  id: string;
  character: string;
  level: string;
  meanings: string[];
  onyomi: string[];
  kunyomi: string[];
}

interface DeckKanjiItem {
  id: string;
  kanjiId: string;
  position: number;
  kanji: KanjiData | null;
}

interface Deck {
  id: string;
  name: string;
  description: string | null;
  kanjiItems: DeckKanjiItem[];
}

const LEVEL_COLORS: Record<string, string> = {
  N5: "#22C55E", N4: "#3B82F6", N3: "#F59E0B", N2: "#F97316", N1: "#DC2626",
};

export default function DeckDetailPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.deckId as string;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [descValue, setDescValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<KanjiData[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingKanji, setAddingKanji] = useState<string | null>(null);
  const [removingKanji, setRemovingKanji] = useState<string | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchDeck();
  }, [deckId]);

  const fetchDeck = async () => {
    try {
      const res = await fetch(`/api/decks/${deckId}`);
      if (!res.ok) { router.push("/decks"); return; }
      const data = await res.json();
      setDeck(data);
      setNameValue(data.name);
      setDescValue(data.description ?? "");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMeta = async () => {
    if (!deck) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/decks/${deckId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameValue, description: descValue || null }),
      });
      const updated = await res.json();
      setDeck(prev => prev ? { ...prev, name: updated.name, description: updated.description } : prev);
      setEditingName(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/kanji/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : []);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleAddKanji = async (kanjiId: string) => {
    setAddingKanji(kanjiId);
    try {
      await fetch(`/api/decks/${deckId}/kanji`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kanjiId }),
      });
      await fetchDeck();
    } finally {
      setAddingKanji(null);
    }
  };

  const handleRemoveKanji = async (kanjiId: string) => {
    setRemovingKanji(kanjiId);
    try {
      await fetch(`/api/decks/${deckId}/kanji`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kanjiId }),
      });
      setDeck(prev => prev ? { ...prev, kanjiItems: prev.kanjiItems.filter(ki => ki.kanjiId !== kanjiId) } : prev);
    } finally {
      setRemovingKanji(null);
    }
  };

  const deckKanjiIds = new Set(deck?.kanjiItems.map(ki => ki.kanjiId) ?? []);

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

  if (!deck) return null;

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#FAFAFA", padding: "40px 24px 80px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 14, color: "#6B7280" }}>
          <Link href="/decks" style={{ color: "#6B7280", textDecoration: "none" }}>Decks</Link>
          <span>›</span>
          <span style={{ color: "#111827", fontWeight: 500 }}>{deck.name}</span>
        </div>

        {/* Header */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "24px 28px", marginBottom: 24, border: "1px solid #F3F4F6" }}>
          {editingName ? (
            <div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, color: "#6B7280", marginBottom: 4 }}>Deck Name</label>
                <input
                  type="text"
                  value={nameValue}
                  onChange={e => setNameValue(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #DC2626", fontSize: 16, fontWeight: 700, outline: "none", boxSizing: "border-box" }}
                  autoFocus
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, color: "#6B7280", marginBottom: 4 }}>Description</label>
                <textarea
                  value={descValue}
                  onChange={e => setDescValue(e.target.value)}
                  rows={2}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={handleSaveMeta}
                  disabled={saving}
                  style={{ background: "#DC2626", color: "#fff", border: "none", borderRadius: 9, padding: "9px 20px", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => { setEditingName(false); setNameValue(deck.name); setDescValue(deck.description ?? ""); }}
                  style={{ background: "#F9FAFB", color: "#374151", border: "1px solid #E5E7EB", borderRadius: 9, padding: "9px 16px", fontSize: 14, cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "0 0 6px", letterSpacing: "-0.3px" }}>
                  {deck.name}
                </h1>
                {deck.description && (
                  <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 8px" }}>{deck.description}</p>
                )}
                <div style={{ fontSize: 13, color: "#9CA3AF" }}>
                  {deck.kanjiItems.length} kanji
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => setEditingName(true)}
                  style={{ background: "#F9FAFB", color: "#374151", border: "1px solid #E5E7EB", borderRadius: 9, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  ✏️ Edit
                </button>
                {deck.kanjiItems.length > 0 && (
                  <Link
                    href={`/decks/${deckId}/study`}
                    style={{ background: "#DC2626", color: "#fff", textDecoration: "none", borderRadius: 9, padding: "8px 16px", fontSize: 13, fontWeight: 700 }}
                  >
                    ▶ Study
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
          {/* Kanji in deck */}
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "#111827", margin: "0 0 16px" }}>
              Kanji in this deck ({deck.kanjiItems.length})
            </h2>
            {deck.kanjiItems.length === 0 ? (
              <div style={{ background: "#fff", border: "2px dashed #E5E7EB", borderRadius: 16, padding: "48px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>➕</div>
                <p style={{ fontSize: 15, color: "#6B7280", margin: 0 }}>
                  Search for kanji on the right to add them to this deck
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {deck.kanjiItems.map(item => {
                  const k = item.kanji;
                  if (!k) return null;
                  const color = LEVEL_COLORS[k.level] ?? "#6B7280";
                  return (
                    <div
                      key={item.id}
                      style={{
                        background: "#fff",
                        border: `1px solid ${color}30`,
                        borderRadius: 12,
                        padding: "10px 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        transition: "all 0.15s",
                        position: "relative",
                      }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                    >
                      <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: 28, fontWeight: 900, color: "#111827" }}>
                        {k.character}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: color, fontWeight: 700 }}>{k.level}</div>
                        <div style={{ fontSize: 12, color: "#374151", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {k.meanings[0]}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveKanji(item.kanjiId)}
                        disabled={removingKanji === item.kanjiId}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#9CA3AF",
                          cursor: "pointer",
                          fontSize: 14,
                          padding: "2px 4px",
                          borderRadius: 6,
                          lineHeight: 1,
                          opacity: removingKanji === item.kanjiId ? 0.4 : 1,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#DC2626")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}
                        title="Remove from deck"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Search sidebar */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid #F3F4F6", alignSelf: "start", position: "sticky", top: 88 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 14px" }}>Add Kanji</h3>
            <div style={{ position: "relative", marginBottom: 12 }}>
              <input
                type="text"
                placeholder="Search kanji, meaning..."
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #E5E7EB",
                  fontSize: 14,
                  outline: "none",
                  background: "#FAFAFA",
                  boxSizing: "border-box",
                }}
                onFocus={e => (e.target.style.borderColor = "#DC2626")}
                onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
              />
              {searching && (
                <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, border: "2px solid #E5E7EB", borderTopColor: "#DC2626", borderRadius: "50%" }} className="spinner" />
              )}
            </div>

            {searchResults.length > 0 && (
              <div style={{ maxHeight: 400, overflowY: "auto" }}>
                {searchResults.map(k => {
                  const isInDeck = deckKanjiIds.has(k.id);
                  const color = LEVEL_COLORS[k.level] ?? "#6B7280";
                  return (
                    <div
                      key={k.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 10px",
                        borderRadius: 10,
                        marginBottom: 4,
                        background: isInDeck ? "#F0FDF4" : "#FAFAFA",
                        border: `1px solid ${isInDeck ? "#86EFAC" : "#F3F4F6"}`,
                      }}
                    >
                      <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: 24, fontWeight: 700, color: "#111827", width: 36 }}>
                        {k.character}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, color, fontWeight: 700 }}>{k.level}</div>
                        <div style={{ fontSize: 12, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {k.meanings.slice(0, 2).join(", ")}
                        </div>
                      </div>
                      <button
                        onClick={() => !isInDeck && handleAddKanji(k.id)}
                        disabled={isInDeck || addingKanji === k.id}
                        style={{
                          background: isInDeck ? "#DCFCE7" : "#DC2626",
                          color: isInDeck ? "#16A34A" : "#fff",
                          border: "none",
                          borderRadius: 7,
                          padding: "4px 10px",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: isInDeck ? "default" : "pointer",
                          flexShrink: 0,
                          opacity: addingKanji === k.id ? 0.5 : 1,
                        }}
                      >
                        {isInDeck ? "Added ✓" : addingKanji === k.id ? "..." : "Add"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {searchQuery && !searching && searchResults.length === 0 && (
              <div style={{ textAlign: "center", padding: "20px", fontSize: 13, color: "#9CA3AF" }}>
                No kanji found for &quot;{searchQuery}&quot;
              </div>
            )}

            {!searchQuery && (
              <div style={{ textAlign: "center", padding: "20px", fontSize: 13, color: "#9CA3AF" }}>
                Type a kanji character, meaning, or reading to search
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
