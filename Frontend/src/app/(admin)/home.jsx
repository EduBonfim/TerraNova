import { AppHeader } from "@/components/AppHeader";
import { SurfaceCard } from "@/components/SurfaceCard";
import { useAuth } from "@/contexts/AuthContext";
import { getAdminUserSummaries } from "@/services/authStore";
import { getMarketplaceItems } from "@/services/marketplaceStore";
import { getAllOrders } from "@/services/ordersStore";
import { getReports } from "@/services/reportsStore";
import { getAdminKPIs } from "@/utils/adminAnalytics";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { appTheme as theme } from "../../theme/appTheme";
import {
  exportBuyersToCSV,
  exportProducersToCSV,
  exportProductsToCSV,
  exportReportsToCSV,
  exportSalesToCSV,
  exportToPlatform,
} from "../../utils/csvExport";

export default function AdminHomeScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [_userSummaries, setUserSummaries] = useState([]);
  const [_marketplaceItems, setMarketplaceItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [_reports, setReports] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(null);
  const handleExport = async (type, filename) => {
    setIsExporting(type);
    try {
      let csvData = "";
      switch (type) {
        case "producers":
          csvData = await exportProducersToCSV();
          break;
        case "buyers":
          csvData = await exportBuyersToCSV();
          break;
        case "products":
          csvData = await exportProductsToCSV();
          break;
        case "sales":
          csvData = await exportSalesToCSV();
          break;
        case "reports":
          csvData = await exportReportsToCSV();
          break;
      }

      await exportToPlatform(filename, csvData);

      Alert.alert(
        "Sucesso ✓",
        `O arquivo ${filename} foi gerado e está pronto! Escolha onde deseja salvar ou com quem compartilhar.`,
        [{ text: "OK", onPress: () => {} }]
      );
    } catch (error) {
      Alert.alert("Erro", "Falha ao exportar arquivo. Tente novamente.");
      console.error("Export error:", error);
    } finally {
      setIsExporting(null);
    }
  };
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = React.useCallback(() => {
    Alert.alert(
      "Confirmar Saída",
      "Deseja realmente sair da conta administrativa?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            setIsLoggingOut(true);
            await new Promise((resolve) => setTimeout(resolve, 3000));
            await logout();
            router.replace("/");
          },
        },
      ]
    );
  }, [logout, router]);

  useEffect(() => {
    const onBackPress = () => {
      handleLogout();
      return true;
    };
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );
    return () => subscription.remove();
  }, [handleLogout]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [usersData, marketData, ordersData, reportsData, kpisData] =
          await Promise.all([
            getAdminUserSummaries(),
            getMarketplaceItems(),
            getAllOrders(),
            getReports(),
            getAdminKPIs(),
          ]);
        setUserSummaries(usersData);
        setMarketplaceItems(marketData);
        setOrders(ordersData);
        setReports(reportsData);
        setKpis(kpisData);
      } catch (error) {
        console.error("Admin Home Load Error:", error);
        Alert.alert(
          "Erro de Sincronização",
          "Não foi possível carregar os dados administrativos."
        );
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
        title="Portal Admin"
        subtitle={
          isLoggingOut ? "Saindo..." : user?.fullName || "Administrador"
        }
        onBackPress={handleLogout}
        showBackButton={true}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.primary}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Resumo Executivo */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Resumo Executivo</Text>
          <Text style={styles.sectionSubtitle}>
            Atualizado hoje às{" "}
            {new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        <View style={styles.kpiGrid}>
          {/* Faturamento Total */}
          <SurfaceCard
            style={[styles.kpiCard, { borderTopColor: theme.colors.primary }]}
          >
            <View style={styles.kpiIconBox}>
              <Ionicons
                name="trending-up"
                size={20}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.kpiLabel}>Faturamento Total</Text>
            <Text style={styles.kpiValue}>
              R${" "}
              {kpis?.totalSales?.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              }) || "0,00"}
            </Text>
            <View style={styles.growthBadge}>
              <Ionicons name="caret-up" size={12} color="#10B981" />
              <Text style={styles.growthText}>+{kpis?.growthRate}%</Text>
            </View>
          </SurfaceCard>

          {/* Ticket Médio */}
          <SurfaceCard style={[styles.kpiCard, { borderTopColor: "#3B82F6" }]}>
            <View style={styles.kpiIconBox}>
              <Ionicons name="receipt" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.kpiLabel}>Ticket Médio</Text>
            <Text style={styles.kpiValue}>
              R${" "}
              {kpis?.averageOrderValue?.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              }) || "0,00"}
            </Text>
            <Text style={styles.kpiSubDetail}>
              Base: {orders.length} pedidos
            </Text>
          </SurfaceCard>

          {/* Taxa de Conversão */}
          <SurfaceCard style={[styles.kpiCard, { borderTopColor: "#F59E0B" }]}>
            <View style={styles.kpiIconBox}>
              <Ionicons name="stats-chart" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.kpiLabel}>Conversão</Text>
            <Text style={styles.kpiValue}>{kpis?.conversionRate}%</Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${kpis?.conversionRate || 0}%`,
                    backgroundColor: "#F59E0B",
                  },
                ]}
              />
            </View>
          </SurfaceCard>

          {/* Base de Usuários */}
          <SurfaceCard style={[styles.kpiCard, { borderTopColor: "#8B5CF6" }]}>
            <View style={styles.kpiIconBox}>
              <Ionicons name="people" size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.kpiLabel}>Usuarios Ativos</Text>
            <Text style={styles.kpiValue}>{kpis?.totalUsers || 0}</Text>
            <Text style={styles.kpiSubDetail}>
              {kpis?.totalProducers} Produtores
            </Text>
            <Text style={[styles.kpiSubDetail, { marginTop: 2 }]}>
              {kpis?.totalBuyers} Consumidor
            </Text>
          </SurfaceCard>
        </View>

        {/* Insights de Performance */}
        <SurfaceCard style={styles.insightsCard}>
          <Text style={styles.cardHeaderTitle}>🎯 Insights de Performance</Text>

          <View style={styles.insightRow}>
            <View style={styles.insightIcon}>
              <Ionicons name="star" size={24} color="#FFD700" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Produto Estrela</Text>
              <Text style={styles.insightText}>
                <Text
                  style={{ fontWeight: "bold", color: theme.colors.primary }}
                >
                  {kpis?.topPerformingProduct?.name || "..."}
                </Text>{" "}
                lidera o faturamento com R${" "}
                {kpis?.topPerformingProduct?.sales.toFixed(2) || "0,00"}.
              </Text>
            </View>
          </View>

          <View style={styles.insightRow}>
            <View style={styles.insightIcon}>
              <Ionicons name="leaf" size={24} color="#10B981" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Categoria em Alta</Text>
              <Text style={styles.insightText}>
                A categoria{" "}
                <Text
                  style={{ fontWeight: "bold", color: theme.colors.primary }}
                >
                  {kpis?.topCategory}
                </Text>{" "}
                é a mais procurada atualmente.
              </Text>
            </View>
          </View>

          <View style={styles.insightRow}>
            <View style={styles.insightIcon}>
              <Ionicons name="alert-circle" size={24} color="#EF4444" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Atenção ao Estoque</Text>
              <Text style={styles.insightText}>
                Existem{" "}
                <Text style={{ fontWeight: "bold", color: "#EF4444" }}>
                  {kpis?.productsOutOfStock}
                </Text>{" "}
                produtos sem estoque que podem estar gerando perda de vendas.
              </Text>
            </View>
          </View>
        </SurfaceCard>

        {/* Central de Relatórios */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Central de Relatórios</Text>
          <Text style={styles.sectionSubtitle}>
            Exporte dados ricos para Power BI ou Excel
          </Text>
        </View>

        <SurfaceCard style={styles.reportGrid}>
          <View style={styles.exportList}>
            {[
              {
                id: "producers",
                label: "Relatório de Produtores",
                detail: "Dados cadastrais, faturamento e logística",
                icon: "business",
              },
              {
                id: "buyers",
                label: "Gestão de Compradores",
                detail: "Perfil de consumo, ticket médio e localidade",
                icon: "cart",
              },
              {
                id: "products",
                label: "Catálogo & Performance",
                detail: "Giro de estoque e conversão por item",
                icon: "cube",
              },
              {
                id: "sales",
                label: "Histórico de Transações",
                detail: "Fluxo de caixa e status de entregas",
                icon: "list",
              },
              {
                id: "reports",
                label: "Ocorrências & Qualidade",
                detail: "Denúncias, feedbacks e moderação",
                icon: "warning",
              },
            ].map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.exportItem}
                onPress={() =>
                  handleExport(
                    item.id,
                    `${item.id}_full_${
                      new Date().toISOString().split("T")[0]
                    }.csv`
                  )
                }
                disabled={isExporting === item.id}
              >
                <View style={styles.exportIconBox}>
                  {isExporting === item.id ? (
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.primary}
                    />
                  ) : (
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color={theme.colors.primary}
                    />
                  )}
                </View>
                <View style={styles.exportTextContent}>
                  <Text style={styles.exportLabelText}>{item.label}</Text>
                  <Text style={styles.exportDetailText}>{item.detail}</Text>
                </View>
                <Ionicons
                  name="download-outline"
                  size={20}
                  color={theme.colors.gray_400}
                />
              </TouchableOpacity>
            ))}
          </View>
        </SurfaceCard>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gestão de Usuários</Text>
        </View>

        <SurfaceCard style={styles.reportGrid}>
          <View style={styles.exportList}>
            <TouchableOpacity
              style={styles.exportItem}
              onPress={() => router.push("/(admin)/recover")}
            >
              <View
                style={[styles.exportIconBox, { backgroundColor: "#FEE2E2" }]}
              >
                <Ionicons name="trash-bin" size={22} color="#EF4444" />
              </View>
              <View style={styles.exportTextContent}>
                <Text style={styles.exportLabelText}>Lixeira de Contas</Text>
                <Text style={styles.exportDetailText}>
                  Visualizar contas no período de arrependimento (30 dias)
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.gray_400}
              />
            </TouchableOpacity>
          </View>
        </SurfaceCard>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  // Headers
  sectionHeader: {
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  // KPI Grid
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  kpiCard: {
    width: "48%",
    padding: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderTopWidth: 4,
    backgroundColor: "white",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
  },
  kpiIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  kpiSubDetail: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 6,
  },
  growthBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  growthText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#065F46",
    marginLeft: 2,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    marginTop: 12,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },

  // Insights
  insightsCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    backgroundColor: "white",
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 16,
  },
  insightRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  insightIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  insightContent: {
    flex: 1,
    justifyContent: "center",
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 2,
  },
  insightText: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },

  // Report Center
  reportGrid: {
    padding: 0,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
  },
  exportList: {
    padding: 8,
  },
  exportItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  exportIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  exportTextContent: {
    flex: 1,
  },
  exportLabelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  exportDetailText: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },

  // Quick Actions
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  quickActionButton: {
    width: "22%",
    alignItems: "center",
  },
  actionBadge: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  actionText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  bottomSpacer: {
    height: 60,
  },
});
