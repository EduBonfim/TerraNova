import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { appTheme as theme } from "@/theme/appTheme";
import { profileStyles as styles } from "@/features/user-profile/styles/user-profile.styles";

export function ProfileQuickActions({
  currentUserRole,
  isFollowing,
  isOwnProfile,
  onToggleFollow,
  onNegotiate,
  onOpenLocation,
  farmAddress,
}) {
  const followLabel =
    currentUserRole === "buyer"
      ? isFollowing
        ? "Favoritada"
        : "Favoritar Fazenda"
      : isFollowing
      ? "Seguindo"
      : "Seguir";

  const followIcon =
    currentUserRole === "buyer"
      ? isFollowing
        ? "heart"
        : "heart-outline"
      : isFollowing
      ? "person-remove"
      : "person-add";

  return (
    <View style={styles.actionsRow}>
      {!isOwnProfile && (
        <>
          <TouchableOpacity
            style={[
              styles.actionButton,
              isFollowing && {
                backgroundColor: theme.colors.gray_100,
                borderWidth: 1,
                borderColor: theme.colors.primary,
              },
            ]}
            onPress={onToggleFollow}
          >
            <Ionicons
              name={followIcon}
              size={18}
              color={isFollowing ? theme.colors.primary : theme.colors.white}
            />
            <Text
              style={[
                styles.actionButtonText,
                isFollowing && { color: theme.colors.primary },
              ]}
            >
              {followLabel}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={onNegotiate}>
            <Ionicons name="chatbubbles" size={18} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>Mensagem</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryAction, { flex: 1 }]}
            onPress={() => {
              if (onOpenLocation) {
                onOpenLocation();
              } else {
                Alert.alert(
                  "Localização",
                  `Propriedade localizada em ${
                    farmAddress || "Endereço não informado"
                  }.`
                );
              }
            }}
          >
            <Ionicons name="location" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
