import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  useAudioRecorder,
  useAudioPlayer,
  AudioModule,
  RecordingPresets,
} from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";

import LanguageBar from "@/src/components/LanguageBar";
import { api } from "@/src/api/client";
import { usePrefs, swapLangs, loadPrefs } from "@/src/state/prefs";

const BARS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

function Bar({ index, active }: { index: number; active: boolean }) {
  const h = useSharedValue(6);
  React.useEffect(() => {
    if (active) {
      h.value = withRepeat(
        withSequence(
          withTiming(20 + Math.random() * 50, { duration: 380 + index * 30, easing: Easing.inOut(Easing.quad) }),
          withTiming(8, { duration: 300, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        true,
      );
    } else {
      h.value = withTiming(6, { duration: 200 });
    }
  }, [active, h, index]);
  const style = useAnimatedStyle(() => ({ height: h.value }));
  return <Animated.View style={[styles.bar, style]} />;
}

export default function Voice() {
  const router = useRouter();
  const prefs = usePrefs();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [stage, setStage] = React.useState<"idle" | "recording" | "processing" | "done">("idle");
  const [transcript, setTranscript] = React.useState("");
  const [translated, setTranslated] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [audioUri, setAudioUri] = React.useState<string | null>(null);
  const player = useAudioPlayer(audioUri ? { uri: audioUri } : null);

  React.useEffect(() => {
    loadPrefs();
  }, []);

  React.useEffect(() => {
    if (audioUri && player) {
      player.seekTo(0);
      player.play();
    }
  }, [audioUri, player]);

  const startRecording = async () => {
    try {
      setError(null);
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        setError("Microphone permission denied. Enable it in settings.");
        return;
      }
      await AudioModule.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setStage("recording");
      setTranscript("");
      setTranslated("");
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e: any) {
      setError(e?.message || "Failed to start recording");
    }
  };

  const stopRecording = async () => {
    try {
      setStage("processing");
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) {
        setError("No recording captured");
        setStage("idle");
        return;
      }
      const b64 = await FileSystem.readAsStringAsync(uri, { encoding: "base64" as any });
      const mime = uri.toLowerCase().endsWith(".m4a") ? "audio/m4a" : "audio/mp4";
      const stt = await api.transcribe({
        audio_base64: b64,
        mime_type: mime,
        language: prefs.from !== "auto" ? prefs.from : undefined,
      });
      setTranscript(stt.text);

      if (!stt.text.trim()) {
        setStage("done");
        return;
      }

      const tr = await api.translate({
        text: stt.text,
        source_lang: prefs.from,
        target_lang: prefs.to,
      });
      setTranslated(tr.translated_text);
      try {
        await api.saveHistory({
          kind: "voice",
          source_text: stt.text,
          translated_text: tr.translated_text,
          source_lang: prefs.from,
          target_lang: prefs.to,
        });
      } catch {}

      // Auto-play TTS for fast Gemini-style reply
      try {
        const tts = await api.tts({ text: tr.translated_text, target_lang: prefs.to });
        setAudioUri(`data:${tts.mime};base64,${tts.audio_base64}`);
      } catch (e: any) {
        console.warn("tts", e?.message);
      }
      setStage("done");
    } catch (e: any) {
      setError(e?.message || "Voice processing failed");
      setStage("idle");
    }
  };

  const replay = async () => {
    if (audioUri && player) {
      player.seekTo(0);
      player.play();
    } else if (translated) {
      try {
        const tts = await api.tts({ text: translated, target_lang: prefs.to });
        setAudioUri(`data:${tts.mime};base64,${tts.audio_base64}`);
      } catch (e: any) {
        console.warn(e?.message);
      }
    }
  };

  const reset = () => {
    setStage("idle");
    setTranscript("");
    setTranslated("");
    setAudioUri(null);
    setError(null);
  };

  const recording = stage === "recording";
  const processing = stage === "processing";
  const done = stage === "done";

  return (
    <View style={styles.root}>
      <LinearGradient colors={["#0A0514", "#1B0A2E", "#0A0514"]} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={["top"]} style={{ flex: 1, paddingHorizontal: 20 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Voice Translator</Text>
          <Text style={styles.subtitle}>
            {recording ? "Speak Now, I'm Listening…" : "Tap the mic, speak, get instant reply."}
          </Text>
        </View>

        <View style={{ marginTop: 8 }}>
          <LanguageBar fromCode={prefs.from} toCode={prefs.to} onSwap={swapLangs} />
        </View>

        <View style={styles.centerArea}>
          <View style={styles.orbWrap}>
            <LinearGradient
              colors={["rgba(255,46,147,0.35)", "rgba(139,92,246,0.15)", "transparent"]}
              style={styles.orbGlow}
            />
            <View style={styles.waveform}>
              {BARS.map((i) => <Bar key={i} index={i} active={recording || processing} />)}
            </View>
          </View>

          {!!transcript && (
            <View style={styles.bubbleUser}>
              <Text style={styles.bubbleLabel}>YOU</Text>
              <Text style={styles.bubbleText}>{transcript}</Text>
            </View>
          )}
          {!!translated && (
            <View style={styles.bubbleBot}>
              <Text style={[styles.bubbleLabel, { color: "#FF6FB0" }]}>TRANSLATION</Text>
              <Text style={styles.bubbleText}>{translated}</Text>
            </View>
          )}
          {!!error && <Text style={styles.error}>{error}</Text>}
        </View>

        <View style={styles.controls}>
          {done ? (
            <>
              <TouchableOpacity testID="voice-replay-button" style={styles.smallBtn} onPress={replay}>
                <Ionicons name="play" size={18} color="#fff" />
                <Text style={styles.smallBtnText}>Replay</Text>
              </TouchableOpacity>
              <TouchableOpacity testID="voice-new-button" style={styles.smallBtn} onPress={reset}>
                <Ionicons name="refresh" size={18} color="#fff" />
                <Text style={styles.smallBtnText}>New</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              testID={recording ? "voice-stop-button" : "voice-start-button"}
              activeOpacity={0.85}
              onPress={recording ? stopRecording : startRecording}
              disabled={processing}
            >
              <LinearGradient
                colors={recording ? ["#EF4444", "#FF2E93"] : ["#FF2E93", "#8B5CF6"]}
                style={styles.bigMic}
              >
                {processing ? (
                  <ActivityIndicator color="#fff" size="large" />
                ) : (
                  <Ionicons name={recording ? "stop" : "mic"} size={44} color="#fff" />
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 90 }} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0514" },
  header: { paddingTop: 4, marginBottom: 12 },
  title: { color: "#fff", fontSize: 26, fontWeight: "800" },
  subtitle: { color: "#9CA3AF", fontSize: 13, marginTop: 4 },
  centerArea: { flex: 1, alignItems: "center", justifyContent: "center" },
  orbWrap: { width: 240, height: 240, alignItems: "center", justifyContent: "center" },
  orbGlow: { position: "absolute", width: 240, height: 240, borderRadius: 120 },
  waveform: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 80,
  },
  bar: {
    width: 5,
    borderRadius: 4,
    backgroundColor: "#FF2E93",
  },
  bubbleUser: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    padding: 14,
    borderRadius: 18,
    marginTop: 18,
    width: "100%",
  },
  bubbleBot: {
    backgroundColor: "rgba(255, 46, 147, 0.08)",
    borderColor: "rgba(255, 46, 147, 0.25)",
    borderWidth: 1,
    padding: 14,
    borderRadius: 18,
    marginTop: 12,
    width: "100%",
  },
  bubbleLabel: { color: "#9CA3AF", fontSize: 10, fontWeight: "700", letterSpacing: 1, marginBottom: 6 },
  bubbleText: { color: "#fff", fontSize: 16, lineHeight: 24 },
  error: { color: "#FCA5A5", marginTop: 16, textAlign: "center" },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 8,
  },
  bigMic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF2E93",
    shadowOpacity: 0.5,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  smallBtn: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  smallBtnText: { color: "#fff", fontWeight: "600" },
});
