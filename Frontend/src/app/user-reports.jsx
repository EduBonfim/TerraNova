import { AppHeader } from "@/components/AppHeader";
import { SurfaceCard } from "@/components/SurfaceCard";
import { useAuth } from "@/contexts/AuthContext";
import { getReportsByUser } from "@/services/reportsStore";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserReportsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("sent");

  const loadData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await getReportsByUser(user.username);
      // Ordenar da mais recente para a mais antiga
      const sorted = data.sort(
        (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
      );
      setReports(sorted);
    } catch (error) {
      console.error("Load User Reports Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [user?.username])
  );

  const sentReports = reports.filter((r) => r.reporter === user?.username);
  const receivedReports = reports.filter(
    (r) => r.reportedUser === user?.username
  );

  const displayReports =
    activeTab === "sent"
      ? sentReports
      : activeTab === "received"
      ? receivedReports
      : reports; // "history" mostra todos os relatórios relacionados ao usuário, tanto enviados quanto recebidos

  const getStatusColor = (status) => {
    switch (status) {
      case "pendente":
        return "#64748B";
      case "em_analise":
        return "#F59E0B";
      case "resolvido":
        return "#10B981";
      case "descartado":
        return "#EF4444";
      default:
        return "#64748B";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pendente":
        return "Pendente";
      case "em_analise":
        return "Em Análise";
      case "resolvido":
        return "Resolvido";
      case "descartado":
        return "Descartado";
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />
      <AppHeader
        title="Minhas Denúncias"
        subtitle="Histórico de ocorrências"
        onBackPress={() => router.back()}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
      />

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "sent" && styles.activeTab]}
          onPress={() => setActiveTab("sent")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "sent" && styles.activeTabText,
            ]}
          >
            Enviadas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "received" && styles.activeTab]}
          onPress={() => setActiveTab("received")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "received" && styles.activeTabText,
            ]}
          >
            Recebidas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.activeTab]}
          onPress={() => setActiveTab("history")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "history" && styles.activeTabText,
            ]}
          >
            Histórico
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : displayReports.length > 0 ? (
          displayReports.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() =>
                router.push({
                  pathname: "/report-details",
                  params: { id: item.id },
                })
              }
              activeOpacity={0.7}
            >
              <SurfaceCard style={styles.reportCard}>
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(item.status)}15` },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(item.status) },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(item.status) },
                      ]}
                    >
                      {getStatusLabel(item.status)}
                    </Text>
                  </View>
                  <Text style={styles.cardDate}>
                    {new Date(item.data).toLocaleDateString()}
                  </Text>
                </View>

                <Text style={styles.cardTitle}>{item.reason}</Text>
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {item.description}
                </Text>

                {activeTab === "received" && item.action && (
                  <View style={styles.actionBtn}>
                    <Ionicons
                      name="information-circle-outline"
                      size={16}
                      color={theme.colors.primary}
                    />
                    <Text style={styles.actionBtnText}>
                      Ver Detalhes da Ação
                    </Text>
                  </View>
                )}

                {activeTab === "sent" && item.status === "resolvido" && (
                  <View style={styles.resolutionBox}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={16}
                      color="#10B981"
                    />
                    <Text style={styles.resolutionText}>
                      Esta denúncia foi processada pela moderação.
                    </Text>
                  </View>
                )}
              </SurfaceCard>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="megaphone-outline"
              size={64}
              color={theme.colors.gray_300}
            />
            <Text style={styles.emptyTitle}>Nenhuma denúncia encontrada</Text>
            <Text style={styles.emptyText}>
              {activeTab === "sent"
                ? "Você ainda não fez nenhuma denúncia na plataforma."
                : "Você não possui registros de denúncias contra sua conta."}
            </Text>
          </View>
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 16, paddingBottom: 32 },
  centerContainer: { paddingVertical: 100, alignItems: "center" },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.white,
    padding: 6,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
  },
  activeTabText: {
    color: theme.colors.white,
  },

  reportCard: {
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: theme.colors.white,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardDate: {
    fontSize: 12,
    fontWeight: "500",
    color: "#94A3B8",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    marginBottom: 20,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  resolutionBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  resolutionText: {
    fontSize: 13,
    color: "#64748B",
    fontStyle: "italic",
    flex: 1,
  },

  emptyContainer: {
    paddingVertical: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E293B",
    marginTop: 24,
  },
  emptyText: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  bottomSpacer: { height: 60 },
});
