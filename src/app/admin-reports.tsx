import { AppHeader } from "@/components/AppHeader";
import { SurfaceCard } from "@/components/SurfaceCard";
import { getReports, updateReportStatus, type AppReport, type ReportStatus } from "@/services/reportsStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const [reports, setReports] = useState<AppReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    const data = await getReports();
    setReports(data);
    setIsLoading(false);
  };

  const handleUpdateStatus = async (id: string, next: ReportStatus) => {
     await updateReportStatus(id, next);
     loadReports();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <AppHeader
        title="Denuncias"
        subtitle="Fila de moderacao e reputacao"
        onBackPress={() => router.back()}
        showBackButton={true}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.gray_200}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {reports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="shield-checkmark-outline" size={48} color={theme.colors.gray_200} />
            <Text style={styles.emptyText}>Nenhuma denúncia pendente</Text>
          </View>
        ) : (
          reports.map((item) => (
            <SurfaceCard key={item.id} style={styles.card}>
              <View style={styles.topRow}>
                <View>
                  <Text style={styles.user}>Foco: {item.reportedUser}</Text>
                  <Text style={styles.reporterLabel}>Por: {item.reporter}</Text>
                </View>
                <Text style={[styles.status, { color: statusColor[item.status] }]}>{statusLabel[item.status]}</Text>
              </View>
              <Text style={styles.reason}>{item.reason}</Text>
              {item.description && <Text style={styles.description}>{item.description}</Text>}
              <View style={styles.actionRow}>
                {item.status === "pendente" && (
                  <TouchableOpacity style={styles.actionButton} onPress={() => handleUpdateStatus(item.id, "em_analise")}>
                    <Ionicons name="search-outline" size={16} color={theme.colors.gray_800} />
                    <Text style={styles.actionText}>Analisar</Text>
                  </TouchableOpacity>
                )}
                {item.status !== "resolvido" && (
                  <TouchableOpacity style={[styles.actionButton, { backgroundColor: "rgba(21, 128, 61, 0.1)" }]} onPress={() => handleUpdateStatus(item.id, "resolvido")}>
                    <Ionicons name="checkmark-circle-outline" size={16} color={theme.colors.green_700} />
                    <Text style={[styles.actionText, { color: theme.colors.green_700 }]}>Resolver</Text>
                  </TouchableOpacity>
                )}
              </View>
            </SurfaceCard>
          ))
        )}
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
  reporterLabel: { fontSize: 11, color: theme.colors.gray_500, marginTop: 2 },
  description: { fontSize: 13, color: theme.colors.gray_500, fontStyle: "italic", marginTop: 4 },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", marginTop: 100 },
  emptyText: { marginTop: 12, color: theme.colors.gray_500, fontSize: 16 },
});
