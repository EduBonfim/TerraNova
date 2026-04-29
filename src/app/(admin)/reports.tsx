import { AppHeader } from "@/components/AppHeader";
import { SurfaceCard } from "@/components/SurfaceCard";
import { archiveReport, getReports, type AppReport } from "@/services/reportsStore";
import { appTheme as theme } from "@/theme/appTheme";
import { ReportDetailScreen } from "@/features/admin/components/ReportDetailScreen";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminReportsScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<AppReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<AppReport | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");

  const loadData = async () => {
    try {
      setIsLoading(true);
      const reportsData = await getReports();
      // Ordenar da mais recente para a mais antiga
      const sorted = reportsData.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      setReports(sorted);
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
             await archiveReport(id);
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

  if (selectedReport) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
        <ReportDetailScreen
          report={selectedReport}
          onBack={() => setSelectedReport(null)}
          onReportUpdated={() => {
            setSelectedReport(null);
            loadData();
          }}
        />
      </SafeAreaView>
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

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "pending" && styles.activeTab]}
          onPress={() => setActiveTab("pending")}
        >
          <Text style={[styles.tabText, activeTab === "pending" && styles.activeTabText]}>Pendentes</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "history" && styles.activeTab]}
          onPress={() => setActiveTab("history")}
        >
          <Text style={[styles.tabText, activeTab === "history" && styles.activeTabText]}>Histórico</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerInfo}>
          <Text style={styles.sectionTitle}>
            {activeTab === "pending" ? "Fila de Moderação" : "Histórico Global"}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {activeTab === "pending" 
              ? "Incidentes aguardando análise ou em andamento." 
              : "Registro completo de todas as denúncias processadas."}
          </Text>
        </View>

        {(() => {
          const displayReports = activeTab === "pending" 
            ? reports.filter(r => r.status === "pendente" || r.status === "em_analise")
            : reports;

          if (displayReports.length === 0) {
            return (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="shield-checkmark" size={48} color={theme.colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>Tudo Limpo</Text>
                <Text style={styles.emptyText}>Não há denúncias nesta categoria.</Text>
              </View>
            );
          }

          return displayReports.map((report) => {
            const statusInfo = (({
              pendente: { color: "#EF4444", bg: "#FEE2E2", label: "Pendente" },
              em_analise: { color: "#F59E0B", bg: "#FEF3C7", label: "Em Análise" },
              resolvido: { color: "#10B981", bg: "#DCFCE7", label: "Resolvido" },
              descartado: { color: "#64748B", bg: "#F1F5F9", label: "Descartado" },
            } as Record<string, { color: string; bg: string; label: string }>)[report.status] || { color: "#64748B", bg: "#F1F5F9", label: report.status });

            return (
              <TouchableOpacity 
                key={report.id} 
                activeOpacity={0.8}
                onPress={() => setSelectedReport(report)}
              >
                <SurfaceCard style={styles.reportCard}>
                  <View style={styles.statusRow}>
                    <View style={[styles.severityBadge, { backgroundColor: statusInfo.bg }]}>
                      <View style={[styles.dot, { backgroundColor: statusInfo.color }]} />
                      <Text style={[styles.severityText, { color: statusInfo.color }]}>
                        {statusInfo.label}
                      </Text>
                    </View>
                    <Text style={styles.reportId}>#{report.id.substring(0, 8).toUpperCase()}</Text>
                  </View>
                  
                  <Text style={styles.reportTitle}>{report.reason}</Text>
                  <Text style={styles.reportDescription} numberOfLines={2}>
                    {report.description || "Sem descrição adicional."}
                  </Text>
                  
                  <View style={styles.reportMetadata}>
                    <View style={styles.metaRow}>
                      <Ionicons name="person-circle-outline" size={16} color={theme.colors.primary} />
                      <Text style={styles.metaText}>
                        Foco: <Text style={styles.boldText}>{report.reportedUser}</Text>
                      </Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Ionicons name="person-outline" size={14} color="#64748B" />
                      <Text style={styles.metaText}>Autor: {report.reporter}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Ionicons name="calendar-outline" size={14} color="#64748B" />
                      <Text style={styles.metaText}>{new Date(report.data).toLocaleDateString()}</Text>
                    </View>
                  </View>

                  {report.status !== "resolvido" && (
                    <TouchableOpacity 
                      style={styles.resolveButton} 
                      onPress={() => handleResolve(report.id, report.reporter)}
                    >
                      <Text style={styles.resolveButtonText}>Marcar como Resolvido</Text>
                      <Ionicons name="checkmark-done" size={16} color="white" />
                    </TouchableOpacity>
                  )}
                </SurfaceCard>
              </TouchableOpacity>
            );
          });
        })()}
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
  
  reportMetadata: { backgroundColor: "#F8FAFC", padding: 12, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: "#E2E8F0" },
  metaRow: { flexDirection: "row", alignItems: "center", marginBottom: 6, gap: 4 },
  metaText: { fontSize: 12, color: "#64748B", marginLeft: 4 },
  boldText: { fontWeight: "bold", color: "#1E293B" },

  resolveButton: { backgroundColor: theme.colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12, gap: 10, elevation: 2 },
  resolveButtonText: { color: "white", fontSize: 14, fontWeight: "bold" },

  bottomSpacer: { height: 40 },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.white,
    padding: 6,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
  },
  activeTabText: {
    color: theme.colors.white,
  },
});
