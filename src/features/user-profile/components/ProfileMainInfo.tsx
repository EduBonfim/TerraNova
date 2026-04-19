import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { appTheme as theme } from "@/theme/appTheme";
import { profileStyles as styles } from "../styles/user-profile.styles";

interface ProfileMainInfoProps {
  displayName: string;
  farmName: string;
  producerRole: string;
  isCepValidated: boolean;
}

export function ProfileMainInfo({
  displayName,
  farmName,
  producerRole,
  isCepValidated,
}: ProfileMainInfoProps) {
  return (
    <View style={styles.profileMainInfo}>
      <Text style={styles.profileDisplayName}>{displayName}</Text>
      <Text style={styles.profileFarmName}>{farmName}</Text>
      <View style={styles.badgeRow}>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{producerRole}</Text>
        </View>
        {isCepValidated && (
          <View style={[styles.roleBadge, { backgroundColor: theme.colors.lightGreen }]}>
            <Ionicons name="shield-checkmark" size={12} color={theme.colors.primary} />
            <Text style={[styles.roleBadgeText, { color: theme.colors.primary, marginLeft: 4 }]}>
              Verificado
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
