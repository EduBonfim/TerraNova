import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { appTheme as theme } from "@/theme/appTheme";
import { ChangePasswordModal } from "./modals/ChangePasswordModal";

const securityStyles = {
  sectionContainer: {
    marginTop: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  changePasswordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  changePasswordButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  changePasswordIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "rgba(107, 142, 35, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  changePasswordTextContainer: {
    flex: 1,
  },
  changePasswordLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.gray_800,
    marginBottom: 2,
  },
  changePasswordHint: {
    fontSize: 12,
    color: theme.colors.gray_500,
  },
  changePasswordArrow: {
    marginLeft: 8,
  },
};

export function SecuritySection({ onChangePassword, isLoading }) {
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);

  const handleChangePassword = async (currentPassword, newPassword) => {
    const result = await onChangePassword(currentPassword, newPassword);
    return result;
  };

  return (
    <>
      <View style={securityStyles.sectionContainer}>
        <Text style={securityStyles.sectionTitle}>Segurança</Text>

        <TouchableOpacity
          style={securityStyles.changePasswordButton}
          onPress={() => setIsChangePasswordModalOpen(true)}
          activeOpacity={0.7}
        >
          <View style={securityStyles.changePasswordButtonContent}>
            <View style={securityStyles.changePasswordIconContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.colors.primary}
              />
            </View>
            <View style={securityStyles.changePasswordTextContainer}>
              <Text style={securityStyles.changePasswordLabel}>
                Alterar Senha
              </Text>
              <Text style={securityStyles.changePasswordHint}>
                Atualize sua senha de segurança
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.gray_400}
            style={securityStyles.changePasswordArrow}
          />
        </TouchableOpacity>
      </View>

      <ChangePasswordModal
        isVisible={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        onChangePassword={handleChangePassword}
        isLoading={isLoading}
      />
    </>
  );
}

export { securityStyles };
