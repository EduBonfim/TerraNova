import { type AppReport, updateReportStatus } from "@/services/reportsStore";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    adminReportsStyles as styles,
    theme,
} from "../styles/adminReports.styles";
import { ActionModal } from "./ActionModal";

interface ReportDetailScreenProps {
  report: AppReport;
  onBack: () => void;
  onReportUpdated: () => void;
}

export function ReportDetailScreen({
  report,
  onBack,
  onReportUpdated,
}: ReportDetailScreenProps) {
  const [actionModalVisible, setActionModalVisible] = useState(false);

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      comportamento: "Comportamento",
      fraude: "Fraude",
      conteudo_inapropriado: "Conteúdo Inapropriado",
      outro: "Outro",
    };
    return labels[category] || category;
  };

  const handleDismissReport = async () => {
    Alert.alert(
      "Descartar Denúncia",
      "Tem certeza que deseja descartar esta denúncia?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Descartar",
          style: "destructive",
          onPress: async () => {
            try {
              await updateReportStatus(report.id, "descartado");
              onReportUpdated();
            } catch (error) {
              Alert.alert("Erro", "Não foi possível descartar a denúncia");
            }
          },
        },
      ],
    );
  };

  const handleOpenActionModal = async () => {
    if (report.status === "pendente") {
      await updateReportStatus(report.id, "em_analise");
    }
    setActionModalVisible(true);
  };

  return (
    <>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={theme.colors.gray_800}
          />
        </TouchableOpacity>
        <Text style={styles.detailTitle}>Detalhes da Denúncia</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.detailContent}>
        {/* Denunciado */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Denunciado</Text>
          <View style={styles.infoBox}>
            <Ionicons
              name="person-circle"
              size={32}
              color={theme.colors.primary}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{report.reportedUser}</Text>
            </View>
          </View>
        </View>

        {/* Denunciante */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Denunciante</Text>
          <View style={styles.infoBox}>
            <Ionicons
              name="person-outline"
              size={32}
              color={theme.colors.gray_500}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{report.reporter}</Text>
              <Text style={styles.infoSubtitle}>
                {new Date(report.data).toLocaleString("pt-BR")}
              </Text>
            </View>
          </View>
        </View>

        {/* Categoria e Motivo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Motivo da Denúncia</Text>
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {getCategoryLabel(report.category)}
              </Text>
            </View>
            <Text style={styles.reasonText}>{report.reason}</Text>
          </View>
        </View>

        {/* Descrição Detalhada */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>{report.description}</Text>
          </View>
        </View>

        {/* Imagem de Evidência */}
        {report.evidenceImageUri && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Evidência</Text>
            <Image
              source={{ uri: report.evidenceImageUri }}
              style={styles.evidenceImage}
            />
          </View>
        )}

        {/* Ação Tomada */}
        {report.status === "resolvido" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ação Tomada</Text>
            <View style={[styles.actionBox, !report.action && { borderLeftColor: theme.colors.gray_200, backgroundColor: "#F1F5F9" }]}>
              <Text style={[styles.actionType, !report.action && { color: theme.colors.gray_200 }]}>
                {report.action 
                  ? (report.action.type === "aviso" ? "⚠️ Aviso" : report.action.type === "bloqueio" ? "🚫 Bloqueio Permanente" : "⏱️ Bloqueio Temporário")
                  : "📁 Caso Arquivado"}
              </Text>
              <Text style={styles.actionDetails}>
                {report.action?.details || "O moderador analisou o incidente e decidiu arquivar o caso sem aplicar penalidades diretas ao usuário."}
              </Text>
              {report.analyzedAt && (
                <Text style={styles.infoSubtitle}>
                  Resolvido em: {new Date(report.analyzedAt).toLocaleString("pt-BR")}
                </Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {report.status !== "resolvido" && report.status !== "descartado" && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.footerButton, styles.dismissButton]}
            onPress={handleDismissReport}
          >
            <Ionicons
              name="close-circle-outline"
              size={18}
              color={theme.colors.gray_500}
            />
            <Text style={styles.dismissButtonText}>Descartar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.footerButton, styles.footerActionButton]}
            onPress={handleOpenActionModal}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color={theme.colors.white}
            />
            <Text style={styles.actionButtonText}>Tomar Ação</Text>
          </TouchableOpacity>
        </View>
      )}

      <ActionModal
        visible={actionModalVisible}
        reportId={report.id}
        reportedUserName={report.reportedUser}
        onClose={() => setActionModalVisible(false)}
        onActionApplied={() => {
          setActionModalVisible(false);
          onReportUpdated();
        }}
      />
    </>
  );
}
