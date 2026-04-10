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
          <View style={styles.totalSalesContainer}>
            <Text style={styles.totalSalesLabel}>Total de Vendas</Text>
            <Text style={styles.totalSalesNumber}>{salesData.total}</Text>
            <Text style={styles.totalSalesDescription}>vendas efetuadas neste período</Text>
          </View>

          {/* Sales Breakdown */}
          <View style={styles.salesBreakdownContainer}>
            <Text style={styles.breakdownTitle}>Vendas por Categoria</Text>
            
            <View style={styles.chartContainer}>
              <View style={styles.chartBar}>
                <View style={styles.chartBarLabel}>
                  <View style={[styles.chartBarColor, { backgroundColor: "#10B981" }]} />
                  <View style={styles.chartBarInfo}>
                    <Text style={styles.chartBarName}>Alimentos</Text>
                    <Text style={styles.chartBarStats}>
                      {salesData.alimentos} vendas ({Math.round((salesData.alimentos / salesData.total) * 100) || 0}%)
                    </Text>
                  </View>
                </View>
                <View style={styles.barFillContainer}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${Math.round((salesData.alimentos / salesData.total) * 100) || 0}%`, backgroundColor: "#10B981" },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.chartBar}>
                <View style={styles.chartBarLabel}>
                  <View style={[styles.chartBarColor, { backgroundColor: "#F59E0B" }]} />
                  <View style={styles.chartBarInfo}>
                    <Text style={styles.chartBarName}>Insumos</Text>
                    <Text style={styles.chartBarStats}>
                      {salesData.insumos} vendas ({Math.round((salesData.insumos / salesData.total) * 100) || 0}%)
                    </Text>
                  </View>
                </View>
                <View style={styles.barFillContainer}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${Math.round((salesData.insumos / salesData.total) * 100) || 0}%`, backgroundColor: "#F59E0B" },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.chartBar}>
                <View style={styles.chartBarLabel}>
                  <View style={[styles.chartBarColor, { backgroundColor: "#3B82F6" }]} />
                  <View style={styles.chartBarInfo}>
                    <Text style={styles.chartBarName}>Sementes</Text>
                    <Text style={styles.chartBarStats}>
                      {salesData.sementes} vendas ({Math.round((salesData.sementes / salesData.total) * 100) || 0}%)
                    </Text>
                  </View>
                </View>
                <View style={styles.barFillContainer}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${Math.round((salesData.sementes / salesData.total) * 100) || 0}%`, backgroundColor: "#3B82F6" },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.salesStats}>
            <Text style={styles.statsTitle}>Estatísticas Adicionais</Text>

            <View style={styles.statRow}>
              <View style={styles.statBox}>
                <Text style={styles.statBoxLabel}>Ticket Médio</Text>
                <Text style={styles.statBoxValue}>R$ 425,00</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBoxLabel}>Maior Venda</Text>
                <Text style={styles.statBoxValue}>R$ 2.100,00</Text>
              </View>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statBox}>
                <Text style={styles.statBoxLabel}>Menor Venda</Text>
                <Text style={styles.statBoxValue}>R$ 150,00</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBoxLabel}>Faturamento Estimado</Text>
                <Text style={styles.statBoxValue}>R$ 104.775</Text>
              </View>
            </View>
          </View>

          {/* Export Button */}
          <TouchableOpacity style={styles.exportButton} onPress={exportToCSV}>
            <Ionicons name="document-text-outline" size={20} color={theme.colors.white} />
            <Text style={styles.exportButtonText}>Exportar Relatório completo (CSV)</Text>
          </TouchableOpacity>
          
          <View style={{ height: 40 }} />
        </View>
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
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 16,
  },
  periodSelector: {
    marginBottom: 16,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    marginRight: 8,
  },
  periodButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  periodButtonText: {
    fontSize: 13,
    fontWeight: "bold",
    color: theme.colors.gray_500,
  },
  periodButtonTextActive: {
    color: theme.colors.white,
  },
  totalSalesContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  totalSalesLabel: {
    fontSize: 14,
    color: theme.colors.gray_500,
    marginBottom: 4,
  },
  totalSalesNumber: {
    fontSize: 48,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  totalSalesDescription: {
    fontSize: 12,
    color: theme.colors.gray_500,
    marginTop: 4,
  },
  salesBreakdownContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  breakdownTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 16,
  },
  chartContainer: {
    marginTop: 4,
  },
  chartBar: {
    marginBottom: 16,
  },
  chartBarLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  chartBarColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 10,
  },
  chartBarInfo: {
    flex: 1,
  },
  chartBarName: {
    fontSize: 13,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  chartBarStats: {
    fontSize: 11,
    color: theme.colors.gray_500,
  },
  barFillContainer: {
    height: 12,
    backgroundColor: theme.colors.gray_200,
    borderRadius: 6,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 6,
  },
  salesStats: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  statBoxLabel: {
    fontSize: 11,
    color: theme.colors.gray_500,
    marginBottom: 4,
  },
  statBoxValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  exportButton: {
    backgroundColor: theme.colors.gray_800,
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  exportButtonText: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: "bold",
  },
});
