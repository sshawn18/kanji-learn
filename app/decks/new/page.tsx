"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";

interface DeckForm {
  name: string;
  description: string;
}

export default function NewDeckPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DeckForm>();

  const nameValue = watch("name", "");

  const onSubmit = async (data: DeckForm) => {
    setServerError("");
    setLoading(true);
    try {
      const res = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, description: data.description || undefined }),
      });
      if (!res.ok) {
        const body = await res.json();
        setServerError(body.error || "Failed to create deck.");
        return;
      }
      const deck = await res.json();
      router.push(`/decks/${deck.id}`);
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#FAFAFA", padding: "40px 24px 80px" }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, fontSize: 14, color: "#6B7280" }}>
          <Link href="/decks" style={{ color: "#6B7280", textDecoration: "none" }}>Decks</Link>
          <span>›</span>
          <span style={{ color: "#111827", fontWeight: 500 }}>New Deck</span>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: "40px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            border: "1px solid #F3F4F6",
            animation: "fadeUp 0.4s ease forwards",
          }}
        >
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "0 0 8px", letterSpacing: "-0.3px" }}>
              Create New Deck
            </h1>
            <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>
              Give your deck a name and start adding kanji
            </p>
          </div>

          {serverError && (
            <div style={{ background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 14, color: "#B91C1C" }}>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Name */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Deck Name <span style={{ color: "#DC2626" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. JLPT N3 Vocab, Food Kanji, Work Terms..."
                {...register("name", {
                  required: "Name is required",
                  maxLength: { value: 60, message: "Max 60 characters" },
                })}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 10,
                  border: errors.name ? "1px solid #DC2626" : "1px solid #E5E7EB",
                  fontSize: 15,
                  outline: "none",
                  background: "#FAFAFA",
                  color: "#111827",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => (e.target.style.borderColor = "#DC2626")}
                onBlur={e => (e.target.style.borderColor = errors.name ? "#DC2626" : "#E5E7EB")}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                {errors.name ? (
                  <p style={{ fontSize: 12, color: "#DC2626", margin: 0 }}>{errors.name.message}</p>
                ) : <span />}
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>{nameValue.length}/60</span>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Description <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                placeholder="What is this deck for? e.g. Kanji from Chapter 5 of Genki II..."
                rows={3}
                {...register("description", {
                  maxLength: { value: 200, message: "Max 200 characters" },
                })}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 10,
                  border: "1px solid #E5E7EB",
                  fontSize: 15,
                  outline: "none",
                  background: "#FAFAFA",
                  color: "#111827",
                  boxSizing: "border-box",
                  resize: "vertical",
                  fontFamily: "inherit",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => (e.target.style.borderColor = "#DC2626")}
                onBlur={e => (e.target.style.borderColor = "#E5E7EB")}
              />
              {errors.description && (
                <p style={{ fontSize: 12, color: "#DC2626", margin: "4px 0 0" }}>{errors.description.message}</p>
              )}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  background: loading ? "#F87171" : "#DC2626",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "13px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {loading ? (
                  <>
                    <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%" }} className="spinner" />
                    Creating...
                  </>
                ) : (
                  "Create Deck →"
                )}
              </button>
              <Link
                href="/decks"
                style={{
                  background: "#F9FAFB",
                  color: "#374151",
                  textDecoration: "none",
                  border: "1px solid #E5E7EB",
                  borderRadius: 10,
                  padding: "13px 20px",
                  fontSize: 15,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
