# Chingu Speak — PRD

## Overview
AI translation + language-coach mobile app (Expo SDK 54, FastAPI, MongoDB). Speak/Vocab/Progress tabs, gear → Settings stack, hidden Admin panel. Inspired by Pingo/LingoBot.

## Tabs
1. **Speak (Home)** — Top bar: target-language pill + Level + 🔥 streak + ⚙ settings. Animated 3D orb, 4 progress dots, “Small talk & first impressions / Warm greetings”, full-width blue **Start** CTA → opens Voice. “Explore on my own” → Translate. Quick row: Chat, Camera, Translate.
2. **Vocab** — Saved translations + Favorites filter, star + delete.
3. **Progress** — Streak hero, weekly bar chart, Text/Voice/Photo/Saved counts.

## Stack screens (off-tabs)
- **Voice** — Whisper STT → translate → auto-play TTS, animated waveform, replay/new.
- **Translate** — text or image OCR → translate, speak output.
- **Camera** — snap or pick → OCR + translate.
- **Chat (LingoBot)** — Pingo-style friend chat, optional Practice Mode (any language), per-message TTS.
- **Language Picker** modal (50+ languages).

## Settings stack
- **/settings** — Account · Upgrade Pro · Preferences · Notifications · App Language · About (7-tap to admin) · Rate Us · Help · Contact · Sign Out · Privacy · Terms · Delete Account.
- **/settings/preferences** — Chingu's Voice (Warm/Calm/Energetic), Teaching Style (Balanced/Strict/Playful), Hands-Free toggle, Korean (Show Pronunciation, Teach in Korean), Spanish (Teach in Spanish).
- **/settings/level** — 5 levels with dot icons; Conversational (3) is the default highlighted block.
- **/settings/app-language** — 15 languages with circular flag + English + native spelling.
- **/settings/notifications** — Daily reminders + Smart scheduling toggles + Reminder time picker.
- **/paywall** — “Join over 3 million happy Chingu learners”, 7-day free banner, 12mo · RON499.99 (RON41.66/mo), testimonial, 4.8★ · 92k reviews, “Start My Free Week” CTA.

## Hidden Admin (chingunadi / 0644782611)
- Stats, Conversations (expand to see all messages, delete), Translations (delete), Export JSON/CSV.
- bcrypt + JWT (HS256, 12h), 5-attempt lockout for 5 minutes.

## AI Stack (Emergent Universal LLM Key)
- `gemini-3-flash-preview` — translation, OCR, LingoBot chat
- `openai/whisper-1` — STT
- `openai/tts-1` — TTS (voice auto-picked per language)

## Verified
- Backend 19/19 pytest cases passed; admin login, stats, conversations, translations, delete, export endpoints all return 200/401/404 correctly.
- Frontend renders Onboarding → Speak → Settings (verified via screenshots).

## Build / Publish
- Use the **Publish** button (top-right) to generate iOS/Android builds — no GitHub Actions APK workflow needed.
- Use **Save to GitHub** to mirror source code to your own repo.
