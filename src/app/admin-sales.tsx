import React from "react";
import { StyleSheet, Text, ScrollView, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AppHeader } from "../components/AppHeader";
import { SurfaceCard } from "../components/SurfaceCard";

const theme = {
  colors: {
    primary: "#6B8E23",
    white: "#FFFFFF",
    background: "#F5F5F5",
    gray_200: "#E5E7EB",
    gray_500: "#6B7280",
    gray_800: "#1F2937",
    green_700: "#15803D",
  },
};

const topSellers = [
  { name: "Sitio Esperanca", gross: "R$ 18.430", deals: 24 },
  { name: "Fazenda Boa Terra", gross: "R$ 14.210", deals: 19 },
  { name: "Chacara Rio Azul", gross: "R$ 11.820", deals: 16 },
];

export default function AdminSalesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <AppHeader
        title="Vendas"
        subtitle="Controle de transacoes e receita"
        onBackPress={() => router.replace("/admin-panel")}
        showBackButton={false}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.gray_200}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <SurfaceCard style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Volume transacionado (30 dias)</Text>
          <Text style={styles.summaryValue}>R$ 86.900</Text>
          <Text style={styles.summaryMeta}>+12.4% em relacao ao periodo anterior</Text>
        </SurfaceCard>

        <SurfaceCard style={styles.listCard}>
          <Text style={styles.listTitle}>Top vendedores</Text>
          {topSellers.map((seller) => (
            <View key={seller.name} style={styles.row}>
              <View>
                <Text style={styles.name}>{seller.name}</Text>
                <Text style={styles.meta}>{seller.deals} negociacoes concluidas</Text>
              </View>
              <Text style={styles.gross}>{seller.gross}</Text>
            </View>
          ))}
        </SurfaceCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, paddingBottom: 24 },
  summaryCard: { padding: 18, marginBottom: 14 },
  summaryLabel: { color: theme.colors.gray_500, marginBottom: 4 },
  summaryValue: { color: theme.colors.green_700, fontWeight: "700", fontSize: 28 },
  summaryMeta: { color: theme.colors.gray_500, marginTop: 4 },
  listCard: { padding: 16 },
  listTitle: { color: theme.colors.gray_800, fontWeight: "700", fontSize: 16, marginBottom: 12 },
  row: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray_200,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { color: theme.colors.gray_800, fontWeight: "700" },
  meta: { color: theme.colors.gray_500, marginTop: 4, fontSize: 12 },
  gross: { color: theme.colors.gray_800, fontWeight: "700" },
});
