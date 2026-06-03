import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

const ORBITING_FLAGS = ["🇰🇷", "🇲🇦", "🇺🇸", "🇫🇷", "🇨🇳", "🇪🇸", "🇯🇵", "🇮🇳"];

function OrbitingFlag({ index, total }: { index: number; total: number }) {
  const progress = useSharedValue(0);
  React.useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 16000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [progress]);

  const radius = width * 0.36;
  const baseAngle = (index / total) * Math.PI * 2;

  const style = useAnimatedStyle(() => {
    const angle = baseAngle + progress.value * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return {
      transform: [{ translateX: x }, { translateY: y }],
    };
  });

  return (
    <Animated.View style={[styles.flagBubble, style]}>
      <Text style={styles.flagText}>{ORBITING_FLAGS[index]}</Text>
    </Animated.View>
  );
}

export default function Onboarding() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#0A0514", "#1B0A2E", "#0A0514"]}
        style={StyleSheet.absoluteFill}
      />
      {/* radial pink glow */}
      <View style={styles.glow} pointerEvents="none">
        <LinearGradient
          colors={["rgba(255,46,147,0.35)", "rgba(139,92,246,0.15)", "transparent"]}
          style={styles.glowInner}
        />
      </View>

      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.heroWrap}>
          <View style={styles.orbContainer}>
            <Image
              source={{ uri: "https://images.pexels.com/photos/28408917/pexels-photo-28408917.jpeg" }}
              style={styles.orbImage}
            />
            {ORBITING_FLAGS.map((_, i) => (
              <OrbitingFlag key={i} index={i} total={ORBITING_FLAGS.length} />
            ))}
          </View>
        </View>

        <View style={styles.bottomContent}>
          <Text style={styles.title}>
            Translate
            {"\n"}
            <Text style={styles.titleAccent}>Effortlessly</Text>
          </Text>
          <Text style={styles.subtitle}>
            Break language barriers with smart AI. Text, voice & images — instant Gemini-style live replies.
          </Text>

          <TouchableOpacity
            testID="get-started-button"
            activeOpacity={0.85}
            onPress={() => router.replace("/(tabs)")}
          >
            <LinearGradient
              colors={["#FF2E93", "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cta}
            >
              <Text style={styles.ctaText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            testID="skip-onboarding-button"
            onPress={() => router.replace("/(tabs)")}
            style={styles.secondary}
          >
            <Text style={styles.secondaryText}>Explore the app</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0514" },
  glow: { position: "absolute", top: -120, left: -80, right: -80, height: 520 },
  glowInner: { flex: 1, borderRadius: 999 },
  safe: { flex: 1, paddingHorizontal: 24 },
  heroWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  orbContainer: {
    width: width * 0.7,
    height: width * 0.7,
    alignItems: "center",
    justifyContent: "center",
  },
  orbImage: {
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: width * 0.275,
  },
  flagBubble: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  flagText: { fontSize: 26 },
  bottomContent: { paddingBottom: 8 },
  title: { color: "#fff", fontSize: 44, fontWeight: "900", lineHeight: 48, letterSpacing: -1 },
  titleAccent: { color: "#FF2E93" },
  subtitle: {
    color: "#C9B8E4",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 14,
    marginBottom: 28,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 999,
    gap: 10,
    shadowColor: "#FF2E93",
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  ctaText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  secondary: { alignItems: "center", marginTop: 16 },
  secondaryText: { color: "#9CA3AF", fontSize: 14 },
});
