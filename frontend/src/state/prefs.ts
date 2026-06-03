import React from "react";
import { storage } from "@/src/utils/storage";

// Keys
const FROM_KEY = "polyglot:lang_from";
const TO_KEY = "polyglot:lang_to";
const CHAT_LANG_KEY = "polyglot:chat_lang";
const SESSION_KEY = "polyglot:session_id";
const LEVEL_KEY = "chingu:level";
const APP_LANG_KEY = "chingu:app_lang";
const AI_VOICE_KEY = "chingu:ai_voice";
const TEACH_STYLE_KEY = "chingu:teach_style";
const HANDS_FREE_KEY = "chingu:hands_free";
const KOR_PRON_KEY = "chingu:kor_pron";
const KOR_TEACH_KEY = "chingu:kor_teach";
const ES_TEACH_KEY = "chingu:es_teach";
const REMIND_DAILY_KEY = "chingu:remind_daily";
const REMIND_SMART_KEY = "chingu:remind_smart";
const REMIND_TIME_KEY = "chingu:remind_time";
const STREAK_KEY = "chingu:streak";
const STREAK_DATE_KEY = "chingu:streak_date";
const ADMIN_TOKEN_KEY = "chingu:admin_token";

export type Prefs = {
  from: string;
  to: string;
  chatLang: string | null;
  session: string;
  level: number;
  appLang: string;
  aiVoice: string;
  teachStyle: string;
  handsFree: boolean;
  korPron: boolean;
  korTeach: boolean;
  esTeach: boolean;
  remindDaily: boolean;
  remindSmart: boolean;
  remindTime: string;
  streak: number;
  streakDate: string | null;
  adminToken: string | null;
};

let _state: Prefs = {
  from: "en",
  to: "ko",
  chatLang: null,
  session: "",
  level: 3,
  appLang: "en",
  aiVoice: "warm",
  teachStyle: "balanced",
  handsFree: false,
  korPron: true,
  korTeach: false,
  esTeach: false,
  remindDaily: true,
  remindSmart: true,
  remindTime: "17:00",
  streak: 0,
  streakDate: null,
  adminToken: null,
};

const listeners: Set<() => void> = new Set();
const emit = () => listeners.forEach((l) => l());

export async function loadPrefs() {
  const keys = [
    FROM_KEY, TO_KEY, CHAT_LANG_KEY, SESSION_KEY, LEVEL_KEY, APP_LANG_KEY,
    AI_VOICE_KEY, TEACH_STYLE_KEY, HANDS_FREE_KEY, KOR_PRON_KEY, KOR_TEACH_KEY,
    ES_TEACH_KEY, REMIND_DAILY_KEY, REMIND_SMART_KEY, REMIND_TIME_KEY,
    STREAK_KEY, STREAK_DATE_KEY, ADMIN_TOKEN_KEY,
  ];
  const vals = await Promise.all(keys.map((k) => storage.getItem(k)));
  const [f, t, c, s, lv, al, av, ts, hf, kp, kt, et, rd, rs, rt, st, sd, at] = vals;
  if (f) _state.from = f;
  if (t) _state.to = t;
  if (c) _state.chatLang = c;
  if (s) { _state.session = s; } else {
    _state.session = `sess-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
    await storage.setItem(SESSION_KEY, _state.session);
  }
  if (lv) _state.level = parseInt(lv, 10) || 3;
  if (al) _state.appLang = al;
  if (av) _state.aiVoice = av;
  if (ts) _state.teachStyle = ts;
  if (hf) _state.handsFree = hf === "1";
  if (kp !== null) _state.korPron = kp !== "0";
  if (kt) _state.korTeach = kt === "1";
  if (et) _state.esTeach = et === "1";
  if (rd !== null) _state.remindDaily = rd !== "0";
  if (rs !== null) _state.remindSmart = rs !== "0";
  if (rt) _state.remindTime = rt;
  if (st) _state.streak = parseInt(st, 10) || 0;
  if (sd) _state.streakDate = sd;
  if (at) _state.adminToken = at;
  emit();
}

export function getPrefs() { return { ..._state }; }

async function set<K extends keyof Prefs>(key: K, value: Prefs[K], storageKey: string, serialize?: (v: any) => string) {
  (_state as any)[key] = value;
  const v = serialize ? serialize(value) : (typeof value === "boolean" ? (value ? "1" : "0") : String(value));
  await storage.setItem(storageKey, v);
  emit();
}

export const setFrom = (c: string) => set("from", c, FROM_KEY);
export const setTo = (c: string) => set("to", c, TO_KEY);
export const setLevel = (n: number) => set("level", n, LEVEL_KEY);
export const setAppLang = (c: string) => set("appLang", c, APP_LANG_KEY);
export const setAiVoice = (v: string) => set("aiVoice", v, AI_VOICE_KEY);
export const setTeachStyle = (v: string) => set("teachStyle", v, TEACH_STYLE_KEY);
export const setHandsFree = (v: boolean) => set("handsFree", v, HANDS_FREE_KEY);
export const setKorPron = (v: boolean) => set("korPron", v, KOR_PRON_KEY);
export const setKorTeach = (v: boolean) => set("korTeach", v, KOR_TEACH_KEY);
export const setEsTeach = (v: boolean) => set("esTeach", v, ES_TEACH_KEY);
export const setRemindDaily = (v: boolean) => set("remindDaily", v, REMIND_DAILY_KEY);
export const setRemindSmart = (v: boolean) => set("remindSmart", v, REMIND_SMART_KEY);
export const setRemindTime = (v: string) => set("remindTime", v, REMIND_TIME_KEY);

export async function setChatLang(code: string | null) {
  _state.chatLang = code;
  if (code) await storage.setItem(CHAT_LANG_KEY, code);
  else await storage.removeItem(CHAT_LANG_KEY);
  emit();
}

export async function swapLangs() {
  if (_state.from === "auto") return;
  const tmp = _state.from;
  _state.from = _state.to;
  _state.to = tmp;
  await storage.setItem(FROM_KEY, _state.from);
  await storage.setItem(TO_KEY, _state.to);
  emit();
}

export async function setAdminToken(token: string | null) {
  _state.adminToken = token;
  if (token) await storage.setItem(ADMIN_TOKEN_KEY, token);
  else await storage.removeItem(ADMIN_TOKEN_KEY);
  emit();
}

export async function bumpStreak() {
  const today = new Date().toISOString().slice(0, 10);
  if (_state.streakDate === today) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const next = _state.streakDate === yesterday ? _state.streak + 1 : 1;
  _state.streak = next;
  _state.streakDate = today;
  await storage.setItem(STREAK_KEY, String(next));
  await storage.setItem(STREAK_DATE_KEY, today);
  emit();
}

export function usePrefs() {
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const cb = () => setTick((n) => n + 1);
    listeners.add(cb);
    return () => { listeners.delete(cb); };
  }, []);
  return getPrefs();
}
