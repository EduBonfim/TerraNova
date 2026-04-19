import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { appTheme as theme } from "@/theme/appTheme";
import { profileStyles as styles } from "../styles/user-profile.styles";

interface HeroBannerProps {
  farmPhotos: string[];
  avatarUri?: string;
  onBackPress: () => void;
}

export function HeroBanner({ farmPhotos, avatarUri, onBackPress }: HeroBannerProps) {
  return (
    <>
      <View style={styles.heroContainer}>
        <Image
          source={{ uri: farmPhotos[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef' }}
          style={styles.heroBanner}
        />
        <View style={styles.heroOverlay} />
        <TouchableOpacity style={styles.heroBackBtn} onPress={onBackPress}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </View>
      <View style={styles.avatarOverlapContainer}>
        <Image
          source={{ uri: avatarUri || 'https://images.unsplash.com/photo-1542838132-92bd5172811e' }}
          style={styles.mainAvatar}
        />
      </View>
    </>
  );
}
