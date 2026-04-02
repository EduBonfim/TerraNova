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
  ScrollView,
  TextInput,
  Keyboard,
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<TextInput>(null);
  const listRef = useRef<FlatList<any> | null>(null);
  const itemOffsetsRef = useRef<Record<string, number>>({});
  const pendingHighlightScrollRef = useRef<string | null>(null);
  const isIOS = Platform.OS === "ios";

  const scrollToHighlightedItem = useCallback((itemId: string, items: any[]) => {
    const index = items.findIndex((item) => item.id === itemId);
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
    scrollToHighlightedItem(highlightedItemId, filteredMarketplaceItems);

    const clearParamsTimeout = setTimeout(() => {
      router.setParams({ highlight: undefined });
    }, 380);

    return () => {
      clearTimeout(clearParamsTimeout);
    };
  }, [highlightedItemId, isFocused, router, scrollToHighlightedItem, filteredMarketplaceItems]);

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

  const categories = useMemo(() => {
    return ["Todos", "Mercado", "Cultivo"];
  }, []);

  const filteredMarketplaceItems = useMemo(() => {
    let items = MARKETPLACE_OPPORTUNITIES;
    
    if (filterByVendor) {
      const normalizedFilter = normalizeText(filterByVendor);
      items = items.filter(
        (item) => normalizeText(item.vendedor) === normalizedFilter
      );
    }

    if (selectedCategory && selectedCategory !== "Todos") {
      items = items.filter((item) => item.categoria === selectedCategory);
    }

    if (searchQuery.trim()) {
      const normalizedSearch = normalizeText(searchQuery);
      items = items.filter((item) =>
        normalizeText(item.produto).includes(normalizedSearch) ||
        normalizeText(item.vendedor).includes(normalizedSearch) ||
        normalizeText(item.categoria).includes(normalizedSearch)
      );
    }

    return items;
  }, [filterByVendor, selectedCategory, searchQuery]);

  const renderItem = ({ item }: any) => {
    const isHighlighted = item.id === activeHighlightId;

    return (
      <View
        onLayout={(event) => {
          registerItemLayout(item.id, event.nativeEvent.layout.y);
        }}
        style={styles.cardWrapper}
      >
        <SurfaceCard style={[styles.card, isHighlighted && styles.cardHighlighted]}>
          {/* Imagem */}
          <TouchableOpacity onPress={() => setImageModalUri(item.foto)} style={styles.imageContainer}>
            <Image source={{ uri: item.foto }} style={styles.productImage} resizeMode="cover" />
          </TouchableOpacity>

          {/* Título */}
          <Text style={styles.productTitle} numberOfLines={2}>{item.produto}</Text>

          {/* Vendor */}
          <View style={styles.vendorRow}>
            <Ionicons name="location" size={11} color={theme.colors.gray_500} />
            <Text style={styles.vendorName} numberOfLines={1}>{item.vendedor}</Text>
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={11} color={theme.colors.orange_500} />
            <Text style={styles.ratingValue}>{ratingBySeller[item.vendedor]?.avg || 0}</Text>
            <Text style={styles.reviewCount}>({ratingBySeller[item.vendedor]?.total || 0})</Text>
          </View>

          {/* Footer: Preço + Botão */}
          <View style={styles.footer}>
            <View style={styles.priceSection}>
              <Text style={styles.price}>{item.preco}</Text>
              <Text style={styles.stock} numberOfLines={1}>{item.estoque}</Text>
            </View>
            <TouchableOpacity
              style={styles.negotiateBtn}
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
              <Text style={styles.negotiateBtnText}>Negociar</Text>
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

      {/* Chip de Busca - Input Direto */}
      <View style={styles.activeSearchChip}>
        <Ionicons name="search" size={14} color={theme.colors.primary} />
        <TextInput
          ref={searchInputRef}
          style={styles.searchChipInput}
          placeholder="Buscar produto, vendedor..."
          placeholderTextColor={theme.colors.gray_500}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
        {searchQuery ? (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
            <Ionicons name="close-circle" size={16} color={theme.colors.gray_500} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filtros de Categoria */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilterContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryFilterButton,
              selectedCategory === cat && styles.categoryFilterButtonActive,
            ]}
            onPress={() => {
              setSelectedCategory(cat === "Todos" ? null : cat);
            }}
          >
            <Text style={[styles.categoryFilterText, selectedCategory === cat && styles.categoryFilterTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
            scrollToHighlightedItem(pendingItemId, filteredMarketplaceItems);
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
        numColumns={2}
        columnWrapperStyle={{ gap: 6 }}
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
  listContainer: { padding: 6, paddingBottom: 20 },
  cardWrapper: { flex: 1, height: 280, marginHorizontal: 4, marginBottom: 8 },
  card: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    display: "flex",
    flexDirection: "column",
  },
  cardHighlighted: {
    borderWidth: 2,
    borderColor: theme.colors.orange_500,
  },
  
  /* Imagem */
  imageContainer: {
    width: "100%",
    height: 120,
    backgroundColor: theme.colors.background,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },

  /* Título */
  productTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.gray_900,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 4,
    lineHeight: 15,
  },

  /* Vendor */
  vendorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 3,
  },
  vendorName: {
    fontSize: 9,
    color: theme.colors.gray_500,
    marginLeft: 3,
    flex: 1,
  },

  /* Rating */
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 6,
  },
  ratingValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: theme.colors.orange_500,
    marginLeft: 2,
  },
  reviewCount: {
    fontSize: 8,
    color: theme.colors.gray_500,
    marginLeft: 2,
  },

  /* Footer */
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 8,
    paddingTop: 6,
    marginTop: "auto",
    paddingBottom: 8,
  },
  priceSection: {
    flex: 1,
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  stock: {
    fontSize: 8,
    color: theme.colors.gray_500,
    marginTop: 1,
  },
  negotiateBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 5,
    marginLeft: 8,
  },
  negotiateBtnText: {
    color: theme.colors.white,
    fontWeight: "bold",
    fontSize: 10,
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
  categoryFilterContainer: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    flexGrow: 0,
    maxHeight: 40,
  },
  categoryFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 6,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
    borderWidth: 0,
    borderColor: "#D0D0D0",
    justifyContent: "center",
    alignItems: "center",
    height: 28,
  },
  categoryFilterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryFilterText: { fontSize: 12, fontWeight: "500", color: theme.colors.gray_800, lineHeight: 14 },
  categoryFilterTextActive: { color: theme.colors.white },

  // Search
  activeSearchChip: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: theme.colors.lightGreen,
    borderRadius: 16,
    gap: 6,
  },
  activeSearchChipText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "500",
    color: theme.colors.primary,
  },
  activeSearchChipPlaceholder: {
    fontSize: 12,
    fontWeight: "400",
    color: theme.colors.gray_500,
  },
  searchChipInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: "500",
    color: theme.colors.primary,
    padding: 0,
    margin: 0,
  },
});
