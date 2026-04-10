import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { SurfaceCard } from "@/components/SurfaceCard";
import { getMarketplaceItems, type MarketplaceOpportunity } from "@/services/marketplaceStore";
import { getAllOrders, type Order } from "@/services/ordersStore";
import { appTheme as theme } from "@/theme/appTheme";

export default function AdminMetricsScreen() {
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Métricas Calculadas
  const totalVolume = orders.reduce((sum, o) => sum + (o.valorNumerico || 0), 0);

  const categories = marketplaceItems.reduce((acc: any, item) => {
    acc[item.categoria] = (acc[item.categoria] || 0) + 1;
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <AppHeader
        title="BI & Relatórios"
        subtitle="Inteligência de Dados"
        onBackPress={() => {}}
        showBackButton={false}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <SurfaceCard style={styles.metricCard}>
          <Text style={styles.metricLabel}>Volume Transacionado (Total)</Text>
          <Text style={styles.metricValue}>R$ {totalVolume.toFixed(2).replace(".", ",")}</Text>
          <View style={styles.trendRow}>
            <Ionicons name="trending-up" size={16} color={theme.colors.primary} />
            <Text style={styles.trendText}>+12.5% em relação ao mês anterior</Text>
          </View>
        </SurfaceCard>

        <Text style={styles.sectionTitle}>Distribuição por Categoria</Text>
        <SurfaceCard style={styles.chartCard}>
          {Object.entries(categories).map(([cat, count]: any) => (
            <View key={cat} style={styles.barRow}>
              <Text style={styles.barLabel}>{cat}</Text>
              <View style={styles.barBackground}>
                <View style={[styles.barFill, { width: `${(count / (marketplaceItems.length || 1)) * 100}%` }]} />
              </View>
              <Text style={styles.barValue}>{count}</Text>
            </View>
          ))}
        </SurfaceCard>

        <SurfaceCard style={[styles.metricCard, { marginTop: 24, backgroundColor: theme.colors.lightGreen }]}>
          <Text style={styles.metricLabel}>Ticket Médio</Text>
          <Text style={styles.metricValue}>R$ {(totalVolume / (orders.length || 1)).toFixed(2).replace(".", ",")}</Text>
        </SurfaceCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { padding: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  metricCard: { padding: 20, marginBottom: 16 },
  metricLabel: { fontSize: 13, color: theme.colors.gray_500, fontWeight: "bold", textTransform: "uppercase" },
  metricValue: { fontSize: 28, fontWeight: "bold", color: theme.colors.gray_900, marginVertical: 8 },
  trendRow: { flexDirection: "row", alignItems: "center" },
  trendText: { fontSize: 12, color: theme.colors.primary, marginLeft: 6, fontWeight: "500" },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: theme.colors.gray_900, marginBottom: 12 },
  chartCard: { padding: 20 },
  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  barLabel: { width: 80, fontSize: 12, color: theme.colors.gray_600 },
  barBackground: { flex: 1, height: 8, backgroundColor: theme.colors.gray_100, borderRadius: 4, marginHorizontal: 12 },
  barFill: { height: "100%", backgroundColor: theme.colors.primary, borderRadius: 4 },
  barValue: { width: 30, fontSize: 12, fontWeight: "bold", color: theme.colors.gray_800, textAlign: "right" },
});
