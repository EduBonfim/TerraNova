import { AppHeader } from "@/components/AppHeader";
import { useAccountLogic } from "@/features/account/hooks/useAccountLogic";
import { metricsStyles as styles } from "@/styles/ordersAndMetricsStyles";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SalesMetricsScreen() {
  const router = useRouter();
  const { salesPeriod, setSalesPeriod, salesData, exportToCSV } =
    useAccountLogic();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />
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
              {(["dias", "semanas", "meses", "total"] as const).map(
                (period) => (
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
                ),
              )}
            </ScrollView>
          </View>

          {/* Total Sales Card */}
          <View style={[styles.card, styles.totalSalesCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="trending-up"
                  size={24}
                  color={theme.colors.white}
                />
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
            <View
              style={[
                styles.statBox,
                { borderLeftColor: "#10B981", borderLeftWidth: 4 },
              ]}
            >
              <Text style={styles.statBoxLabel}>Total Pedidos</Text>
              <Text style={styles.statBoxValue}>{salesData.total}</Text>
            </View>
            <View
              style={[
                styles.statBox,
                { borderLeftColor: theme.colors.primary, borderLeftWidth: 4 },
              ]}
            >
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
              {
                id: "1",
                client: "João Silva",
                value: "R$ 1.250,00",
                time: "Há 2 horas",
              },
              {
                id: "2",
                client: "Maria Souza",
                value: "R$ 450,00",
                time: "Há 5 horas",
              },
              {
                id: "3",
                client: "Fazenda Sol",
                value: "R$ 2.100,00",
                time: "Ontem",
              },
            ].map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons
                    name="cart-outline"
                    size={20}
                    color={theme.colors.primary}
                  />
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
            <Ionicons
              name="cloud-download-outline"
              size={20}
              color={theme.colors.white}
            />
            <Text style={styles.exportButtonText}>
              Gerar Relatório Analítico (CSV)
            </Text>
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
        <Text style={styles.chartBarStats}>
          {value} de {total} ({percentage}%)
        </Text>
      </View>
      <View style={styles.barFillContainer}>
        <View
          style={[
            styles.barFill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}
