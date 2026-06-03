import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { usePrefs, loadPrefs, setAiVoice, setTeachStyle, setHandsFree, setKorPron, setKorTeach, setEsTeach } from "@/src/state/prefs";

const VOICES = [
  { id: "warm", label: "Warm & Friendly" },
  { id: "calm", label: "Calm & Clear" },
  { id: "energetic", label: "Energetic" },
];
const STYLES = [
  { id: "balanced", label: "Balanced" },
  { id: "strict", label: "Strict" },
  { id: "playful", label: "Playful" },
];

export default function Preferences() {
  const router = useRouter();
  const prefs = usePrefs();
  React.useEffect(() => { loadPrefs(); }, []);
  const [voiceOpen, setVoiceOpen] = React.useState(false);
  const [styleOpen, setStyleOpen] = React.useState(false);

  const voiceLabel = VOICES.find((v) => v.id === prefs.aiVoice)?.label || "Warm & Friendly";
  const styleLabel = STYLES.find((s) => s.id === prefs.teachStyle)?.label || "Balanced";

  return (
    <View style={styles.root}>
      <LinearGradient colors={["#0A0514", "#160C28"]} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity testID="prefs-back" onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Preferences</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <TouchableOpacity testID="prefs-ai-voice" onPress={() => setVoiceOpen((v) => !v)} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>Chingu's Voice</Text>
                <Text style={styles.rowSub}>AI Agent Voice</Text>
              </View>
              <Text style={styles.rowVal}>{voiceLabel}</Text>
              <Feather name={voiceOpen ? "chevron-up" : "chevron-down"} size={18} color="#7A6E91" />
            </TouchableOpacity>
            {voiceOpen && VOICES.map((v) => (
              <TouchableOpacity key={v.id} testID={`voice-${v.id}`} onPress={() => { setAiVoice(v.id); setVoiceOpen(false); }} style={[styles.option, prefs.aiVoice === v.id && styles.optionActive]}>
                <Text style={[styles.optionText, prefs.aiVoice === v.id && styles.optionTextActive]}>{v.label}</Text>
                {prefs.aiVoice === v.id && <Ionicons name="checkmark" size={18} color="#5B7CFA" />}
              </TouchableOpacity>
            ))}

            <View style={styles.divider} />

            <TouchableOpacity testID="prefs-style" onPress={() => setStyleOpen((v) => !v)} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>Teaching Style</Text>
              </View>
              <Text style={styles.rowVal}>{styleLabel}</Text>
              <Feather name={styleOpen ? "chevron-up" : "chevron-down"} size={18} color="#7A6E91" />
            </TouchableOpacity>
            {styleOpen && STYLES.map((s) => (
              <TouchableOpacity key={s.id} testID={`style-${s.id}`} onPress={() => { setTeachStyle(s.id); setStyleOpen(false); }} style={[styles.option, prefs.teachStyle === s.id && styles.optionActive]}>
                <Text style={[styles.optionText, prefs.teachStyle === s.id && styles.optionTextActive]}>{s.label}</Text>
                {prefs.teachStyle === s.id && <Ionicons name="checkmark" size={18} color="#5B7CFA" />}
              </TouchableOpacity>
            ))}

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>Hands-Free Mode</Text>
                <Text style={styles.rowSub}>Continuous listening</Text>
              </View>
              <Switch testID="toggle-hands-free" value={prefs.handsFree} onValueChange={setHandsFree} trackColor={{ true: "#5B7CFA", false: "#3a3454" }} />
            </View>
          </View>

          {/* Korean section */}
          <Text style={styles.sectionHead}>🇰🇷  Korean</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}><Text style={styles.rowTitle}>Show Pronunciation</Text></View>
              <Switch testID="toggle-kor-pron" value={prefs.korPron} onValueChange={setKorPron} trackColor={{ true: "#5B7CFA", false: "#3a3454" }} />
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <View style={{ flex: 1 }}><Text style={styles.rowTitle}>Teach in Korean</Text></View>
              <Switch testID="toggle-kor-teach" value={prefs.korTeach} onValueChange={setKorTeach} trackColor={{ true: "#5B7CFA", false: "#3a3454" }} />
            </View>
          </View>

          <Text style={styles.sectionHead}>🇪🇸  Spanish</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}><Text style={styles.rowTitle}>Teach in Spanish</Text></View>
              <Switch testID="toggle-es-teach" value={prefs.esTeach} onValueChange={setEsTeach} trackColor={{ true: "#5B7CFA", false: "#3a3454" }} />
            </View>
          </View>
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
  sectionHead: { color: "#9CA3AF", fontSize: 12, fontWeight: "700", letterSpacing: 1, marginBottom: 8, marginTop: 12, paddingLeft: 4 },
  card: { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", marginBottom: 16, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, gap: 10 },
  rowTitle: { color: "#fff", fontSize: 14, fontWeight: "600" },
  rowSub: { color: "#9CA3AF", fontSize: 11, marginTop: 2 },
  rowVal: { color: "#5B7CFA", fontSize: 13, fontWeight: "700" },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.06)" },
  option: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, paddingHorizontal: 24, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.04)" },
  optionActive: { backgroundColor: "rgba(91,124,250,0.08)" },
  optionText: { color: "#C9B8E4", fontSize: 13 },
  optionTextActive: { color: "#fff", fontWeight: "700" },
});
