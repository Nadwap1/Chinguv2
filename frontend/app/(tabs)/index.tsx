import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing,
} from "react-native-reanimated";

import { usePrefs, loadPrefs } from "@/src/state/prefs";
import { TRANSLATABLE_LANGUAGES, getLanguage } from "@/src/constants/languages";
import { LEVELS, TOPICS } from "@/src/constants/app-data";

function Orb() {
  const s = useSharedValue(1);
  React.useEffect(() => {
    s.value = withRepeat(withTiming(1.07, { duration: 2200, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [s]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Animated.View style={style}>
      <Image
        source={{ uri: "https://images.pexels.com/photos/28408917/pexels-photo-28408917.jpeg" }}
        style={styles.orb}
      />
    </Animated.View>
  );
}

export default function Speak() {
  const router = useRouter();
  const prefs = usePrefs();
  React.useEffect(() => { loadPrefs(); }, []);
  const level = LEVELS.find((l) => l.id === prefs.level) || LEVELS[2];
  const targetLang = getLanguage(prefs.to);
  const topic = TOPICS[0];

  return (
    <View style={styles.root}>
      <LinearGradient colors={["#0A0514", "#160C28", "#0A0514"]} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              testID="topbar-language-pill"
              style={styles.langPill}
              onPress={() => router.push("/settings/level")}
              activeOpacity={0.85}
            >
              <Text style={styles.langFlag}>{targetLang.flag}</Text>
              <Text style={styles.langText}>Level {level.id}</Text>
              <Ionicons name="chevron-down" size={14} color="#fff" />
            </TouchableOpacity>

            <View style={styles.streakPill}>
              <Text style={styles.flame}>🔥</Text>
              <Text style={styles.streakNum}>{prefs.streak}</Text>
            </View>

            <TouchableOpacity
              testID="settings-button"
              style={styles.iconBtn}
              onPress={() => router.push("/settings")}
            >
              <Ionicons name="settings-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Orb */}
          <View style={styles.orbWrap}>
            <LinearGradient
              colors={["rgba(91,124,250,0.4)", "rgba(255,143,163,0.2)", "transparent"]}
              style={styles.orbGlow}
            />
            <Orb />
          </View>

          {/* Progress dots */}
          <View style={styles.progressRow}>
            <View style={[styles.progressPill, { backgroundColor: "#5B7CFA" }]} />
            <View style={[styles.progressPill, { backgroundColor: "#FF8FA3" }]} />
            <View style={[styles.progressPill, { backgroundColor: "#FFC857" }]} />
            <View style={[styles.progressPill, { backgroundColor: "rgba(255,255,255,0.15)" }]} />
          </View>

          {/* Headline */}
          <Text style={styles.headline}>{topic.title}</Text>
          <Text style={styles.subhead}>{topic.subtitle}</Text>

          {/* Start button */}
          <TouchableOpacity
            testID="start-session-button"
            activeOpacity={0.9}
            onPress={() => router.push("/voice")}
            style={styles.startBtnWrap}
          >
            <LinearGradient
              colors={["#5B7CFA", "#4F6CE8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startBtn}
            >
              <Ionicons name="mic" size={22} color="#fff" />
              <Text style={styles.startText}>Start</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            testID="explore-on-my-own"
            onPress={() => router.push("/translate")}
            style={styles.exploreLink}
          >
            <Text style={styles.exploreText}>Explore on my own</Text>
          </TouchableOpacity>

          {/* Quick actions */}
          <View style={styles.quickRow}>
            <TouchableOpacity
              testID="quick-chat"
              style={styles.quickCard}
              onPress={() => router.push("/chat")}
              activeOpacity={0.85}
            >
              <Ionicons name="chatbubbles" size={22} color="#FF8FA3" />
              <Text style={styles.quickText}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="quick-camera"
              style={styles.quickCard}
              onPress={() => router.push("/camera")}
              activeOpacity={0.85}
            >
              <Ionicons name="camera" size={22} color="#FFC857" />
              <Text style={styles.quickText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="quick-text"
              style={styles.quickCard}
              onPress={() => router.push("/translate")}
              activeOpacity={0.85}
            >
              <Ionicons name="text" size={22} color="#5B7CFA" />
              <Text style={styles.quickText}>Translate</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0514" },
  scroll: { paddingHorizontal: 20, paddingTop: 4 },
  topBar: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  langPill: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
  },
  langFlag: { fontSize: 18 },
  langText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  streakPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999,
    backgroundColor: "rgba(255,200,87,0.15)", borderWidth: 1, borderColor: "rgba(255,200,87,0.4)",
  },
  flame: { fontSize: 16 },
  streakNum: { color: "#FFC857", fontSize: 13, fontWeight: "700" },
  iconBtn: {
    marginLeft: "auto",
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  orbWrap: { alignItems: "center", justifyContent: "center", marginTop: 20, marginBottom: 24, height: 220 },
  orbGlow: { position: "absolute", width: 280, height: 280, borderRadius: 140 },
  orb: { width: 180, height: 180, borderRadius: 90 },
  progressRow: { flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 26 },
  progressPill: { width: 36, height: 10, borderRadius: 5 },
  headline: { color: "#fff", fontSize: 26, fontWeight: "800", textAlign: "center", paddingHorizontal: 20 },
  subhead: { color: "#9CA3AF", fontSize: 14, textAlign: "center", marginTop: 6, marginBottom: 32 },
  startBtnWrap: { alignSelf: "stretch" },
  startBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    paddingVertical: 18, borderRadius: 999,
    shadowColor: "#5B7CFA", shadowOpacity: 0.5, shadowRadius: 20, shadowOffset: { width: 0, height: 6 }, elevation: 10,
  },
  startText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  exploreLink: { alignItems: "center", paddingVertical: 16 },
  exploreText: { color: "#9CA3AF", fontSize: 14, fontWeight: "500" },
  quickRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  quickCard: {
    flex: 1, alignItems: "center", paddingVertical: 16, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", gap: 6,
  },
  quickText: { color: "#fff", fontSize: 12, fontWeight: "600" },
});
