import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useAudioPlayer } from "expo-audio";

import { api } from "@/src/api/client";
import { getLanguage, TRANSLATABLE_LANGUAGES } from "@/src/constants/languages";
import { usePrefs, loadPrefs, setChatLang } from "@/src/state/prefs";

type Msg = { role: "user" | "assistant"; content: string; id: string };

const SUGGESTIONS = [
  "Teach me a fun Korean phrase",
  "How do I say 'thank you' in Moroccan Darija?",
  "Quiz me on French greetings",
  "Tell me a joke in Spanish",
];

export default function Chat() {
  const router = useRouter();
  const prefs = usePrefs();
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [picker, setPicker] = React.useState(false);
  const [audioUri, setAudioUri] = React.useState<string | null>(null);
  const player = useAudioPlayer(audioUri ? { uri: audioUri } : null);
  const listRef = React.useRef<FlatList<Msg>>(null);

  React.useEffect(() => {
    loadPrefs();
  }, []);

  React.useEffect(() => {
    (async () => {
      const sid = prefs.session;
      if (!sid) return;
      try {
        const h = await api.chatHistory(sid);
        if (h.messages?.length) {
          setMessages(h.messages.map((m, i) => ({ role: m.role as any, content: m.content, id: `${i}-${m.ts}` })));
        }
      } catch {}
    })();
  }, [prefs.session]);

  React.useEffect(() => {
    if (audioUri && player) {
      player.seekTo(0);
      player.play();
    }
  }, [audioUri, player]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || sending || !prefs.session) return;
    const userMsg: Msg = { role: "user", content: msg, id: `u-${Date.now()}` };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);
    try {
      const res = await api.chat({
        session_id: prefs.session,
        message: msg,
        practice_lang: prefs.chatLang || undefined,
      });
      setMessages((m) => [...m, { role: "assistant", content: res.reply, id: `a-${Date.now()}` }]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    } catch (e: any) {
      setMessages((m) => [...m, { role: "assistant", content: `(error) ${e?.message || "Try again"}`, id: `e-${Date.now()}` }]);
    } finally {
      setSending(false);
    }
  };

  const speak = async (text: string) => {
    try {
      const tts = await api.tts({ text, target_lang: prefs.chatLang || "en" });
      setAudioUri(`data:${tts.mime};base64,${tts.audio_base64}`);
    } catch (e: any) {
      console.warn(e?.message);
    }
  };

  const clear = async () => {
    if (!prefs.session) return;
    try {
      await api.clearChat(prefs.session);
      setMessages([]);
    } catch {}
  };

  const currentLang = prefs.chatLang ? getLanguage(prefs.chatLang) : null;

  return (
    <View style={styles.root}>
      <LinearGradient colors={["#0A0514", "#160C28"]} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity testID="chat-back" onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Image
              source={{ uri: "https://images.pexels.com/photos/28408917/pexels-photo-28408917.jpeg" }}
              style={styles.botAvatar}
            />
            <View>
              <Text style={styles.headerTitle}>LingoBot</Text>
              <Text style={styles.headerSub}>Your fun language friend</Text>
            </View>
          </View>
          <TouchableOpacity testID="chat-clear" onPress={clear} style={styles.iconBtn}>
            <Feather name="trash-2" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.practiceRow}>
          <TouchableOpacity
            testID="chat-lang-picker"
            style={styles.practiceChip}
            onPress={() => setPicker((p) => !p)}
          >
            <Text style={styles.practiceLabel}>Practice mode:</Text>
            <Text style={styles.practiceVal}>
              {currentLang ? `${currentLang.flag} ${currentLang.name}` : "Off"}
            </Text>
            <Ionicons name="chevron-down" size={14} color="#C9B8E4" />
          </TouchableOpacity>
          {prefs.chatLang && (
            <TouchableOpacity testID="chat-lang-clear" onPress={() => setChatLang(null)} style={styles.practiceClear}>
              <Ionicons name="close" size={14} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {picker && (
          <View style={styles.pickerCard}>
            <FlatList
              data={TRANSLATABLE_LANGUAGES.slice(0, 18)}
              numColumns={3}
              keyExtractor={(i) => i.code}
              contentContainerStyle={{ gap: 8 }}
              columnWrapperStyle={{ gap: 8 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  testID={`practice-lang-${item.code}`}
                  style={styles.pickerItem}
                  onPress={() => { setChatLang(item.code); setPicker(false); }}
                >
                  <Text style={styles.pickerFlag}>{item.flag}</Text>
                  <Text style={styles.pickerName} numberOfLines={1}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={20}
        >
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, paddingTop: 8, gap: 10 }}
            ListEmptyComponent={
              <View style={styles.welcome}>
                <Image
                  source={{ uri: "https://images.pexels.com/photos/28408917/pexels-photo-28408917.jpeg" }}
                  style={styles.welcomeOrb}
                />
                <Text style={styles.welcomeTitle}>Hey there! I'm LingoBot 👋</Text>
                <Text style={styles.welcomeSub}>
                  Ask me anything, practice a language, or just have fun.
                </Text>
                <View style={{ gap: 8, marginTop: 12, width: "100%" }}>
                  {SUGGESTIONS.map((s, i) => (
                    <TouchableOpacity
                      key={s}
                      testID={`suggestion-${i}`}
                      style={styles.suggestion}
                      onPress={() => send(s)}
                    >
                      <Feather name="zap" size={14} color="#FF2E93" />
                      <Text style={styles.suggestionText}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            }
            renderItem={({ item }) => (
              <View style={[styles.bubbleRow, item.role === "user" ? styles.rowRight : styles.rowLeft]}>
                {item.role === "assistant" && (
                  <View style={styles.botBubbleWrap}>
                    <LinearGradient
                      colors={["#FF2E93", "#8B5CF6"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.botBubble}
                    >
                      <Text style={styles.bubbleText} selectable>{item.content}</Text>
                    </LinearGradient>
                    <TouchableOpacity
                      testID={`chat-tts-${item.id}`}
                      onPress={() => speak(item.content)}
                      style={styles.ttsBtn}
                    >
                      <Ionicons name="volume-high" size={14} color="#FF2E93" />
                    </TouchableOpacity>
                  </View>
                )}
                {item.role === "user" && (
                  <View style={styles.userBubble}>
                    <Text style={styles.bubbleText} selectable>{item.content}</Text>
                  </View>
                )}
              </View>
            )}
          />
          {sending && (
            <View style={styles.typing}>
              <ActivityIndicator color="#FF2E93" />
              <Text style={styles.typingText}>LingoBot is thinking…</Text>
            </View>
          )}
          <View style={styles.inputBar}>
            <TextInput
              testID="chat-input"
              value={input}
              onChangeText={setInput}
              placeholder="Message LingoBot…"
              placeholderTextColor="#7A6E91"
              style={styles.input}
              multiline
            />
            <TouchableOpacity
              testID="chat-send"
              onPress={() => send()}
              disabled={!input.trim() || sending}
              style={{ opacity: !input.trim() || sending ? 0.4 : 1 }}
            >
              <LinearGradient colors={["#FF2E93", "#8B5CF6"]} style={styles.sendBtn}>
                <Ionicons name="send" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0514" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 8 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.06)" },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 10 },
  botAvatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: "#FF2E93" },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  headerSub: { color: "#9CA3AF", fontSize: 11 },
  practiceRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  practiceChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  practiceLabel: { color: "#9CA3AF", fontSize: 11 },
  practiceVal: { color: "#fff", fontSize: 12, fontWeight: "600" },
  practiceClear: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(239,68,68,0.6)" },
  pickerCard: { marginHorizontal: 16, marginBottom: 10, padding: 10, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  pickerItem: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 12, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  pickerFlag: { fontSize: 22 },
  pickerName: { color: "#fff", fontSize: 10, marginTop: 4, paddingHorizontal: 4 },
  welcome: { alignItems: "center", padding: 24, gap: 8 },
  welcomeOrb: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
  welcomeTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  welcomeSub: { color: "#9CA3AF", textAlign: "center" },
  suggestion: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  suggestionText: { color: "#fff", fontSize: 13, flex: 1 },
  bubbleRow: { flexDirection: "row" },
  rowLeft: { justifyContent: "flex-start" },
  rowRight: { justifyContent: "flex-end" },
  botBubbleWrap: { maxWidth: "85%" },
  botBubble: { borderRadius: 18, padding: 14, borderBottomLeftRadius: 4 },
  userBubble: { maxWidth: "85%", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 18, padding: 14, borderBottomRightRadius: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  bubbleText: { color: "#fff", fontSize: 15, lineHeight: 22 },
  ttsBtn: { marginTop: 6, alignSelf: "flex-start", width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  typing: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 22, marginBottom: 4 },
  typingText: { color: "#9CA3AF", fontSize: 12 },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 8, padding: 12, paddingBottom: 24, backgroundColor: "rgba(22,12,40,0.8)", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" },
  input: { flex: 1, color: "#fff", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 22, paddingHorizontal: 16, paddingVertical: 12, maxHeight: 120, fontSize: 15 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
});
