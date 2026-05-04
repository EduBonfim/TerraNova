import { AppHeader } from "@/components/AppHeader";
import { SurfaceCard } from "@/components/SurfaceCard";
import { useAuth } from "@/contexts/AuthContext";
import { getMarketplaceItems, MarketplaceOpportunity } from "@/services/marketplaceStore";
import { deleteListing } from "@/services/listingService";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StockControlScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [userProducts, setUserProducts] = useState<MarketplaceOpportunity[]>([]);

  // Filtrar produtos do usuário logado
  useFocusEffect(
    React.useCallback(() => {
      const loadUserProducts = async () => {
        if (user?.username) {
          const allItems = await getMarketplaceItems();
          const filtered = allItems.filter(
            (p) => p.vendedor === user.username || p.vendedor === user.farmName
          );
          setUserProducts(filtered);
        }
      };
      loadUserProducts();
    }, [user])
  );

  const handleDeleteProduct = (productId: string) => {
    Alert.alert(
      "Remover Produto",
      "Tem certeza que deseja remover este produto do seu estoque?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            // Se for um anúncio local (criado pelo usuário), deleta do storage
            if (productId.startsWith("listing-")) {
              await deleteListing(productId);
            }
            
            setUserProducts(userProducts.filter((p) => p.id !== productId));
            Alert.alert("Removido", "Produto removido do estoque");
          },
        },
      ]
    );
  };

  const totalProducts = userProducts.length;
  const totalQuantity = userProducts.reduce((sum, p) => sum + p.estoqueValor, 0);
  const outOfStock = userProducts.filter((p) => p.estoqueValor === 0).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />
      <AppHeader
        title="Controle de Estoque"
        subtitle="Gerencie seus produtos anunciados"
        onBackPress={() => router.back()}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.gray_200}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#E0E7FF" }]}>
              <Ionicons name="layers" size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.statLabel}>Produtos</Text>
            <Text style={styles.statValue}>{totalProducts}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="cube" size={24} color={theme.colors.orange_500} />
            </View>
            <Text style={styles.statLabel}>Quantidade</Text>
            <Text style={styles.statValue}>{totalQuantity}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#FEE2E2" }]}>
              <Ionicons name="alert" size={24} color={theme.colors.red_500} />
            </View>
            <Text style={styles.statLabel}>Sem Estoque</Text>
            <Text style={styles.statValue}>{outOfStock}</Text>
          </View>
        </View>

        {userProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name="layers"
                size={64}
                color={theme.colors.gray_400}
              />
            </View>
            <Text style={styles.emptyTitle}>Nenhum Produto</Text>
            <Text style={styles.emptyText}>
              Você não tem produtos anunciados ainda. Comece anunciando seus
              produtos no marketplace.
            </Text>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📦 Meus Produtos</Text>

            {userProducts.map((product) => (
              <View key={product.id} style={styles.productCard}>
                <SurfaceCard style={styles.card} bordered={false}>
                  <View style={styles.cardContent}>
                    <Image
                      source={{ uri: product.foto }}
                      style={styles.productImage}
                    />

                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={2}>
                        {product.produto}
                      </Text>

                      <View style={styles.detailsRow}>
                        <View style={styles.detail}>
                          <Text style={styles.detailLabel}>Categoria</Text>
                          <Text style={styles.detailValue}>
                            {product.subcategoria || product.categoria}
                          </Text>
                        </View>
                        <View style={styles.detail}>
                          <Text style={styles.detailLabel}>Preço</Text>
                          <Text style={styles.detailValue}>{product.preco}</Text>
                        </View>
                      </View>

                      <View
                        style={[
                          styles.stockBadge,
                          product.estoqueValor === 0 && styles.stockBadgeEmpty,
                        ]}
                      >
                        <Text
                          style={[
                            styles.stockText,
                            product.estoqueValor === 0 && styles.stockTextEmpty,
                          ]}
                        >
                          {product.estoqueValor === 0
                            ? "SEM ESTOQUE"
                            : `${product.estoqueValor} un`}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => router.push({ pathname: "/edit-product", params: { id: product.id } })}
                      >
                        <Ionicons
                          name="pencil-outline"
                          size={20}
                          color={theme.colors.primary}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeleteProduct(product.id)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color={theme.colors.red_500}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </SurfaceCard>
              </View>
            ))}
          </View>
        )}
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
  content: {
    paddingBottom: 24,
  },
  statsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: theme.colors.white,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.gray_600,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.gray_900,
    marginTop: 2,
  },
  emptyContainer: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.gray_200,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.gray_800,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.gray_600,
    textAlign: "center",
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 12,
  },
  productCard: {
    marginBottom: 12,
  },
  card: {
    padding: 0,
  },
  cardContent: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
    gap: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: theme.colors.gray_200,
    flexShrink: 0,
  },
  productInfo: {
    flex: 1,
    gap: 8,
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.gray_800,
    lineHeight: 16,
  },
  detailsRow: {
    flexDirection: "row",
    gap: 8,
  },
  detail: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: theme.colors.gray_600,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 11,
    color: theme.colors.gray_800,
    fontWeight: "600",
    marginTop: 2,
  },
  stockBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: "#ECFDF5",
    alignSelf: "flex-start",
  },
  stockBadgeEmpty: {
    backgroundColor: "#FEE2E2",
  },
  stockText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  stockTextEmpty: {
    color: theme.colors.red_500,
  },
  actions: {
    flexDirection: "column",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: theme.colors.gray_100,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    backgroundColor: "#FEE2E2",
  },
});
