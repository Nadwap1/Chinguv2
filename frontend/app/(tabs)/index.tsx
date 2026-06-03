import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";

import { api, HistoryItem } from "@/src/api/client";
import { getLanguage } from "@/src/constants/languages";
import { loadPrefs } from "@/src/state/prefs";

const QUICK_ACTIONS = [
  { key: "text", title: "Translate", icon: "text", color: ["#FF2E93", "#FF6FB0"], route: "/(tabs)/translate" },
  { key: "image", title: "Camera", icon: "camera", color: ["#8B5CF6", "#B794F6"], route: "/camera" },
  { key: "voice", title: "Voice", icon: "mic", color: ["#3B82F6", "#60A5FA"], route: "/(tabs)/voice" },
  { key: "chat", title: "Chat Buddy", icon: "chatbubbles", color: ["#10B981", "#34D399"], route: "/chat" },
] as const;

export default function Home() {
  const router = useRouter();
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const res = await api.listHistory();
      setHistory(res.items.slice(0, 5));
    } catch (e) {
      console.warn("history load", e);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadPrefs();
      load();
    }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={["#0A0514", "#160C28"]} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl tintColor="#fff" refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.hi}>Hi there 👋</Text>
              <Text style={styles.helper}>How may I help you today?</Text>
            </View>
            <TouchableOpacity testID="profile-shortcut" style={styles.avatarWrap} onPress={() => router.push("/(tabs)/profile")}>
              <LinearGradient colors={["#FF2E93", "#8B5CF6"]} style={styles.avatar}>
                <Ionicons name="sparkles" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Hero AI card */}
          <View style={styles.heroCard}>
            <LinearGradient
              colors={["#FF2E93", "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroLeft}>
              <Image
                source={{ uri: "https://images.pexels.com/photos/28408917/pexels-photo-28408917.jpeg" }}
                style={styles.heroOrb}
              />
            </View>
            <View style={styles.heroRight}>
              <Text style={styles.heroTitle}>Smart AI Translator</Text>
              <Text style={styles.heroSub}>Text · Voice · Image, fast & live with Gemini.</Text>
              <TouchableOpacity
                testID="hero-start-chat-button"
                style={styles.heroBtn}
                onPress={() => router.push("/chat")}
                activeOpacity={0.85}
              >
                <Text style={styles.heroBtnText}>Chat with LingoBot</Text>
                <Ionicons name="arrow-forward" size={14} color="#FF2E93" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((a) => (
              <TouchableOpacity
                key={a.key}
                testID={`quick-action-${a.key}`}
                style={styles.actionCard}
                activeOpacity={0.85}
                onPress={() => router.push(a.route as any)}
              >
                <LinearGradient colors={a.color as any} style={styles.actionIcon}>
                  <Ionicons name={a.icon as any} size={22} color="#fff" />
                </LinearGradient>
                <Text style={styles.actionTitle}>{a.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent history */}
          <View style={styles.historyHead}>
            <Text style={styles.sectionTitle}>Recent History</Text>
            <TouchableOpacity testID="see-all-history" onPress={() => router.push("/(tabs)/saved")}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {history.length === 0 ? (
            <View style={styles.emptyCard}>
              <Feather name="book-open" size={28} color="#9CA3AF" />
              <Text style={styles.emptyText}>No translations yet. Start translating to see them here.</Text>
            </View>
          ) : (
            history.map((h) => {
              const from = getLanguage(h.source_lang);
              const to = getLanguage(h.target_lang);
              return (
                <TouchableOpacity
                  key={h.id}
                  testID={`history-card-${h.id}`}
                  style={styles.histCard}
                  activeOpacity={0.85}
                  onPress={() => router.push("/(tabs)/saved")}
                >
                  <View style={styles.histFlags}>
                    <Text style={styles.histFlag}>{from.flag}</Text>
                    <Text style={styles.histFlag}>{to.flag}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.histSource} numberOfLines={1}>{h.source_text}</Text>
                    <Text style={styles.histTrans} numberOfLines={1}>{h.translated_text}</Text>
                  </View>
                  <Ionicons name="arrow-up" size={14} color="#FF2E93" style={{ transform: [{ rotate: "45deg" }] }} />
                </TouchableOpacity>
              );
            })
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0514" },
  scroll: { paddingHorizontal: 20, paddingTop: 8 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  hi: { color: "#fff", fontSize: 26, fontWeight: "800" },
  helper: { color: "#9CA3AF", fontSize: 13, marginTop: 2 },
  avatarWrap: {},
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  heroCard: {
    height: 160,
    borderRadius: 24,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    marginBottom: 24,
  },
  heroLeft: { width: 110, alignItems: "center", justifyContent: "center" },
  heroOrb: { width: 110, height: 110, borderRadius: 55 },
  heroRight: { flex: 1, paddingLeft: 12 },
  heroTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  heroSub: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 4, lineHeight: 16 },
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 12,
  },
  heroBtnText: { color: "#FF2E93", fontSize: 12, fontWeight: "700" },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 14 },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 28,
  },
  actionCard: {
    width: "47%",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionTitle: { color: "#fff", fontSize: 15, fontWeight: "700" },
  historyHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  seeAll: { color: "#FF2E93", fontSize: 13, fontWeight: "600" },
  emptyCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  emptyText: { color: "#9CA3AF", textAlign: "center", fontSize: 13 },
  histCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 10,
  },
  histFlags: { flexDirection: "row" },
  histFlag: { fontSize: 20, marginRight: -6 },
  histSource: { color: "#fff", fontSize: 13, fontWeight: "600" },
  histTrans: { color: "#9CA3AF", fontSize: 12, marginTop: 2 },
});
