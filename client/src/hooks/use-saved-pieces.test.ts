import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { getSavedIds, useSavedPieces } from "./use-saved-pieces";

const LS_KEY = "tpg_saved_pieces";

describe("getSavedIds", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns an empty array when localStorage is empty", () => {
    expect(getSavedIds()).toEqual([]);
  });

  it("returns the stored IDs when localStorage has valid data", () => {
    localStorage.setItem(LS_KEY, JSON.stringify(["id-1", "id-2"]));
    expect(getSavedIds()).toEqual(["id-1", "id-2"]);
  });

  it("returns an empty array when localStorage contains invalid JSON", () => {
    localStorage.setItem(LS_KEY, "{bad json}");
    expect(getSavedIds()).toEqual([]);
  });
});

describe("useSavedPieces", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(global, "fetch").mockResolvedValue(new Response(null, { status: 200 }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initialises with IDs from localStorage", () => {
    localStorage.setItem(LS_KEY, JSON.stringify(["piece-a", "piece-b"]));
    const { result } = renderHook(() => useSavedPieces());
    expect(result.current.savedIds).toEqual(["piece-a", "piece-b"]);
  });

  it("isSaved returns false for an unknown ID", () => {
    const { result } = renderHook(() => useSavedPieces());
    expect(result.current.isSaved("unknown")).toBe(false);
  });

  it("isSaved returns true for a known ID", () => {
    localStorage.setItem(LS_KEY, JSON.stringify(["piece-x"]));
    const { result } = renderHook(() => useSavedPieces());
    expect(result.current.isSaved("piece-x")).toBe(true);
  });

  it("toggleSave adds a new ID optimistically and calls POST /api/saved", async () => {
    const { result } = renderHook(() => useSavedPieces());
    const onToast = vi.fn();

    await act(async () => {
      await result.current.toggleSave("new-piece", onToast);
    });

    expect(result.current.isSaved("new-piece")).toBe(true);
    expect(getSavedIds()).toContain("new-piece");
    expect(onToast).toHaveBeenCalledWith(true);
    expect(fetch).toHaveBeenCalledWith(
      "/api/saved",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("toggleSave removes an existing ID optimistically and calls DELETE /api/saved/:id", async () => {
    localStorage.setItem(LS_KEY, JSON.stringify(["to-remove"]));
    const { result } = renderHook(() => useSavedPieces());
    const onToast = vi.fn();

    await act(async () => {
      await result.current.toggleSave("to-remove", onToast);
    });

    expect(result.current.isSaved("to-remove")).toBe(false);
    expect(getSavedIds()).not.toContain("to-remove");
    expect(onToast).toHaveBeenCalledWith(false);
    expect(fetch).toHaveBeenCalledWith(
      "/api/saved/to-remove",
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("toggleSave still updates local state even when the API call fails", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useSavedPieces());
    const onToast = vi.fn();

    await act(async () => {
      await result.current.toggleSave("offline-piece", onToast);
    });

    // localStorage is source of truth — optimistic update should persist
    expect(result.current.isSaved("offline-piece")).toBe(true);
    expect(getSavedIds()).toContain("offline-piece");
  });
});
