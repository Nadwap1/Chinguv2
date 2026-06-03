import React from "react";
import { storage } from "@/src/utils/storage";

const FROM_KEY = "polyglot:lang_from";
const TO_KEY = "polyglot:lang_to";
const CHAT_LANG_KEY = "polyglot:chat_lang";
const SESSION_KEY = "polyglot:session_id";

let _from = "en";
let _to = "ko";
let _chatLang: string | null = null;
let _session: string | null = null;
const listeners: Set<() => void> = new Set();

function emit() {
  listeners.forEach((l) => l());
}

export async function loadPrefs() {
  const [f, t, c, s] = await Promise.all([
    storage.getItem(FROM_KEY),
    storage.getItem(TO_KEY),
    storage.getItem(CHAT_LANG_KEY),
    storage.getItem(SESSION_KEY),
  ]);
  if (f) _from = f;
  if (t) _to = t;
  if (c) _chatLang = c;
  if (s) {
    _session = s;
  } else {
    _session = `sess-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
    await storage.setItem(SESSION_KEY, _session);
  }
  emit();
}

export function getPrefs() {
  return { from: _from, to: _to, chatLang: _chatLang, session: _session || "" };
}

export async function setFrom(code: string) {
  _from = code;
  await storage.setItem(FROM_KEY, code);
  emit();
}
export async function setTo(code: string) {
  _to = code;
  await storage.setItem(TO_KEY, code);
  emit();
}
export async function setChatLang(code: string | null) {
  _chatLang = code;
  if (code) await storage.setItem(CHAT_LANG_KEY, code);
  else await storage.removeItem(CHAT_LANG_KEY);
  emit();
}
export async function swapLangs() {
  if (_from === "auto") return;
  const tmp = _from;
  _from = _to;
  _to = tmp;
  await storage.setItem(FROM_KEY, _from);
  await storage.setItem(TO_KEY, _to);
  emit();
}

export function usePrefs() {
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const cb = () => setTick((n) => n + 1);
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, []);
  return getPrefs();
}
