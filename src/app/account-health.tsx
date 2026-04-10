import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AppHeader } from "@/components/AppHeader";
import { appTheme as theme } from "@/theme/appTheme";
import { useAuth } from "@/contexts/AuthContext";
import { getProfileSummary } from "@/services/communityStore";
import { getOrdersByUser } from "@/services/ordersStore";

export default function AccountHealthScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    certificatesApproved: 0,
    certificatesPending: 0,
    rating: 5.0,
  });

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const profile = getProfileSummary(user.username);
        const orders = await getOrdersByUser(user.username);
        
        const finishedCount = orders.filter(o => o.status === "finalizado").length;
        const approvedCount = profile.certificates ? profile.certificates.filter(c => c.status === "approved").length : 0;
        const pendingCount = profile.certificates ? profile.certificates.filter(c => c.status === "pending").length : 0;

        setMetrics({
          totalSales: finishedCount,
          certificatesApproved: approvedCount,
          certificatesPending: pendingCount,
          rating: 4.9,
        });
      } catch (error) {
        console.error("Erro ao carregar metricas de saude:", error);
      }
    };
    loadData();
  }, [user]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
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
              <View style={[styles.healthBadge, styles.healthBadgeGreen]}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.white} />
                <Text style={styles.healthBadgeText}>Saudável!</Text>
              </View>
            </View>
            <View style={styles.healthBar}>
              <View style={[styles.healthBarFill, { width: "95%", backgroundColor: "#10B981" }]} />
            </View>
            <Text style={styles.healthPercentage}>95% - Você é um usuário 100% confiável!</Text>
          </View>

          <View style={styles.healthSection}>
            <Text style={styles.healthSectionTitle}>Sua Atividade Real</Text>
            
            <View style={styles.healthDetailItem}>
              <View style={styles.healthDetailIconGreen}>
                <Ionicons name="cart" size={20} color={theme.colors.white} />
              </View>
              <View style={styles.healthDetailContent}>
                <Text style={styles.healthDetailLabel}>Vendas Finalizadas</Text>
                <Text style={styles.healthDetailValue}>{metrics.totalSales} encomendas entregues</Text>
              </View>
            </View>

            <View style={styles.healthDetailItem}>
              <View style={styles.healthDetailIconGreen}>
                <Ionicons name="shield-checkmark" size={20} color={theme.colors.white} />
              </View>
              <View style={styles.healthDetailContent}>
                <Text style={styles.healthDetailLabel}>Certificações Ativas</Text>
                <Text style={styles.healthDetailValue}>{metrics.certificatesApproved} aprovados / {metrics.certificatesPending} em análise</Text>
              </View>
            </View>

            <View style={styles.healthDetailItem}>
              <View style={styles.healthDetailIconGreen}>
                <Ionicons name="star" size={20} color={theme.colors.white} />
              </View>
              <View style={styles.healthDetailContent}>
                <Text style={styles.healthDetailLabel}>Avaliação Média</Text>
                <Text style={styles.healthDetailValue}>{metrics.rating} de 5 estrelas</Text>
              </View>
            </View>
          </View>

          <View style={styles.healthSection}>
            <Text style={styles.healthSectionTitle}>Dicas para Manter a Saúde</Text>
            
            <View style={styles.healthTipItem}>
              <View style={styles.healthTipNumber}>
                <Text style={styles.healthTipNumberText}>1</Text>
              </View>
              <View style={styles.healthTipContent}>
                <Text style={styles.healthTipTitle}>Responda rapidamente às mensagens</Text>
                <Text style={styles.healthTipDescription}>Mantenha uma comunicação ativa com seus clientes</Text>
              </View>
            </View>

            <View style={styles.healthTipItem}>
              <View style={styles.healthTipNumber}>
                <Text style={styles.healthTipNumberText}>2</Text>
              </View>
              <View style={styles.healthTipContent}>
                <Text style={styles.healthTipTitle}>Cumpra os prazos de entrega</Text>
                <Text style={styles.healthTipDescription}>Prepare e envie seus produtos dentro do prazo acordado</Text>
              </View>
            </View>

            <View style={styles.healthTipItem}>
              <View style={styles.healthTipNumber}>
                <Text style={styles.healthTipNumberText}>3</Text>
              </View>
              <View style={styles.healthTipContent}>
                <Text style={styles.healthTipTitle}>Mantenha descrições precisas</Text>
                <Text style={styles.healthTipDescription}>Atualize seu perfil com informações corretas e fotos claras</Text>
              </View>
            </View>

            <View style={styles.healthTipItem}>
              <View style={styles.healthTipNumber}>
                <Text style={styles.healthTipNumberText}>4</Text>
              </View>
              <View style={styles.healthTipContent}>
                <Text style={styles.healthTipTitle}>Resolva conflitos amigavelmente</Text>
                <Text style={styles.healthTipDescription}>Negocie soluções com seus clientes de forma respeitosa</Text>
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
