import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AppHeader } from "../components/AppHeader";
import { SurfaceCard } from "../components/SurfaceCard";
import {
  getAverageRating,
  getProfile,
  getReviews,
} from "../services/communityStore";

const theme = {
  colors: {
    primary: "#6B8E23",
    white: "#FFFFFF",
    background: "#F5F5F5",
    gray_200: "#E5E7EB",
    gray_500: "#6B7280",
    gray_800: "#1F2937",
    gray_900: "#111827",
    orange_500: "#F9A825",
  },
};

export default function UserProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string }>();
  const name = params.name || "Fazenda São João";

  const profile = getProfile(name);
  const rating = getAverageRating(name);
  const reviews = getReviews(name);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />
      <AppHeader
        title={profile.displayName}
        subtitle="Perfil público para negociação"
        onBackPress={() => router.push("/messages")}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.gray_200}
        subtitleStyle={styles.headerSubtitleOverride}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <SurfaceCard style={styles.card}>
          <Text style={styles.bioText}>{profile.bio}</Text>
          <Text style={styles.ratingText}>
            <Ionicons name="star" size={14} color={theme.colors.orange_500} />{" "}
            {rating} ({reviews.length} avaliações)
          </Text>
        </SurfaceCard>

        <SurfaceCard style={styles.card}>
          <Text style={styles.sectionTitle}>Fotos da fazenda</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {profile.farmPhotos.map((uri) => (
              <Image key={uri} source={{ uri }} style={styles.photo} />
            ))}
          </ScrollView>
        </SurfaceCard>

        <SurfaceCard style={styles.card}>
          <Text style={styles.sectionTitle}>Itens para venda/doação</Text>
          {profile.listings.length === 0 ? (
            <Text style={styles.emptyText}>Sem itens cadastrados.</Text>
          ) : null}
          {profile.listings.map((item) => (
            <View key={item.id} style={styles.rowItem}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.badge}>
                {item.type === "venda" ? item.price || "Venda" : "Doação"}
              </Text>
            </View>
          ))}
        </SurfaceCard>

        <SurfaceCard style={styles.card}>
          <Text style={styles.sectionTitle}>Estercagem / insumos</Text>
          {profile.insumos.length === 0 ? (
            <Text style={styles.emptyText}>Sem insumos cadastrados.</Text>
          ) : null}
          {profile.insumos.map((item) => (
            <View key={item.id} style={styles.rowItem}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.amount}>{item.amount}</Text>
            </View>
          ))}
        </SurfaceCard>

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

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },

  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  headerSubtitleOverride: {
    fontSize: 13,
  },

  card: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.gray_900,
    marginBottom: 8,
  },

  bioText: {
    fontSize: 14,
    color: theme.colors.gray_800,
    lineHeight: 20,
  },

  ratingText: {
    fontSize: 13,
    color: theme.colors.gray_800,
    marginTop: 8,
  },

  photo: {
    width: 120,
    height: 90,
    borderRadius: 10,
    marginRight: 8,
  },

  rowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },

  itemTitle: {
    color: theme.colors.gray_800,
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },

  badge: {
    color: theme.colors.white,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "bold",
  },

  amount: {
    color: theme.colors.gray_500,
    fontSize: 12,
    fontWeight: "bold",
  },

  emptyText: {
    color: theme.colors.gray_500,
    fontSize: 13,
  },

  reviewItem: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray_200,
    paddingTop: 8,
    marginTop: 6,
  },

  reviewMeta: {
    fontSize: 11,
    color: theme.colors.gray_500,
  },

  reviewStars: {
    fontSize: 12,
    color: theme.colors.orange_500,
    marginTop: 2,
  },

  reviewComment: {
    fontSize: 13,
    color: theme.colors.gray_800,
    marginTop: 2,
  },

  bottomSpacer: {
    height: 30,
  },
});
