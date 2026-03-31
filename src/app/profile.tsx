import React, { useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Platform,
  Image,
  Modal,
  Pressable,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { AppHeader } from "../components/AppHeader";
import { SurfaceCard } from "../components/SurfaceCard";
import { getAverageRating, getProfileSummary, getReviews } from "../services/communityStore";
import { MARKETPLACE_OPPORTUNITIES } from "../services/marketplaceStore";

// 🎨 NOVA PALETA OFICIAL TERRA Nova
const theme = {
  colors: {
    primary: "#6B8E23",
    lightGreen: "#E8F5E9",
    white: "#FFFFFF",
    background: "#F5F5F5",
    gray_300: "#D1D5DB",
    gray_500: "#6B7280",
    gray_800: "#1F2937",
    gray_900: "#111827",
    orange_500: "#F9A825",
  },
};

const IOS_VISUAL = {
  modalCloseTop: 58,
};

const ANDROID_VISUAL = {
  modalCloseTop: 32,
};

const MODAL_CLOSE_TOP =
  Platform.OS === "ios" ? IOS_VISUAL.modalCloseTop : ANDROID_VISUAL.modalCloseTop;

export default function MarketplaceScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const { highlight } = useLocalSearchParams<{ highlight?: string }>();
  const highlightedItemId = Array.isArray(highlight) ? highlight[0] : highlight;
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);
  const [imageModalUri, setImageModalUri] = useState<string | null>(null);

  useEffect(() => {
    if (highlightedItemId) {
      setActiveHighlightId(highlightedItemId);
      router.setParams({ highlight: undefined });
    }
  }, [highlightedItemId, router]);

  useEffect(() => {
    if (!isFocused) {
      setActiveHighlightId(null);
    }
  }, [isFocused]);

  const ratingBySeller = useMemo(() => {
    const result: Record<string, { avg: number; total: number }> = {};
    MARKETPLACE_OPPORTUNITIES.forEach((item) => {
      const avg = getAverageRating(item.vendedor);
      const total = getReviews(item.vendedor).length;
      result[item.vendedor] = { avg, total };
    });
    return result;
  }, []);

  const trustBySeller = useMemo(() => {
    const result: Record<string, { cep: boolean; pin: boolean }> = {};
    MARKETPLACE_OPPORTUNITIES.forEach((item) => {
      const summary = getProfileSummary(item.vendedor);
      result[item.vendedor] = {
        cep: summary.isCepValidated,
        pin: summary.isGatePinConfirmed,
      };
    });
    return result;
  }, []);

  const renderItem = ({ item }: any) => {
    const isHighlighted = item.id === activeHighlightId;

    return (
    <SurfaceCard style={[styles.card, isHighlighted ? styles.cardHighlighted : null]}>
      <TouchableOpacity onPress={() => setImageModalUri(item.foto)}>
        <Image source={{ uri: item.foto }} style={styles.itemImage} />
      </TouchableOpacity>

      {isHighlighted ? (
        <View style={styles.highlightBadge}>
          <Ionicons name="notifications" size={12} color={theme.colors.white} />
          <Text style={styles.highlightBadgeText}>Item da sua notificacao</Text>
        </View>
      ) : null}

      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name={item.icone} size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.produtoTitle}>{item.produto}</Text>
          <Text style={styles.vendedorText}>
            <Ionicons
              name="location-outline"
              size={14}
              color={theme.colors.gray_500}
            />{" "}
            {item.vendedor}
          </Text>
          <Text style={styles.ratingText}>
            <Ionicons name="star" size={13} color={theme.colors.orange_500} />{" "}
            {ratingBySeller[item.vendedor]?.avg || 0} (
            {ratingBySeller[item.vendedor]?.total || 0} avaliações)
          </Text>

          <View style={styles.trustMiniRow}>
            <Ionicons
              name={trustBySeller[item.vendedor]?.cep ? "checkmark-circle" : "alert-circle-outline"}
              size={12}
              color={trustBySeller[item.vendedor]?.cep ? theme.colors.primary : theme.colors.gray_500}
            />
            <Text style={styles.trustMiniText}>CEP</Text>
            <Ionicons
              name={trustBySeller[item.vendedor]?.pin ? "checkmark-circle" : "alert-circle-outline"}
              size={12}
              color={trustBySeller[item.vendedor]?.pin ? theme.colors.primary : theme.colors.gray_500}
            />
            <Text style={styles.trustMiniText}>Porteira</Text>
          </View>
        </View>
      </View>

      <View style={styles.divisor} />

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.precoText}>{item.preco}</Text>
          <Text style={styles.estoqueText}>{item.estoque}</Text>
        </View>
        <TouchableOpacity
          style={styles.buyButton}
          onPress={() => router.push("/messages")}
        >
          <Text style={styles.buyButtonText}>Negociar</Text>
        </TouchableOpacity>
      </View>
    </SurfaceCard>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />
      <AppHeader
        title="Mercado Terra Nova"
        subtitle="Economia circular e venda direta"
        onBackPress={() => router.replace("/home")}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.gray_300}
      />

      <FlatList
        data={MARKETPLACE_OPPORTUNITIES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.list}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={Boolean(imageModalUri)} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalClose}
            onPress={() => setImageModalUri(null)}
          >
            <Ionicons name="close" size={28} color={theme.colors.white} />
          </Pressable>
          {imageModalUri ? (
            <Image
              source={{ uri: imageModalUri }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.primary },
  list: { flex: 1, backgroundColor: theme.colors.background },
  listContainer: { padding: 15 },
  card: {
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHighlighted: {
    borderWidth: 2,
    borderColor: theme.colors.orange_500,
    backgroundColor: "#FFFBEA",
  },
  itemImage: { width: "100%", height: 160, borderRadius: 10, marginBottom: 12 },
  highlightBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.orange_500,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
    gap: 4,
  },
  highlightBadgeText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.lightGreen,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  headerText: { flex: 1 },
  produtoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.gray_900,
    marginBottom: 4,
  },
  vendedorText: { fontSize: 13, color: theme.colors.gray_500 },
  ratingText: { fontSize: 12, color: theme.colors.gray_800, marginTop: 4 },
  trustMiniRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  trustMiniText: {
    fontSize: 11,
    color: theme.colors.gray_500,
    marginRight: 6,
  },
  divisor: {
    height: 1,
    backgroundColor: theme.colors.gray_300,
    marginVertical: 15,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  precoText: { fontSize: 18, fontWeight: "bold", color: theme.colors.primary },
  estoqueText: { fontSize: 12, color: theme.colors.gray_500, marginTop: 2 },
  buyButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buyButtonText: {
    color: theme.colors.white,
    fontWeight: "bold",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalClose: {
    position: "absolute",
    top: MODAL_CLOSE_TOP,
    right: 18,
    zIndex: 2,
    padding: 6,
  },
  fullImage: { width: "94%", height: "82%" },
});
