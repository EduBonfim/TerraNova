import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  InteractionManager,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { AppHeader } from "../components/AppHeader";
import { SurfaceCard } from "../components/SurfaceCard";
import { getAverageRating, getProfileSummary, getReviews, initCommunityStore } from "../services/communityStore";
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
const ESTIMATED_CARD_HEIGHT = 320;

export default function MarketplaceScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const params = useLocalSearchParams<{ highlight?: string; filterByVendor?: string }>();
  const highlight = Array.isArray(params.highlight) ? params.highlight[0] : params.highlight;
  const filterByVendor = Array.isArray(params.filterByVendor) ? params.filterByVendor[0] : params.filterByVendor;
  const highlightedItemId = highlight;
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);
  const [imageModalUri, setImageModalUri] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [storeVersion, setStoreVersion] = useState(0);
  const listRef = useRef<FlatList<any> | null>(null);
  const itemOffsetsRef = useRef<Record<string, number>>({});
  const pendingHighlightScrollRef = useRef<string | null>(null);
  const isIOS = Platform.OS === "ios";

  const scrollToHighlightedItem = useCallback((itemId: string) => {
    const index = MARKETPLACE_OPPORTUNITIES.findIndex((item) => item.id === itemId);
    if (index < 0) return;

    const measuredOffset = itemOffsetsRef.current[itemId];
    if (typeof measuredOffset === "number") {
      pendingHighlightScrollRef.current = null;

      const moveToMeasuredOffset = () => {
        listRef.current?.scrollToOffset({
          offset: Math.max(0, measuredOffset - 12),
          animated: true,
        });
      };

      requestAnimationFrame(moveToMeasuredOffset);
      InteractionManager.runAfterInteractions(moveToMeasuredOffset);
      return;
    }

    pendingHighlightScrollRef.current = itemId;
    const estimatedOffset = Math.max(0, index * ESTIMATED_CARD_HEIGHT);
    listRef.current?.scrollToOffset({
      offset: estimatedOffset,
      animated: true,
    });

    setTimeout(() => {
      listRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: isIOS ? 0.3 : 0.15,
      });
    }, 140);
  }, [isIOS]);

  const registerItemLayout = useCallback((itemId: string, y: number) => {
    itemOffsetsRef.current[itemId] = y;

    if (pendingHighlightScrollRef.current === itemId) {
      pendingHighlightScrollRef.current = null;
      listRef.current?.scrollToOffset({
        offset: Math.max(0, y - 12),
        animated: true,
      });
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simular delay de requisição
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Aqui você faria um fetch real dos dados do marketplace
      // const { data } = await get("/marketplace/opportunities")
      // Dados já vêm do state, então por enquanto é só um visual refresh
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isFocused || !highlightedItemId) return;

    setActiveHighlightId(highlightedItemId);
    scrollToHighlightedItem(highlightedItemId);

    const clearParamsTimeout = setTimeout(() => {
      router.setParams({ highlight: undefined });
    }, 380);

    return () => {
      clearTimeout(clearParamsTimeout);
    };
  }, [highlightedItemId, isFocused, router, scrollToHighlightedItem]);

  useEffect(() => {
    if (!isFocused) {
      setActiveHighlightId(null);
    }
  }, [isFocused]);

  useEffect(() => {
    let mounted = true;

    const ensureStoreReady = async () => {
      await initCommunityStore();
      if (mounted) {
        setStoreVersion((prev) => prev + 1);
      }
    };

    ensureStoreReady();

    return () => {
      mounted = false;
    };
  }, []);

  const ratingBySeller = useMemo(() => {
    const result: Record<string, { avg: number; total: number }> = {};
    MARKETPLACE_OPPORTUNITIES.forEach((item) => {
      const avg = getAverageRating(item.vendedor);
      const total = getReviews(item.vendedor).length;
      result[item.vendedor] = { avg, total };
    });
    return result;
  }, [storeVersion]);

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
  }, [storeVersion]);

  const normalizeText = (value: string): string => {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  };

  const filteredMarketplaceItems = useMemo(() => {
    if (!filterByVendor) {
      return MARKETPLACE_OPPORTUNITIES;
    }
    
    const normalizedFilter = normalizeText(filterByVendor);
    return MARKETPLACE_OPPORTUNITIES.filter(
      (item) => normalizeText(item.vendedor) === normalizedFilter
    );
  }, [filterByVendor]);

  const renderItem = ({ item }: any) => {
    const isHighlighted = item.id === activeHighlightId;

    return (
    <View
      onLayout={(event) => {
        registerItemLayout(item.id, event.nativeEvent.layout.y);
      }}
    >
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
            <Text style={styles.buyButtonText}>Negociar</Text>
          </TouchableOpacity>
        </View>
      </SurfaceCard>
    </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />
      <AppHeader
        title={filterByVendor ? "Ofertas da propriedade" : "Mercado Terra Nova"}
        subtitle={filterByVendor ? undefined : "Economia circular e venda direta"}
        titleStyle={filterByVendor ? { fontSize: 17, lineHeight: 20 } : undefined}
        onBackPress={() => {
          if (filterByVendor) {
            router.replace("/profile");
          } else {
            router.replace("/home");
          }
        }}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.gray_300}
      />

      {filterByVendor ? (
        <View style={styles.filterBar}>
          <View style={styles.filterInfo}>
            <Ionicons name="filter" size={16} color={theme.colors.primary} />
            <View style={styles.filterTextGroup}>
              <Text style={styles.filterText}>Filtrando por propriedade</Text>
              <Text style={styles.filterVendorText} numberOfLines={1} ellipsizeMode="tail">
                {filterByVendor}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.clearFilterButton}
            onPress={() => router.replace("/profile")}
          >
            <Ionicons name="close" size={18} color={theme.colors.white} />
            <Text style={styles.clearFilterText}>Limpar</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        ref={listRef}
        data={filteredMarketplaceItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onScrollToIndexFailed={(info) => {
          const fallbackItem = MARKETPLACE_OPPORTUNITIES[info.index];
          if (fallbackItem?.id) {
            pendingHighlightScrollRef.current = fallbackItem.id;
          }

          const averageLength = info.averageItemLength > 0 ? info.averageItemLength : ESTIMATED_CARD_HEIGHT;
          const fallbackOffset = Math.max(0, averageLength * info.index - averageLength * 0.25);
          listRef.current?.scrollToOffset({ offset: fallbackOffset, animated: true });

          setTimeout(() => {
            listRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
              viewPosition: isIOS ? 0.3 : 0.15,
            });
          }, 120);

          if (isIOS) {
            setTimeout(() => {
              listRef.current?.scrollToOffset({
                offset: Math.max(0, info.index * ESTIMATED_CARD_HEIGHT),
                animated: true,
              });
            }, 240);
          }
        }}
        onContentSizeChange={() => {
          const pendingItemId = pendingHighlightScrollRef.current;
          if (pendingItemId) {
            scrollToHighlightedItem(pendingItemId);
          }
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
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
  filterBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.lightGreen,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_300,
  },
  filterInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    gap: 8,
  },
  filterTextGroup: {
    flex: 1,
  },
  filterText: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  filterVendorText: {
    marginTop: 1,
    fontSize: 12,
    color: theme.colors.gray_800,
    fontWeight: "600",
  },
  clearFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  clearFilterText: {
    fontSize: 12,
    color: theme.colors.white,
    fontWeight: "600",
  },
});
