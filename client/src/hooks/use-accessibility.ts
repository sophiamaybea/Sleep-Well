import { useState, useEffect, useCallback } from "react";

export interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  largerText: boolean;
  dyslexiaFont: boolean;
  widerSpacing: boolean;
  focusMode: boolean;
  gardenLight: boolean;
}

const defaultSettings: AccessibilitySettings = {
  reducedMotion: false,
  highContrast: false,
  largerText: false,
  dyslexiaFont: false,
  widerSpacing: false,
  focusMode: false,
  gardenLight: true,
};

const STORAGE_KEY = "page-gallery-a11y";

function loadSettings(): AccessibilitySettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
  } catch {}
  return defaultSettings;
}

function applyToDOM(settings: AccessibilitySettings) {
  const root = document.documentElement;
  root.classList.toggle("a11y-reduced-motion", settings.reducedMotion);
  root.classList.toggle("a11y-high-contrast", settings.highContrast);
  root.classList.toggle("a11y-larger-text", settings.largerText);
  root.classList.toggle("a11y-dyslexia-font", settings.dyslexiaFont);
  root.classList.toggle("a11y-wider-spacing", settings.widerSpacing);
  root.classList.toggle("a11y-focus-mode", settings.focusMode);
  root.classList.toggle("garden-light", settings.gardenLight);
}

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(loadSettings);

  useEffect(() => {
    applyToDOM(settings);
  }, [settings]);

  useEffect(() => {
    applyToDOM(settings);
  }, []);

  const toggle = useCallback((key: keyof AccessibilitySettings) => {
    setSettings(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      applyToDOM(next);
      return next;
    });
  }, []);

  return { settings, toggle };
}
