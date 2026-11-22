import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { getProfileSummary } from "@/services/communityStore";
import { getOrdersByUser } from "@/services/ordersStore";
import { getUserWarnings, getUserBlock } from "@/services/reportsStore";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountHealthScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    certificatesApproved: 0,
    certificatesPending: 0,
    rating: 5.0,
  });
  const [healthScore, setHealthScore] = useState(100);
  const [warnings, setWarnings] = useState([]);
  const [block, setBlock] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const profile = getProfileSummary(user.username);
        const orders = await getOrdersByUser(user.username);

        const finishedCount = orders.filter(
          (o) => o.status === "finalizado"
        ).length;
        const approvedCount = profile.certificates
          ? profile.certificates.filter((c) => c.status === "approved").length
          : 0;
        const pendingCount = profile.certificates
          ? profile.certificates.filter((c) => c.status === "pending").length
          : 0;

        setMetrics({
          totalSales: finishedCount,
          certificatesApproved: approvedCount,
          certificatesPending: pendingCount,
          rating: 4.9,
        });

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
      } catch (error) {
        console.error("Erro ao carregar metricas de saude:", error);
      }
    };
    loadData();
  }, [user]);

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
        badgeStyle: { backgroundColor: "#F59E0B" },
      };
    return {
      label: "Crítico: Conta Restrita",
      color: theme.colors.red_500,
      badgeStyle: { backgroundColor: theme.colors.red_500 },
    };
  };

  const status = getHealthStatus();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />
      <AppHeader
        title="Saúde da Conta"
        onBackPress={() => router.back()}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.primary}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.healthStatusContainer}>
            <View style={styles.healthStatusHeader}>
              <Text style={styles.healthStatusLabel}>Status da Sua Conta</Text>
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

          {/* Sessão de infrações */}
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
                  <View
                    style={[
                      styles.healthDetailIconGreen,
                      { backgroundColor: theme.colors.red_500 },
                    ]}
                  >
                    <Ionicons name="ban" size={20} color={theme.colors.white} />
                  </View>
                  <View style={styles.healthDetailContent}>
                    <Text style={styles.healthDetailLabel}>Bloqueio Ativo</Text>
                    <Text style={styles.healthDetailValue}>{block.reason}</Text>
                  </View>
                </View>
              )}

              {warnings.map((w, _idx) => (
                <View key={w.id} style={styles.healthDetailItem}>
                  <View
                    style={[
                      styles.healthDetailIconGreen,
                      { backgroundColor: "#F59E0B" },
                    ]}
                  >
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

          <View style={styles.healthSection}>
            <Text style={styles.healthSectionTitle}>Sua Atividade Real</Text>

            <View style={styles.healthDetailItem}>
              <View style={styles.healthDetailIconGreen}>
                <Ionicons name="cart" size={20} color={theme.colors.white} />
              </View>
              <View style={styles.healthDetailContent}>
                <Text style={styles.healthDetailLabel}>Vendas Finalizadas</Text>
                <Text style={styles.healthDetailValue}>
                  {metrics.totalSales} encomendas entregues
                </Text>
              </View>
            </View>

            <View style={styles.healthDetailItem}>
              <View style={styles.healthDetailIconGreen}>
                <Ionicons
                  name="shield-checkmark"
                  size={20}
                  color={theme.colors.white}
                />
              </View>
              <View style={styles.healthDetailContent}>
                <Text style={styles.healthDetailLabel}>
                  Certificações Ativas
                </Text>
                <Text style={styles.healthDetailValue}>
                  {metrics.certificatesApproved} aprovados /{" "}
                  {metrics.certificatesPending} em análise
                </Text>
              </View>
            </View>

            <View style={styles.healthDetailItem}>
              <View style={styles.healthDetailIconGreen}>
                <Ionicons name="star" size={20} color={theme.colors.white} />
              </View>
              <View style={styles.healthDetailContent}>
                <Text style={styles.healthDetailLabel}>Avaliação Média</Text>
                <Text style={styles.healthDetailValue}>
                  {metrics.rating} de 5 estrelas
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.healthSection}>
            <Text style={styles.healthSectionTitle}>
              Como a Pontuação Funciona?
            </Text>

            <View style={{ marginBottom: 12 }}>
              <Text style={styles.healthExplanationText}>
                Sua conta começa com{" "}
                <Text style={{ fontWeight: "bold", color: "#10B981" }}>
                  100% de saúde
                </Text>
                . Essa nota diminui quando ocorrem violações nas regras da
                comunidade:
              </Text>
            </View>

            <View style={styles.healthDetailItem}>
              <View
                style={[
                  styles.healthDetailIconGreen,
                  { backgroundColor: "#F59E0B" },
                ]}
              >
                <Ionicons
                  name="warning-outline"
                  size={20}
                  color={theme.colors.white}
                />
              </View>
              <View style={styles.healthDetailContent}>
                <Text style={styles.healthDetailLabel}>
                  Advertências (Avisos)
                </Text>
                <Text style={styles.healthDetailValue}>
                  -15 pontos por cada aviso
                </Text>
              </View>
            </View>

            <View style={styles.healthDetailItem}>
              <View
                style={[
                  styles.healthDetailIconGreen,
                  { backgroundColor: theme.colors.red_500 },
                ]}
              >
                <Ionicons
                  name="ban-outline"
                  size={20}
                  color={theme.colors.white}
                />
              </View>
              <View style={styles.healthDetailContent}>
                <Text style={styles.healthDetailLabel}>Bloqueio de Conta</Text>
                <Text style={styles.healthDetailValue}>
                  -50 pontos por bloqueio ativo
                </Text>
              </View>
            </View>

            <View
              style={{
                marginTop: 8,
                padding: 12,
                backgroundColor: theme.colors.gray_100,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: theme.colors.gray_600,
                  lineHeight: 18,
                }}
              >
                Contas com saúde abaixo de{" "}
                <Text style={{ fontWeight: "bold" }}>50%</Text> entram em estado
                crítico e podem sofrer restrições operacionais na plataforma.
              </Text>
            </View>
          </View>

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

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 16,
  },
  healthStatusContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  healthSectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 12,
  },
  healthExplanationText: {
    fontSize: 13,
    color: theme.colors.gray_600,
    lineHeight: 18,
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
