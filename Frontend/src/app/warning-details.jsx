import { AppHeader } from "@/components/AppHeader";
import { SurfaceCard } from "@/components/SurfaceCard";
import { useAuth } from "@/contexts/AuthContext";
import { getReportById } from "@/services/reportsStore";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WarningDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      if (id) {
        setIsLoading(true);
        const fetchedReport = await getReportById(id);
        setReport(fetchedReport);
        setIsLoading(false);
      }
    };
    loadReport();
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.red_500} />
        <Text style={styles.loadingText}>
          Carregando detalhes do incidente...
        </Text>
      </View>
    );
  }

  if (!report) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <AppHeader
          title="Detalhes do Incidente"
          onBackPress={() => router.back()}
          backgroundColor={theme.colors.red_500}
          textColor={theme.colors.white}
        />
        <View style={styles.emptyContainer}>
          <Ionicons
            name="document-text-outline"
            size={64}
            color={theme.colors.gray_300}
          />
          <Text style={styles.emptyText}>
            Incidente não encontrado ou já foi removido.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isReportedUser = user?.username === report.reportedUser;
  const isReporter = user?.username === report.reporter;

  const getActionTitle = () => {
    if (isReporter) {
      if (report.status === "resolvido" && report.action) {
        return "Sua denúncia foi atendida";
      }
      return "Sua denúncia foi arquivada";
    }

    if (isReportedUser) {
      if (report.action?.type === "aviso") return "Aviso de Moderação";
      if (report.action?.type === "bloqueio_temporario")
        return "Suspensão Temporária";
      if (report.action?.type === "bloqueio")
        return "Conta Bloqueada Permanentemente";
      if (report.status === "resolvido" && !report.action)
        return "Incidente Arquivado";
    }
    return "Detalhes do Incidente";
  };

  const getSeverityColor = () => {
    if (isReporter) return theme.colors.primary; // Informative
    if (report.action?.type === "aviso") return theme.colors.orange_500;
    if (
      report.action?.type === "bloqueio" ||
      report.action?.type === "bloqueio_temporario"
    )
      return theme.colors.red_500;
    return theme.colors.gray_500; // Arquivado/Descartado
  };

  const getIcon = () => {
    if (isReporter) return "shield-checkmark";
    if (report.action?.type === "aviso") return "warning";
    if (
      report.action?.type === "bloqueio" ||
      report.action?.type === "bloqueio_temporario"
    )
      return "ban";
    return "information-circle";
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: getSeverityColor() }]}
      edges={["top"]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={getSeverityColor()}
      />
      <AppHeader
        title="Alerta de Moderação"
        onBackPress={() => router.back()}
        backgroundColor={getSeverityColor()}
        textColor={theme.colors.white}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerBanner}>
          <View
            style={[styles.iconCircle, { backgroundColor: getSeverityColor() }]}
          >
            <Ionicons name={getIcon()} size={42} color={theme.colors.white} />
          </View>
          <Text style={styles.bannerTitle}>{getActionTitle()}</Text>
          <Text style={styles.bannerDate}>
            Data da ação:{" "}
            {report.analyzedAt
              ? new Date(report.analyzedAt).toLocaleDateString("pt-BR")
              : "Recente"}
          </Text>
        </View>

        <SurfaceCard style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Contexto</Text>
          {isReportedUser ? (
            <Text style={styles.descriptionText}>
              Nossa equipe de moderação analisou a denúncia feita contra a sua
              conta em relação a:{" "}
              <Text style={styles.boldText}>{report.reason}</Text>.
            </Text>
          ) : (
            <Text style={styles.descriptionText}>
              Nossa equipe analisou a sua denúncia com motivo:{" "}
              <Text style={styles.boldText}>{report.reason}</Text>.
            </Text>
          )}

          {report.action && (
            <View style={styles.actionBox}>
              <View style={styles.actionBoxHeader}>
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={getSeverityColor()}
                />
                <Text
                  style={[styles.actionBoxTitle, { color: getSeverityColor() }]}
                >
                  Mensagem da Moderação
                </Text>
              </View>
              <Text style={styles.actionBoxText}>{report.action.details}</Text>

              {isReportedUser &&
                (report.action.type === "aviso" ||
                  report.action.type === "bloqueio_temporario") && (
                  <View style={styles.healthWarningBox}>
                    <Ionicons
                      name="pulse"
                      size={16}
                      color={theme.colors.orange_500}
                    />
                    <Text style={styles.healthWarningText}>
                      Lembre-se: Penalidades como esta reduzem a Saúde da sua
                      Conta. Mantenha as boas práticas para recuperar sua
                      pontuação.
                    </Text>
                  </View>
                )}
            </View>
          )}

          {!report.action && (
            <View
              style={[
                styles.actionBox,
                { backgroundColor: "#F1F5F9", borderColor: "#CBD5E1" },
              ]}
            >
              <Text style={styles.actionBoxText}>
                O incidente foi arquivado e não gerou penalidades na plataforma.
                Agradecemos por manter a comunidade segura.
              </Text>
            </View>
          )}
        </SurfaceCard>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            { backgroundColor: getSeverityColor() },
          ]}
          onPress={() => router.back()}
        >
          <Text style={styles.primaryButtonText}>Estou Ciente</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/privacy-lgpd")}
        >
          <Text style={styles.secondaryButtonText}>
            Ler Diretrizes da Comunidade
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: { marginTop: 16, color: "#64748B", fontWeight: "600" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: { color: "white", fontWeight: "bold" },

  headerBanner: { alignItems: "center", marginBottom: 24, marginTop: 10 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 4,
  },
  bannerDate: { fontSize: 13, color: "#64748B" },

  infoCard: { padding: 20, borderRadius: 16, marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    marginBottom: 20,
  },
  boldText: { fontWeight: "bold", color: "#1E293B" },

  actionBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: 16,
    borderRadius: 12,
  },
  actionBoxHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  actionBoxTitle: { fontSize: 15, fontWeight: "bold" },
  actionBoxText: { fontSize: 14, color: "#334155", lineHeight: 22 },

  healthWarningBox: {
    flexDirection: "row",
    backgroundColor: "#FFFBEB",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
    alignItems: "flex-start",
  },
  healthWarningText: {
    flex: 1,
    fontSize: 12,
    color: "#92400E",
    lineHeight: 18,
  },

  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  secondaryButton: { paddingVertical: 16, alignItems: "center" },
  secondaryButtonText: { color: "#64748B", fontSize: 14, fontWeight: "600" },
});
