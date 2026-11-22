import { SurfaceCard } from "@/components/SurfaceCard";
import React from "react";
import { Text, View } from "react-native";
import { profileStyles as styles } from "@/features/user-profile/styles/user-profile.styles";

export function RecentReviews({ reviews }) {
  return (
    <SurfaceCard style={styles.card}>
      <Text style={styles.sectionTitle}>Avaliações recentes</Text>
      {reviews.length === 0 ? (
        <Text style={styles.emptyText}>Ainda sem avaliações.</Text>
      ) : null}
      {reviews.slice(0, 5).map((review) => (
        <View key={review.id} style={styles.reviewItem}>
          <Text style={styles.reviewMeta}>
            {review.author} • {review.date}
          </Text>
          <Text style={styles.reviewStars}>
            {"★".repeat(review.stars)}
            {"☆".repeat(5 - review.stars)}
          </Text>
          <Text style={styles.reviewComment}>{review.comment}</Text>
        </View>
      ))}
    </SurfaceCard>
  );
}
