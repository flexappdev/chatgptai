"use client";

import { create } from "zustand";
import type { CanvasType } from "@/lib/canvas/parser";

export type OpenCanvas = {
  id?: string;
  identifier: string;
  title?: string;
  type: CanvasType;
  language?: string;
  content: string;
  version: number;
  versions?: { id: string; version: number; updated_at: string }[];
  streaming?: boolean;
};

type Store = {
  open: boolean;
  current: OpenCanvas | null;
  openCanvas(c: OpenCanvas): void;
  appendDelta(text: string): void;
  closeStreaming(): void;
  close(): void;
  setContent(text: string): void;
};

export const useCanvasPanel = create<Store>((set, get) => ({
  open: false,
  current: null,
  openCanvas(c) {
    set({ open: true, current: c });
  },
  appendDelta(text) {
    const cur = get().current;
    if (!cur) return;
    set({ current: { ...cur, content: cur.content + text } });
  },
  closeStreaming() {
    const cur = get().current;
    if (!cur) return;
    set({ current: { ...cur, streaming: false } });
  },
  close() {
    set({ open: false });
  },
  setContent(text) {
    const cur = get().current;
    if (!cur) return;
    set({ current: { ...cur, content: text } });
  },
}));
