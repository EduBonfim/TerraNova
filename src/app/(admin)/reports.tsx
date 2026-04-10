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
import { getReports, deleteReport, type AppReport } from "@/services/reportsStore";
import { appTheme as theme } from "@/theme/appTheme";

export default function AdminReportsScreen() {
  const [reports, setReports] = useState<AppReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    const reportsData = await getReports();
    setReports(reportsData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolve = async (id: string) => {
    Alert.alert(
      "Resolver Denúncia",
      "Deseja marcar esta denúncia como resolvida?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Resolver",
          style: "default",
          onPress: async () => {
             await deleteReport(id);
             Alert.alert("Sucesso", "Denúncia arquivada.");
             loadData();
          }
        }
      ]
    );
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
        title="Moderação"
        subtitle="Denúncias e Suporte"
        onBackPress={() => {}}
        showBackButton={false}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {reports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="shield-checkmark" size={64} color={theme.colors.primary} />
            <Text style={styles.emptyTitle}>Sem denúncias pendentes</Text>
            <Text style={styles.emptyText}>Tudo certo com a comunidade!</Text>
          </View>
        ) : (
          reports.map((report) => (
            <SurfaceCard key={report.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <View style={styles.reportBadge}>
                  <Text style={styles.reportBadgeText}>{report.reason}</Text>
                </View>
                <Text style={styles.reportDate}>{report.data || "Hoje"}</Text>
              </View>
              
              <Text style={styles.reportContent}>{report.description || "Sem detalhes adicionais."}</Text>
              
              <View style={styles.reportFooter}>
                <Text style={styles.reportedUser}>Por: {report.reporter || "Anônimo"}</Text>
                <TouchableOpacity style={styles.resolveButton} onPress={() => handleResolve(report.id)}>
                   <Text style={styles.resolveButtonText}>Resolver</Text>
                   <Ionicons name="checkmark-done" size={16} color={theme.colors.white} style={{ marginLeft: 6 }} />
                </TouchableOpacity>
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
  scrollContent: { padding: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", marginTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: theme.colors.gray_900, marginTop: 16 },
  emptyText: { fontSize: 14, color: theme.colors.gray_500, marginTop: 4 },
  reportCard: { padding: 16, marginBottom: 16 },
  reportHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  reportBadge: { backgroundColor: theme.colors.red_500, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  reportBadgeText: { color: theme.colors.white, fontSize: 10, fontWeight: "bold" },
  reportDate: { fontSize: 12, color: theme.colors.gray_400 },
  reportContent: { fontSize: 14, color: theme.colors.gray_800, marginBottom: 16, lineHeight: 20 },
  reportFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: theme.colors.gray_100, paddingTop: 12 },
  reportedUser: { fontSize: 12, color: theme.colors.gray_500 },
  resolveButton: { flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.primary, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  resolveButtonText: { color: theme.colors.white, fontSize: 12, fontWeight: "bold" },
});
