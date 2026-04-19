import React from "react";
import { ScrollView, Image, TouchableOpacity, Text } from "react-native";
import { profileStyles as styles } from "../styles/user-profile.styles";
import { SurfaceCard } from "@/components/SurfaceCard";

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
