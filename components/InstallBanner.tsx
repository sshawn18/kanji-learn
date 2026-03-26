"use client";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed (running as standalone)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    // Check if dismissed before
    if (localStorage.getItem("pwa-banner-dismissed")) {
      setDismissed(true);
      return;
    }

    // iOS detection
    const isIOSDevice = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Android/Chrome: capture install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-banner-dismissed", "1");
    setDismissed(true);
  };

  // Don't show if: already installed, dismissed, or no prompt available (and not iOS)
  if (installed || dismissed || (!prompt && !isIOS)) return null;

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #E5E7EB",
      borderRadius: 12,
      padding: "14px 16px",
      marginBottom: 24,
      display: "flex",
      alignItems: "center",
      gap: 12,
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    }}>
      {/* Icon */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        background: "#DC2626",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: 22,
        color: "#fff",
        fontWeight: 900,
      }}>
        漢
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
          Add KanjiLearn to Home Screen
        </div>
        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
          {isIOS
            ? "Tap Share → \"Add to Home Screen\" in Safari"
            : "Install for quick access — works offline too"}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        {!isIOS && prompt && (
          <button
            onClick={handleInstall}
            style={{
              background: "#DC2626",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "7px 14px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Install
          </button>
        )}
        <button
          onClick={handleDismiss}
          style={{
            background: "none",
            border: "1px solid #E5E7EB",
            borderRadius: 8,
            padding: "7px 12px",
            fontSize: 13,
            color: "#6B7280",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {isIOS ? "OK" : "Not now"}
        </button>
      </div>
    </div>
  );
}
