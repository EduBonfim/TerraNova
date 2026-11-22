import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export function SalesMetricsModal({
  visible,
  onClose,
  salesPeriod,
  setSalesPeriod,
  salesData,
  onExportCSV,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.metricsModalBackdrop}>
        <View style={styles.metricsModalCard}>
          <View style={styles.metricsModalHeader}>
            <Text style={styles.metricsModalTitle}>Relatórios e Métricas</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.gray_800} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.metricsScrollView}
          >
            {/* Seletor de periodo */}
            <View style={styles.periodSelector}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {["dias", "semanas", "meses", "total"].map((period) => (
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

            {/* Total de vendas */}
            <View style={styles.totalSalesContainer}>
              <Text style={styles.totalSalesLabel}>Total de Vendas</Text>
              <Text style={styles.totalSalesNumber}>{salesData.total}</Text>
              <Text style={styles.totalSalesDescription}>
                vendas efetuadas neste período
              </Text>
            </View>

            {/* Vendas por Categoria */}
            <View style={styles.salesBreakdownContainer}>
              <Text style={styles.breakdownTitle}>Vendas por Categoria</Text>

              {/* Chart Container */}
              <View style={styles.chartContainer}>
                <View style={styles.chartBar}>
                  <View style={styles.chartBarLabel}>
                    <View
                      style={[
                        styles.chartBarColor,
                        { backgroundColor: "#10B981" },
                      ]}
                    />
                    <View style={styles.chartBarInfo}>
                      <Text style={styles.chartBarName}>Alimentos</Text>
                      <Text style={styles.chartBarStats}>
                        {salesData.alimentos} vendas (
                        {Math.round(
                          (salesData.alimentos / salesData.total) * 100
                        ) || 0}
                        %)
                      </Text>
                    </View>
                  </View>
                  <View style={styles.barFillContainer}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${
                            Math.round(
                              (salesData.alimentos / salesData.total) * 100
                            ) || 0
                          }%`,
                          backgroundColor: "#10B981",
                        },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.chartBar}>
                  <View style={styles.chartBarLabel}>
                    <View
                      style={[
                        styles.chartBarColor,
                        { backgroundColor: "#F59E0B" },
                      ]}
                    />
                    <View style={styles.chartBarInfo}>
                      <Text style={styles.chartBarName}>Insumos</Text>
                      <Text style={styles.chartBarStats}>
                        {salesData.insumos} vendas (
                        {Math.round(
                          (salesData.insumos / salesData.total) * 100
                        ) || 0}
                        %)
                      </Text>
                    </View>
                  </View>
                  <View style={styles.barFillContainer}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${
                            Math.round(
                              (salesData.insumos / salesData.total) * 100
                            ) || 0
                          }%`,
                          backgroundColor: "#F59E0B",
                        },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.chartBar}>
                  <View style={styles.chartBarLabel}>
                    <View
                      style={[
                        styles.chartBarColor,
                        { backgroundColor: "#3B82F6" },
                      ]}
                    />
                    <View style={styles.chartBarInfo}>
                      <Text style={styles.chartBarName}>Sementes</Text>
                      <Text style={styles.chartBarStats}>
                        {salesData.sementes} vendas (
                        {Math.round(
                          (salesData.sementes / salesData.total) * 100
                        ) || 0}
                        %)
                      </Text>
                    </View>
                  </View>
                  <View style={styles.barFillContainer}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${
                            Math.round(
                              (salesData.sementes / salesData.total) * 100
                            ) || 0
                          }%`,
                          backgroundColor: "#3B82F6",
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Estatísticas de vendas */}
            <View style={styles.salesStats}>
              <Text style={styles.statsTitle}>Estatísticas</Text>

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
                  <Text style={styles.statBoxLabel}>Faturamento Total</Text>
                  <Text style={styles.statBoxValue}>R$ 104.775</Text>
                </View>
              </View>
            </View>

            {/* Botao de exportar */}
            <TouchableOpacity style={styles.exportButton} onPress={onExportCSV}>
              <Ionicons
                name="document-outline"
                size={18}
                color={theme.colors.white}
              />
              <Text style={styles.exportButtonText}>Exportar como CSV</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  metricsModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.45)",
    justifyContent: "flex-end",
  },
  metricsModalCard: {
    maxHeight: "94%",
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 0,
    paddingTop: 14,
    paddingBottom: 20,
  },
  metricsScrollView: {
    paddingHorizontal: 16,
  },
  metricsModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  metricsModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  periodSelector: {
    marginBottom: 16,
  },
  periodButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
    marginRight: 6,
  },
  periodButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  periodButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.gray_500,
  },
  periodButtonTextActive: {
    color: theme.colors.white,
  },
  totalSalesContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  totalSalesLabel: {
    fontSize: 13,
    color: theme.colors.gray_500,
    marginBottom: 4,
  },
  totalSalesNumber: {
    fontSize: 42,
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
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 16,
  },
  chartContainer: {
    marginTop: 12,
  },
  chartBar: {
    marginBottom: 16,
  },
  chartBarLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
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
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.gray_800,
  },
  chartBarStats: {
    fontSize: 11,
    color: theme.colors.gray_500,
    marginTop: 2,
  },
  barFillContainer: {
    height: 24,
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
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 14,
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
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  exportButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: "bold",
  },
});
