import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
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
    red_500: "#EF4444",
    amber_500: "#F59E0B",
    green_700: "#15803D",
  },
};

const reportQueue = [
  {
    id: "rep-01",
    user: "fazenda_sj",
    reason: "Anuncio enganoso sobre certificacao",
    status: "pendente",
  },
  {
    id: "rep-02",
    user: "produtor_joao",
    reason: "Agressao verbal no chat",
    status: "em_analise",
  },
  {
    id: "rep-03",
    user: "horta_bela",
    reason: "Suspeita de documento duplicado",
    status: "resolvido",
  },
];

const statusLabel: Record<string, string> = {
  pendente: "Pendente",
  em_analise: "Em analise",
  resolvido: "Resolvido",
};

const statusColor: Record<string, string> = {
  pendente: theme.colors.red_500,
  em_analise: theme.colors.amber_500,
  resolvido: theme.colors.green_700,
};

export default function AdminReportsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <AppHeader
        title="Denuncias"
        subtitle="Fila de moderacao e reputacao"
        onBackPress={() => router.replace("/admin-panel")}
        showBackButton={false}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.gray_200}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {reportQueue.map((item) => (
          <SurfaceCard key={item.id} style={styles.card}>
            <View style={styles.topRow}>
              <Text style={styles.user}>{item.user}</Text>
              <Text style={[styles.status, { color: statusColor[item.status] }]}>{statusLabel[item.status]}</Text>
            </View>
            <Text style={styles.reason}>{item.reason}</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="search-outline" size={16} color={theme.colors.gray_800} />
                <Text style={styles.actionText}>Detalhes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="checkmark-circle-outline" size={16} color={theme.colors.gray_800} />
                <Text style={styles.actionText}>Resolver</Text>
              </TouchableOpacity>
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
  content: { padding: 16, paddingBottom: 24 },
  card: { padding: 14, marginBottom: 12 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  user: { color: theme.colors.gray_800, fontWeight: "700" },
  status: { fontWeight: "700", fontSize: 12 },
  reason: { color: theme.colors.gray_500, marginTop: 8, lineHeight: 20 },
  actionRow: { flexDirection: "row", marginTop: 12 },
  actionButton: {
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: { marginLeft: 6, color: theme.colors.gray_800, fontWeight: "600" },
});
