"use client";

import { useEffect } from "react";

export function CapacitorSplashHide() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Capacitor" in window)) return;

    import("@capacitor/splash-screen")
      .then(({ SplashScreen }) => SplashScreen.hide())
      .catch(() => {
        // Not running inside the Capacitor shell, or the plugin isn't
        // available — nothing to do.
      });
  }, []);

  return null;
}
