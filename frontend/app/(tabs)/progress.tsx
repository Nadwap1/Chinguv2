import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";

import { api, HistoryItem } from "@/src/api/client";
import { usePrefs, loadPrefs } from "@/src/state/prefs";
import { LEVELS } from "@/src/constants/app-data";

export default function Progress() {
  const prefs = usePrefs();
  const [items, setItems] = React.useState<HistoryItem[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      loadPrefs();
      (async () => {
        try { const r = await api.listHistory(); setItems(r.items); } catch {}
      })();
    }, []),
  );

  const counts: Record<string, number> = { text: 0, voice: 0, image: 0 };
  items.forEach((i) => { counts[i.kind] = (counts[i.kind] || 0) + 1; });
  const favCount = items.filter((i) => i.favorite).length;
  const level = LEVELS.find((l) => l.id === prefs.level) || LEVELS[2];

  // Last 7 days activity
  const today = new Date();
  const days: { day: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const c = items.filter((it) => (it.created_at || "").startsWith(key)).length;
    days.push({ day: ["S","M","T","W","T","F","S"][d.getDay()], count: c });
  }
  const maxCount = Math.max(1, ...days.map((d) => d.count));

  return (
    <View style={styles.root}>
      <LinearGradient colors={["#0A0514", "#160C28"]} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>Keep the streak alive!</Text>

          <View style={styles.heroCard}>
            <LinearGradient colors={["#5B7CFA", "#8B5CF6"]} start={{x:0,y:0}} end={{x:1,y:1}} style={StyleSheet.absoluteFill} />
            <View style={styles.heroRow}>
              <View>
                <Text style={styles.heroLabel}>CURRENT STREAK</Text>
                <View style={styles.streakNumRow}>
                  <Text style={styles.streakNum}>{prefs.streak}</Text>
                  <Text style={styles.fireBig}>🔥</Text>
                </View>
                <Text style={styles.heroDays}>days</Text>
              </View>
              <View style={styles.levelBadge}>
                <Text style={styles.levelLabel}>LEVEL {level.id}</Text>
                <Text style={styles.levelName}>{level.name}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.section}>This week</Text>
          <View style={styles.weekCard}>
            <View style={styles.weekRow}>
              {days.map((d, i) => (
                <View key={i} style={styles.dayCol}>
                  <View style={styles.barWrap}>
                    <View style={[styles.bar, { height: 6 + (d.count / maxCount) * 70, backgroundColor: d.count > 0 ? "#5B7CFA" : "rgba(255,255,255,0.1)" }]} />
                  </View>
                  <Text style={styles.dayLabel}>{d.day}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.section}>Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="text" size={20} color="#5B7CFA" />
              <Text style={styles.statNum}>{counts.text || 0}</Text>
              <Text style={styles.statLabel}>Text</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="mic" size={20} color="#FF8FA3" />
              <Text style={styles.statNum}>{counts.voice || 0}</Text>
              <Text style={styles.statLabel}>Voice</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="camera" size={20} color="#FFC857" />
              <Text style={styles.statNum}>{counts.image || 0}</Text>
              <Text style={styles.statLabel}>Photo</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="star" size={20} color="#FFD43B" />
              <Text style={styles.statNum}>{favCount}</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0514" },
  title: { color: "#fff", fontSize: 26, fontWeight: "800", marginTop: 4 },
  subtitle: { color: "#9CA3AF", fontSize: 13, marginTop: 4, marginBottom: 18 },
  heroCard: { borderRadius: 24, padding: 22, overflow: "hidden", marginBottom: 24 },
  heroRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  heroLabel: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  streakNumRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  streakNum: { color: "#fff", fontSize: 56, fontWeight: "900", lineHeight: 60 },
  fireBig: { fontSize: 36 },
  heroDays: { color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: "600" },
  levelBadge: { backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14 },
  levelLabel: { color: "rgba(255,255,255,0.8)", fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  levelName: { color: "#fff", fontSize: 14, fontWeight: "700", marginTop: 2 },
  section: { color: "#fff", fontSize: 15, fontWeight: "700", marginBottom: 12 },
  weekCard: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 20, padding: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 24 },
  weekRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 100 },
  dayCol: { alignItems: "center", flex: 1, justifyContent: "flex-end", height: "100%" },
  barWrap: { justifyContent: "flex-end", height: 80 },
  bar: { width: 16, borderRadius: 6 },
  dayLabel: { color: "#9CA3AF", fontSize: 11, marginTop: 6 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
  statCard: { width: "47%", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", gap: 6 },
  statNum: { color: "#fff", fontSize: 24, fontWeight: "800" },
  statLabel: { color: "#9CA3AF", fontSize: 12 },
});
