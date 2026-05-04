import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BuyerProfileHeaderProps {
  profilePhotoUri: string | null;
  displayName: string;
  email: string;
  initials: string;
  onPressEditProfile: () => void;
}

export function BuyerProfileHeader({
  profilePhotoUri,
  displayName,
  email,
  initials,
  onPressEditProfile,
}: BuyerProfileHeaderProps) {
  return (
    <View style={styles.profileHeaderSection}>
      <TouchableOpacity
        style={styles.profileHeaderContent}
        onPress={onPressEditProfile}
      >
        {profilePhotoUri ? (
          <Image
            source={{ uri: `${profilePhotoUri}?t=${new Date().getTime()}` }}
            style={styles.profileHeaderAvatar}
          />
        ) : (
          <View style={styles.profileHeaderAvatarFallback}>
            <Text style={styles.profileHeaderAvatarInitials}>{initials}</Text>
          </View>
        )}
        <View style={styles.profileHeaderInfo}>
          <Text style={styles.profileHeaderName}>{displayName}</Text>
          <Text style={styles.profileHeaderSubtitle}>Meu perfil</Text>
          <Text style={styles.profileHeaderEmail} numberOfLines={1}>
            {email}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.gray_500}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  profileHeaderSection: {
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  profileHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileHeaderAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileHeaderAvatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  profileHeaderAvatarInitials: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.white,
  },
  profileHeaderInfo: {
    flex: 1,
  },
  profileHeaderName: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  profileHeaderSubtitle: {
    fontSize: 12,
    color: theme.colors.gray_500,
    marginTop: 2,
  },
  profileHeaderEmail: {
    fontSize: 12,
    color: theme.colors.gray_600,
    marginTop: 4,
  },
});
