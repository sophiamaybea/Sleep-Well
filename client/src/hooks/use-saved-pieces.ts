/**
 * Feature 2: localStorage-backed saved pieces
 * Key: tpg_saved_pieces — array of writing IDs
 * API call fires in background; localStorage is source of truth.
 */
import { useState, useCallback } from "react";

const LS_KEY = "tpg_saved_pieces";

export function getSavedIds(): string[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setSavedIds(ids: string[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(ids));
  } catch {
    // storage full or private mode — silently ignore
  }
}

export function useSavedPieces() {
  const [savedIds, setSavedIdsState] = useState<string[]>(() => getSavedIds());

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  const toggleSave = useCallback(
    async (writingId: string, onToast: (saved: boolean) => void) => {
      const current = getSavedIds();
      const alreadySaved = current.includes(writingId);
      const next = alreadySaved
        ? current.filter((id) => id !== writingId)
        : [...current, writingId];

      // Update localStorage and local state immediately
      setSavedIds(next);
      setSavedIdsState(next);
      onToast(!alreadySaved);

      // Fire API in background — failure is silent (localStorage is source of truth)
      try {
        if (!alreadySaved) {
          await fetch("/api/saved", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ writingId }),
          });
        } else {
          await fetch(`/api/saved/${writingId}`, {
            method: "DELETE",
            credentials: "include",
          });
        }
      } catch {
        // API unavailable — localStorage state already updated, that's fine
      }
    },
    []
  );

  return { isSaved, toggleSave, savedIds };
}
