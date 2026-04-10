import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { SurfaceCard } from "@/components/SurfaceCard";
import { useAuth } from "@/contexts/AuthContext";
import { getMarketplaceItems, type MarketplaceOpportunity } from "@/services/marketplaceStore";
import { getAllOrders, type Order } from "@/services/ordersStore";
import { convertToCSV, exportToPlatform } from "@/utils/csvExport";
import { appTheme as theme } from "@/theme/appTheme";

export default function AdminSalesScreen() {
  const { user } = useAuth();
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceOpportunity[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [marketData, ordersData] = await Promise.all([
        getMarketplaceItems(),
        getAllOrders()
      ]);
      setMarketplaceItems(marketData);
      setOrders(ordersData);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleExportCSV = async (type: "vendas" | "inventario") => {
    let dataToExport: any[] = [];
    let filename = "";
    if (type === "vendas") {
      dataToExport = orders;
      filename = "relatorio_vendas.csv";
    } else {
      dataToExport = marketplaceItems;
      filename = "inventario_geral.csv";
    }
    const csvContent = convertToCSV(dataToExport);
    await exportToPlatform(filename, csvContent);
    Alert.alert("Exportação Concluída", `${filename} gerado com sucesso.`);
  };

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
        title="Gestão Comercial"
        subtitle="Vendas e Inventário"
        onBackPress={() => {}}
        showBackButton={false}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.exportRow}>
          <TouchableOpacity style={styles.exportButton} onPress={() => handleExportCSV("vendas")}>
            <Ionicons name="download-outline" size={20} color={theme.colors.white} />
            <Text style={styles.exportButtonText}>Exportar Vendas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.exportButton, { backgroundColor: theme.colors.orange_500 }]} onPress={() => handleExportCSV("inventario")}>
            <Ionicons name="download-outline" size={20} color={theme.colors.white} />
            <Text style={styles.exportButtonText}>Exportar Inventário</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Vendas Recentes (Top 10)</Text>
        <SurfaceCard style={styles.listCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.columnHeader, { width: 120 }]}>Data</Text>
                <Text style={[styles.columnHeader, { width: 150 }]}>Produto</Text>
                <Text style={[styles.columnHeader, { width: 100 }]}>Valor</Text>
                <Text style={[styles.columnHeader, { width: 100 }]}>Status</Text>
              </View>
              {orders.slice(0, 10).map((order) => (
                <View key={order.id} style={styles.tableRow}>
                  <Text style={[styles.cell, { width: 120 }]}>{order.data}</Text>
                  <Text style={[styles.cell, { width: 150 }]}>{order.produto}</Text>
                  <Text style={[styles.cell, { width: 100 }]}>{order.valor}</Text>
                  <Text style={[styles.cell, { width: 100, color: theme.colors.primary }]}>{order.status}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </SurfaceCard>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Alertas de Inventário</Text>
        {marketplaceItems.filter(i => i.estoqueValor === 0).map(item => (
          <SurfaceCard key={item.id} style={styles.alertItem}>
            <Ionicons name="alert-circle" size={24} color={theme.colors.red_500} />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>{item.produto}</Text>
              <Text style={styles.alertDesc}>Estoque esgotado. Verifique com o produtor.</Text>
            </View>
          </SurfaceCard>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { padding: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  exportRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  exportButton: { flex: 0.48, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.primary, paddingVertical: 12, borderRadius: 10 },
  exportButtonText: { color: theme.colors.white, fontSize: 13, fontWeight: "bold", marginLeft: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: theme.colors.gray_900, marginBottom: 12 },
  listCard: { padding: 0, overflow: "hidden" },
  table: { paddingBottom: 8 },
  tableHeader: { flexDirection: "row", backgroundColor: theme.colors.gray_100, paddingVertical: 12, paddingHorizontal: 16 },
  columnHeader: { fontSize: 12, fontWeight: "bold", color: theme.colors.gray_600 },
  tableRow: { flexDirection: "row", paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.gray_100 },
  cell: { fontSize: 13, color: theme.colors.gray_800 },
  alertItem: { flexDirection: "row", alignItems: "center", padding: 16, marginBottom: 12 },
  alertContent: { flex: 1, marginLeft: 12 },
  alertTitle: { fontSize: 14, fontWeight: "bold", color: theme.colors.gray_900 },
  alertDesc: { fontSize: 12, color: theme.colors.gray_500, marginTop: 2 },
});
