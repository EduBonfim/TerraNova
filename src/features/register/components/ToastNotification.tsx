import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { appTheme as theme } from "@/theme/appTheme";
import { registerStyles as styles } from "@/features/register/styles/register.styles";

interface ToastNotificationProps {
  message: string | null;
}

export function ToastNotification({ message }: ToastNotificationProps) {
  if (!message) return null;

  return (
    <View style={styles.toastContainer}>
      <Ionicons name="checkmark-circle" size={18} color={theme.colors.white} />
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
}
