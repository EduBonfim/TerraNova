import { AppHeader } from "@/components/AppHeader";
import { SurfaceCard } from "@/components/SurfaceCard";
import { appTheme as theme } from "@/theme/appTheme";
import { getAdminKPIs } from "@/utils/adminAnalytics";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const _SCREEN_WIDTH = Dimensions.get("window").width;

export default function AdminMetricsScreen() {
  const router = useRouter();
  const [kpis, setKpis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await getAdminKPIs();
        setKpis(data);
      } catch (error) {
        console.error("Admin Metrics Load Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>
          Processando Inteligência de Dados...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />
      <AppHeader
        title="BI & Inteligência"
        subtitle="Analíticos de Ponta a Ponta"
        onBackPress={() => router.back()}
        showBackButton={true}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Row 1: Financeiro Principal */}
        <SurfaceCard style={styles.heroMetricCard}>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroLabel}>
                Volume Bruto de Mercadoria (GMV)
              </Text>
              <Text style={styles.heroValue}>
                R${" "}
                {kpis?.totalSales?.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                }) || "0,00"}
              </Text>
            </View>
            <View style={styles.heroIconBox}>
              <Ionicons
                name="trending-up"
                size={32}
                color={theme.colors.white}
              />
            </View>
          </View>
          <View style={styles.heroFooter}>
            <Ionicons
              name="stats-chart"
              size={14}
              color="rgba(255,255,255,0.7)"
            />
            <Text style={styles.heroFooterText}>
              Ticket Médio: R${" "}
              {kpis?.averageOrderValue?.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              }) || "0,00"}
            </Text>
          </View>
        </SurfaceCard>

        {/* Row 2: Distribuição de Inventário */}
        <Text style={styles.sectionTitle}>Gestão de Inventário</Text>
        <View style={styles.rowGrid}>
          <SurfaceCard style={styles.smallMetricCard}>
            <Text style={styles.smallMetricLabel}>Em Estoque</Text>
            <Text
              style={[styles.smallMetricValue, { color: theme.colors.primary }]}
            >
              {kpis?.productsInStock ?? 0}
            </Text>
            <Text style={styles.smallMetricSubText}>Itens ativos</Text>
          </SurfaceCard>

          <SurfaceCard style={styles.smallMetricCard}>
            <Text style={styles.smallMetricLabel}>Esgotados</Text>
            <Text
              style={[styles.smallMetricValue, { color: theme.colors.red_500 }]}
            >
              {kpis?.productsOutOfStock ?? 0}
            </Text>
            <Text style={styles.smallMetricSubText}>Ruptura comercial</Text>
          </SurfaceCard>
        </View>

        {/* Row 3: Insights de Mercado */}
        <Text style={styles.sectionTitle}>Insights de Mercado</Text>
        <SurfaceCard style={styles.standardCard}>
          <View style={styles.insightItem}>
            <View style={[styles.insightIcon, { backgroundColor: "#EEF2FF" }]}>
              <Ionicons name="star" size={20} color="#6366F1" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightLabel}>Produto Mais Vendido</Text>
              <Text style={styles.insightValue}>
                {kpis?.topPerformingProduct?.name || "Nenhum"}
              </Text>
              <Text style={styles.insightDetail}>
                Faturamento: R${" "}
                {kpis?.topPerformingProduct?.sales.toFixed(2) || "0,00"}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.insightItem,
              {
                borderTopWidth: 1,
                borderTopColor: "#F1F5F9",
                paddingTop: 16,
                marginTop: 16,
              },
            ]}
          >
            <View style={[styles.insightIcon, { backgroundColor: "#ECFDF5" }]}>
              <Ionicons name="leaf" size={20} color="#10B981" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightLabel}>Categoria Líder</Text>
              <Text style={styles.insightValue}>
                {kpis?.topCategory || "N/A"}
              </Text>
              <Text style={styles.insightDetail}>
                Volume de procura crescente
              </Text>
            </View>
          </View>
        </SurfaceCard>

        {/* Row 4: Performance da Plataforma */}
        <Text style={styles.sectionTitle}>Performance da Rede</Text>
        <SurfaceCard style={styles.standardCard}>
          <View style={styles.performanceRow}>
            <View style={styles.perfBox}>
              <Text style={styles.perfLabel}>Taxa de Conversão</Text>
              <Text style={styles.perfValue}>{kpis?.conversionRate || 0}%</Text>
              <View style={styles.perfIndicator}>
                <View
                  style={[
                    styles.perfBar,
                    {
                      width: `${kpis?.conversionRate || 0}%`,
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                />
              </View>
            </View>
            <View style={styles.perfDivider} />
            <View style={styles.perfBox}>
              <Text style={styles.perfLabel}>Crescimento</Text>
              <Text style={styles.perfValue}>+{kpis?.growthRate || 0}%</Text>
              <View style={styles.perfIndicator}>
                <View
                  style={[
                    styles.perfBar,
                    {
                      width: `${kpis?.growthRate || 0}%`,
                      backgroundColor: "#3B82F6",
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </SurfaceCard>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { padding: 20 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 16,
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
  },

  heroMetricCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    elevation: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "600",
  },
  heroValue: { color: "white", fontSize: 32, fontWeight: "800", marginTop: 8 },
  heroIconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  heroFooterText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 16,
    marginTop: 8,
  },

  rowGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  smallMetricCard: { width: "48%", padding: 16, borderRadius: 16 },
  smallMetricLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 4,
  },
  smallMetricValue: { fontSize: 24, fontWeight: "800" },
  smallMetricSubText: { fontSize: 10, color: "#94A3B8", marginTop: 4 },

  standardCard: { padding: 20, borderRadius: 20, marginBottom: 24 },

  insightItem: { flexDirection: "row", alignItems: "center" },
  insightIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  insightContent: { flex: 1 },
  insightLabel: { fontSize: 12, fontWeight: "600", color: "#64748B" },
  insightValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E293B",
    marginTop: 2,
  },
  insightDetail: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: "600",
    marginTop: 2,
  },

  performanceRow: { flexDirection: "row", alignItems: "center" },
  perfBox: { flex: 1 },
  perfLabel: { fontSize: 12, fontWeight: "600", color: "#64748B" },
  perfValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E293B",
    marginVertical: 4,
  },
  perfIndicator: {
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    overflow: "hidden",
  },
  perfBar: { height: "100%", borderRadius: 3 },
  perfDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#F1F5F9",
    marginHorizontal: 20,
  },

  bottomSpacer: { height: 40 },
});
