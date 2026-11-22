import React from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { appTheme as theme } from "@/theme/appTheme";

export function PasswordRequirementsModal({ isVisible, onClose, password }) {
  const requirements = [
    {
      id: "length",
      label: "8 a 64 caracteres",
      met: password.length >= 8 && password.length <= 64,
    },
    {
      id: "uppercase",
      label: "Letra maiúscula (A-Z)",
      met: /[A-Z]/.test(password),
    },
    {
      id: "lowercase",
      label: "Letra minúscula (a-z)",
      met: /[a-z]/.test(password),
    },
    {
      id: "number",
      label: "Número (0-9)",
      met: /\d/.test(password),
    },
    {
      id: "special",
      label: "Caractere especial (!\"#$%&'()*+,-./:;<=>?@[]^_`{}|~)",
      met: /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/.test(password),
    },
    {
      id: "noSpaces",
      label: "Sem espaços em branco",
      met: !/\s/.test(password),
    },
  ];

  const allMet = requirements.every((req) => req.met);

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Requisitos da Senha</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.gray_800} />
            </TouchableOpacity>
          </View>

          {/* Conteudo */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {requirements.map((requirement) => (
              <View key={requirement.id} style={styles.requirementItem}>
                <View
                  style={[
                    styles.checkIcon,
                    {
                      backgroundColor: requirement.met
                        ? theme.colors.green_500
                        : theme.colors.gray_300,
                    },
                  ]}
                >
                  {requirement.met ? (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={theme.colors.white}
                    />
                  ) : (
                    <Ionicons
                      name="close"
                      size={16}
                      color={theme.colors.white}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.requirementLabel,
                    {
                      color: requirement.met
                        ? theme.colors.gray_800
                        : theme.colors.gray_500,
                    },
                  ]}
                >
                  {requirement.label}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            {allMet && password.length > 0 ? (
              <View style={styles.successMessage}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={theme.colors.green_500}
                />
                <Text style={styles.successText}>Senha válida!</Text>
              </View>
            ) : password.length === 0 ? (
              <Text style={styles.hintText}>
                Digite sua senha para ver os requisitos
              </Text>
            ) : (
              <Text style={styles.hintText}>Complete todos os requisitos</Text>
            )}
            <TouchableOpacity onPress={onClose} style={styles.okButton}>
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = {
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    width: "100%",
    maxHeight: "80%",
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.gray_900,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxHeight: 350,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  checkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  requirementLabel: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray_200,
    gap: 12,
  },
  successMessage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.green_500,
  },
  successText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.green_500,
  },
  hintText: {
    fontSize: 13,
    color: theme.colors.gray_600,
    textAlign: "center",
  },
  okButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  okButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
};

export function PasswordRequirementsInline({ password, visible }) {
  if (!visible || !password) return null;

  const requirements = [
    {
      id: "length",
      label: "8 a 64 caracteres",
      met: password.length >= 8 && password.length <= 64,
    },
    {
      id: "uppercase",
      label: "Letra maiúscula (A-Z)",
      met: /[A-Z]/.test(password),
    },
    {
      id: "lowercase",
      label: "Letra minúscula (a-z)",
      met: /[a-z]/.test(password),
    },
    {
      id: "number",
      label: "Número (0-9)",
      met: /\d/.test(password),
    },
    {
      id: "special",
      label: "Especial (!@#...)",
      met: /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/.test(password),
    },
    {
      id: "noSpaces",
      label: "Sem espaços em branco",
      met: !/\s/.test(password),
    },
  ];

  const metCount = requirements.filter((r) => r.met).length;
  const totalCount = requirements.length;
  const progressPercent = (metCount / totalCount) * 100;

  // Cor do progresso baseada no nível de segurança
  let progressColor = theme.colors.red_500;
  let statusText = "Fraca";
  if (metCount >= 5) {
    progressColor = theme.colors.green_500;
    statusText = "Forte";
  } else if (metCount >= 3) {
    progressColor = theme.colors.orange_500;
    statusText = "Média";
  }

  return (
    <View style={inlineStyles.container}>
      <View style={inlineStyles.headerRow}>
        <Text style={inlineStyles.title}>Requisitos da Senha</Text>
        <Text style={[inlineStyles.strengthText, { color: progressColor }]}>
          {statusText} ({metCount}/{totalCount})
        </Text>
      </View>

      {/* Barra de Força da Senha */}
      <View style={inlineStyles.progressBarBg}>
        <View
          style={[
            inlineStyles.progressBarFg,
            { width: `${progressPercent}%`, backgroundColor: progressColor },
          ]}
        />
      </View>

      <View style={inlineStyles.grid}>
        {requirements.map((req) => (
          <View key={req.id} style={inlineStyles.gridItem}>
            <Ionicons
              name={req.met ? "checkmark-circle" : "close-circle-outline"}
              size={14}
              color={req.met ? theme.colors.green_500 : theme.colors.gray_400}
            />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                inlineStyles.requirementLabel,
                {
                  color: req.met
                    ? theme.colors.gray_800
                    : theme.colors.gray_500,
                },
              ]}
            >
              {req.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const inlineStyles = {
  container: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    marginTop: 4,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.gray_700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "700",
  },
  progressBarBg: {
    height: 4,
    backgroundColor: theme.colors.gray_200,
    borderRadius: 2,
    marginBottom: 10,
    overflow: "hidden",
  },
  progressBarFg: {
    height: "100%",
    borderRadius: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 6,
  },
  gridItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  requirementLabel: {
    fontSize: 11,
    fontWeight: "500",
    flex: 1,
  },
};
