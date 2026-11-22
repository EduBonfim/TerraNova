import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { getUserWarnings, getUserBlock } from "@/services/reportsStore";

export function AccountHealthModal({ visible, onClose }) {
  const { user } = useAuth();
  const [healthScore, setHealthScore] = useState(100);
  const [warnings, setWarnings] = useState([]);
  const [block, setBlock] = useState(null);

  useEffect(() => {
    const loadHealthData = async () => {
      if (user?.username && visible) {
        const userWarnings = await getUserWarnings(user.username);
        const userBlock = await getUserBlock(user.username);

        setWarnings(userWarnings);
        setBlock(userBlock);

        let score = 100;
        score -= userWarnings.length * 15;
        if (userBlock) {
          score -= 50;
        }

        setHealthScore(Math.max(0, score));
      }
    };
    loadHealthData();
  }, [user, visible]);

  const getHealthStatus = () => {
    if (healthScore >= 80)
      return {
        label: "Saudável!",
        color: "#10B981",
        badgeStyle: styles.healthBadgeGreen,
      };
    if (healthScore >= 50)
      return {
        label: "Atenção: Risco",
        color: "#F59E0B",
        badgeStyle: styles.healthBadgeOrange,
      };
    return {
      label: "Crítico: Conta Restrita",
      color: theme.colors.red_500,
      badgeStyle: styles.healthBadgeRed,
    };
  };

  const status = getHealthStatus();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.healthModalBackdrop}>
        <View style={styles.healthModalCard}>
          <View style={styles.healthModalHeader}>
            <Text style={styles.healthModalTitle}>Saúde da Conta</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.gray_800} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/*  Status Bar Saude da conta*/}
            <View style={styles.healthStatusContainer}>
              <View style={styles.healthStatusHeader}>
                <Text style={styles.healthStatusLabel}>
                  Status da Sua Conta
                </Text>
                <View style={[styles.healthBadge, status.badgeStyle]}>
                  <Ionicons
                    name={healthScore >= 80 ? "checkmark-circle" : "warning"}
                    size={16}
                    color={theme.colors.white}
                  />
                  <Text style={styles.healthBadgeText}>{status.label}</Text>
                </View>
              </View>
              <View style={styles.healthBar}>
                <View
                  style={[
                    styles.healthBarFill,
                    { width: `${healthScore}%`, backgroundColor: status.color },
                  ]}
                />
              </View>
              <Text style={styles.healthPercentage}>
                {healthScore}% -{" "}
                {healthScore >= 80
                  ? "Você é um usuário confiável!"
                  : "Mantenha as boas práticas da comunidade."}
              </Text>
            </View>

            {/* Infracoes */}
            {(warnings.length > 0 || block) && (
              <View
                style={[
                  styles.healthSection,
                  { borderColor: theme.colors.red_500, borderWidth: 1 },
                ]}
              >
                <Text style={styles.healthSectionTitle}>
                  Histórico de Infrações
                </Text>

                {block && (
                  <View style={styles.healthDetailItem}>
                    <View style={styles.healthDetailIconRed}>
                      <Ionicons
                        name="ban"
                        size={20}
                        color={theme.colors.white}
                      />
                    </View>
                    <View style={styles.healthDetailContent}>
                      <Text style={styles.healthDetailLabel}>
                        Bloqueio Ativo
                      </Text>
                      <Text style={styles.healthDetailValue}>
                        {block.reason}
                      </Text>
                    </View>
                  </View>
                )}

                {warnings.map((w, _idx) => (
                  <View key={w.id} style={styles.healthDetailItem}>
                    <View style={styles.healthDetailIconOrange}>
                      <Ionicons
                        name="warning"
                        size={20}
                        color={theme.colors.white}
                      />
                    </View>
                    <View style={styles.healthDetailContent}>
                      <Text style={styles.healthDetailLabel}>
                        Aviso Recebido (
                        {new Date(w.issuedAt).toLocaleDateString()})
                      </Text>
                      <Text style={styles.healthDetailValue}>{w.reason}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Detalhes da Conta */}
            <View style={styles.healthSection}>
              <Text style={styles.healthSectionTitle}>
                Comportamento do Usuário
              </Text>

              <View style={styles.healthDetailItem}>
                <View style={styles.healthDetailIconGreen}>
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={theme.colors.white}
                  />
                </View>
                <View style={styles.healthDetailContent}>
                  <Text style={styles.healthDetailLabel}>Avaliação Média</Text>
                  <Text style={styles.healthDetailValue}>
                    4.9 de 5 estrelas
                  </Text>
                </View>
              </View>

              <View style={styles.healthDetailItem}>
                <View style={styles.healthDetailIconGreen}>
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={theme.colors.white}
                  />
                </View>
                <View style={styles.healthDetailContent}>
                  <Text style={styles.healthDetailLabel}>Taxa de Resposta</Text>
                  <Text style={styles.healthDetailValue}>
                    98% de respostas em 24 horas
                  </Text>
                </View>
              </View>

              <View style={styles.healthDetailItem}>
                <View style={styles.healthDetailIconGreen}>
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={theme.colors.white}
                  />
                </View>
                <View style={styles.healthDetailContent}>
                  <Text style={styles.healthDetailLabel}>
                    Entregas no Prazo
                  </Text>
                  <Text style={styles.healthDetailValue}>
                    100% das entregas pontuais
                  </Text>
                </View>
              </View>

              <View style={styles.healthDetailItem}>
                <View style={styles.healthDetailIconGreen}>
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={theme.colors.white}
                  />
                </View>
                <View style={styles.healthDetailContent}>
                  <Text style={styles.healthDetailLabel}>Cancelamentos</Text>
                  <Text style={styles.healthDetailValue}>
                    0,2% taxa de cancelamento
                  </Text>
                </View>
              </View>
            </View>

            {/* Dicas para Manter a Saúde */}
            <View style={styles.healthSection}>
              <Text style={styles.healthSectionTitle}>
                Dicas para Manter a Saúde
              </Text>

              <View style={styles.healthTipItem}>
                <View style={styles.healthTipNumber}>
                  <Text style={styles.healthTipNumberText}>1</Text>
                </View>
                <View style={styles.healthTipContent}>
                  <Text style={styles.healthTipTitle}>
                    Responda rapidamente às mensagens
                  </Text>
                  <Text style={styles.healthTipDescription}>
                    Mantenha uma comunicação ativa com seus clientes
                  </Text>
                </View>
              </View>

              <View style={styles.healthTipItem}>
                <View style={styles.healthTipNumber}>
                  <Text style={styles.healthTipNumberText}>2</Text>
                </View>
                <View style={styles.healthTipContent}>
                  <Text style={styles.healthTipTitle}>
                    Cumpra os prazos de entrega
                  </Text>
                  <Text style={styles.healthTipDescription}>
                    Prepare e envie seus produtos dentro do prazo acordado
                  </Text>
                </View>
              </View>

              <View style={styles.healthTipItem}>
                <View style={styles.healthTipNumber}>
                  <Text style={styles.healthTipNumberText}>3</Text>
                </View>
                <View style={styles.healthTipContent}>
                  <Text style={styles.healthTipTitle}>
                    Mantenha descrições precisas
                  </Text>
                  <Text style={styles.healthTipDescription}>
                    Atualize seu perfil com informações corretas e fotos claras
                  </Text>
                </View>
              </View>

              <View style={styles.healthTipItem}>
                <View style={styles.healthTipNumber}>
                  <Text style={styles.healthTipNumberText}>4</Text>
                </View>
                <View style={styles.healthTipContent}>
                  <Text style={styles.healthTipTitle}>
                    Resolva conflitos amigavelmente
                  </Text>
                  <Text style={styles.healthTipDescription}>
                    Negocie soluções com seus clientes de forma respeitosa
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  healthModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.45)",
    justifyContent: "flex-end",
  },
  healthModalCard: {
    maxHeight: "92%",
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
  },
  healthModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  healthModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  healthStatusContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  healthStatusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  healthStatusLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  healthBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  healthBadgeGreen: {
    backgroundColor: "#10B981",
  },
  healthBadgeOrange: {
    backgroundColor: "#F59E0B",
  },
  healthBadgeRed: {
    backgroundColor: theme.colors.red_500,
  },
  healthBadgeText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  healthBar: {
    height: 12,
    backgroundColor: theme.colors.gray_200,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  healthBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  healthPercentage: {
    fontSize: 12,
    color: theme.colors.gray_500,
    fontWeight: "500",
  },
  healthSection: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  healthSectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 12,
  },
  healthDetailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  healthDetailIconGreen: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  healthDetailIconOrange: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F59E0B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  healthDetailIconRed: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.red_500,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  healthDetailContent: {
    flex: 1,
  },
  healthDetailLabel: {
    fontSize: 12,
    color: theme.colors.gray_500,
  },
  healthDetailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.gray_800,
    marginTop: 2,
  },
  healthTipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  healthTipNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  healthTipNumberText: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.white,
  },
  healthTipContent: {
    flex: 1,
  },
  healthTipTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.gray_800,
  },
  healthTipDescription: {
    fontSize: 12,
    color: theme.colors.gray_500,
    marginTop: 2,
  },
});
