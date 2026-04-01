import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { AppHeader } from "../components/AppHeader";
import { SurfaceCard } from "../components/SurfaceCard";
import { useAuth } from "../contexts/AuthContext";
import {
  deleteSoilReportById,
  getSoilReportsByUser,
  type SoilReport,
} from "../services/soilReportsStore";

const theme = {
  colors: {
    primary: "#6B8E23",
    lightGreen: "#E8F5E9",
    white: "#FFFFFF",
    background: "#F5F5F5",
    gray_200: "#E5E7EB",
    gray_300: "#D1D5DB",
    gray_500: "#6B7280",
    gray_800: "#1F2937",
    orange_500: "#F9A825",
    red_500: "#EF4444",
  },
};

const formatDate = (dateIso: string) => {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return "Data indisponível";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function SoilReportsScreen() {
  type DateFilter = "all" | "today" | "7d" | "30d";

  const { user } = useAuth();
  const [reports, setReports] = useState<SoilReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  const loadReports = useCallback(async () => {
    if (!user?.username) {
      setReports([]);
      setLoading(false);
      return;
    }

    const next = await getSoilReportsByUser(user.username);
    setReports(next);
    setLoading(false);
  }, [user?.username]);

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [loadReports]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Excluir laudo", "Deseja remover este laudo?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          await deleteSoilReportById(id);
          await loadReports();
        },
      },
    ]);
  };

  const filteredReports = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    const now = Date.now();

    return reports.filter((item) => {
      const createdMs = new Date(item.createdAt).getTime();
      const ageMs = Number.isNaN(createdMs) ? Number.MAX_SAFE_INTEGER : now - createdMs;

      const passDate =
        dateFilter === "all"
          ? true
          : dateFilter === "today"
            ? ageMs <= 24 * 60 * 60 * 1000
            : dateFilter === "7d"
              ? ageMs <= 7 * 24 * 60 * 60 * 1000
              : ageMs <= 30 * 24 * 60 * 60 * 1000;

      if (!passDate) return false;
      if (!search) return true;

      const diagnosisText = item.diagnosis.join(" ").toLowerCase();
      return diagnosisText.includes(search);
    });
  }, [reports, searchTerm, dateFilter]);

  const renderItem = ({ item }: { item: SoilReport }) => (
    <SurfaceCard style={styles.card}>
      <View style={styles.cardTopRow}>
        <View style={styles.badgeRow}>
          <Ionicons name="document-text-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.badgeText}>Laudo salvo</Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={20} color={theme.colors.red_500} />
        </TouchableOpacity>
      </View>

      <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>

      <View style={styles.metricsRow}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>pH</Text>
          <Text style={styles.metricValue}>{item.metrics.ph || "-"}</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>M.O.</Text>
          <Text style={styles.metricValue}>{item.metrics.materiaOrganica || "-"}%</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>P</Text>
          <Text style={styles.metricValue}>{item.metrics.fosforo || "-"}</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>K</Text>
          <Text style={styles.metricValue}>{item.metrics.potassio || "-"}</Text>
        </View>
      </View>

      <View style={styles.sectionDivider} />

      <Text style={styles.diagnosisTitle}>Diagnóstico</Text>
      {item.diagnosis.length > 0 ? (
        item.diagnosis.map((line, index) => (
          <View key={`${item.id}-${index}`} style={styles.diagnosisRow}>
            <Ionicons name="alert-circle-outline" size={16} color={theme.colors.orange_500} />
            <Text style={styles.diagnosisText}>{line}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.diagnosisEmpty}>Sem alertas registrados.</Text>
      )}
    </SurfaceCard>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

      <AppHeader
        title="Meus Laudos de Solo"
        subtitle="Histórico local antes da migração"
        onBackPress={() => router.replace("/account")}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.gray_200}
      />

      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Carregando laudos...</Text>
          </View>
        ) : reports.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="flask-outline" size={56} color={theme.colors.gray_300} />
            <Text style={styles.emptyTitle}>Nenhum laudo salvo ainda</Text>
            <Text style={styles.emptyText}>
              Faça uma análise na tela de scan e toque em "Salvar somente no Perfil".
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => router.push("/scan")}>
              <Text style={styles.emptyButtonText}>Ir para Scan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.filtersWrapper}>
              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={16} color={theme.colors.gray_500} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar por diagnóstico"
                  placeholderTextColor={theme.colors.gray_500}
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                />
              </View>

              <View style={styles.filterRow}>
                {[
                  { label: "Todos", value: "all" as const },
                  { label: "Hoje", value: "today" as const },
                  { label: "7 dias", value: "7d" as const },
                  { label: "30 dias", value: "30d" as const },
                ].map((filter) => (
                  <TouchableOpacity
                    key={filter.value}
                    onPress={() => setDateFilter(filter.value)}
                    style={[
                      styles.filterChip,
                      dateFilter === filter.value ? styles.filterChipActive : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        dateFilter === filter.value ? styles.filterChipTextActive : null,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {filteredReports.length === 0 ? (
              <View style={styles.emptyFilteredState}>
                <Ionicons name="funnel-outline" size={42} color={theme.colors.gray_300} />
                <Text style={styles.emptyFilteredTitle}>Nenhum laudo encontrado</Text>
                <Text style={styles.emptyFilteredText}>Tente ajustar o período ou a palavra da busca.</Text>
              </View>
            ) : (
              <FlatList
                data={filteredReports}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    tintColor={theme.colors.primary}
                    colors={[theme.colors.primary]}
                  />
                }
              />
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: theme.colors.background },
  loadingState: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: theme.colors.gray_500, fontSize: 14 },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 26,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.gray_800,
  },
  emptyText: {
    marginTop: 8,
    textAlign: "center",
    color: theme.colors.gray_500,
    lineHeight: 21,
    fontSize: 14,
  },
  emptyButton: {
    marginTop: 18,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: theme.colors.white,
    fontWeight: "700",
  },
  listContent: {
    padding: 14,
    paddingBottom: 110,
    gap: 12,
  },
  filtersWrapper: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: theme.colors.background,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchInput: {
    marginLeft: 8,
    flex: 1,
    color: theme.colors.gray_800,
    fontSize: 14,
    paddingVertical: 0,
  },
  filterRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    backgroundColor: theme.colors.white,
  },
  filterChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.lightGreen,
  },
  filterChipText: {
    color: theme.colors.gray_500,
    fontWeight: "600",
    fontSize: 12,
  },
  filterChipTextActive: {
    color: theme.colors.primary,
  },
  emptyFilteredState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyFilteredTitle: {
    marginTop: 10,
    color: theme.colors.gray_800,
    fontSize: 17,
    fontWeight: "700",
  },
  emptyFilteredText: {
    marginTop: 6,
    color: theme.colors.gray_500,
    fontSize: 14,
    textAlign: "center",
  },
  card: {
    padding: 14,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.colors.lightGreen,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  dateText: {
    marginTop: 10,
    color: theme.colors.gray_500,
    fontSize: 12,
  },
  metricsRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  metricBox: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  metricLabel: {
    color: theme.colors.gray_500,
    fontSize: 11,
  },
  metricValue: {
    marginTop: 3,
    color: theme.colors.gray_800,
    fontWeight: "700",
    fontSize: 14,
  },
  sectionDivider: {
    marginTop: 12,
    marginBottom: 10,
    height: 1,
    backgroundColor: theme.colors.gray_200,
  },
  diagnosisTitle: {
    color: theme.colors.gray_800,
    fontWeight: "700",
    marginBottom: 8,
  },
  diagnosisRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  diagnosisText: {
    marginLeft: 8,
    color: theme.colors.gray_800,
    flex: 1,
    lineHeight: 20,
  },
  diagnosisEmpty: {
    color: theme.colors.gray_500,
    fontStyle: "italic",
  },
});
