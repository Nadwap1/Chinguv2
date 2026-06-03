import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { usePrefs, loadPrefs, setAppLang } from "@/src/state/prefs";
import { APP_LANGUAGES } from "@/src/constants/app-data";

export default function AppLanguage() {
  const router = useRouter();
  const prefs = usePrefs();
  React.useEffect(() => { loadPrefs(); }, []);

  return (
    <View style={styles.root}>
      <LinearGradient colors={["#0A0514", "#160C28"]} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity testID="applang-back" onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>App Language</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {APP_LANGUAGES.map((l) => {
            const active = prefs.appLang === l.code;
            return (
              <TouchableOpacity
                key={l.code}
                testID={`applang-${l.code}`}
                style={[styles.row, active && styles.rowActive]}
                activeOpacity={0.85}
                onPress={() => setAppLang(l.code)}
              >
                <View style={styles.flagCircle}>
                  <Text style={styles.flag}>{l.flag}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.eng}>{l.english}</Text>
                  <Text style={styles.native}>{l.native}</Text>
                </View>
                {active && <Ionicons name="checkmark-circle" size={20} color="#5B7CFA" />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0514" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 8 },
  backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.06)" },
  title: { color: "#fff", fontSize: 18, fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", marginBottom: 8 },
  rowActive: { borderColor: "#5B7CFA", backgroundColor: "rgba(91,124,250,0.08)" },
  flagCircle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" },
  flag: { fontSize: 26 },
  eng: { color: "#fff", fontSize: 15, fontWeight: "700" },
  native: { color: "#9CA3AF", fontSize: 12, marginTop: 2 },
});
