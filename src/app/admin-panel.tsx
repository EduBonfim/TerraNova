import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AppHeader } from "../components/AppHeader";
import { SurfaceCard } from "../components/SurfaceCard";
import { useAuth } from "../contexts/AuthContext";
import { getAdminUserSummaries, type AdminUserSummary } from "../services/authStore";

const theme = {
  colors: {
    primary: "#6B8E23",
    white: "#FFFFFF",
    background: "#F5F5F5",
    gray_200: "#E5E7EB",
    gray_500: "#6B7280",
    gray_800: "#1F2937",
    gray_900: "#111827",
    orange_500: "#F9A825",
    red_500: "#EF4444",
  },
};

const overviewCards = [
  { id: "u", label: "Usuarios ativos", value: "1.284", icon: "people" as const },
  { id: "a", label: "Anuncios ativos", value: "362", icon: "pricetags" as const },
  { id: "n", label: "Negociacoes hoje", value: "89", icon: "chatbubbles" as const },
  { id: "d", label: "Denuncias abertas", value: "17", icon: "flag" as const },
];

export default function AdminPanelScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [userSummaries, setUserSummaries] = useState<AdminUserSummary[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      const data = await getAdminUserSummaries();
      if (!isMounted) return;
      setUserSummaries(data);
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <AppHeader
        title="Painel Admin"
        subtitle={`Sessao: ${user?.fullName || "Administrador"}`}
        onBackPress={() => router.replace("/admin-panel")}
        showBackButton={false}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.gray_200}
        rightAccessory={
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color={theme.colors.white} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          {overviewCards.map((card) => (
            <SurfaceCard key={card.id} style={styles.card}>
              <Ionicons name={card.icon} size={20} color={theme.colors.primary} />
              <Text style={styles.cardValue}>{card.value}</Text>
              <Text style={styles.cardLabel}>{card.label}</Text>
            </SurfaceCard>
          ))}
        </View>

        <SurfaceCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Atencao imediata</Text>
          <Text style={styles.sectionText}>5 contas com risco de fraude documental aguardando revisao.</Text>
          <Text style={styles.sectionText}>3 anuncios suspensos por suspeita de informacao falsa.</Text>
          <Text style={styles.sectionText}>2 disputas de entrega em mediacao manual.</Text>
        </SurfaceCard>

        <SurfaceCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Controle cadastral (LGPD)</Text>
          <Text style={styles.sectionText}>Documentos aparecem mascarados por padrao, inclusive para administradores.</Text>
          {userSummaries.map((item) => (
            <View key={item.username} style={styles.userRow}>
              <View style={styles.userRowLeft}>
                <Text style={styles.userName}>{item.fullName || item.username}</Text>
                <Text style={styles.userMeta}>{item.farmName || "Propriedade nao informada"}</Text>
              </View>
              <Text style={styles.userDocument}>
                {item.farmDocumentType ? item.farmDocumentType.toUpperCase() : "DOC"}: {item.farmDocumentMasked}
              </Text>
            </View>
          ))}
        </SurfaceCard>

        <TouchableOpacity style={styles.ctaButton} onPress={() => router.push("/admin-reports")}>
          <Ionicons name="flag-outline" size={18} color={theme.colors.white} style={styles.ctaIcon} />
          <Text style={styles.ctaText}>Ir para fila de denuncias</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push("/privacy-lgpd") }>
          <Ionicons name="shield-outline" size={18} color={theme.colors.primary} style={styles.ctaIcon} />
          <Text style={styles.secondaryButtonText}>Privacidade e LGPD</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, paddingBottom: 24 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  card: {
    width: "48%",
    padding: 14,
    marginBottom: 12,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.gray_900,
    marginTop: 8,
  },
  cardLabel: {
    marginTop: 4,
    color: theme.colors.gray_500,
    fontSize: 13,
  },
  sectionCard: {
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    color: theme.colors.gray_800,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 10,
  },
  sectionText: {
    color: theme.colors.gray_500,
    marginBottom: 8,
    lineHeight: 20,
  },
  ctaButton: {
    marginTop: 4,
    backgroundColor: theme.colors.orange_500,
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  ctaText: {
    color: theme.colors.white,
    fontWeight: "700",
    fontSize: 15,
  },
  ctaIcon: {
    marginRight: 8,
  },
  secondaryButton: {
    marginTop: 10,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontWeight: "700",
    fontSize: 15,
  },
  userRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray_200,
    paddingTop: 10,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userRowLeft: {
    flex: 1,
    marginRight: 10,
  },
  userName: {
    color: theme.colors.gray_800,
    fontWeight: "700",
  },
  userMeta: {
    marginTop: 2,
    color: theme.colors.gray_500,
    fontSize: 12,
  },
  userDocument: {
    color: theme.colors.gray_800,
    fontWeight: "700",
    fontSize: 12,
  },
});
