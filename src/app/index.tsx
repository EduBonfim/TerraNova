import { useAuth } from "@/contexts/AuthContext";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { 
  FadeInDown, 
  FadeInUp, 
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useFocusEffect(
    React.useCallback(() => {
      if (!isLoading && user) {
        if (user.role === "admin") {
          if (user.pendingLgpdReacceptance) {
            router.replace({
              pathname: "/privacy-lgpd",
              params: { forceConsent: "1" },
            });
            return;
          }
          router.replace("/(admin)/home");
        } else if (user.role === "buyer") {
          router.replace("/(buyer)/home");
        } else {
          router.replace("/(producer)/home");
        }
      }
    }, [user, isLoading, router]),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Decorative Background Elements */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <View style={styles.container}>
        <ScrollView 
          style={styles.scroll} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* --- LOGO E TÍTULO --- */}
          <Animated.View entering={FadeInUp.duration(1000)} style={styles.logoContainer}>
            <View style={styles.logoShadow}>
              <View style={styles.logoCircle}>
                <Image
                  source={require("../assets/mascote.png")}
                  style={styles.avatar}
                />
              </View>
            </View>
            <Text style={styles.title}>Terra Nova</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>AGROECOLOGIA 2.0</Text>
            </View>
          </Animated.View>

          {/* --- DESCRIÇÃO DO APLICATIVO --- */}
          <Animated.View entering={FadeInDown.delay(200).duration(1000)}>
            <Text style={styles.description}>
              Transformando a agricultura através da tecnologia e economia circular. 
              Sua jornada sustentável começa aqui.
            </Text>

            <View style={styles.features}>
              <View style={styles.featureItem}>
                <View style={styles.iconCircle}>
                  <Ionicons name="leaf" size={18} color={theme.colors.primary} />
                </View>
                <Text style={styles.featureText}>IA para Saúde do Solo</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.iconCircle}>
                  <Ionicons name="location" size={18} color={theme.colors.primary} />
                </View>
                <Text style={styles.featureText}>Radar de Insumos Locais</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.iconCircle}>
                  <Ionicons name="ribbon" size={18} color={theme.colors.primary} />
                </View>
                <Text style={styles.featureText}>Certificação Facilitada</Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* --- BOTÕES DE ACESSO --- */}
        <Animated.View entering={FadeInDown.delay(400).duration(1000)} style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.primaryButtonText}>Acessar Portal</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/register-type")}
          >
            <Text style={styles.secondaryButtonText}>Criar nova conta</Text>
          </TouchableOpacity>
          
          <Text style={styles.versionText}>Versão 1.0.4 • © 2026 Terra Nova</Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAF8" },
  
  // Background Decorations
  bgCircle1: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "rgba(107, 142, 35, 0.04)",
  },
  bgCircle2: {
    position: "absolute",
    bottom: -50,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: "rgba(249, 168, 37, 0.04)",
  },

  container: { flex: 1, paddingHorizontal: 32, paddingBottom: Platform.OS === "ios" ? 10 : 20 },
  scroll: { flex: 1 },
  scrollContent: { paddingVertical: 10, paddingBottom: 80 },

  logoContainer: { alignItems: "center", marginBottom: SCREEN_HEIGHT < 700 ? 10 : 20 },
  logoShadow: {
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 20,
    marginBottom: 16,
  },
  logoCircle: {
    width: SCREEN_HEIGHT < 700 ? 120 : 150,
    height: SCREEN_HEIGHT < 700 ? 120 : 150,
    borderRadius: SCREEN_HEIGHT < 700 ? 35 : 45,
    backgroundColor: theme.colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: { 
    width: SCREEN_HEIGHT < 700 ? 120 : 150, 
    height: SCREEN_HEIGHT < 700 ? 120 : 150, 
    borderRadius: SCREEN_HEIGHT < 700 ? 25 : 30 
  },
  title: {
    fontSize: SCREEN_HEIGHT < 700 ? 32 : 40,
    fontWeight: "900",
    color: theme.colors.primary,
    textAlign: "center",
    letterSpacing: -1.5,
  },
  badge: {
    backgroundColor: "rgba(107, 142, 35, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: theme.colors.primary,
    letterSpacing: 2,
  },

  description: {
    fontSize: SCREEN_HEIGHT < 700 ? 14 : 16,
    color: theme.colors.gray_500,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: SCREEN_HEIGHT < 700 ? 16 : 24,
    fontWeight: "500",
  },

  features: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 28,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    marginBottom: 20,
    // Add depth to card
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  featureItem: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(107, 142, 35, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureText: {
    fontSize: 15,
    color: "#1E293B",
    fontWeight: "700",
  },

  footer: { 
    paddingTop: 32,
    backgroundColor: "#F8FAF8", 
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    height: 60,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    gap: 10,
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: "800",
  },

  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
  },
  secondaryButtonText: {
    color: theme.colors.gray_700,
    fontSize: 18,
    fontWeight: "700",
  },
  versionText: {
    textAlign: "center",
    fontSize: 11,
    color: theme.colors.gray_400,
    marginTop: 16,
    fontWeight: "500",
  },
});
