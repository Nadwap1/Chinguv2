import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import LanguageBar from "@/src/components/LanguageBar";
import { api } from "@/src/api/client";
import { usePrefs, loadPrefs } from "@/src/state/prefs";

export default function Camera() {
  const router = useRouter();
  const prefs = usePrefs();
  const [imageUri, setImageUri] = React.useState<string | null>(null);
  const [extracted, setExtracted] = React.useState("");
  const [translated, setTranslated] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => { loadPrefs(); }, []);

  const pick = async (fromCamera: boolean) => {
    setError(null);
    try {
      if (fromCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) { setError("Camera permission denied"); return; }
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) { setError("Photo library permission denied"); return; }
      }
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.6 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], base64: true, quality: 0.6 });
      if (result.canceled || !result.assets[0]?.base64) return;
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setLoading(true);
      const res = await api.translateImage({
        image_base64: asset.base64 as string,
        target_lang: prefs.to,
      });
      setExtracted(res.extracted_text);
      setTranslated(res.translated_text);
      try {
        await api.saveHistory({
          kind: "image",
          source_text: res.extracted_text || "(image)",
          translated_text: res.translated_text,
          source_lang: "auto",
          target_lang: prefs.to,
        });
      } catch {}
    } catch (e: any) {
      setError(e?.message || "Image translation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={["#0A0514", "#160C28"]} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity testID="camera-close" onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Scan & Translate</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <LanguageBar fromCode="auto" toCode={prefs.to} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
          <View style={styles.preview}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImg} resizeMode="cover" />
            ) : (
              <View style={styles.placeholder}>
                <LinearGradient
                  colors={["rgba(255,46,147,0.15)", "rgba(139,92,246,0.1)"]}
                  style={StyleSheet.absoluteFill}
                />
                <Feather name="camera" size={48} color="#FF2E93" />
                <Text style={styles.placeholderText}>Snap or pick an image with text</Text>
              </View>
            )}
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={{ color: "#fff", marginTop: 12, fontWeight: "600" }}>Reading & translating…</Text>
              </View>
            )}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity testID="camera-take-photo" style={styles.actionBtn} onPress={() => pick(true)}>
              <LinearGradient colors={["#FF2E93", "#8B5CF6"]} style={styles.actionInner}>
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={styles.actionText}>Take Photo</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity testID="camera-pick-image" style={styles.actionBtn} onPress={() => pick(false)}>
              <View style={[styles.actionInner, styles.actionGhost]}>
                <Feather name="image" size={20} color="#fff" />
                <Text style={styles.actionText}>From Gallery</Text>
              </View>
            </TouchableOpacity>
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}

          {!!extracted && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>EXTRACTED TEXT</Text>
              <Text style={styles.cardText} selectable>{extracted}</Text>
            </View>
          )}
          {!!translated && (
            <View style={[styles.card, styles.cardAccent]}>
              <Text style={[styles.cardLabel, { color: "#FF6FB0" }]}>TRANSLATION</Text>
              <Text style={styles.cardText} selectable>{translated}</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0514" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.08)" },
  title: { color: "#fff", fontSize: 18, fontWeight: "700" },
  preview: { height: 280, borderRadius: 22, overflow: "hidden", marginBottom: 16, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  previewImg: { width: "100%", height: "100%" },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  placeholderText: { color: "#C9B8E4", fontSize: 14 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(10,5,20,0.7)", alignItems: "center", justifyContent: "center" },
  actions: { flexDirection: "row", gap: 12, marginBottom: 16 },
  actionBtn: { flex: 1 },
  actionInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 999 },
  actionGhost: { backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  actionText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  error: { color: "#FCA5A5", textAlign: "center", marginVertical: 8 },
  card: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  cardAccent: { backgroundColor: "rgba(255, 46, 147, 0.07)", borderColor: "rgba(255, 46, 147, 0.25)" },
  cardLabel: { color: "#9CA3AF", fontSize: 10, fontWeight: "700", letterSpacing: 1, marginBottom: 8 },
  cardText: { color: "#fff", fontSize: 16, lineHeight: 24 },
});
