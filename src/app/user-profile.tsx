import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  StatusBar,
  TouchableOpacity,
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
import { MARKETPLACE_OPPORTUNITIES } from "../services/marketplaceStore";

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

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function UserProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string }>();
  const name = params.name || "Fazenda São João";

  const profile = getProfile(name);
  const rating = getAverageRating(name);
  const reviews = getReviews(name);

  const userListings = MARKETPLACE_OPPORTUNITIES.filter(
    (item) => normalizeText(item.vendedor) === normalizeText(name)
  );

  const formatValidationTimestamp = (value?: string) => {
    if (!value) return "Nao validado";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Nao validado";
    return date.toLocaleString("pt-BR");
  };

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

          <View style={styles.trustCard}>
            <Text style={styles.trustTitle}>Selo de Confiabilidade de Localizacao</Text>

            <View style={styles.trustRow}>
              <Ionicons
                name={profile.isCepValidated ? "checkmark-circle" : "alert-circle-outline"}
                size={16}
                color={profile.isCepValidated ? theme.colors.primary : theme.colors.gray_500}
              />
              <Text style={styles.trustText}>CEP validado</Text>
            </View>

            <View style={styles.trustRow}>
              <Ionicons
                name={profile.isGatePinConfirmed ? "checkmark-circle" : "alert-circle-outline"}
                size={16}
                color={profile.isGatePinConfirmed ? theme.colors.primary : theme.colors.gray_500}
              />
              <Text style={styles.trustText}>Pin confirmado manualmente</Text>
            </View>

            <View style={styles.trustRow}>
              <Ionicons name="time-outline" size={16} color={theme.colors.gray_500} />
              <Text style={styles.trustText}>
                Ultima validacao: {formatValidationTimestamp(profile.locationValidatedAt)}
              </Text>
            </View>
          </View>
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
          <Text style={styles.sectionTitle}>Itens à venda</Text>
          {userListings.length === 0 ? (
            <Text style={styles.emptyText}>Sem itens disponíveis no mercado.</Text>
          ) : null}
          {userListings.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.listingCard}
              onPress={() => {}}
            >
              <Image source={{ uri: item.foto }} style={styles.listingImage} />
              <View style={styles.listingContent}>
                <View style={styles.listingHeader}>
                  <Ionicons name={item.categoria === "Mercado" ? "cart" : "leaf"} size={18} color={theme.colors.primary} />
                  <Text style={styles.listingTitle}>{item.produto}</Text>
                </View>
                <Text style={styles.listingPrice}>{item.preco}</Text>
                <Text style={styles.listingStock}>{item.estoque}</Text>
              </View>
              <TouchableOpacity
                style={styles.negotiateButton}
                onPress={() =>
                  router.push({
                    pathname: "/messages",
                    params: {
                      sellerName: item.vendedor,
                      productName: item.produto,
                    },
                  })
                }
              >
                <Text style={styles.negotiateButtonText}>Negociar</Text>
              </TouchableOpacity>
            </TouchableOpacity>
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

  trustCard: {
    marginTop: 12,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  trustTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.colors.gray_900,
    marginBottom: 6,
  },

  trustRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },

  trustText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.gray_800,
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

  listingCard: {
    flexDirection: "row",
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
  },

  listingImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },

  listingContent: {
    flex: 1,
  },

  listingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },

  listingTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.gray_900,
    flex: 1,
  },

  listingPrice: {
    fontSize: 13,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 2,
  },

  listingStock: {
    fontSize: 12,
    color: theme.colors.gray_500,
  },

  negotiateButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },

  negotiateButtonText: {
    color: theme.colors.white,
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
