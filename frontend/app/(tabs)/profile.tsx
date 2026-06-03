import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import LanguageBar from "@/src/components/LanguageBar";
import { usePrefs, swapLangs, loadPrefs } from "@/src/state/prefs";
import { getLanguage } from "@/src/constants/languages";

export default function Profile() {
  const router = useRouter();
  const prefs = usePrefs();
  React.useEffect(() => { loadPrefs(); }, []);
  const from = getLanguage(prefs.from);
  const to = getLanguage(prefs.to);

  return (
    <View style={styles.root}>
      <LinearGradient colors={["#0A0514", "#160C28"]} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Profile</Text>

          <View style={styles.heroCard}>
            <LinearGradient colors={["#FF2E93", "#8B5CF6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <Image source={{ uri: "https://images.pexels.com/photos/28408917/pexels-photo-28408917.jpeg" }} style={styles.heroAvatar} />
            <Text style={styles.heroName}>Polyglot Guest</Text>
            <Text style={styles.heroSub}>Talking to the world ✨</Text>
            <View style={styles.statRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>{from.flag}</Text>
                <Text style={styles.statLabel}>FROM</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>{to.flag}</Text>
                <Text style={styles.statLabel}>TO</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNum}>53+</Text>
                <Text style={styles.statLabel}>LANGUAGES</Text>
              </View>
            </View>
          </View>

          <Text style={styles.section}>Default Languages</Text>
          <View style={styles.card}>
            <LanguageBar fromCode={prefs.from} toCode={prefs.to} onSwap={swapLangs} />
          </View>

          <Text style={styles.section}>Quick Links</Text>
          <View style={styles.linkCard}>
            {[
              { icon: "chatbubbles", label: "Chat with LingoBot", route: "/chat", color: "#FF2E93" },
              { icon: "camera", label: "Scan & Translate", route: "/camera", color: "#8B5CF6" },
              { icon: "bookmark", label: "Saved Translations", route: "/(tabs)/saved", color: "#3B82F6" },
            ].map((row, i) => (
              <TouchableOpacity
                key={row.label}
                testID={`profile-link-${row.icon}`}
                onPress={() => router.push(row.route as any)}
                style={[styles.linkRow, i > 0 && styles.linkRowBorder]}
                activeOpacity={0.7}
              >
                <View style={[styles.linkIcon, { backgroundColor: row.color + "22", borderColor: row.color + "55" }]}>
                  <Ionicons name={row.icon as any} size={18} color={row.color} />
                </View>
                <Text style={styles.linkText}>{row.label}</Text>
                <Feather name="chevron-right" size={18} color="#7A6E91" />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Powered by Gemini 3 Flash · OpenAI Whisper · OpenAI TTS</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0514" },
  title: { color: "#fff", fontSize: 26, fontWeight: "800", marginBottom: 18 },
  heroCard: { borderRadius: 24, padding: 22, overflow: "hidden", alignItems: "center", marginBottom: 28 },
  heroAvatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: "rgba(255,255,255,0.5)" },
  heroName: { color: "#fff", fontSize: 20, fontWeight: "800", marginTop: 12 },
  heroSub: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4 },
  statRow: { flexDirection: "row", justifyContent: "space-around", width: "100%", marginTop: 20 },
  statBox: { alignItems: "center", flex: 1 },
  statNum: { color: "#fff", fontSize: 24, fontWeight: "800" },
  statLabel: { color: "rgba(255,255,255,0.75)", fontSize: 10, fontWeight: "700", marginTop: 4, letterSpacing: 1 },
  section: { color: "#fff", fontSize: 15, fontWeight: "700", marginBottom: 12 },
  card: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 20, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 24 },
  linkCard: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 24 },
  linkRow: { flexDirection: "row", alignItems: "center", padding: 16, gap: 14 },
  linkRowBorder: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  linkIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  linkText: { color: "#fff", fontSize: 15, fontWeight: "600", flex: 1 },
  footer: { alignItems: "center", marginTop: 12 },
  footerText: { color: "#7A6E91", fontSize: 11, textAlign: "center" },
});
