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
import { Alert } from "react-native";
import { appTheme as theme } from "@/theme/appTheme";
import { SurfaceCard } from "@/components/SurfaceCard";
import {
  getAverageRating,
  getProfile,
  getReviews,
} from "@/services/communityStore";
import { MARKETPLACE_OPPORTUNITIES } from "@/services/marketplaceStore";
import { useAuth } from "@/contexts/AuthContext";
import { addReport } from "@/services/reportsStore";
import { useCart } from "@/services/cartStore";



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
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 0 }}
      >
        {/* Banner Hero */}
        <View style={styles.heroContainer}>
          <Image 
            source={{ uri: profile.farmPhotos[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef' }} 
            style={styles.heroBanner} 
          />
          <View style={styles.heroOverlay} />
          <TouchableOpacity style={styles.heroBackBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        {/* Profile Header Overlap (Avatar only) */}
        <View style={styles.avatarOverlapContainer}>
          <Image 
            source={{ uri: profile.avatarUri || 'https://images.unsplash.com/photo-1542838132-92bd5172811e' }} 
            style={styles.mainAvatar} 
          />
        </View>

        {/* Profile Text Info (Below Banner for readability) */}
        <View style={styles.profileMainInfo}>
          <Text style={styles.profileDisplayName}>{profile.displayName}</Text>
          <Text style={styles.profileFarmName}>{profile.farmName}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{profile.producerRole}</Text>
            </View>
            {profile.isCepValidated && (
              <View style={[styles.roleBadge, { backgroundColor: theme.colors.lightGreen }]}>
                <Ionicons name="shield-checkmark" size={12} color={theme.colors.primary} />
                <Text style={[styles.roleBadgeText, { color: theme.colors.primary, marginLeft: 4 }]}>Verificado</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push({
              pathname: "/messages",
              params: { sellerName: profile.displayName, productName: "Conversa Direta" },
            })}
          >
            <Ionicons name="chatbubbles" size={18} color={theme.colors.white} />
            <Text style={styles.actionButtonText}>Negociar Diretamente</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryAction]}
            onPress={() => Alert.alert("Localização", `Propriedade localizada em ${profile.farmAddress}. Coordenadas: ${profile.gateLatitude}, ${profile.gateLongitude}`)}
          >
            <Ionicons name="location" size={18} color={theme.colors.primary} />
            <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>Mapa</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{reviews.length}</Text>
            <Text style={styles.statLabel}>Vendas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{rating}</Text>
            <Text style={styles.statLabel}>Avaliação</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{profile.certificates.length || 0}</Text>
            <Text style={styles.statLabel}>Certificados</Text>
          </View>
        </View>
        <SurfaceCard style={styles.card}>
          <Text style={styles.sectionTitle}>Sobre o Produtor</Text>
          <Text style={styles.bioText}>{profile.bio}</Text>
        </SurfaceCard>

        <View style={styles.trustCard}>
          <Text style={styles.trustTitle}>Selo de Confiabilidade de Localização</Text>

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
              Última validação: {formatValidationTimestamp(profile.locationValidatedAt)}
            </Text>
          </View>
        </View>

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
                      </View>
                    </SurfaceCard>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </SurfaceCard>

        <SurfaceCard style={styles.card}>
          <Text style={styles.sectionTitle}>Qualidade e Fertilizantes</Text>
          <Text style={styles.bioText}>Confira insumos e estercagem disponíveis para parcerias ou venda direta nesta propriedade.</Text>
          <View style={{ marginTop: 12 }}>
            {profile.insumos.length === 0 ? (
              <Text style={styles.emptyText}>Sem insumos cadastrados.</Text>
            ) : null}
            {profile.insumos.map((item) => (
              <View key={item.id} style={styles.rowItem}>
                <Ionicons name="cube-outline" size={16} color={theme.colors.gray_400} />
                <Text style={[styles.itemTitle, { marginLeft: 8 }]}>{item.title}</Text>
                <Text style={styles.amount}>{item.amount}</Text>
              </View>
            ))}
          </View>
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

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
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
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    style={[styles.detailsNegotiateBtn, { flex: 1 }]}
                    onPress={() => {
                      const prod = selectedProduct;
                      setSelectedProduct(null);
                      const targetPath = currentUser?.role === "buyer" ? "/(buyer)/marketplace" : "/(tabs)/profile";
                      router.push({
                        pathname: targetPath as any,
                        params: { filterByVendor: prod.vendedor, highlight: prod.id },
                      });
                    }}
                  >
                    <Ionicons name="storefront-outline" size={20} color={theme.colors.white} />
                    <Text style={[styles.detailsNegotiateBtnText, { fontSize: 16 }]}>Ir para Mercado</Text>
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
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Hero Section
  heroContainer: {
    height: 160,
    width: "100%",
    position: "relative",
  },
  heroBanner: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  heroBackBtn: {
    position: "absolute",
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarOverlapContainer: {
    paddingHorizontal: 16,
    marginTop: -45,
    marginBottom: 8,
  },
  mainAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: theme.colors.white,
    backgroundColor: theme.colors.gray_100,
  },
  profileMainInfo: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  profileDisplayName: {
    fontSize: 22,
    fontWeight: "bold",
    color: theme.colors.gray_900,
  },
  profileFarmName: {
    fontSize: 14,
    color: theme.colors.gray_600,
    fontWeight: "500",
  },
  badgeRow: {
    flexDirection: "row",
    marginTop: 6,
    gap: 6,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.gray_100,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: theme.colors.gray_600,
    textTransform: "uppercase",
  },

  // Actions Row
  actionsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  actionButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  actionButtonText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },

  // Stats
  statsContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.white,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.gray_500,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: "60%",
    backgroundColor: theme.colors.gray_200,
    alignSelf: "center",
  },

  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.gray_900,
    marginBottom: 10,
  },
  bioText: {
    fontSize: 14,
    color: theme.colors.gray_700,
    lineHeight: 22,
  },

  trustCard: {
    marginTop: 12,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  trustTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 10,
  },
  trustRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  trustText: {
    fontSize: 12,
    color: theme.colors.gray_800,
  },

  photo: {
    width: 140,
    height: 100,
    borderRadius: 12,
    marginRight: 10,
  },

  rowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_100,
  },
  itemTitle: {
    color: theme.colors.gray_800,
    fontSize: 14,
    flex: 1,
  },
  amount: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: "bold",
  },

  emptyText: {
    color: theme.colors.gray_500,
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
  },

  cardWrapper: { width: "50%", height: 260, paddingHorizontal: 4, marginBottom: 8 },
  productCard: { flex: 1, backgroundColor: theme.colors.white, borderRadius: 12, overflow: "hidden", elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  imageContainer: { width: "100%", height: 130, backgroundColor: theme.colors.gray_100 },
  productImage: { width: "100%", height: "100%" },
  productTitle: { fontSize: 13, fontWeight: "600", color: theme.colors.gray_900, paddingHorizontal: 10, paddingTop: 10, paddingBottom: 4, lineHeight: 16 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 10, paddingTop: 6, marginTop: "auto", paddingBottom: 10 },
  priceSection: { flex: 1 },
  price: { fontSize: 15, fontWeight: "bold", color: theme.colors.primary },
  stock: { fontSize: 9, color: theme.colors.gray_500, marginTop: 2 },
  negotiateBtn: { backgroundColor: theme.colors.primary, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  negotiateBtnText: { color: theme.colors.white, fontWeight: "bold", fontSize: 10 },
  outOfStockBadge: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  outOfStockText: { color: theme.colors.white, fontWeight: "900", fontSize: 14, letterSpacing: 1, borderWidth: 2, borderColor: theme.colors.white, paddingHorizontal: 8, paddingVertical: 4, transform: [{ rotate: "-15deg" }] },
  negotiateBtnDisabled: { backgroundColor: theme.colors.gray_300 },
  organicBadge: { position: "absolute", top: 10, left: 10, backgroundColor: theme.colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  organicBadgeText: { color: theme.colors.white, fontSize: 9, fontWeight: "bold" },

  reviewItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_100,
  },
  reviewMeta: {
    fontSize: 12,
    color: theme.colors.gray_500,
    marginBottom: 2,
  },
  reviewStars: {
    fontSize: 14,
    color: theme.colors.orange_500,
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: theme.colors.gray_800,
    lineHeight: 18,
  },

  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 20,
    padding: 14,
    backgroundColor: "rgba(239, 68, 68, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.15)",
    borderRadius: 12,
    gap: 8,
  },
  reportButtonText: {
    color: theme.colors.red_500,
    fontSize: 14,
    fontWeight: "bold",
  },

  previewModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  closePreviewButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
  },

  // Modal Details
  detailsModalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  detailsModalContent: { backgroundColor: theme.colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, height: "88%", overflow: "hidden" },
  detailsCloseBtn: { position: "absolute", top: 16, right: 16, zIndex: 10, backgroundColor: theme.colors.white, borderRadius: 20, padding: 6, elevation: 4 },
  detailsImage: { width: "100%", height: 320 },
  detailsBody: { padding: 24 },
  detailsTitle: { fontSize: 24, fontWeight: "bold", color: theme.colors.gray_900, marginBottom: 8 },
  detailsPrice: { fontSize: 28, fontWeight: "900", color: theme.colors.primary, marginBottom: 20 },
  detailsVendorRow: { flexDirection: "row", alignItems: "center", marginBottom: 24, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: theme.colors.gray_100 },
  detailsVendorName: { fontSize: 17, color: theme.colors.gray_800, marginLeft: 10, fontWeight: "500" },
  certBox: { backgroundColor: "#F0FDF4", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.primary, marginBottom: 24 },
  certBoxTitle: { fontSize: 15, fontWeight: "bold", color: theme.colors.primary, marginBottom: 8 },
  certBoxItem: { fontSize: 14, color: theme.colors.gray_800, marginBottom: 4 },
  detailsStock: { fontSize: 14, color: theme.colors.gray_500, fontStyle: "italic" },
  detailsFooter: { padding: 20, paddingBottom: 40, borderTopWidth: 1, borderTopColor: theme.colors.gray_100, backgroundColor: theme.colors.white },
  detailsNegotiateBtn: { backgroundColor: theme.colors.orange_500, paddingVertical: 18, borderRadius: 12, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10 },
  detailsNegotiateBtnText: { color: theme.colors.white, fontSize: 17, fontWeight: "bold" },
  organicBadgeDetails: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 12 },
  bottomSpacer: { height: 40 },
});
