import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  BackHandler,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AppHeader } from "@/components/AppHeader";
import { SurfaceCard } from "@/components/SurfaceCard";
import { useAuth } from "@/contexts/AuthContext";
import { getAdminUserSummaries, type AdminUserSummary } from "@/services/authStore";
import { getMarketplaceItems, type MarketplaceOpportunity } from "@/services/marketplaceStore";
import { getAllOrders, type Order } from "@/services/ordersStore";
import { getReports, type AppReport } from "../../services/reportsStore";
import { getAdminKPIs, type AdminKPI } from "../../utils/adminAnalytics";
import {
  exportProducersToCSV,
  exportBuyersToCSV,
  exportProductsToCSV,
  exportSalesToCSV,
  exportReportsToCSV,
  exportToPlatform,
} from "../../utils/csvExport";
import { appTheme as theme } from "../../theme/appTheme";

export default function AdminHomeScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [userSummaries, setUserSummaries] = useState<AdminUserSummary[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceOpportunity[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reports, setReports] = useState<AppReport[]>([]);
  const [kpis, setKpis] = useState<AdminKPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const handleExport = async (
    type: "producers" | "buyers" | "products" | "sales" | "reports",
    filename: string
  ) => {
    setIsExporting(type);
    try {
      let csvData: string = "";
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
        `Arquivo ${filename} exportado com sucesso! Copie os dados do console do desenvolvedor.`,
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
            await new Promise(resolve => setTimeout(resolve, 3000));
            await logout();
            router.replace("/");
          }
        }
      ]
    );
  }, [logout, router]);

  useEffect(() => {
    const onBackPress = () => {
      handleLogout();
      return true;
    };
    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
  }, [handleLogout]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [usersData, marketData, ordersData, reportsData, kpisData] = await Promise.all([
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
      setIsLoading(false);
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
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <AppHeader
        title="Portal Admin"
        subtitle={isLoggingOut ? "Saindo..." : user?.fullName || "Administrador"}
        onBackPress={handleLogout}
        showBackButton={true}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.primary}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* ===== DASHBOARD KPIs ===== */}
        <SurfaceCard style={styles.dashboardCard}>
          <Text style={styles.dashboardTitle}>📊 Dashboard de KPIs</Text>
          
          {/* Linha 1 */}
          <View style={styles.kpiRow}>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiLabel}>Usuários</Text>
              <Text style={styles.kpiValue}>{kpis?.totalUsers || 0}</Text>
              <Text style={styles.kpiDetail}>
                👥 {kpis?.totalProducers || 0} prod. / {kpis?.totalBuyers || 0} comp.
              </Text>
            </View>

            <View style={styles.kpiItem}>
              <Text style={styles.kpiLabel}>Produtos</Text>
              <Text style={styles.kpiValue}>{kpis?.totalProducts || 0}</Text>
              <Text style={styles.kpiDetail}>
                ✓ {kpis?.productsInStock || 0} / ✗ {kpis?.productsOutOfStock || 0}
              </Text>
            </View>
          </View>

          {/* Linha 2 */}
          <View style={styles.kpiRow}>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiLabel}>Faturamento</Text>
              <Text style={styles.kpiValue}>R$ {kpis?.totalSales?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0,00"}</Text>
              <Text style={styles.kpiDetail}>
                {kpis?.totalSales ? `${kpis.totalSales > 0 ? "↑ Ativo" : "→ Estável"}` : "→ Sem dados"}
              </Text>
            </View>

            <View style={styles.kpiItem}>
              <Text style={styles.kpiLabel}>Negociações</Text>
              <Text style={styles.kpiValue}>{kpis?.totalSales || 0}</Text>
              <Text style={styles.kpiDetail}>
                💰 P: R$ {kpis?.producerSalesTotal?.toFixed(2) || "0"} / C: R$ {kpis?.buyerPurchasesTotal?.toFixed(2) || "0"}
              </Text>
            </View>
          </View>

          <View style={styles.kpiStats}>
            <View style={styles.kpiStatRow}>
              <Text style={styles.kpiStatLabel}>Preço Médio:</Text>
              <Text style={styles.kpiStatValue}>R$ {kpis?.averageProductPrice?.toFixed(2) || "0"}</Text>
            </View>
            <View style={styles.kpiStatRow}>
              <Text style={styles.kpiStatLabel}>Top Categoria:</Text>
              <Text style={styles.kpiStatValue}>{kpis?.topCategory || "N/A"}</Text>
            </View>
          </View>
        </SurfaceCard>

        {/* ===== EXPORTAR DADOS ===== */}
        <SurfaceCard style={styles.exportCard}>
          <Text style={styles.exportTitle}>📥 Exportar Dados para CSV</Text>

          {/* Produtores */}
          <TouchableOpacity
            style={styles.exportButton}
            disabled={isExporting === "producers"}
            onPress={() =>
              handleExport(
                "producers",
                `produtores_${new Date().toISOString().split("T")[0]}.csv`
              )
            }
          >
            {isExporting === "producers" ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Ionicons name="people-outline" size={20} color={theme.colors.primary} />
            )}
            <View style={styles.exportButtonContent}>
              <Text style={styles.exportButtonLabel}>Exportar Produtores</Text>
              <Text style={styles.exportButtonDetail}>
                {kpis?.totalProducers || 0} de {kpis?.totalUsers || 0} usuários
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.gray_400}
            />
          </TouchableOpacity>

          {/* Compradores */}
          <TouchableOpacity
            style={styles.exportButton}
            disabled={isExporting === "buyers"}
            onPress={() =>
              handleExport(
                "buyers",
                `compradores_${new Date().toISOString().split("T")[0]}.csv`
              )
            }
          >
            {isExporting === "buyers" ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Ionicons name="cart-outline" size={20} color={theme.colors.primary} />
            )}
            <View style={styles.exportButtonContent}>
              <Text style={styles.exportButtonLabel}>Exportar Compradores</Text>
              <Text style={styles.exportButtonDetail}>
                {kpis?.totalBuyers || 0} de {kpis?.totalUsers || 0} usuários
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.gray_400}
            />
          </TouchableOpacity>

          {/* Produtos */}
          <TouchableOpacity
            style={styles.exportButton}
            disabled={isExporting === "products"}
            onPress={() =>
              handleExport(
                "products",
                `produtos_${new Date().toISOString().split("T")[0]}.csv`
              )
            }
          >
            {isExporting === "products" ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Ionicons name="pricetags-outline" size={20} color={theme.colors.primary} />
            )}
            <View style={styles.exportButtonContent}>
              <Text style={styles.exportButtonLabel}>Exportar Produtos</Text>
              <Text style={styles.exportButtonDetail}>
                {kpis?.totalProducts || 0} produtos ativos
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.gray_400}
            />
          </TouchableOpacity>

          {/* Vendas/Compras */}
          <TouchableOpacity
            style={styles.exportButton}
            disabled={isExporting === "sales"}
            onPress={() =>
              handleExport(
                "sales",
                `vendas_${new Date().toISOString().split("T")[0]}.csv`
              )
            }
          >
            {isExporting === "sales" ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Ionicons name="bar-chart-outline" size={20} color={theme.colors.primary} />
            )}
            <View style={styles.exportButtonContent}>
              <Text style={styles.exportButtonLabel}>Exportar Vendas & Compras</Text>
              <Text style={styles.exportButtonDetail}>
                {orders.length} transações registradas
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.gray_400}
            />
          </TouchableOpacity>

          {/* Relatórios */}
          <TouchableOpacity
            style={styles.exportButton}
            disabled={isExporting === "reports"}
            onPress={() =>
              handleExport(
                "reports",
                `relatorios_${new Date().toISOString().split("T")[0]}.csv`
              )
            }
          >
            {isExporting === "reports" ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Ionicons name="flag-outline" size={20} color={theme.colors.primary} />
            )}
            <View style={styles.exportButtonContent}>
              <Text style={styles.exportButtonLabel}>Exportar Relatórios</Text>
              <Text style={styles.exportButtonDetail}>
                {reports.length} denúncias
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.gray_400}
            />
          </TouchableOpacity>
        </SurfaceCard>

        {/* ===== AÇÕES RÁPIDAS ===== */}
        <SurfaceCard style={styles.actionCard}>
          <Text style={styles.cardTitle}>⚡ Ações Rápidas</Text>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push("../sales")}>
            <Ionicons name="cart-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.actionButtonText}>Ver Todas as Vendas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push("../reports")}>
            <Ionicons name="flag-outline" size={20} color={theme.colors.red_500} />
            <Text style={[styles.actionButtonText, { color: theme.colors.red_500 }]}>Resolver Denúncias</Text>
          </TouchableOpacity>
        </SurfaceCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: theme.colors.primary 
  },
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  scrollContent: { 
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },

  // ===== DASHBOARD KPIs =====
  dashboardCard: { 
    padding: 16, 
    marginBottom: 16,
    borderRadius: 12,
  },
  dashboardTitle: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: theme.colors.gray_900, 
    marginBottom: 16,
  },
  kpiRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  kpiItem: {
    flex: 1,
    backgroundColor: theme.colors.gray_100,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.gray_600,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: "900",
    color: theme.colors.primary,
    marginBottom: 4,
  },
  kpiDetail: {
    fontSize: 10,
    color: theme.colors.gray_500,
    fontWeight: "500",
  },
  kpiStats: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray_200,
    paddingTop: 12,
    gap: 8,
  },
  kpiStatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  kpiStatLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: theme.colors.gray_700,
  },
  kpiStatValue: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary,
  },

  // ===== EXPORTAR DADOS =====
  exportCard: {
    padding: 16,
    marginBottom: 16,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.gray_900,
    marginBottom: 12,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: theme.colors.gray_100,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  exportButtonContent: {
    flex: 1,
    marginHorizontal: 12,
    justifyContent: "center",
  },
  exportButtonLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.gray_900,
    marginBottom: 2,
  },
  exportButtonDetail: {
    fontSize: 11,
    color: theme.colors.gray_600,
  },

  // ===== AÇÕES RÁPIDAS =====
  actionCard: { 
    padding: 16, 
    marginBottom: 16 
  },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: theme.colors.gray_900, 
    marginBottom: 12 
  },
  actionButton: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: theme.colors.gray_100 
  },
  actionButtonText: { 
    fontSize: 14, 
    color: theme.colors.gray_800, 
    marginLeft: 12, 
    fontWeight: "500" 
  },
});
