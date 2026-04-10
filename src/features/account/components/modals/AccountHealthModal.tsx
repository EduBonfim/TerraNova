import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { appTheme as theme } from '@/theme/appTheme';

interface AccountHealthModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AccountHealthModal({ visible, onClose }: AccountHealthModalProps) {
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
            {/* Health Status Bar */}
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

            {/* Account Details */}
            <View style={styles.healthSection}>
              <Text style={styles.healthSectionTitle}>Comportamento do Usuário</Text>
              
              <View style={styles.healthDetailItem}>
                <View style={styles.healthDetailIconGreen}>
                  <Ionicons name="checkmark" size={20} color={theme.colors.white} />
                </View>
                <View style={styles.healthDetailContent}>
                  <Text style={styles.healthDetailLabel}>Avaliação Média</Text>
                  <Text style={styles.healthDetailValue}>4.9 de 5 estrelas</Text>
                </View>
              </View>

              <View style={styles.healthDetailItem}>
                <View style={styles.healthDetailIconGreen}>
                  <Ionicons name="checkmark" size={20} color={theme.colors.white} />
                </View>
                <View style={styles.healthDetailContent}>
                  <Text style={styles.healthDetailLabel}>Taxa de Resposta</Text>
                  <Text style={styles.healthDetailValue}>98% de respostas em 24 horas</Text>
                </View>
              </View>

              <View style={styles.healthDetailItem}>
                <View style={styles.healthDetailIconGreen}>
                  <Ionicons name="checkmark" size={20} color={theme.colors.white} />
                </View>
                <View style={styles.healthDetailContent}>
                  <Text style={styles.healthDetailLabel}>Entregas no Prazo</Text>
                  <Text style={styles.healthDetailValue}>100% das entregas pontuais</Text>
                </View>
              </View>

              <View style={styles.healthDetailItem}>
                <View style={styles.healthDetailIconGreen}>
                  <Ionicons name="checkmark" size={20} color={theme.colors.white} />
                </View>
                <View style={styles.healthDetailContent}>
                  <Text style={styles.healthDetailLabel}>Cancelamentos</Text>
                  <Text style={styles.healthDetailValue}>0,2% taxa de cancelamento</Text>
                </View>
              </View>
            </View>

            {/* Tips Section */}
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
