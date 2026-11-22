import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAverageRating,
  getReviews,
  fetchProfile,
} from "@/services/communityStore";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RatingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [_loading, setLoading] = useState(true);

  // Carregar perfil com avaliações do backend
  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchProfile(user.username).finally(() => setLoading(false));
    }
  }, [user?.username]);

  const reviews = useMemo(() => {
    return user ? getReviews(user.username) : [];
  }, [user]);

  const averageRating = useMemo(() => {
    return user ? getAverageRating(user.username) : 0;
  }, [user]);

  const stats = useMemo(() => {
    const total = reviews.length;
    const counts = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      const star = Math.round(r.stars);
      if (star >= 1 && star <= 5) counts[star - 1]++;
    });

    return {
      total,
      breakdown: counts.reverse().map((count, i) => ({
        stars: 5 - i,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      })),
    };
  }, [reviews]);

  const renderStars = (rating, size = 20) => {
    return (
      <View style={styles.ratingsStars}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Ionicons
            key={i}
            name={
              i <= Math.floor(rating)
                ? "star"
                : i <= rating
                ? "star-half"
                : "star-outline"
            }
            size={size}
            color={theme.colors.orange_500}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />
      <AppHeader
        title="Minhas Avaliações"
        onBackPress={() => router.back()}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.primary}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.ratingsSummary}>
            <Text style={styles.ratingsSummaryNumber}>
              {averageRating.toFixed(1)}
            </Text>
            {renderStars(averageRating)}
            <Text style={styles.ratingsCount}>
              baseado em {stats.total} avaliações
            </Text>
          </View>

          <View style={styles.ratingsBreakdown}>
            {stats.breakdown.map((item) => (
              <View key={item.stars} style={styles.ratingBar}>
                <Text style={styles.ratingLabel}>
                  {item.stars} {item.stars === 1 ? "estrela" : "estrelas"}
                </Text>
                <View style={styles.ratingBarContainer}>
                  <View
                    style={[
                      styles.ratingBarFill,
                      {
                        width: `${item.percentage}%`,
                        backgroundColor:
                          item.stars >= 4
                            ? "#10B981"
                            : item.stars === 3
                            ? "#F59E0B"
                            : "#EF4444",
                      },
                    ]}
                  />
                </View>
                <Text style={styles.ratingCountText}>{item.count}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.reviewsTitle}>
            {reviews.length > 0
              ? "Avaliações recentes"
              : "Nenhuma avaliação ainda"}
          </Text>

          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>
                  {review.authorName || review.author}
                </Text>
                <View style={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Ionicons
                      key={i}
                      name={i <= review.stars ? "star" : "star-outline"}
                      size={14}
                      color={theme.colors.orange_500}
                    />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewDate}>{review.date}</Text>
              <Text style={styles.reviewText}>{review.comment}</Text>
            </View>
          ))}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16 },
  ratingsSummary: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  ratingsSummaryNumber: {
    fontSize: 56,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  ratingsStars: { flexDirection: "row", gap: 6, marginVertical: 10 },
  ratingsCount: {
    fontSize: 13,
    color: theme.colors.gray_500,
    fontWeight: "500",
  },
  ratingsBreakdown: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  ratingBar: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  ratingLabel: {
    fontSize: 12,
    color: theme.colors.gray_800,
    width: 80,
    fontWeight: "600",
  },
  ratingBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.gray_200,
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  ratingBarFill: { height: "100%", borderRadius: 4 },
  ratingCountText: {
    fontSize: 12,
    color: theme.colors.gray_500,
    width: 30,
    textAlign: "right",
    fontWeight: "bold",
  },
  reviewsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 12,
    marginTop: 4,
  },
  reviewItem: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  reviewStars: { flexDirection: "row", gap: 2 },
  reviewDate: { fontSize: 12, color: theme.colors.gray_500, marginBottom: 8 },
  reviewText: { fontSize: 13, color: theme.colors.gray_500, lineHeight: 20 },
});
