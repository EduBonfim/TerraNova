import { SurfaceCard } from "@/components/SurfaceCard";
import { profileStyles as styles } from "@/features/user-profile/styles/user-profile.styles";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity } from "react-native";

interface PhotoGalleryProps {
  farmPhotos: string[];
  onPhotoPress: (uri: string) => void;
}

export function PhotoGallery({ farmPhotos, onPhotoPress }: PhotoGalleryProps) {
  return (
    <SurfaceCard style={styles.card}>
      <Text style={styles.sectionTitle}>Fotos da fazenda</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {farmPhotos.map((uri) => (
          <TouchableOpacity key={uri} onPress={() => onPhotoPress(uri)}>
            <Image source={{ uri }} style={styles.photo} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SurfaceCard>
  );
}
