import { AppHeader } from "@/components/AppHeader";
import { SurfaceCard } from "@/components/SurfaceCard";
import { useAuth } from "@/contexts/AuthContext";
import { getReportById, type AppReport } from "@/services/reportsStore";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReportDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [report, setReport] = useState<AppReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  useEffect(() => {
    const loadReport = async () => {
      if (id) {
        setIsLoading(true);
        console.log("Loading report detail for ID:", id);
        const fetchedReport = await getReportById(id);
        if (fetchedReport) {
          setReport(fetchedReport);
        } else {
          console.warn("Report not found for ID:", id);
        }
        setIsLoading(false);
      }
    };
    loadReport();
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando detalhes...</Text>
      </View>
    );
  }

  if (!report) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <AppHeader
          title="Não encontrado"
          onBackPress={() => router.back()}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.white}
        />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Denúncia não encontrada.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isReporter = user?.username === report.reporter;
  const statusColor = report.status === "resolvido" ? "#10B981" : report.status === "em_analise" ? "#F59E0B" : "#64748B";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <AppHeader
        title="Detalhes da Ocorrência"
        subtitle={`ID: #${report.id.substring(0, 8)}`}
        onBackPress={() => router.back()}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Geral */}
        <SurfaceCard style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {report.status.replace("_", " ").toUpperCase()}
              </Text>
            </View>
            <Text style={styles.dateText}>{new Date(report.data).toLocaleDateString()}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Categoria:</Text>
            <Text style={styles.infoValue}>{report.category.replace("_", " ")}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{isReporter ? "Denunciado:" : "Denunciante:"}</Text>
            <Text style={styles.infoValue}>{isReporter ? report.reportedUser : "Confidencial"}</Text>
          </View>
        </SurfaceCard>

        {/* Conteúdo */}
        <SurfaceCard style={styles.card}>
          <Text style={styles.sectionTitle}>Relato do Incidente</Text>
          <Text style={styles.reasonText}>{report.reason}</Text>
          <Text style={styles.descriptionText}>{report.description}</Text>
        </SurfaceCard>

        {/* Evidência */}
        {report.evidenceImageUri && (
          <SurfaceCard style={styles.card}>
            <Text style={styles.sectionTitle}>Evidência Anexada</Text>
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={() => setPreviewPhoto(report.evidenceImageUri!)}
              style={styles.evidenceImageContainer}
            >
              <Image 
                source={{ uri: report.evidenceImageUri }} 
                style={styles.evidenceImage} 
                resizeMode="cover" 
              />
              <View style={styles.zoomBadge}>
                <Ionicons name="search" size={16} color="white" />
                <Text style={styles.zoomBadgeText}>Clique para ampliar</Text>
              </View>
            </TouchableOpacity>
          </SurfaceCard>
        )}

        {/* Resolução */}
        {report.status === "resolvido" && (
          <SurfaceCard style={[styles.card, styles.resolutionCard]}>
            <View style={styles.resolutionHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.resolutionTitle}>Conclusão da Moderação</Text>
            </View>
            <Text style={styles.resolutionText}>
              {report.action 
                ? "A denúncia foi analisada e uma ação corretiva foi aplicada ao usuário envolvido."
                : "A denúncia foi analisada e arquivada pelo moderador."}
            </Text>
            {report.action && (
              <TouchableOpacity 
                style={styles.actionLink}
                onPress={() => router.push({ pathname: "/warning-details", params: { id: report.id } })}
              >
                <Text style={styles.actionLinkText}>Ver detalhes da ação</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </SurfaceCard>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modal de Zoom da Imagem */}
      <Modal visible={!!previewPhoto} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.closeZoomButton} 
            onPress={() => setPreviewPhoto(null)}
          >
            <Ionicons name="close-circle" size={44} color="white" />
          </TouchableOpacity>
          
          {previewPhoto && (
            <Image 
              source={{ uri: previewPhoto }} 
              style={styles.fullZoomImage} 
              resizeMode="contain" 
            />
          )}
          
          <View style={styles.zoomFooter}>
            <Text style={styles.zoomFooterText}>Inspeção de Evidência</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#64748B" },
  
  card: { padding: 20, borderRadius: 16, marginBottom: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: "bold" },
  dateText: { fontSize: 12, color: "#94A3B8" },
  
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  infoLabel: { fontSize: 14, color: "#64748B" },
  infoValue: { fontSize: 14, fontWeight: "600", color: "#1E293B", textTransform: "capitalize" },

  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#1E293B", marginBottom: 12 },
  reasonText: { fontSize: 17, fontWeight: "700", color: "#334155", marginBottom: 8 },
  descriptionText: { fontSize: 15, color: "#475569", lineHeight: 22 },

  evidenceImageContainer: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    marginTop: 10,
    backgroundColor: "#F1F5F9",
    overflow: "hidden",
    position: "relative",
  },
  evidenceImage: { width: "100%", height: "100%" },
  zoomBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  zoomBadgeText: { color: "white", fontSize: 11, fontWeight: "bold" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeZoomButton: {
    position: "absolute",
    top: 50,
    right: 25,
    zIndex: 10,
    padding: 10,
  },
  fullZoomImage: {
    width: "100%",
    height: "80%",
  },
  zoomFooter: {
    position: "absolute",
    bottom: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  zoomFooterText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  resolutionCard: { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0", borderWidth: 1 },
  resolutionHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  resolutionTitle: { fontSize: 16, fontWeight: "bold", color: "#166534" },
  resolutionText: { fontSize: 14, color: "#306040", lineHeight: 20 },
  
  actionLink: { flexDirection: "row", alignItems: "center", marginTop: 16, gap: 4 },
  actionLinkText: { fontSize: 14, fontWeight: "700", color: theme.colors.primary },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  emptyText: { fontSize: 16, color: "#64748B", textAlign: "center" },
  bottomSpacer: { height: 40 },
});
