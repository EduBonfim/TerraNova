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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 🎨 PALETA OFICIAL TERRA NOVA já importada do theme

const IOS_VISUAL = {
  footerPaddingBottom: 20,
};

const ANDROID_VISUAL = {
  footerPaddingBottom: 0,
};

const CURRENT_PLATFORM_UI = Platform.OS === "ios" ? IOS_VISUAL : ANDROID_VISUAL;

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Se o histórico zerar ou o app abrir, joga o usuário logado de volta para sua respectiva home
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
      <View style={styles.container}>
        <View style={styles.content}>
          {/* --- LOGO E TÍTULO --- */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Image
                source={require("../assets/mascote.png")}
                style={styles.avatar}
              />
            </View>
            <Text style={styles.title}>Seja bem-vindo à Terra Nova</Text>
          </View>

          {/* --- DESCRIÇÃO DO APLICATIVO --- */}
          <Text style={styles.description}>
            A primeira plataforma dedicada à transição agroecológica. Conectamos
            agricultores para impulsionar a economia circular, facilitamos a
            venda de bioinsumos e utilizamos Inteligência Artificial para
            analisar a saúde do seu solo.
          </Text>

          <View style={styles.features}>
            <View style={styles.featureItem}>
              <Ionicons
                name="scan-outline"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.featureText}>IA para Leitura de Laudos</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons
                name="map-outline"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.featureText}>
                Radar de Insumos num raio de 15km
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons
                name="shield-checkmark-outline"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.featureText}>
                Apoio à Certificação Orgânica
              </Text>
            </View>
          </View>
        </View>

        {/* --- BOTÕES DE ACESSO --- */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.primaryButtonText}>Fazer Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/register-type")}
          >
            <Text style={styles.secondaryButtonText}>Criar nova conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// 💅 ESTILOS
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.white },
  container: { flex: 1, justifyContent: "space-between", padding: 24 },

  content: { flex: 1, justifyContent: "center" },
  logoContainer: { alignItems: "center", marginBottom: 32 },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 4,
  },
  avatar: { width: 160, height: 160, borderRadius: 50 },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: theme.colors.primary,
    textAlign: "center",
  },

  description: {
    fontSize: 16,
    color: theme.colors.gray_500,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },

  features: {
    backgroundColor: theme.colors.background,
    padding: 20,
    borderRadius: 16,
  },
  featureItem: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  featureText: {
    fontSize: 15,
    color: theme.colors.gray_800,
    marginLeft: 12,
    fontWeight: "500",
  },

  footer: { paddingBottom: CURRENT_PLATFORM_UI.footerPaddingBottom },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
  },
  primaryButtonText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },

  secondaryButton: {
    backgroundColor: theme.colors.lightGreen,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: "bold",
  },
});
