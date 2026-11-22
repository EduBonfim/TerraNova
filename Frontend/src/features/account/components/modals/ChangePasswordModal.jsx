import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { appTheme as theme } from "@/theme/appTheme";
import {
  PasswordRequirementsModal,
  PasswordRequirementsInline,
} from "@/features/register/components/PasswordRequirementsModal";

const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])[A-Za-z\d!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{8,64}$/;

const isStrongPassword = (value) => STRONG_PASSWORD_REGEX.test(value);

const sanitizePasswordInput = (value) =>
  value.replace(/[^A-Za-z0-9!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, "");

export function ChangePasswordModal({
  isVisible,
  onClose,
  onChangePassword,
  isLoading = false,
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordRequirementsOpen, setIsPasswordRequirementsOpen] =
    useState(false);
  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    const newErrors = {};

    if (!currentPassword.trim()) {
      newErrors.currentPassword = "Senha atual é obrigatória";
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = "Nova senha é obrigatória";
    } else if (!isStrongPassword(newPassword)) {
      newErrors.newPassword =
        "Senha deve ter 8-64 caracteres, maiúscula, minúscula, número e caractere especial";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirmação de senha é obrigatória";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }

    if (currentPassword === newPassword) {
      newErrors.newPassword = "A nova senha deve ser diferente da atual";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    const result = await onChangePassword(currentPassword, newPassword);

    if (result.success) {
      Alert.alert("Sucesso", "Senha alterada com sucesso!");
      handleClose();
    } else {
      Alert.alert(
        "Erro",
        result.message ||
          "Não foi possível alterar a senha. Verifique sua senha atual."
      );
    }
  };

  return (
    <>
      <Modal
        transparent
        visible={isVisible}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View style={styles.backdrop}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Alterar Senha</Text>
              <TouchableOpacity onPress={handleClose} disabled={isLoading}>
                <Ionicons
                  name="close"
                  size={24}
                  color={
                    isLoading ? theme.colors.gray_400 : theme.colors.gray_800
                  }
                />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
              {/* Senha Atual */}
              <View style={styles.fieldSection}>
                <Text style={styles.fieldLabel}>Senha Atual</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={theme.colors.gray_500}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Digite sua senha atual"
                    placeholderTextColor={theme.colors.placeholder}
                    secureTextEntry={!showCurrentPassword}
                    value={currentPassword}
                    onChangeText={(text) => {
                      setCurrentPassword(sanitizePasswordInput(text));
                      if (errors.currentPassword) {
                        setErrors({ ...errors, currentPassword: undefined });
                      }
                    }}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    disabled={isLoading}
                  >
                    <Ionicons
                      name={showCurrentPassword ? "eye" : "eye-off"}
                      size={18}
                      color={theme.colors.gray_500}
                    />
                  </TouchableOpacity>
                </View>
                {errors.currentPassword && (
                  <Text style={styles.errorText}>{errors.currentPassword}</Text>
                )}
              </View>

              {/* Nova Senha */}
              <View style={styles.fieldSection}>
                <View style={styles.labelRow}>
                  <Text style={styles.fieldLabel}>Nova Senha</Text>
                  <TouchableOpacity
                    onPress={() => setIsPasswordRequirementsOpen(true)}
                    disabled={isLoading}
                  >
                    <Ionicons
                      name="information-circle-outline"
                      size={18}
                      color={theme.colors.primary}
                    />
                  </TouchableOpacity>
                </View>

                {/* Requisitos da senha inline exibidos durante a digitação */}
                <PasswordRequirementsInline
                  password={newPassword}
                  visible={newPassword.length > 0}
                />

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={theme.colors.gray_500}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Digite sua nova senha"
                    placeholderTextColor={theme.colors.placeholder}
                    secureTextEntry={!showNewPassword}
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(sanitizePasswordInput(text));
                      if (errors.newPassword) {
                        setErrors({ ...errors, newPassword: undefined });
                      }
                    }}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    disabled={isLoading}
                  >
                    <Ionicons
                      name={showNewPassword ? "eye" : "eye-off"}
                      size={18}
                      color={theme.colors.gray_500}
                    />
                  </TouchableOpacity>
                </View>
                {errors.newPassword && (
                  <Text style={styles.errorText}>{errors.newPassword}</Text>
                )}
              </View>

              {/* Confirmar Senha */}
              <View style={styles.fieldSection}>
                <Text style={styles.fieldLabel}>Confirmar Nova Senha</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={theme.colors.gray_500}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirme sua nova senha"
                    placeholderTextColor={theme.colors.placeholder}
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(sanitizePasswordInput(text));
                      if (errors.confirmPassword) {
                        setErrors({ ...errors, confirmPassword: undefined });
                      }
                    }}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye" : "eye-off"}
                      size={18}
                      color={theme.colors.gray_500}
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleClose}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleChangePassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={theme.colors.white} />
                ) : (
                  <Text style={styles.confirmButtonText}>Alterar Senha</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <PasswordRequirementsModal
        isVisible={isPasswordRequirementsOpen}
        onClose={() => setIsPasswordRequirementsOpen(false)}
        password={newPassword}
      />
    </>
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
    maxHeight: "85%",
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
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxHeight: 400,
  },
  fieldSection: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.gray_600,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.gray_800,
  },
  errorText: {
    fontSize: 11,
    color: theme.colors.red_500,
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray_200,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.colors.gray_100,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: theme.colors.gray_800,
    fontSize: 14,
    fontWeight: "600",
  },
  confirmButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
};
