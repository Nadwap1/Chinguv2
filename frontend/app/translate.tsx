import React from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useAudioPlayer } from "expo-audio";
import { useRouter } from "expo-router";

import LanguageBar from "@/src/components/LanguageBar";
import { api } from "@/src/api/client";
import { usePrefs, swapLangs, loadPrefs, bumpStreak } from "@/src/state/prefs";

export default function Translate() {
  const router = useRouter();
  const prefs = usePrefs();
  const [text, setText] = React.useState("");
  const [output, setOutput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [ttsLoading, setTtsLoading] = React.useState(false);
  const [audioUri, setAudioUri] = React.useState<string | null>(null);
  const player = useAudioPlayer(audioUri ? { uri: audioUri } : null);

  React.useEffect(() => { loadPrefs(); }, []);
  React.useEffect(() => { if (audioUri && player) { player.seekTo(0); player.play(); } }, [audioUri, player]);

  const onTranslate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const res = await api.translate({ text, source_lang: prefs.from, target_lang: prefs.to });
      setOutput(res.translated_text);
      try {
        await api.saveHistory({ kind: "text", source_text: text, translated_text: res.translated_text, source_lang: prefs.from, target_lang: prefs.to });
        bumpStreak();
      } catch {}
    } catch (e: any) { setOutput("Error: " + (e?.message || "Translation failed")); }
    finally { setLoading(false); }
  };
  const onSpeak = async () => {
    if (!output.trim()) return;
    setTtsLoading(true);
    try { const res = await api.tts({ text: output, target_lang: prefs.to }); setAudioUri(`data:${res.mime};base64,${res.audio_base64}`); }
    catch (e: any) { console.warn(e?.message); }
    finally { setTtsLoading(false); }
  };
  const onImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], base64: true, quality: 0.6 });
    if (result.canceled || !result.assets[0]?.base64) return;
    setLoading(true);
    try {
      const res = await api.translateImage({ image_base64: result.assets[0].base64, target_lang: prefs.to });
      setText(res.extracted_text || "");
      setOutput(res.translated_text);
      try { await api.saveHistory({ kind: "image", source_text: res.extracted_text || "(image)", translated_text: res.translated_text, source_lang: "auto", target_lang: prefs.to }); bumpStreak(); } catch {}
    } catch (e: any) { setOutput("Error: " + (e?.message || "Image translation failed")); }
    finally { setLoading(false); }
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={["#0A0514", "#160C28"]} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity testID="translate-back" onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Translate</Text>
          <View style={{ width: 38 }} />
        </View>

        <KeyboardAwareScrollView bottomOffset={120} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.subtitle}>Type, paste, or scan.</Text>

          <View style={{ marginTop: 14 }}>
            <LanguageBar fromCode={prefs.from} toCode={prefs.to} onSwap={swapLangs} />
          </View>

          <View style={styles.inputCard}>
            <TextInput testID="translate-input" value={text} onChangeText={setText} placeholder="Type something to translate…" placeholderTextColor="#7A6E91" multiline style={styles.input} />
            <View style={styles.inputActions}>
              <TouchableOpacity testID="translate-image-button" onPress={onImage} style={styles.iconBtnSm}>
                <Feather name="image" size={18} color="#C9B8E4" />
              </TouchableOpacity>
              {!!text && (
                <TouchableOpacity testID="clear-input-button" onPress={() => { setText(""); setOutput(""); }} style={styles.iconBtnSm}>
                  <Ionicons name="close" size={18} color="#C9B8E4" />
                </TouchableOpacity>
              )}
              <View style={{ flex: 1 }} />
              <TouchableOpacity testID="translate-submit-button" onPress={onTranslate} activeOpacity={0.85} disabled={loading || !text.trim()} style={{ opacity: loading || !text.trim() ? 0.5 : 1 }}>
                <LinearGradient colors={["#5B7CFA", "#8B5CF6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.goBtn}>
                  {loading ? <ActivityIndicator color="#fff" /> : <><Text style={styles.goText}>Translate</Text><Ionicons name="arrow-forward" size={16} color="#fff" /></>}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {!!output && (
            <View style={styles.outputCard}>
              <View style={styles.outputHead}>
                <Text style={styles.outputLabel}>TRANSLATION</Text>
                <TouchableOpacity testID="speak-output-button" onPress={onSpeak} style={styles.iconBtnSm}>
                  {ttsLoading ? <ActivityIndicator color="#5B7CFA" size="small" /> : <Ionicons name="volume-high" size={18} color="#5B7CFA" />}
                </TouchableOpacity>
              </View>
              <Text testID="translate-output-text" style={styles.outputText} selectable>{output}</Text>
            </View>
          )}
          <View style={{ height: 100 }} />
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0514" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 4 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.06)" },
  title: { color: "#fff", fontSize: 18, fontWeight: "700" },
  scroll: { paddingHorizontal: 20, paddingTop: 8 },
  subtitle: { color: "#9CA3AF", fontSize: 13 },
  inputCard: { marginTop: 18, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 16 },
  input: { color: "#fff", fontSize: 17, minHeight: 120, textAlignVertical: "top", lineHeight: 24 },
  inputActions: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  iconBtnSm: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  goBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 999 },
  goText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  outputCard: { marginTop: 16, backgroundColor: "rgba(91, 124, 250, 0.06)", borderRadius: 22, borderWidth: 1, borderColor: "rgba(91, 124, 250, 0.25)", padding: 18 },
  outputHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  outputLabel: { color: "#8FA8FF", fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  outputText: { color: "#fff", fontSize: 19, lineHeight: 28, fontWeight: "500" },
});
