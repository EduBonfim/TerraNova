import { Ionicons } from "@expo/vector-icons";
import { appTheme as theme } from "@/theme/appTheme";
import { profileStyles as styles } from "@/features/user-profile/styles/user-profile.styles";
import React from "react";
import { Text, View } from "react-native";

export function ProfileMainInfo({
  displayName,
  farmName,
  producerRole,
  isCepValidated,
  followerCount,
  followingCount,
}) {
  return (
    <View style={styles.profileMainInfo}>
      <Text style={styles.profileDisplayName}>{displayName}</Text>
      <Text style={styles.profileFarmName}>{farmName}</Text>

      <View style={styles.socialStatsRow}>
        <View style={styles.socialStatItem}>
          <Text style={styles.socialStatNumber}>{followerCount}</Text>
          <Text style={styles.socialStatLabel}>Seguidores</Text>
        </View>
        <View style={styles.socialStatDivider} />
        <View style={styles.socialStatItem}>
          <Text style={styles.socialStatNumber}>{followingCount}</Text>
          <Text style={styles.socialStatLabel}>Seguindo</Text>
        </View>
      </View>

      <View style={styles.badgeRow}>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{producerRole}</Text>
        </View>
        {isCepValidated && (
          <View
            style={[
              styles.roleBadge,
              { backgroundColor: theme.colors.lightGreen },
            ]}
          >
            <Ionicons
              name="shield-checkmark"
              size={12}
              color={theme.colors.primary}
            />
            <Text
              style={[
                styles.roleBadgeText,
                { color: theme.colors.primary, marginLeft: 4 },
              ]}
            >
              Verificado
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
