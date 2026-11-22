import { AppHeader } from "@/components/AppHeader";
import { SurfaceCard } from "@/components/SurfaceCard";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";
import { useAsync } from "@/hooks/useAsync";
import { http } from "@/services/api";

const theme = {
  colors: {
    primary: "#6B8E23",
    white: "#FFFFFF",
    background: "#F5F5F5",
    gray_200: "#E5E7EB",
    gray_500: "#6B7280",
    gray_800: "#1F2937",
    green_700: "#15803D",
  },
};

export default function AdminSalesScreen() {
  const router = useRouter();

  // Fetch dados reais do KPI
  const fetchAdminMetrics = async () => {
    const response = await http("/api/v1/admin/kpis");
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || "Falha ao buscar métricas");
  };

  // Fetch dados dos vendedores
  const fetchTopSellers = async () => {
    const response = await http("/api/v1/admin/sellers");
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || "Falha ao buscar vendedores");
  };

  const {
    data: metrics,
    isLoading,
    error,
    execute,
  } = useAsync(fetchAdminMetrics);
  const {
    data: sellers,
    isLoading: sellersLoading,
    error: sellersError,
    execute: executeSellers,
  } = useAsync(fetchTopSellers);

  useEffect(() => {
    execute();
    executeSellers();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />
      <AppHeader
        title="Vendas"
        subtitle="Controle de transacoes e receita"
        onBackPress={() => router.back()}
        showBackButton={true}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.gray_200}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Carregando métricas...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>Erro ao carregar dados</Text>
            <Text style={styles.errorMessage}>{error}</Text>
          </View>
        ) : metrics ? (
          <>
            <SurfaceCard style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>
                Volume transacionado (total)
              </Text>
              <Text style={styles.summaryValue}>
                R$ {metrics.totalSales?.toLocaleString("pt-BR") || "0"}
              </Text>
              <Text style={styles.summaryMeta}>
                {metrics.totalProducts} produtos no marketplace
              </Text>
            </SurfaceCard>

            <SurfaceCard style={styles.listCard}>
              <Text style={styles.listTitle}>Estatísticas gerais</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total de usuários</Text>
                  <Text style={styles.statValue}>
                    {metrics.totalUsers || 0}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Produtores</Text>
                  <Text style={styles.statValue}>
                    {metrics.totalProducers || 0}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Compradores</Text>
                  <Text style={styles.statValue}>
                    {metrics.totalBuyers || 0}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Preço médio</Text>
                  <Text style={styles.statValue}>
                    R$ {(metrics.averageProductPrice || 0).toFixed(2)}
                  </Text>
                </View>
              </View>
            </SurfaceCard>

            <SurfaceCard style={styles.listCard}>
              <Text style={styles.listTitle}>Top vendedores</Text>
              {sellersLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                  />
                  <Text style={styles.loadingText}>
                    Carregando vendedores...
                  </Text>
                </View>
              ) : sellersError ? (
                <Text style={styles.errorMessage}>{sellersError}</Text>
              ) : sellers && sellers.length > 0 ? (
                sellers.map((seller, index) => (
                  <View key={index} style={styles.row}>
                    <View>
                      <Text style={styles.name}>{seller.name}</Text>
                      <Text style={styles.meta}>
                        {seller.deals} negociacoes concluidas
                      </Text>
                    </View>
                    <Text style={styles.gross}>
                      R$ {seller.gross?.toLocaleString("pt-BR") || "0,00"}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Nenhum vendedor encontrado</Text>
              )}
            </SurfaceCard>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, paddingBottom: 24 },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: theme.colors.gray_800,
    fontSize: 14,
  },
  errorText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 8,
  },
  errorMessage: {
    color: theme.colors.gray_500,
    fontSize: 13,
  },
  summaryCard: { padding: 18, marginBottom: 14 },
  summaryLabel: { color: theme.colors.gray_500, marginBottom: 4 },
  summaryValue: {
    color: theme.colors.green_700,
    fontWeight: "700",
    fontSize: 28,
  },
  summaryMeta: { color: theme.colors.gray_500, marginTop: 4 },
  listCard: { padding: 16, marginBottom: 14 },
  listTitle: {
    color: theme.colors.gray_800,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: "48%",
    padding: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
  },
  statLabel: {
    color: theme.colors.gray_500,
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: theme.colors.green_700,
    fontWeight: "700",
    fontSize: 18,
  },
  todoText: {
    color: "#B45309",
    fontSize: 13,
    marginBottom: 8,
  },
  todoNote: {
    color: theme.colors.gray_500,
    fontSize: 12,
    fontStyle: "italic",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  emptyText: {
    color: theme.colors.gray_500,
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 12,
  },
  row: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray_200,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { color: theme.colors.gray_800, fontWeight: "700" },
  meta: { color: theme.colors.gray_500, marginTop: 4, fontSize: 12 },
  gross: { color: theme.colors.gray_800, fontWeight: "700" },
});
