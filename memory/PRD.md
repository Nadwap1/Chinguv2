# Polyglot AI Translator — PRD

## Overview
A Gemini-style AI translation mobile app (Expo React Native) with a fun LingoBot chat buddy (Pingo-inspired). Supports text, voice, and image translation across 50+ languages with instant TTS playback.

## Stack
- Frontend: Expo SDK 54, expo-router, react-native-reanimated, expo-linear-gradient, expo-audio, expo-image-picker, react-native-keyboard-controller
- Backend: FastAPI + MongoDB (Motor)
- AI: Gemini 3 Flash (translation, OCR, chat), OpenAI Whisper-1 (STT), OpenAI tts-1 (TTS) — all via Emergent Universal LLM Key

## Screens
1. **Onboarding** — animated 3D orb with orbiting flags + Get Started CTA
2. **Home (tab)** — greeting, hero AI card, 4 quick actions (Translate, Camera, Voice, Chat Buddy), recent history
3. **Translate (tab)** — text input, From/To language pills with swap, image-from-gallery shortcut, output card with TTS playback
4. **Voice (tab, floating mic)** — record → Whisper STT → translate → auto-play TTS, animated waveform, replay button
5. **Saved (tab)** — full history with All/Favorites filter, favorite toggle, delete
6. **Profile (tab)** — default language settings, quick links, branding
7. **Camera (modal)** — Take photo or pick from gallery → OCR + translate
8. **Chat (LingoBot)** — Pingo-style fun chat with persistent history, optional Practice Mode that makes the bot reply in any target language, per-message TTS playback, smart suggestions
9. **Language Picker (modal)** — search across 50+ languages

## Backend Endpoints (all under /api)
- `GET /languages` — list of supported languages
- `POST /translate` — text translation (returns id, translated_text, detected_source)
- `POST /translate-image` — base64 image → OCR + translate
- `POST /transcribe` — base64 audio → text (Whisper)
- `POST /tts` — text → base64 mp3 (voice auto-picked per language)
- `POST /chat`, `GET /chat/{sid}/history`, `DELETE /chat/{sid}` — LingoBot persistent chat
- `POST /history`, `GET /history`, `DELETE /history/{id}`, `POST /history/{id}/favorite` — translation history CRUD

## Verified
- 19/19 backend pytest cases passing (translate en→ko, en→fr, en→ar-ma Darija, auto→es; image OCR + translation; tts mp3 magic-byte verified; Whisper round-trip; chat session persistence; full history CRUD).
- Frontend renders onboarding orb, home with hero card, glassmorphic action grid, floating mic, recent history.

## Known Limits
- Voice recording requires a development build for full reliability on iOS (Expo Go limited). Web preview uses HTML media recorder if available.
- Heavy concurrent Gemini calls can hit the Emergent LLM Key per-window budget — surface a friendlier 429 message later.
