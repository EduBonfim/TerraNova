import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function ProfileHeader({
  profilePhotoUri,
  displayName,
  farmName,
  farmAddress,
  onPressEditProfile,
}) {
  return (
    <View style={styles.profileHeaderSection}>
      <TouchableOpacity
        style={styles.profileHeaderContent}
        onPress={onPressEditProfile}
      >
        <Image
          source={
            profilePhotoUri
              ? { uri: profilePhotoUri }
              : require("../../../assets/perfil.png")
          }
          style={styles.profileHeaderAvatar}
        />
        <View style={styles.profileHeaderInfo}>
          <Text style={styles.profileHeaderName}>{displayName}</Text>
          <Text style={styles.profileHeaderSubtitle}>Meu perfil</Text>
          <Text style={styles.profileHeaderFarm}>{farmName}</Text>
          <Text style={styles.profileHeaderState}>
            {farmAddress.split("-")[1]?.trim() || "Estado não informado"}
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
  profileHeaderFarm: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.gray_800,
    marginTop: 6,
  },
  profileHeaderState: {
    fontSize: 11,
    color: theme.colors.gray_500,
    marginTop: 2,
  },
});
