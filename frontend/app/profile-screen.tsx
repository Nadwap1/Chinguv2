import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import LanguageBar from "@/src/components/LanguageBar";
import { usePrefs, swapLangs, loadPrefs, setUser } from "@/src/state/prefs";
import { getLanguage } from "@/src/constants/languages";

export default function ProfileScreen() {
  const router = useRouter();
  const prefs = usePrefs();
  const [aboutTaps, setAboutTaps] = React.useState(0);
  React.useEffect(() => { loadPrefs(); }, []);
  const from = getLanguage(prefs.from); const to = getLanguage(prefs.to);
  const onAbout = () => {
    const n = aboutTaps + 1; setAboutTaps(n);
    if (n >= 7) { setAboutTaps(0); router.push(prefs.adminToken ? "/admin" : "/admin-login"); return; }
    setTimeout(() => setAboutTaps(0), 2000);
  };
  const signedIn = !!prefs.userToken;
  const displayName = prefs.userName || (signedIn ? prefs.userEmail : "Chingu Guest");

  return (
    <View style={styles.root}>
      <LinearGradient colors={["#0A0514", "#160C28"]} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity testID="settings-button" onPress={() => router.push("/settings")} style={styles.iconBtn}>
            <Ionicons name="settings-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <LinearGradient colors={["#FF2E93", "#8B5CF6"]} start={{x:0,y:0}} end={{x:1,y:1}} style={StyleSheet.absoluteFill} />
            <Image source={{ uri: "https://images.pexels.com/photos/28408917/pexels-photo-28408917.jpeg" }} style={styles.heroAvatar} />
            <Text style={styles.heroName}>{displayName}</Text>
            <Text style={styles.heroSub}>{prefs.isPro ? "✨ Pro · Talking to the world" : "Talking to the world ✨"}</Text>
            <View style={styles.statRow}>
              <View style={styles.statBox}><Text style={styles.statNum}>{from.flag}</Text><Text style={styles.statLabel}>FROM</Text></View>
              <View style={styles.statBox}><Text style={styles.statNum}>{to.flag}</Text><Text style={styles.statLabel}>TO</Text></View>
              <View style={styles.statBox}><Text style={styles.statNum}>53+</Text><Text style={styles.statLabel}>LANGUAGES</Text></View>
            </View>
          </View>

          {/* Auth block */}
          {signedIn ? (
            <TouchableOpacity testID="profile-signout" onPress={() => setUser(null, null, null)} style={styles.authCard}>
              <Feather name="log-out" size={18} color="#FF6FB0" />
              <Text style={styles.authText}>Sign Out</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity testID="profile-signin" onPress={() => router.push("/auth")} style={styles.authCard}>
              <Ionicons name="log-in-outline" size={20} color="#fff" />
              <Text style={styles.authText}>Sign In or Create Account</Text>
              <Feather name="chevron-right" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}

          {/* Upgrade */}
          <TouchableOpacity testID="profile-upgrade" onPress={() => router.push("/paywall")} style={styles.upgradeWrap} activeOpacity={0.9}>
            <LinearGradient colors={prefs.isPro ? ["#10B981", "#34D399"] : ["#FF2E93", "#8B5CF6"]} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.upgrade}>
              <Text style={styles.upgradeText}>{prefs.isPro ? "👑 You're a Pro Member" : "✨ Upgrade to Chingu Speak Pro ✨"}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.section}>Default Languages</Text>
          <View style={styles.card}><LanguageBar fromCode={prefs.from} toCode={prefs.to} onSwap={swapLangs} /></View>

          <Text style={styles.section}>Quick Links</Text>
          <View style={styles.linkCard}>
            {[
              { icon: "chatbubbles" as const, label: "Chat with LingoBot", route: "/chat", color: "#FF2E93" },
              { icon: "camera" as const, label: "Scan & Translate", route: "/camera", color: "#8B5CF6" },
              { icon: "bookmark" as const, label: "Saved Translations", route: "/(tabs)/saved", color: "#3B82F6" },
              { icon: "options" as const, label: "Preferences", route: "/settings/preferences", color: "#10B981" },
              { icon: "trophy" as const, label: "Your Level", route: "/settings/level", color: "#FFC857" },
              { icon: "globe" as const, label: "App Language", route: "/settings/app-language", color: "#FF8FA3" },
              { icon: "notifications" as const, label: "Notifications", route: "/settings/notifications", color: "#5B7CFA" },
            ].map((row, i) => (
              <TouchableOpacity key={row.label} testID={`profile-link-${row.icon}`} onPress={() => router.push(row.route as any)} style={[styles.linkRow, i > 0 && styles.linkBorder]} activeOpacity={0.7}>
                <View style={[styles.linkIcon, { backgroundColor: row.color + "22", borderColor: row.color + "55" }]}>
                  <Ionicons name={row.icon} size={18} color={row.color} />
                </View>
                <Text style={styles.linkText}>{row.label}</Text>
                <Feather name="chevron-right" size={18} color="#7A6E91" />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity testID="profile-about" onPress={onAbout} style={styles.aboutLine}>
            <Text style={styles.aboutText}>About · v1.0</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0514" },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.06)" },
  title: { color: "#fff", fontSize: 26, fontWeight: "800" },
  heroCard: { borderRadius: 24, padding: 22, overflow: "hidden", alignItems: "center", marginBottom: 24 },
  heroAvatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: "rgba(255,255,255,0.5)" },
  heroName: { color: "#fff", fontSize: 20, fontWeight: "800", marginTop: 12 },
  heroSub: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4 },
  statRow: { flexDirection: "row", justifyContent: "space-around", width: "100%", marginTop: 20 },
  statBox: { alignItems: "center", flex: 1 },
  statNum: { color: "#fff", fontSize: 24, fontWeight: "800" },
  statLabel: { color: "rgba(255,255,255,0.75)", fontSize: 10, fontWeight: "700", marginTop: 4, letterSpacing: 1 },
  authCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, marginBottom: 16, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  authText: { color: "#fff", fontSize: 15, fontWeight: "700", flex: 1 },
  upgradeWrap: { marginBottom: 24 },
  upgrade: { paddingVertical: 16, borderRadius: 18, alignItems: "center" },
  upgradeText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  section: { color: "#fff", fontSize: 15, fontWeight: "700", marginBottom: 12 },
  card: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 20, padding: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 24 },
  linkCard: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 24, overflow: "hidden" },
  linkRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 14 },
  linkBorder: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  linkIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  linkText: { color: "#fff", fontSize: 15, fontWeight: "600", flex: 1 },
  aboutLine: { alignItems: "center", padding: 12 },
  aboutText: { color: "#7A6E91", fontSize: 12 },
});
