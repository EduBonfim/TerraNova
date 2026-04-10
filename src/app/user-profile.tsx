import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  StatusBar,
  TouchableOpacity,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AppHeader } from "@/components/AppHeader";
import { SurfaceCard } from "@/components/SurfaceCard";
import {
  getAverageRating,
  getProfile,
  getReviews,
} from "../services/communityStore";
import { MARKETPLACE_OPPORTUNITIES } from "../services/marketplaceStore";
import { useAuth } from "../contexts/AuthContext";
import { addReport } from "../services/reportsStore";
import { useCart, addToCart, clearCart, updateCartQuantity } from "@/services/cartStore";
import { addToProducerCart, clearProducerCart } from "@/services/producerCartStore";
import { Alert, Animated } from "react-native";
import { appTheme as theme } from "@/theme/appTheme";



function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function UserProfileScreen() {
  const router = useRouter();
  const { cartItems, vendorName: cartVendorName, totalItems } = useCart();
  const { user: currentUser } = useAuth();
  const params = useLocalSearchParams<{ name?: string; filterByVendor?: string }>();
  const name = params.filterByVendor || params.name || "Fazenda São João";
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [addedItemIds, setAddedItemIds] = useState<string[]>([]);

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

  const handleAddToCart = async (product: any) => {
    try {
      if (currentUser?.role === "buyer") {
        await addToCart(product, 1);
      } else {
        await addToProducerCart(product, 1);
      }
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
             if (currentUser?.role === "buyer") {
               await clearCart();
               await addToCart(product, 1);
             } else {
               await clearProducerCart();
               await addToProducerCart(product, 1);
             }
             setSelectedProduct(null);
             setAddedItemIds((prev) => [...prev, product.id]);
             setTimeout(() => {
               setAddedItemIds((prev) => prev.filter((id) => id !== product.id));
             }, 1200);
          }
        }
      ]);
    }
  };

  const handleReport = () => {
    Alert.alert(
      "Denunciar Usuário",
      `Deseja abrir uma denúncia formal contra ${profile.displayName} para análise administrativa?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Confirmar Denúncia", 
          style: "destructive",
          onPress: async () => {
             await addReport({
               reportedUser: name,
               reporter: currentUser?.username || "Anônimo",
               reason: "Denúncia via perfil público",
               description: "Ação iniciada pelo usuário através do botão de denúncia no perfil."
             });
             Alert.alert("Sucesso", "Denúncia enviada com sucesso. Nossa equipe analisará o caso.");
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />
      <AppHeader
        title={profile.displayName}
        subtitle="Perfil público para negociação"
        onBackPress={() => router.back()}
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
              <TouchableOpacity key={uri} onPress={() => setPreviewPhoto(uri)}>
                <Image source={{ uri }} style={styles.photo} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SurfaceCard>

        <SurfaceCard style={styles.card}>
          <Text style={styles.sectionTitle}>Itens à venda</Text>
          {userListings.length === 0 ? (
            <Text style={styles.emptyText}>Sem itens disponíveis no mercado.</Text>
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4 }}>
              {userListings.map((item) => (
                <View key={item.id} style={styles.cardWrapper}>
                  <TouchableOpacity activeOpacity={0.9} style={{ flex: 1 }} onPress={() => setSelectedProduct(item)}>
                    <SurfaceCard style={styles.productCard}>
                      <View style={styles.imageContainer}>
                        <Image source={{ uri: item.foto }} style={styles.productImage} resizeMode="cover" />
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

                      <Text style={styles.productTitle} numberOfLines={2}>{item.produto}</Text>

                      <View style={styles.footer}>
                        <View style={styles.priceSection}>
                          <Text style={styles.price}>{item.preco}</Text>
                          <Text style={styles.stock} numberOfLines={1}>{item.estoque}</Text>
                        </View>
                        <TouchableOpacity
                          style={[styles.negotiateBtn, item.estoqueValor === 0 && styles.negotiateBtnDisabled]}
                          onPress={() => {
                            if (item.estoqueValor > 0) {
                              router.push({
                                pathname: "/messages",
                                params: { sellerName: item.vendedor, productName: item.produto },
                              });
                            }
                          }}
                          disabled={item.estoqueValor === 0}
                        >
                          <Text style={styles.negotiateBtnText}>
                            {item.estoqueValor > 0 ? "Negociar" : "Indisponível"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </SurfaceCard>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
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

        <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
          <Ionicons name="flag-outline" size={16} color={theme.colors.red_500} />
          <Text style={styles.reportButtonText}>Denunciar Perfil ou Anúncio Irregular</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modal Reintroduzido para preview da foto em tela cheia */}
      <Modal visible={!!previewPhoto} transparent={true} animationType="fade">
        <View style={styles.previewModalContainer}>
          <TouchableOpacity 
            style={styles.closePreviewButton}
            onPress={() => setPreviewPhoto(null)}
          >
            <Ionicons name="close" size={32} color="#FFFFFF" />
          </TouchableOpacity>
          {previewPhoto ? (
            <Image
              source={{ uri: previewPhoto }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>

      {/* Product Details Modal */}
      <Modal visible={Boolean(selectedProduct)} transparent animationType="slide">
        <View style={styles.detailsModalOverlay}>
          <View style={styles.detailsModalContent}>
            <TouchableOpacity style={styles.detailsCloseBtn} onPress={() => setSelectedProduct(null)}>
              <Ionicons name="close" size={24} color={theme.colors.gray_800} />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Image source={{ uri: selectedProduct?.foto }} style={styles.detailsImage} resizeMode="cover" />
              
              <View style={styles.detailsBody}>
                {selectedProduct?.tipoCertificacao === "Organico" && (
                  <View style={styles.organicBadgeDetails}>
                    <Ionicons name="leaf" size={14} color={theme.colors.white} style={{ marginRight: 4 }} />
                    <Text style={styles.organicBadgeText}>CERTIFICAÇÃO ORGÂNICA</Text>
                  </View>
                )}
                
                <Text style={styles.detailsTitle}>{selectedProduct?.produto}</Text>
                <Text style={styles.detailsPrice}>{selectedProduct?.preco}</Text>
                
                <View style={styles.detailsVendorRow}>
                  <Ionicons name="storefront-outline" size={16} color={theme.colors.gray_200} />
                  <Text style={styles.detailsVendorName}>{selectedProduct?.vendedor}</Text>
                </View>

                {selectedProduct?.loteCodigo && (
                  <View style={styles.certBox}>
                    <Text style={styles.certBoxTitle}>Rastreabilidade e Origem</Text>
                    <Text style={styles.certBoxItem}>Lote: {selectedProduct.loteCodigo}</Text>
                    {selectedProduct.numeroRegistro && (
                      <Text style={styles.certBoxItem}>Registro MAPA: {selectedProduct.numeroRegistro}</Text>
                    )}
                  </View>
                )}

                <Text style={styles.detailsStock}>Estoque disponível: {selectedProduct?.estoque}</Text>
              </View>
            </ScrollView>

            <View style={styles.detailsFooter}>
              {selectedProduct?.estoqueValor === 0 ? (
                <TouchableOpacity style={[styles.detailsNegotiateBtn, styles.negotiateBtnDisabled]} disabled>
                  <Text style={styles.detailsNegotiateBtnText}>Produto Indisponível</Text>
                </TouchableOpacity>
              ) : (
                (() => {
                  const cartItem = cartItems.find(c => c.id === selectedProduct?.id);
                  if (cartItem) {
                    return (
                      <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.gray_200, borderRadius: 8, overflow: "hidden", flex: 1 }}>
                        <TouchableOpacity onPress={() => updateCartQuantity(selectedProduct!.id, cartItem.cartQuantity - 1)} style={{ flex: 1, alignItems: "center", padding: 16, backgroundColor: theme.colors.white, borderWidth: 1, borderColor: theme.colors.gray_200, borderRadius: 8 }}>
                          <Ionicons name="remove" size={24} color={theme.colors.primary} />
                        </TouchableOpacity>
                        <View style={{ paddingHorizontal: 24 }}>
                          <Text style={{ fontWeight: "bold", fontSize: 20 }}>{cartItem.cartQuantity}</Text>
                        </View>
                        <TouchableOpacity onPress={() => updateCartQuantity(selectedProduct!.id, cartItem.cartQuantity + 1)} style={{ flex: 1, alignItems: "center", padding: 16, backgroundColor: theme.colors.primary, borderRadius: 8 }}>
                          <Ionicons name="add" size={24} color={theme.colors.white} />
                        </TouchableOpacity>
                      </View>
                    );
                  }
                  return (
                    <TouchableOpacity
                      style={[
                        styles.detailsNegotiateBtn, 
                        { flex: 1 },
                        addedItemIds.includes(selectedProduct?.id || "")
                          ? { backgroundColor: "#BEE3F8" }
                          : { backgroundColor: theme.colors.primary }
                      ]}
                      onPress={() => handleAddToCart(selectedProduct)}
                    >
                      {addedItemIds.includes(selectedProduct?.id || "") ? (
                        <>
                          <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                          <Text style={[styles.detailsNegotiateBtnText, { color: theme.colors.primary }]}>Adicionado</Text>
                        </>
                      ) : (
                        <>
                          <Ionicons name="cart-outline" size={20} color={theme.colors.white} />
                          <Text style={styles.detailsNegotiateBtnText}>Adicionar ao Carrinho</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  );
                })()
              )}
            </View>
          </View>
        </View>
      </Modal>
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

  emptyText: {
    color: theme.colors.gray_500,
    fontSize: 13,
  },

  cardWrapper: { width: "50%", height: 260, paddingHorizontal: 4, marginBottom: 8 },
  productCard: { flex: 1, backgroundColor: theme.colors.white, borderRadius: 8, overflow: "hidden", elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
  imageContainer: { width: "100%", height: 120, backgroundColor: theme.colors.background },
  productImage: { width: "100%", height: "100%" },
  productTitle: { fontSize: 13, fontWeight: "600", color: theme.colors.gray_900, paddingHorizontal: 8, paddingTop: 8, paddingBottom: 4, lineHeight: 15 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 8, paddingTop: 6, marginTop: "auto", paddingBottom: 8 },
  priceSection: { flex: 1 },
  price: { fontSize: 14, fontWeight: "bold", color: theme.colors.primary },
  stock: { fontSize: 8, color: theme.colors.gray_500, marginTop: 1 },
  negotiateBtn: { backgroundColor: theme.colors.primary, paddingVertical: 7, paddingHorizontal: 14, borderRadius: 5, marginLeft: 8 },
  negotiateBtnText: { color: theme.colors.white, fontWeight: "bold", fontSize: 10 },
  outOfStockBadge: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  outOfStockText: { color: theme.colors.white, fontWeight: "900", fontSize: 14, letterSpacing: 1, borderWidth: 2, borderColor: theme.colors.white, paddingHorizontal: 8, paddingVertical: 4, transform: [{ rotate: "-15deg" }] },
  negotiateBtnDisabled: { backgroundColor: theme.colors.gray_200 },
  organicBadge: { position: "absolute", top: 8, left: 8, backgroundColor: theme.colors.primary, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 },
  organicBadgeText: { color: theme.colors.white, fontSize: 9, fontWeight: "bold", letterSpacing: 0.5 },
  detailsModalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  detailsModalContent: { backgroundColor: theme.colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, height: "85%", overflow: "hidden" },
  detailsCloseBtn: { position: "absolute", top: 16, right: 16, zIndex: 10, backgroundColor: "rgba(255,255,255,0.8)", borderRadius: 20, padding: 4 },
  detailsImage: { width: "100%", height: 280, backgroundColor: theme.colors.gray_200 },
  detailsBody: { padding: 20 },
  organicBadgeDetails: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", backgroundColor: theme.colors.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, marginBottom: 10 },
  detailsTitle: { fontSize: 22, fontWeight: "bold", color: theme.colors.gray_900, marginBottom: 8 },
  detailsPrice: { fontSize: 26, fontWeight: "900", color: theme.colors.primary, marginBottom: 16 },
  detailsVendorRow: { flexDirection: "row", alignItems: "center", marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: theme.colors.gray_200 },
  detailsVendorName: { fontSize: 16, color: theme.colors.gray_800, marginLeft: 8 },
  certBox: { backgroundColor: "#F0FDF4", padding: 14, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.primary, marginBottom: 20 },
  certBoxTitle: { fontSize: 14, fontWeight: "bold", color: theme.colors.primary, marginBottom: 6 },
  certBoxItem: { fontSize: 13, color: theme.colors.gray_800, marginBottom: 2 },
  detailsStock: { fontSize: 14, color: theme.colors.gray_500, fontStyle: "italic" },
  detailsFooter: { padding: 16, borderTopWidth: 1, borderTopColor: theme.colors.gray_200, backgroundColor: theme.colors.white },
  detailsNegotiateBtn: { backgroundColor: theme.colors.orange_500, paddingVertical: 16, borderRadius: 10, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  detailsNegotiateBtnText: { color: theme.colors.white, fontSize: 16, fontWeight: "bold" },

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

  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    borderRadius: 10,
    gap: 8,
  },

  reportButtonText: {
    color: theme.colors.red_500,
    fontSize: 13,
    fontWeight: "600",
  },

  bottomSpacer: {
    height: 30,
  },

  previewModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closePreviewButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
  },
});
