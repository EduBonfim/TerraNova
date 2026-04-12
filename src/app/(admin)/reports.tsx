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
import { useRouter } from "expo-router";
import { AppHeader } from "@/components/AppHeader";
import { SurfaceCard } from "@/components/SurfaceCard";
import { getReports, deleteReport, type AppReport } from "@/services/reportsStore";
import { appTheme as theme } from "@/theme/appTheme";

export default function AdminReportsScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<AppReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const reportsData = await getReports();
      setReports(reportsData);
    } catch (error) {
      console.error("Admin Reports Load Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolve = async (id: string, reporter: string) => {
    Alert.alert(
      "Moderação de Conteúdo",
      `Deseja arquivar esta denúncia de ${reporter}? O caso será marcado como resolvido.`,
      [
        { text: "Manter Aberto", style: "cancel" },
        {
          text: "Resolver Caso",
          style: "default",
          onPress: async () => {
             await deleteReport(id);
             Alert.alert("Sucesso ✓", "Caso resolvido e arquivado com sucesso.");
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
        <Text style={styles.loadingText}>Acessando Fila de Moderação...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <AppHeader
        title="Escudo & Moderação"
        subtitle="Qualidade da Comunidade"
        onBackPress={() => router.back()}
        showBackButton={true}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerInfo}>
          <Text style={styles.sectionTitle}>Incidentes Pendentes ({reports.length})</Text>
          <Text style={styles.sectionSubtitle}>Verifique e resolva conflitos para manter a saúde da plataforma.</Text>
        </View>

        {reports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="shield-checkmark" size={48} color={theme.colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>Ambiente Seguro</Text>
            <Text style={styles.emptyText}>Não há denúncias pendentes no momento. Bom trabalho!</Text>
          </View>
        ) : (
          reports.map((report, index) => (
            <SurfaceCard key={report.id} style={styles.reportCard}>
              <View style={styles.statusRow}>
                <View style={[styles.severityBadge, { backgroundColor: index % 2 === 0 ? "#FEE2E2" : "#FEF3C7" }]}>
                  <View style={[styles.dot, { backgroundColor: index % 2 === 0 ? "#EF4444" : "#F59E0B" }]} />
                  <Text style={[styles.severityText, { color: index % 2 === 0 ? "#EF4444" : "#D97706" }]}>
                    {report.reason || "DENÚNCIA"}
                  </Text>
                </View>
                <Text style={styles.reportId}>#Ocor-{(1000 + index)}</Text>
              </View>
              
              <Text style={styles.reportTitle}>Denunciado: {report.reportedUser || "Inconsistente"}</Text>
              <Text style={styles.reportDescription}>{report.description || "O usuário não forneceu detalhes adicionais sobre o incidente."}</Text>
              
              <View style={styles.reportMetadata}>
                <View style={styles.metaRow}>
                  <Ionicons name="person-outline" size={14} color="#64748B" />
                  <Text style={styles.metaText}>Autor: {report.reporter || "Anônimo"}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={14} color="#64748B" />
                  <Text style={styles.metaText}>{report.data || "Hoje"}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.resolveButton} 
                onPress={() => handleResolve(report.id, report.reporter || "Anônimo")}
              >
                <Text style={styles.resolveButtonText}>Marcar como Resolvido</Text>
                <Ionicons name="arrow-forward" size={16} color="white" />
              </TouchableOpacity>
            </SurfaceCard>
          ))
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { padding: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" },
  loadingText: { marginTop: 16, color: "#64748B", fontWeight: "600" },

  headerInfo: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: "800", color: "#1E293B" },
  sectionSubtitle: { fontSize: 13, color: "#64748B", marginTop: 4, lineHeight: 18 },

  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", marginTop: 80 },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#ECFDF5", justifyContent: "center", alignItems: "center", marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#1E293B" },
  emptyText: { fontSize: 14, color: "#64748B", textAlign: "center", marginTop: 8, paddingHorizontal: 40 },

  reportCard: { padding: 20, borderRadius: 20, marginBottom: 16, elevation: 3 },
  statusRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  severityBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  severityText: { fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  reportId: { fontSize: 12, fontWeight: "600", color: "#94A3B8" },

  reportTitle: { fontSize: 16, fontWeight: "700", color: "#1E293B", marginBottom: 8 },
  reportDescription: { fontSize: 14, color: "#475569", lineHeight: 22, marginBottom: 20 },
  
  reportMetadata: { backgroundColor: "#F1F5F9", padding: 12, borderRadius: 12, marginBottom: 20 },
  metaRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  metaText: { fontSize: 12, color: "#64748B", marginLeft: 8 },

  resolveButton: { backgroundColor: theme.colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12, gap: 10 },
  resolveButtonText: { color: "white", fontSize: 14, fontWeight: "bold" },

  bottomSpacer: { height: 40 },
});
