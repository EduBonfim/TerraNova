import React from "react";
import { StyleSheet, View, Text, ScrollView, StatusBar } from "react-native";
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
    amber_600: "#D97706",
  },
};

const byRegion = [
  { region: "Centro-Oeste", users: 420, listings: 133 },
  { region: "Sudeste", users: 378, listings: 120 },
  { region: "Sul", users: 211, listings: 68 },
  { region: "Nordeste", users: 192, listings: 31 },
  { region: "Norte", users: 83, listings: 10 },
];

export default function AdminMetricsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <AppHeader
        title="Metricas"
        subtitle="Visao geral por periodo e regiao"
        onBackPress={() => router.replace("/admin-panel")}
        showBackButton={false}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.gray_200}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <SurfaceCard style={styles.card}>
          <Text style={styles.title}>Resumo do mes</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Usuarios novos</Text>
            <Text style={[styles.value, { color: theme.colors.green_700 }]}>+214</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Anuncios publicados</Text>
            <Text style={styles.value}>+98</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Negociacoes concluídas</Text>
            <Text style={styles.value}>+64</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Taxa de conflito</Text>
            <Text style={[styles.value, { color: theme.colors.amber_600 }]}>3.1%</Text>
          </View>
        </SurfaceCard>

        <SurfaceCard style={styles.card}>
          <Text style={styles.title}>Distribuicao por regiao</Text>
          {byRegion.map((item) => (
            <View key={item.region} style={styles.regionRow}>
              <Text style={styles.regionName}>{item.region}</Text>
              <Text style={styles.regionMeta}>{item.users} usuarios | {item.listings} anuncios</Text>
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
  card: { padding: 16, marginBottom: 14 },
  title: { fontSize: 16, fontWeight: "700", color: theme.colors.gray_800, marginBottom: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  label: { color: theme.colors.gray_500 },
  value: { color: theme.colors.gray_800, fontWeight: "700" },
  regionRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray_200,
    paddingTop: 10,
    marginTop: 10,
  },
  regionName: { color: theme.colors.gray_800, fontWeight: "700" },
  regionMeta: { color: theme.colors.gray_500, marginTop: 4 },
});
