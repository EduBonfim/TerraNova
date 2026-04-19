import { AppHeader } from "@/components/AppHeader";
import { SurfaceCard } from "@/components/SurfaceCard";
import { getMarketplaceItems, type MarketplaceOpportunity } from "@/services/marketplaceStore";
import { getAllOrders, type Order } from "@/services/ordersStore";
import { appTheme as theme } from "@/theme/appTheme";
import { convertToCSV, exportToPlatform } from "@/utils/csvExport";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminSalesScreen() {
  const router = useRouter();
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceOpportunity[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [marketData, ordersData] = await Promise.all([
          getMarketplaceItems(),
          getAllOrders()
        ]);
        setMarketplaceItems(marketData);
        setOrders(ordersData);
      } catch (error) {
        console.error("Admin Sales Load Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleExportCSV = async (type: "vendas" | "inventario") => {
    let dataToExport: any[] = [];
    let filename = "";
    if (type === "vendas") {
      dataToExport = orders;
      filename = `vendas_full_${new Date().toISOString().split("T")[0]}.csv`;
    } else {
      dataToExport = marketplaceItems;
      filename = `inventario_full_${new Date().toISOString().split("T")[0]}.csv`;
    }
    try {
        const csvContent = convertToCSV(dataToExport);
        await exportToPlatform(filename, csvContent);
        Alert.alert("Sucesso ✓", `O arquivo ${filename} foi gerado com sucesso.`);
    } catch (error) {
        Alert.alert("Erro", "Falha ao gerar o arquivo CSV.");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Sincronizando Ordens de Venda...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <AppHeader
        title="Gestão Comercial"
        subtitle="Ordens & Inventário Ativo"
        onBackPress={() => router.back()}
        showBackButton={true}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Quick Actions for Export */}
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Extrair Dados Ativos</Text>
        </View>
        <View style={styles.exportGrid}>
          <TouchableOpacity style={[styles.exportBtn, { backgroundColor: "#3B82F6" }]} onPress={() => handleExportCSV("vendas")}>
            <Ionicons name="receipt-outline" size={20} color="white" />
            <View>
              <Text style={styles.exportBtnTitle}>Histórico Vendas</Text>
              <Text style={styles.exportBtnSub}>Formato CSV/Excel</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.exportBtn, { backgroundColor: theme.colors.orange_500 }]} onPress={() => handleExportCSV("inventario")}>
            <Ionicons name="cube-outline" size={20} color="white" />
            <View>
              <Text style={styles.exportBtnTitle}>Inventário Geral</Text>
              <Text style={styles.exportBtnSub}>Status do Catálogo</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Sales Table */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Transações de Rede</Text>
            <Text style={styles.sectionSubtitle}>Últimos 15 lançamentos detectados</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{orders.length}</Text>
          </View>
        </View>

        <SurfaceCard style={styles.tableCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View style={styles.tableHeader}>
                <Text style={[styles.hCell, { width: 100 }]}>DATA</Text>
                <Text style={[styles.hCell, { width: 150 }]}>PRODUTO</Text>
                <Text style={[styles.hCell, { width: 100 }]}>VALOR</Text>
                <Text style={[styles.hCell, { width: 120 }]}>STATUS</Text>
              </View>
              {orders.slice(0, 15).map((order, idx) => (
                <View key={order.id} style={[styles.tableRow, idx % 2 === 0 && { backgroundColor: "#F8FAFC" }]}>
                  <Text style={[styles.cell, { width: 100, color: "#64748B" }]}>{order.data}</Text>
                  <Text style={[styles.cell, { width: 150, fontWeight: "700" }]}>{order.produto}</Text>
                  <Text style={[styles.cell, { width: 100, fontWeight: "800", color: theme.colors.primary }]}>{order.valor}</Text>
                  <View style={[styles.statusTag, { width: 100 }]}>
                    <Text style={styles.statusTagText}>{order.status.toUpperCase()}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </SurfaceCard>

        {/* Inventory Intelligence */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Alertas Críticos de Estoque</Text>
        <Text style={styles.sectionSubtitle}>Itens com ruptura total detectada</Text>
        
        <View style={styles.alertList}>
          {marketplaceItems.filter(i => i.estoqueValor === 0).length === 0 ? (
            <SurfaceCard style={styles.successCard}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.successText}>Todo o catálogo possui estoque disponível.</Text>
            </SurfaceCard>
          ) : (
            marketplaceItems.filter(i => i.estoqueValor === 0).map(item => (
              <SurfaceCard key={item.id} style={styles.alertCard}>
                <View style={styles.alertIconBg}>
                  <Ionicons name="warning" size={20} color="#EF4444" />
                </View>
                <View style={styles.alertTextContainer}>
                  <Text style={styles.alertProduct}>{item.produto}</Text>
                  <Text style={styles.alertOwner}>Vendedor: {item.vendedor}</Text>
                </View>
                <TouchableOpacity style={styles.notifBtn}>
                  <Text style={styles.notifBtnText}>Notificar</Text>
                </TouchableOpacity>
              </SurfaceCard>
            ))
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { padding: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" },
  loadingText: { marginTop: 16, color: "#64748B", fontWeight: "600" },

  headerRow: { marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B" },
  sectionSubtitle: { fontSize: 13, color: "#64748B", marginBottom: 12 },
  
  exportGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  exportBtn: { flex: 0.48, flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 16, gap: 10 },
  exportBtnTitle: { color: "white", fontSize: 13, fontWeight: "800" },
  exportBtnSub: { color: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: "500" },

  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  countBadge: { backgroundColor: "#F1F5F9", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  countText: { fontSize: 12, fontWeight: "bold", color: "#475569" },

  tableCard: { padding: 0, borderRadius: 20, overflow: "hidden", elevation: 2 },
  tableHeader: { flexDirection: "row", backgroundColor: "#F1F5F9", paddingVertical: 14, paddingHorizontal: 20 },
  hCell: { fontSize: 11, fontWeight: "800", color: "#64748B", letterSpacing: 0.5 },
  tableRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  cell: { fontSize: 13, color: "#1E293B" },
  statusTag: { backgroundColor: "#ECFDF5", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, alignItems: "center" },
  statusTagText: { fontSize: 9, fontWeight: "900", color: "#10B981" },

  alertList: { marginTop: 8 },
  alertCard: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 16, marginBottom: 10 },
  alertIconBg: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#FEE2E2", justifyContent: "center", alignItems: "center", marginRight: 12 },
  alertTextContainer: { flex: 1 },
  alertProduct: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  alertOwner: { fontSize: 11, color: "#64748B", marginTop: 2 },
  notifBtn: { backgroundColor: "#F1F5F9", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  notifBtnText: { fontSize: 11, fontWeight: "700", color: "#475569" },

  successCard: { flexDirection: "row", alignItems: "center", padding: 20, borderRadius: 16, backgroundColor: "#ECFDF5", gap: 12 },
  successText: { flex: 1, fontSize: 13, fontWeight: "600", color: "#065F46" },

  bottomSpacer: { height: 40 },
});
