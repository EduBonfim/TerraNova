import { type ActionType, applyActionToReport } from "@/services/reportsStore";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    adminReportsStyles as styles,
    theme,
} from "../styles/adminReports.styles";

interface ActionModalProps {
  visible: boolean;
  reportId: string;
  reportedUserName: string;
  onClose: () => void;
  onActionApplied: () => void;
}

export function ActionModal({
  visible,
  reportId,
  reportedUserName,
  onClose,
  onActionApplied,
}: ActionModalProps) {
  const [selectedAction, setSelectedAction] = useState<ActionType>("aviso");
  const [actionDetails, setActionDetails] = useState("");
  const [blockDays, setBlockDays] = useState("7");
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyAction = async () => {
    if (!actionDetails.trim()) {
      alert("Por favor, descreva a ação a ser tomada");
      return;
    }

    setIsApplying(true);
    try {
      const days =
        selectedAction === "bloqueio_temporario"
          ? parseInt(blockDays)
          : undefined;

      await applyActionToReport(
        reportId,
        {
          type: selectedAction,
          details: actionDetails.trim(),
          blockDays: days,
        },
        "Admin",
      );

      setActionDetails("");
      setBlockDays("7");
      setSelectedAction("aviso");
      onActionApplied();
    } catch (error) {
      alert("Erro ao aplicar ação");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Tomar Ação contra {reportedUserName}
            </Text>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.modalLabel}>Tipo de Ação</Text>
            {(
              [
                "aviso",
                "bloqueio",
                "bloqueio_temporario",
                "nenhum",
              ] as ActionType[]
            ).map((action) => (
              <TouchableOpacity
                key={action}
                style={[
                  styles.actionOption,
                  selectedAction === action && styles.actionOptionSelected,
                ]}
                onPress={() => setSelectedAction(action)}
                disabled={isApplying}
              >
                <Ionicons
                  name={
                    action === "aviso"
                      ? "alert-circle-outline"
                      : action === "bloqueio"
                      ? "ban-outline"
                      : action === "bloqueio_temporario"
                      ? "time-outline"
                      : "checkmark-circle-outline"
                  }
                  size={20}
                  color={
                    selectedAction === action
                      ? theme.colors.primary
                      : theme.colors.gray_500
                  }
                />
                <Text
                  style={[
                    styles.actionOptionText,
                    selectedAction === action &&
                      styles.actionOptionTextSelected,
                  ]}
                >
                  {action === "aviso"
                    ? "Aviso"
                    : action === "bloqueio"
                    ? "Bloqueio Permanente"
                    : action === "bloqueio_temporario"
                    ? "Bloqueio Temporário"
                    : "Nenhuma Ação"}
                </Text>
              </TouchableOpacity>
            ))}

            {selectedAction === "bloqueio_temporario" && (
              <View>
                <Text style={styles.modalLabel}>
                  Duração do Bloqueio (dias)
                </Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ex: 7, 30, 90"
                  value={blockDays}
                  onChangeText={setBlockDays}
                  keyboardType="number-pad"
                  editable={!isApplying}
                />
              </View>
            )}

            <Text style={styles.modalLabel}>Detalhes da Ação</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextarea]}
              placeholder="Descreva a ação a ser tomada e o motivo..."
              value={actionDetails}
              onChangeText={setActionDetails}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!isApplying}
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={onClose}
              disabled={isApplying}
            >
              <Text style={styles.modalCancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalConfirmButton,
                isApplying && { opacity: 0.7 },
              ]}
              onPress={handleApplyAction}
              disabled={isApplying}
            >
              {isApplying ? (
                <ActivityIndicator color={theme.colors.white} size="small" />
              ) : (
                <Text style={styles.modalConfirmButtonText}>Aplicar Ação</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
