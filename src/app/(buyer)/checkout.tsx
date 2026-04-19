import { AppHeader } from "@/components/AppHeader";
import { SurfaceCard } from "@/components/SurfaceCard";
import { useAuth } from "@/contexts/AuthContext";
import { clearCart, removeFromCart, updateCartQuantity, useCart } from "@/services/cartStore";
import { createOrder } from "@/services/ordersStore";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CheckoutScreen() {
  const router = useRouter();
  const { cartItems, totalValue, vendorName } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsProcessing(true);

    try {
      for (const item of cartItems) {
        await createOrder({
          vendedorUsername: item.vendedor,
          produto: item.produto,
          produtoId: item.id,
          quantidade: `${item.cartQuantity} unid.`,
          quantidadeNum: item.cartQuantity,
          valor: item.preco,
          valorNumerico: (parseFloat(item.preco.replace("R$", "").replace(/\./g, "").replace(",", ".")) || 0) * item.cartQuantity,
          data: new Date().toLocaleDateString("pt-BR"),
          comprador: user?.fullName || user?.username || "Comprador Local",
          status: "aguardando",
          categoria: item.categoria === "Mercado" ? "alimentos" : "insumos",
        });
      }

      await clearCart();
      Alert.alert("Pedido Finalizado!", "Seus pedidos foram enviados ao produtor para aprovação.", [
        { text: "Ver Meus Pedidos", onPress: () => router.push("/my-orders") }
      ]);
    } catch (e) {
      Alert.alert("Erro", "Ocorreu um erro ao processar seu pedido.");
    } finally {
      setIsProcessing(false);
    }
  };

  const removeItem = async (id: string) => {
    await removeFromCart(id);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <AppHeader
        title="Carrinho"
        subtitle={vendorName ? `Itens de ${vendorName}` : ""}
        onBackPress={() => router.back()}
        showBackButton
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
      />

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color={theme.colors.gray_300} />
          <Text style={styles.emptyTitle}>Seu carrinho está vazio</Text>
          <Text style={styles.emptySubtitle}>Explore o mercado e adicione produtos direto dos produtores rurais.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Voltar ao Mercado</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
            <Text style={styles.vendorHeader}>Fazenda Produtora: {vendorName}</Text>
            
            {cartItems.map((item) => (
              <SurfaceCard key={item.id} style={styles.itemCard}>
                <Image source={{ uri: item.foto }} style={styles.itemImage} resizeMode="cover" />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={2}>{item.produto}</Text>

                  {/* Checklist Data */}
                  <View style={styles.checklistBadgeRow}>
                    <Ionicons name={item.tipoCertificacao === "Organico" ? "leaf" : "checkmark-circle"} size={10} color={theme.colors.primary} />
                    <Text style={styles.checklistItemDetail}>
                      [ {item.tipoCertificacao} ] Lote: {item.loteCodigo || "Padrão"}
                    </Text>
                  </View>

                  <Text style={styles.itemPrice}>{item.preco} (cada)</Text>
                </View>
                
                <View style={{ flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
                  <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(item.id)}>
                    <Ionicons name="trash-outline" size={20} color={theme.colors.red_500} />
                  </TouchableOpacity>

                  <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.gray_100, borderRadius: 6, overflow: "hidden" }}>
                    <TouchableOpacity onPress={() => updateCartQuantity(item.id, item.cartQuantity - 1)} style={{ padding: 6, backgroundColor: theme.colors.white, borderWidth: 1, borderColor: theme.colors.gray_200, borderRadius: 6 }}>
                      <Ionicons name="remove" size={14} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <View style={{ paddingHorizontal: 10 }}>
                      <Text style={{ fontWeight: "bold", fontSize: 14 }}>{item.cartQuantity}</Text>
                    </View>
                    <TouchableOpacity onPress={() => updateCartQuantity(item.id, item.cartQuantity + 1)} style={{ padding: 6, backgroundColor: theme.colors.primary, borderRadius: 6 }}>
                      <Ionicons name="add" size={14} color={theme.colors.white} />
                    </TouchableOpacity>
                  </View>
                </View>
              </SurfaceCard>
            ))}

            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>Resumo do Pedido</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{totalValue}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Frete / Logística</Text>
                <Text style={styles.summaryAdvice}>A combinar direto com vendedor</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                <Text style={styles.summaryTotalLabel}>Total Previsto</Text>
                <Text style={styles.summaryTotalValue}>{totalValue}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: 24 }]}>
            <TouchableOpacity 
              style={[styles.checkoutBtn, isProcessing && styles.checkoutBtnDisabled, { marginBottom: 10 }]} 
              onPress={handleCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <>
                  <Text style={styles.checkoutBtnText}>Confirmar Pedido</Text>
                  <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.white} style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>

            {cartItems.length > 0 && (
              <TouchableOpacity 
                style={[styles.checkoutBtn, { backgroundColor: "#BEE3F8", elevation: 0 }]} 
                onPress={() => {
                  router.push({
                    pathname: "/messages",
                    params: { sellerName: cartItems[0].vendedor, productName: "Cesta de Produtos" },
                  });
                }}
              >
                <Text style={[styles.checkoutBtnText, { color: theme.colors.primary }]}>Negociar com Produtor</Text>
                <Ionicons name="chatbubbles-outline" size={20} color={theme.colors.primary} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: theme.colors.gray_800, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: theme.colors.gray_500, textAlign: "center", marginTop: 8 },
  backBtn: { marginTop: 24, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: theme.colors.primary, borderRadius: 8 },
  backBtnText: { color: theme.colors.white, fontWeight: "bold" },
  scrollView: { flex: 1, padding: 16 },
  vendorHeader: { fontSize: 14, fontWeight: "bold", color: theme.colors.primary, marginBottom: 12 },
  itemCard: { flexDirection: "row", alignItems: "center", padding: 12, marginBottom: 12, borderRadius: 8 },
  itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: "600", color: theme.colors.gray_900 },
  checklistBadgeRow: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(34, 197, 94, 0.1)", alignSelf: "flex-start", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4, marginBottom: 2 },
  checklistItemDetail: { fontSize: 10, color: theme.colors.primary, marginLeft: 4, fontWeight: "600" },
  itemPrice: { fontSize: 13, color: theme.colors.primary, marginTop: 2 },
  itemQuantity: { fontSize: 12, color: theme.colors.gray_600, marginTop: 4 },
  removeBtn: { padding: 8 },
  summaryBox: { backgroundColor: theme.colors.white, padding: 16, borderRadius: 8, marginTop: 16, marginBottom: 40, elevation: 1 },
  summaryTitle: { fontSize: 16, fontWeight: "bold", color: theme.colors.gray_900, marginBottom: 12 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryLabel: { color: theme.colors.gray_600 },
  summaryValue: { color: theme.colors.gray_900, fontWeight: "500" },
  summaryAdvice: { color: theme.colors.orange_500, fontStyle: "italic", fontSize: 12 },
  summaryTotalRow: { borderTopWidth: 1, borderTopColor: theme.colors.gray_200, paddingTop: 12, marginTop: 4 },
  summaryTotalLabel: { fontSize: 16, fontWeight: "bold", color: theme.colors.gray_900 },
  summaryTotalValue: { fontSize: 18, fontWeight: "bold", color: theme.colors.primary },
  footer: { padding: 16, backgroundColor: theme.colors.white, borderTopWidth: 1, borderTopColor: theme.colors.gray_200 },
  checkoutBtn: { backgroundColor: theme.colors.primary, flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 16, borderRadius: 8 },
  checkoutBtnDisabled: { backgroundColor: theme.colors.gray_400 },
  checkoutBtnText: { color: theme.colors.white, fontSize: 16, fontWeight: "bold" },
});
