import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { appTheme as theme } from "@/theme/appTheme";
import { profileStyles as styles } from "../styles/user-profile.styles";

interface ProfileQuickActionsProps {
  onNegotiate: () => void;
  farmAddress: string;
  latitude?: number | string;
  longitude?: number | string;
}

export function ProfileQuickActions({
  onNegotiate,
  farmAddress,
  latitude,
  longitude,
}: ProfileQuickActionsProps) {
  return (
    <View style={styles.actionsRow}>
      <TouchableOpacity style={styles.actionButton} onPress={onNegotiate}>
        <Ionicons name="chatbubbles" size={18} color={theme.colors.white} />
        <Text style={styles.actionButtonText}>Negociar Diretamente</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.secondaryAction]}
        onPress={() =>
          Alert.alert(
            "Localização",
            `Propriedade localizada em ${farmAddress}. Coordenadas: ${latitude}, ${longitude}`
          )
        }
      >
        <Ionicons name="location" size={18} color={theme.colors.primary} />
        <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>Mapa</Text>
      </TouchableOpacity>
    </View>
  );
}
