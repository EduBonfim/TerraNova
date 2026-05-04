import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SurfaceCard } from "@/components/SurfaceCard";
import { appTheme as theme } from "@/theme/appTheme";
import { Review } from "@/services/communityStore";
import { CURRENT_PLATFORM_UI, messagesStyles as styles } from "@/features/messages/styles/messages.styles";

interface ReviewSellerViewProps {
  sellerRating: number;
  sellerReviews: Review[];
  sellerPhotos: string[];
  stars: number;
  comment: string;
  setStars: (val: number) => void;
  setComment: (val: string) => void;
  setPreviewPhoto: (uri: string) => void;
  submitReview: () => void;
}

export function ReviewSellerView({
  sellerRating,
  sellerReviews,
  sellerPhotos,
  stars,
  comment,
  setStars,
  setComment,
  setPreviewPhoto,
  submitReview
}: ReviewSellerViewProps) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.reviewScreenContent, { paddingBottom: CURRENT_PLATFORM_UI.reviewBottomExtra }]}
    >
      <SurfaceCard style={styles.trustCard}>
        <Text style={styles.trustTitle}>Avaliação da negociação</Text>
        <Text style={styles.trustRating}>
          <Ionicons name="star" size={14} color={theme.colors.primary} /> Nota atual do produtor: {sellerRating} ({sellerReviews.length} avaliações)
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
          {sellerPhotos.map((uri) => (
            <TouchableOpacity key={uri} onPress={() => setPreviewPhoto(uri)}>
              <Image source={{ uri }} style={styles.sellerPhoto} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((value) => (
            <TouchableOpacity key={value} onPress={() => setStars(value)}>
              <Ionicons name={value <= stars ? "star" : "star-outline"} size={26} color={theme.colors.primary} />
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.reviewInput}
          value={comment}
          onChangeText={setComment}
          placeholder="Escreva um comentário sobre a negociação"
          placeholderTextColor={theme.colors.gray_500}
          multiline
        />

        <TouchableOpacity style={styles.reviewSubmit} onPress={submitReview}>
          <Text style={styles.reviewSubmitText}>Publicar avaliação</Text>
        </TouchableOpacity>

        {sellerReviews.slice(0, 3).map((item) => (
          <View key={item.id} style={styles.reviewCard}>
            <Text style={styles.reviewMeta}>{item.author} • {item.role} • {item.date}</Text>
            {item.negotiatedItem && <Text style={styles.negotiatedItemText}>Negociado: {item.negotiatedItem}</Text>}
            <Text style={styles.reviewStars}>{"★".repeat(item.stars)}{"☆".repeat(5 - item.stars)}</Text>
            <Text style={styles.reviewComment}>{item.comment}</Text>
          </View>
        ))}
      </SurfaceCard>
    </ScrollView>
  );
}
