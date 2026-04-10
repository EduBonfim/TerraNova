import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AppHeader } from "@/components/AppHeader";

// 🎨 PALETA OFICIAL TERRA NOVA
const theme = {
  colors: {
    primary: "#6B8E23",
    primaryDark: "#4A6B1A",
    lightGreen: "#E8F5E9",
    white: "#FFFFFF",
    background: "#F5F5F5",
    gray_200: "#E5E7EB",
    gray_400: "#9CA3AF",
    gray_500: "#6B7280",
    gray_800: "#1F2937",
    orange_500: "#F9A825",
    orange_light: "#FFF8E1",
  },
};

export default function RegisterTypeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <AppHeader
        title="Criar Conta"
        onBackPress={() => router.back()}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.primary}
        titleAlign="center"
        rightAccessory={<View style={{ width: 40 }} />}
      />

      <View style={styles.container}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="leaf" size={36} color={theme.colors.primary} />
          </View>
          <Text style={styles.title}>Bem-vindo ao Terra Nova</Text>
          <Text style={styles.subtitle}>
            Como você vai usar a plataforma? Escolha o perfil que melhor te descreve.
          </Text>
        </View>

        {/* Cards de seleção */}
        <View style={styles.cardsContainer}>

          {/* Card: Comprador */}
          <TouchableOpacity
            style={[styles.card, styles.cardBuyer]}
            onPress={() => router.push("/register-buyer" as never)}
            activeOpacity={0.85}
          >
            <View style={[styles.cardIconWrapper, styles.cardIconBuyer]}>
              <Ionicons name="bag-handle" size={32} color={theme.colors.orange_500} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Sou Comprador</Text>
              <Text style={styles.cardDescription}>
                Quero comprar produtos orgânicos e agroecológicos direto do produtor.
              </Text>
              <View style={styles.cardBadges}>
                <View style={styles.badge}>
                  <Ionicons name="checkmark-circle" size={13} color={theme.colors.orange_500} />
                  <Text style={styles.badgeText}>Compras no marketplace</Text>
                </View>
                <View style={styles.badge}>
                  <Ionicons name="checkmark-circle" size={13} color={theme.colors.orange_500} />
                  <Text style={styles.badgeText}>Rastreio de pedidos</Text>
                </View>
                <View style={styles.badge}>
                  <Ionicons name="checkmark-circle" size={13} color={theme.colors.orange_500} />
                  <Text style={styles.badgeText}>Cadastro rápido</Text>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color={theme.colors.orange_500} style={styles.cardArrow} />
          </TouchableOpacity>

          {/* Divisor */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Card: Produtor */}
          <TouchableOpacity
            style={[styles.card, styles.cardProducer]}
            onPress={() => router.push("/register")}
            activeOpacity={0.85}
          >
            <View style={[styles.cardIconWrapper, styles.cardIconProducer]}>
              <Ionicons name="leaf" size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: theme.colors.primary }]}>Sou Produtor</Text>
              <Text style={styles.cardDescription}>
                Tenho uma propriedade rural e quero vender meus produtos na plataforma.
              </Text>
              <View style={styles.cardBadges}>
                <View style={styles.badge}>
                  <Ionicons name="checkmark-circle" size={13} color={theme.colors.primary} />
                  <Text style={styles.badgeText}>Criar anúncios</Text>
                </View>
                <View style={styles.badge}>
                  <Ionicons name="checkmark-circle" size={13} color={theme.colors.primary} />
                  <Text style={styles.badgeText}>Gestão de estoque</Text>
                </View>
                <View style={styles.badge}>
                  <Ionicons name="checkmark-circle" size={13} color={theme.colors.primary} />
                  <Text style={styles.badgeText}>Relatórios e métricas</Text>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color={theme.colors.primary} style={styles.cardArrow} />
          </TouchableOpacity>

        </View>

        {/* Rodapé */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem uma conta?</Text>
          <TouchableOpacity onPress={() => router.replace("/login")}>
            <Text style={styles.loginLink}>Fazer login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 24,
    justifyContent: "space-between",
  },

  header: { alignItems: "center", marginBottom: 8 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.lightGreen,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.gray_500,
    textAlign: "center",
    lineHeight: 20,
  },

  cardsContainer: { flex: 1, justifyContent: "center", gap: 0 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    marginVertical: 6,
  },
  cardBuyer: {
    backgroundColor: theme.colors.orange_light,
    borderColor: theme.colors.orange_500,
  },
  cardProducer: {
    backgroundColor: theme.colors.lightGreen,
    borderColor: theme.colors.primary,
  },

  cardIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardIconBuyer: { backgroundColor: "rgba(249,168,37,0.15)" },
  cardIconProducer: { backgroundColor: "rgba(107,142,35,0.15)" },

  cardContent: { flex: 1 },
  cardTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: theme.colors.orange_500,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: theme.colors.gray_500,
    lineHeight: 18,
    marginBottom: 10,
  },
  cardBadges: { gap: 4 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  badgeText: {
    fontSize: 12,
    color: theme.colors.gray_800,
    fontWeight: "500",
  },
  cardArrow: { marginLeft: 6 },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.gray_200,
  },
  dividerText: {
    marginHorizontal: 12,
    color: theme.colors.gray_400,
    fontSize: 13,
    fontWeight: "500",
  },

  footer: { alignItems: "center", marginTop: 16 },
  footerText: { fontSize: 14, color: theme.colors.gray_500, marginBottom: 4 },
  loginLink: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
});
