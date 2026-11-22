import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Image, TouchableOpacity, View } from "react-native";
import { appTheme as theme } from "@/theme/appTheme";
import { profileStyles as styles } from "@/features/user-profile/styles/user-profile.styles";

export function HeroBanner({ farmPhotos, avatarUri, onBackPress }) {
  // Fallback para a imagem do banner caso farmPhotos esteja vazio ou indefinido
  const bannerUri =
    farmPhotos && farmPhotos.length > 0
      ? farmPhotos[0]
      : "https://images.unsplash.com/photo-1500382017468-9049fed747ef";

  return (
    <>
      <View style={styles.heroContainer}>
        <Image source={{ uri: bannerUri }} style={styles.heroBanner} />
        <View style={styles.heroOverlay} />
        <TouchableOpacity style={styles.heroBackBtn} onPress={onBackPress}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.avatarOverlapContainer}>
        <Image source={{ uri: avatarUri }} style={styles.mainAvatar} />
      </View>
    </>
  );
}
