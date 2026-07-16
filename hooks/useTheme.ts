"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("theme") as Theme | null;
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function subscribeToHydration() {
  return () => {};
}

function getHydrationSnapshot() {
  return false;
}

function getClientSnapshot() {
  return true;
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readStoredTheme);
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getHydrationSnapshot,
  );

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme, mounted]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return { theme, setTheme, toggleTheme, mounted };
}
