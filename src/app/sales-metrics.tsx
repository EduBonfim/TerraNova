import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AppHeader } from "@/components/AppHeader";
import { useAccountLogic } from "@/features/account/hooks/useAccountLogic";
import { appTheme as theme } from "@/theme/appTheme";

export default function SalesMetricsScreen() {
  const router = useRouter();
  const { 
    salesPeriod, 
    setSalesPeriod, 
    salesData, 
    exportToCSV 
  } = useAccountLogic();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <AppHeader
        title="Relatórios e Métricas"
        onBackPress={() => router.back()}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.primary}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Period Selector */}
          <View style={styles.periodSelector}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(["dias", "semanas", "meses", "total"] as const).map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodButton,
                    salesPeriod === period && styles.periodButtonActive,
                  ]}
                  onPress={() => setSalesPeriod(period)}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      salesPeriod === period && styles.periodButtonTextActive,
                    ]}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Total Sales Card */}
          <View style={[styles.card, styles.totalSalesCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name="trending-up" size={24} color={theme.colors.white} />
              </View>
              <View>
                <Text style={styles.cardLabel}>Faturamento Total Estimado</Text>
                <Text style={styles.cardSubValue}>Balanço do Período</Text>
              </View>
            </View>
            <Text style={styles.totalSalesNumber}>R$ 104.775,00</Text>
            <View style={styles.badge}>
              <Ionicons name="caret-up" size={12} color="#10B981" />
              <Text style={styles.badgeText}>+12.4% vs anterior</Text>
            </View>
          </View>

          {/* Key KPIs Row */}
          <View style={styles.statRow}>
            <View style={[styles.statBox, { borderLeftColor: "#10B981", borderLeftWidth: 4 }]}>
              <Text style={styles.statBoxLabel}>Total Pedidos</Text>
              <Text style={styles.statBoxValue}>{salesData.total}</Text>
            </View>
            <View style={[styles.statBox, { borderLeftColor: theme.colors.primary, borderLeftWidth: 4 }]}>
              <Text style={styles.statBoxLabel}>Ticket Médio</Text>
              <Text style={styles.statBoxValue}>R$ 425</Text>
            </View>
          </View>

          {/* Sales Breakdown */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Vendas por Categoria</Text>
            
            <View style={styles.chartContainer}>
              <CategoryBar 
                label="Alimentos" 
                value={salesData.alimentos} 
                total={salesData.total} 
                color="#10B981" 
              />
              <CategoryBar 
                label="Insumos" 
                value={salesData.insumos} 
                total={salesData.total} 
                color="#F59E0B" 
              />
              <CategoryBar 
                label="Sementes" 
                value={salesData.sementes} 
                total={salesData.total} 
                color="#3B82F6" 
              />
            </View>
          </View>

          {/* Recent Activity Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Atividades Recentes</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver tudo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activitiesContainer}>
            {/* Exibindo os últimos 3 pedidos como exemplo de atividade */}
            {[
              { id: "1", client: "João Silva", value: "R$ 1.250,00", time: "Há 2 horas" },
              { id: "2", client: "Maria Souza", value: "R$ 450,00", time: "Há 5 horas" },
              { id: "3", client: "Fazenda Sol", value: "R$ 2.100,00", time: "Ontem" },
            ].map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="cart-outline" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityClient}>{activity.client}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
                <Text style={styles.activityValue}>{activity.value}</Text>
              </View>
            ))}
          </View>

          {/* Export Button */}
          <TouchableOpacity style={styles.exportButton} onPress={exportToCSV}>
            <Ionicons name="cloud-download-outline" size={20} color={theme.colors.white} />
            <Text style={styles.exportButtonText}>Gerar Relatório Analítico (CSV)</Text>
          </TouchableOpacity>
          
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper Component for Bars
function CategoryBar({ label, value, total, color }: any) {
  const percentage = Math.round((value / total) * 100) || 0;
  return (
    <View style={styles.chartBar}>
      <View style={styles.chartBarLabel}>
        <Text style={styles.chartBarName}>{label}</Text>
        <Text style={styles.chartBarStats}>{value} de {total} ({percentage}%)</Text>
      </View>
      <View style={styles.barFillContainer}>
        <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 16,
  },
  periodSelector: {
    marginBottom: 20,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    marginRight: 10,
  },
  periodButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.gray_600,
  },
  periodButtonTextActive: {
    color: theme.colors.white,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  totalSalesCard: {
    backgroundColor: theme.colors.primary,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  cardSubValue: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  totalSalesNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.white,
    marginBottom: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    color: theme.colors.white,
    fontWeight: "bold",
  },
  statRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statBoxLabel: {
    fontSize: 12,
    color: theme.colors.gray_500,
    marginBottom: 4,
  },
  statBoxValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 20,
  },
  chartContainer: {
    gap: 16,
  },
  chartBar: {
    marginBottom: 4,
  },
  chartBarLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  chartBarName: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.gray_700,
  },
  chartBarStats: {
    fontSize: 12,
    color: theme.colors.gray_500,
  },
  barFillContainer: {
    height: 10,
    backgroundColor: theme.colors.gray_100,
    borderRadius: 5,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  seeAllText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  activitiesContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_500,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityClient: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  activityTime: {
    fontSize: 12,
    color: theme.colors.gray_500,
    marginTop: 2,
  },
  activityValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  exportButton: {
    backgroundColor: theme.colors.gray_800,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  exportButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
