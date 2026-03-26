"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const userInitial = session?.user?.name
    ? session.user.name.charAt(0).toUpperCase()
    : session?.user?.email?.charAt(0).toUpperCase() ?? "U";

  return (
    <nav
      style={{
        background: "#fff",
        borderBottom: "1px solid #E5E7EB",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
        >
          <span
            style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: 22,
              fontWeight: 900,
              color: "#DC2626",
              lineHeight: 1,
            }}
          >
            漢字
          </span>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#111827", letterSpacing: "-0.3px" }}>
            KanjiLearn
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {session ? (
            <>
              <Link
                href="/dashboard"
                style={{
                  color: "#374151",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 500,
                  padding: "6px 12px",
                  borderRadius: 8,
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                Dashboard
              </Link>
              <Link
                href="/study"
                style={{
                  color: "#374151",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 500,
                  padding: "6px 12px",
                  borderRadius: 8,
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                Study
              </Link>
              <Link
                href="/decks"
                style={{
                  color: "#374151",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 500,
                  padding: "6px 12px",
                  borderRadius: 8,
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                Decks
              </Link>

              {/* User avatar + dropdown */}
              <div style={{ position: "relative", marginLeft: 8 }}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "#DC2626",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {userInitial}
                </button>
                {dropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      background: "#fff",
                      border: "1px solid #E5E7EB",
                      borderRadius: 10,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                      minWidth: 180,
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                        {session.user?.name ?? "User"}
                      </div>
                      <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                        {session.user?.email}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      style={{
                        width: "100%",
                        background: "none",
                        border: "none",
                        padding: "10px 16px",
                        cursor: "pointer",
                        fontSize: 14,
                        color: "#6B7280",
                        textAlign: "left",
                        display: "block",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                style={{
                  color: "#374151",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 500,
                  padding: "6px 14px",
                  borderRadius: 8,
                }}
              >
                Login
              </Link>
              <Link
                href="/signup"
                style={{
                  background: "#DC2626",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  padding: "8px 18px",
                  borderRadius: 8,
                  marginLeft: 4,
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#B91C1C")}
                onMouseLeave={e => (e.currentTarget.style.background = "#DC2626")}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
