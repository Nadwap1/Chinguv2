import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function Paywall() {
  const router = useRouter();
  return (
    <View style={styles.root}>
      <LinearGradient colors={["#0A0514", "#160C28"]} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity testID="paywall-close" onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.headline}>
            Join over <Text style={styles.headlineBlue}>3 million</Text> happy{"\n"}Chingu learners
          </Text>

          <View style={styles.priceCard}>
            <View style={styles.priceBanner}><Text style={styles.priceBannerText}>7 days free</Text></View>
            <View style={styles.priceRow}>
              <View>
                <Text style={styles.priceTitle}>Chingu Speak Pro</Text>
                <Text style={styles.priceSub}>12 mo · RON 499.99</Text>
              </View>
              <View style={styles.priceTag}>
                <Text style={styles.priceTagBig}>RON41.66</Text>
                <Text style={styles.priceTagSmall}>/mo</Text>
              </View>
            </View>
          </View>

          <View style={styles.testimonial}>
            <Text style={styles.testimonialQuote}>“This app improved my Korean speaking more in one week than a year of tutoring.”</Text>
            <Text style={styles.testimonialAuthor}>— User from California, USA</Text>
          </View>

          <View style={styles.starsBox}>
            <Text style={styles.stars}>★★★★★</Text>
            <Text style={styles.ratingText}>4.8 · 92k+ reviews</Text>
          </View>

          <View style={styles.checkRow}>
            <Ionicons name="checkmark-circle" size={20} color="#5B7CFA" />
            <Text style={styles.checkText}>Cancel before billing to pay nothing</Text>
          </View>

          <TouchableOpacity testID="paywall-cta" activeOpacity={0.9}>
            <LinearGradient colors={["#5B7CFA", "#4F6CE8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
              <Text style={styles.ctaText}>Start My Free Week</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity testID="paywall-view-all" style={styles.viewAll}>
            <Text style={styles.viewAllText}>View all plans</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0514" },
  header: { flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 16, paddingVertical: 8 },
  closeBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.06)" },
  headline: { color: "#fff", fontSize: 30, fontWeight: "900", textAlign: "center", lineHeight: 38, marginTop: 12, marginBottom: 32 },
  headlineBlue: { color: "#5B7CFA" },
  priceCard: { borderRadius: 22, borderWidth: 2, borderColor: "#5B7CFA", padding: 16, backgroundColor: "rgba(91,124,250,0.06)", marginBottom: 24 },
  priceBanner: { alignSelf: "flex-start", backgroundColor: "#5B7CFA", paddingHorizontal: 14, paddingVertical: 4, borderRadius: 10, marginBottom: 14 },
  priceBannerText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  priceTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  priceSub: { color: "#9CA3AF", fontSize: 12, marginTop: 4 },
  priceTag: { flexDirection: "row", alignItems: "flex-end" },
  priceTagBig: { color: "#fff", fontSize: 22, fontWeight: "900" },
  priceTagSmall: { color: "#9CA3AF", fontSize: 13, marginBottom: 2 },
  testimonial: { paddingVertical: 14 },
  testimonialQuote: { color: "#fff", fontSize: 14, fontStyle: "italic", textAlign: "center", lineHeight: 22 },
  testimonialAuthor: { color: "#9CA3AF", fontSize: 12, textAlign: "center", marginTop: 8 },
  starsBox: { alignItems: "center", marginVertical: 18 },
  stars: { color: "#FFD43B", fontSize: 28, letterSpacing: 4 },
  ratingText: { color: "#fff", fontSize: 12, marginTop: 6 },
  checkRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 14 },
  checkText: { color: "#9CA3AF", fontSize: 13 },
  cta: { paddingVertical: 18, borderRadius: 999, alignItems: "center", shadowColor: "#5B7CFA", shadowOpacity: 0.5, shadowRadius: 16, elevation: 10 },
  ctaText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  viewAll: { alignItems: "center", paddingVertical: 16 },
  viewAllText: { color: "#9CA3AF", fontSize: 13, fontWeight: "600" },
});
