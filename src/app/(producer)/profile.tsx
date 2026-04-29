import { AppHeader } from "@/components/AppHeader";
import { SurfaceCard } from "@/components/SurfaceCard";
import { useMarketplaceLogic } from "@/features/marketplace/hooks/useMarketplaceLogic";
import {
  addToProducerCart,
  clearProducerCart,
  updateProducerCartQuantity,
  useProducerCart,
} from "@/services/producerCartStore";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Keyboard,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProducerMarketplaceScreen() {
  const {
    cartItems,
    totalItems,
    vendorName: cartVendorName,
  } = useProducerCart();

  const {
    router,
    filterByVendor,
    activeHighlightId,
    imageModalUri,
    setImageModalUri,
    isRefreshing,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    searchInputRef,
    filteredMarketplaceItems,
    categories,
    ratingBySeller,
    handleRefresh,
    marketplaceItems,
  } = useMarketplaceLogic(cartVendorName);

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const [animScale] = useState(new Animated.Value(1));
  const [addedItemIds, setAddedItemIds] = useState<string[]>([]);

  // Trigger bounce animation when cart item count changes
  useEffect(() => {
    if (totalItems > 0) {
      Animated.sequence([
        Animated.timing(animScale, {
          toValue: 1.4,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(animScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
  }, [totalItems, animScale]);

  const handleAddToCart = async (product: any) => {
    try {
      await addToProducerCart(product, 1);
      setSelectedProduct(null);
      setAddedItemIds((prev) => [...prev, product.id]);
      setTimeout(() => {
        setAddedItemIds((prev) => prev.filter((id) => id !== product.id));
      }, 1200);
    } catch (e: any) {
      Alert.alert("Carrinho Ocupado", e.message, [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Esvaziar e Adicionar",
          style: "destructive",
          onPress: async () => {
            await clearProducerCart();
            await addToProducerCart(product, 1);
            setSelectedProduct(null);
            setAddedItemIds((prev) => [...prev, product.id]);
            setTimeout(() => {
              setAddedItemIds((prev) => prev.filter((id) => id !== product.id));
            }, 1200);
          },
        },
      ]);
    }
  };

  const renderItem = ({ item }: any) => {
    const isHighlighted = item.id === activeHighlightId;

    return (
      <View style={styles.cardWrapper}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={{ flex: 1 }}
          onPress={() => setSelectedProduct(item)}
        >
          <SurfaceCard
            style={[styles.card, isHighlighted && styles.cardHighlighted]}
          >
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item.foto }}
                style={styles.productImage}
                resizeMode="cover"
              />
              {item.tipoCertificacao === "Organico" && (
                <View style={styles.organicBadge}>
                  <Text style={styles.organicBadgeText}>ORGÂNICO</Text>
                </View>
              )}
              {item.estoqueValor === 0 && (
                <View style={styles.outOfStockBadge}>
                  <Text style={styles.outOfStockText}>ESGOTADO</Text>
                </View>
              )}
            </View>

            <Text style={styles.productTitle} numberOfLines={2}>
              {item.produto}
            </Text>

            <View style={styles.vendorRow}>
              <Ionicons
                name="location"
                size={11}
                color={theme.colors.gray_500}
              />
              <Text style={styles.vendorName} numberOfLines={1}>
                {item.vendedor}
              </Text>
            </View>

            <View style={styles.ratingRow}>
              <Ionicons name="star" size={11} color={theme.colors.orange_500} />
              <Text style={styles.ratingValue}>
                {ratingBySeller[item.vendedor]?.avg || 0}
              </Text>
              <Text style={styles.reviewCount}>
                ({ratingBySeller[item.vendedor]?.total || 0})
              </Text>
            </View>

            <View style={styles.footer}>
              <View style={styles.priceSection}>
                <Text style={styles.price}>{item.preco}</Text>
                <Text style={styles.stock} numberOfLines={1}>
                  {item.estoque}
                </Text>
              </View>
              {(() => {
                const cartItem = cartItems.find((c) => c.id === item.id);
                if (cartItem && item.estoqueValor > 0) {
                  return (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: theme.colors.gray_100,
                        borderRadius: 8,
                        overflow: "hidden",
                      }}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          updateProducerCartQuantity(
                            item.id,
                            cartItem.cartQuantity - 1,
                          )
                        }
                        style={{
                          padding: 10,
                          backgroundColor: theme.colors.white,
                          borderWidth: 1,
                          borderColor: theme.colors.gray_200,
                          borderRadius: 8,
                        }}
                      >
                        <Ionicons
                          name="remove"
                          size={16}
                          color={theme.colors.primary}
                        />
                      </TouchableOpacity>
                      <View style={{ paddingHorizontal: 12 }}>
                        <Text style={{ fontWeight: "bold", fontSize: 14 }}>
                          {cartItem.cartQuantity}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          updateProducerCartQuantity(
                            item.id,
                            cartItem.cartQuantity + 1,
                          )
                        }
                        style={{
                          padding: 10,
                          backgroundColor: theme.colors.primary,
                          borderRadius: 8,
                        }}
                      >
                        <Ionicons
                          name="add"
                          size={16}
                          color={theme.colors.white}
                        />
                      </TouchableOpacity>
                    </View>
                  );
                }
                return (
                  <TouchableOpacity
                    style={[
                      styles.negotiateBtn,
                      item.estoqueValor === 0 && styles.negotiateBtnDisabled,
                    ]}
                    onPress={() => handleAddToCart(item)}
                    disabled={item.estoqueValor === 0}
                  >
                    <Text style={styles.negotiateBtnText}>
                      {item.estoqueValor > 0 ? "Adicionar" : "Indisponível"}
                    </Text>
                  </TouchableOpacity>
                );
              })()}
            </View>
          </SurfaceCard>
        </TouchableOpacity>
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
        title={
          filterByVendor ? "Ofertas da propriedade" : "Mercado B2B Produtor"
        }
        subtitle={filterByVendor ? undefined : "Insumos e matéria-prima"}
        titleStyle={
          filterByVendor ? { fontSize: 17, lineHeight: 20 } : undefined
        }
        onBackPress={() => {}}
        showBackButton={false}
        rightAccessory={
          <TouchableOpacity
            style={{ position: "relative", padding: 4 }}
            onPress={() => router.push("/(producer)/checkout")}
          >
            <Animated.View style={{ transform: [{ scale: animScale }] }}>
              <Ionicons
                name="cart-outline"
                size={24}
                color={theme.colors.white}
              />
              {totalItems > 0 && (
                <View
                  style={[
                    styles.cartBadge,
                    { position: "absolute", top: -6, right: -6 },
                  ]}
                >
                  <Text style={styles.cartBadgeText}>{totalItems}</Text>
                </View>
              )}
            </Animated.View>
          </TouchableOpacity>
        }
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.gray_300}
      />

      {cartVendorName && !filterByVendor && (
        <View style={styles.cartFilterBanner}>
          <Ionicons
            name="information-circle"
            size={20}
            color={theme.colors.white}
          />
          <Text style={styles.cartFilterBannerText}>
            Loja restrita a: {cartVendorName}
          </Text>
          <TouchableOpacity
            onPress={() => clearProducerCart()}
            style={styles.cartFilterBannerBtn}
          >
            <Text style={styles.cartFilterBannerBtnText}>Limpar</Text>
          </TouchableOpacity>
        </View>
      )}

      {filterByVendor && (
        <View style={styles.filterBar}>
          <View style={styles.filterInfo}>
            <Ionicons name="filter" size={16} color={theme.colors.primary} />
            <View style={styles.filterTextGroup}>
              <Text style={styles.filterText}>Filtrando por propriedade</Text>
              <Text style={styles.filterVendorText} numberOfLines={1}>
                {filterByVendor}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.clearFilterButton}
            onPress={() => router.replace("/(producer)/profile")}
          >
            <Ionicons name="close" size={18} color={theme.colors.white} />
            <Text style={styles.clearFilterText}>Limpar</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.activeSearchChip}>
        <Ionicons name="search" size={14} color={theme.colors.primary} />
        <TextInput
          ref={searchInputRef}
          style={styles.searchChipInput}
          placeholder="Buscar produto, vendedor..."
          placeholderTextColor={theme.colors.gray_500}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => Keyboard.dismiss()}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons
              name="close-circle"
              size={16}
              color={theme.colors.gray_500}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilterContainer}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryFilterButton,
              selectedCategory === cat && styles.categoryFilterButtonActive,
            ]}
            onPress={() => setSelectedCategory(cat === "Todos" ? null : cat)}
          >
            <Text
              style={[
                styles.categoryFilterText,
                selectedCategory === cat && styles.categoryFilterTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredMarketplaceItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
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
          {imageModalUri && (
            <Image
              source={{ uri: imageModalUri }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Product Details Modal */}
      <Modal
        visible={Boolean(selectedProduct)}
        transparent
        animationType="slide"
      >
        <View style={styles.detailsModalOverlay}>
          <View style={styles.detailsModalContent}>
            <TouchableOpacity
              style={styles.detailsCloseBtn}
              onPress={() => setSelectedProduct(null)}
            >
              <Ionicons name="close" size={24} color={theme.colors.gray_800} />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Image
                source={{ uri: selectedProduct?.foto }}
                style={styles.detailsImage}
                resizeMode="cover"
              />

              <View style={styles.detailsBody}>
                {selectedProduct?.tipoCertificacao === "Organico" && (
                  <View style={styles.organicBadgeDetails}>
                    <Ionicons
                      name="leaf"
                      size={14}
                      color={theme.colors.white}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.organicBadgeText}>
                      CERTIFICAÇÃO ORGÂNICA
                    </Text>
                  </View>
                )}

                <Text style={styles.detailsTitle}>
                  {selectedProduct?.produto}
                </Text>
                <Text style={styles.detailsPrice}>
                  {selectedProduct?.preco}
                </Text>

                <View style={styles.detailsVendorRow}>
                  <Ionicons
                    name="storefront-outline"
                    size={16}
                    color={theme.colors.gray_600}
                  />
                  <Text style={styles.detailsVendorName}>
                    {selectedProduct?.vendedor}
                  </Text>
                </View>

                {selectedProduct?.loteCodigo && (
                  <View style={styles.certBox}>
                    <Text style={styles.certBoxTitle}>
                      Rastreabilidade e Origem
                    </Text>
                    <Text style={styles.certBoxItem}>
                      Lote: {selectedProduct.loteCodigo}
                    </Text>
                    {selectedProduct.numeroRegistro && (
                      <Text style={styles.certBoxItem}>
                        Registro MAPA: {selectedProduct.numeroRegistro}
                      </Text>
                    )}
                  </View>
                )}

                <Text style={styles.detailsStock}>
                  Estoque disponível: {selectedProduct?.estoque}
                </Text>
              </View>
            </ScrollView>

            <View style={styles.detailsFooter}>
              {selectedProduct?.estoqueValor === 0 ? (
                <TouchableOpacity
                  style={[
                    styles.detailsNegotiateBtn,
                    styles.negotiateBtnDisabled,
                  ]}
                  disabled
                >
                  <Text style={styles.detailsNegotiateBtnText}>
                    Produto Indisponível
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    style={[
                      styles.detailsNegotiateBtn,
                      { flex: 1 },
                      addedItemIds.includes(selectedProduct?.id || "")
                        ? { backgroundColor: theme.colors.lightGreen }
                        : { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={() => handleAddToCart(selectedProduct)}
                  >
                    {addedItemIds.includes(selectedProduct?.id || "") ? (
                      <>
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={theme.colors.primary}
                        />
                        <Text
                          style={[
                            styles.detailsNegotiateBtnText,
                            { color: theme.colors.primary },
                          ]}
                        >
                          Adicionado
                        </Text>
                      </>
                    ) : (
                      <>
                        <Ionicons
                          name="cart-outline"
                          size={20}
                          color={theme.colors.white}
                        />
                        <Text style={styles.detailsNegotiateBtnText}>
                          + Cesta
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.detailsNegotiateBtn, { flex: 2 }]}
                    onPress={() => {
                      const prod = selectedProduct;
                      setSelectedProduct(null);
                      router.push({
                        pathname: "/messages",
                        params: {
                          sellerName: prod.vendedor,
                          productName: prod.produto,
                        },
                      });
                    }}
                  >
                    <Ionicons
                      name="chatbubbles-outline"
                      size={20}
                      color={theme.colors.white}
                    />
                    <Text style={styles.detailsNegotiateBtnText}>
                      Negociar Direto
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
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
  },
  cardHighlighted: { borderWidth: 2, borderColor: theme.colors.orange_500 },
  imageContainer: {
    width: "100%",
    height: 120,
    backgroundColor: theme.colors.background,
  },
  productImage: { width: "100%", height: "100%" },
  productTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.gray_900,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 4,
    lineHeight: 15,
  },
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
  reviewCount: { fontSize: 8, color: theme.colors.gray_500, marginLeft: 2 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 8,
    paddingTop: 6,
    marginTop: "auto",
    paddingBottom: 8,
  },
  priceSection: { flex: 1 },
  price: { fontSize: 14, fontWeight: "bold", color: theme.colors.primary },
  stock: { fontSize: 8, color: theme.colors.gray_500, marginTop: 1 },
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
    top: Platform.OS === "ios" ? 58 : 32,
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
  filterTextGroup: { flex: 1 },
  filterText: { fontSize: 13, color: theme.colors.primary, fontWeight: "600" },
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
    justifyContent: "center",
    alignItems: "center",
    height: 28,
  },
  categoryFilterButtonActive: { backgroundColor: theme.colors.primary },
  categoryFilterText: {
    fontSize: 12,
    fontWeight: "500",
    color: theme.colors.gray_800,
    lineHeight: 14,
  },
  categoryFilterTextActive: { color: theme.colors.white },
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
  searchChipInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: "500",
    color: theme.colors.primary,
    padding: 0,
    margin: 0,
  },
  outOfStockBadge: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  outOfStockText: {
    color: theme.colors.white,
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 1,
    borderWidth: 2,
    borderColor: theme.colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    transform: [{ rotate: "-15deg" }],
  },
  negotiateBtnDisabled: { backgroundColor: theme.colors.gray_400 },
  organicBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  organicBadgeText: {
    color: theme.colors.white,
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -4,
    backgroundColor: theme.colors.orange_500,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  cartBadgeText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  cartFilterBanner: {
    flexDirection: "row",
    backgroundColor: theme.colors.orange_500,
    padding: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  cartFilterBannerText: {
    color: theme.colors.white,
    fontWeight: "bold",
    fontSize: 13,
    flex: 1,
    marginLeft: 8,
  },
  cartFilterBannerBtn: {
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cartFilterBannerBtnText: {
    color: theme.colors.white,
    fontWeight: "bold",
    fontSize: 13,
  },
  detailsModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  detailsModalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "85%",
    overflow: "hidden",
  },
  detailsCloseBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 20,
    padding: 4,
  },
  detailsImage: {
    width: "100%",
    height: 280,
    backgroundColor: theme.colors.gray_200,
  },
  detailsBody: { padding: 20 },
  organicBadgeDetails: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 10,
  },
  detailsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: theme.colors.gray_900,
    marginBottom: 8,
  },
  detailsPrice: {
    fontSize: 26,
    fontWeight: "900",
    color: theme.colors.primary,
    marginBottom: 16,
  },
  detailsVendorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
  },
  detailsVendorName: {
    fontSize: 16,
    color: theme.colors.gray_800,
    marginLeft: 8,
  },
  certBox: {
    backgroundColor: "#F0FDF4",
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginBottom: 20,
  },
  certBoxTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 6,
  },
  certBoxItem: { fontSize: 13, color: theme.colors.gray_800, marginBottom: 2 },
  detailsStock: {
    fontSize: 14,
    color: theme.colors.gray_500,
    fontStyle: "italic",
  },
  detailsFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray_200,
    backgroundColor: theme.colors.white,
  },
  detailsNegotiateBtn: {
    backgroundColor: theme.colors.orange_500,
    paddingVertical: 16,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  detailsNegotiateBtnText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
