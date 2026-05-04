import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Image, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { appTheme as theme } from "@/theme/appTheme";
import { profileStyles as styles } from "@/features/user-profile/styles/user-profile.styles";

interface ProductDetailsModalProps {
  selectedProduct: any | null;
  currentUserRole: string | undefined;
  onClose: () => void;
  onNavigateToMarket: (product: any) => void;
}

export function ProductDetailsModal({
  selectedProduct,
  currentUserRole,
  onClose,
  onNavigateToMarket,
}: ProductDetailsModalProps) {
  return (
    <Modal visible={Boolean(selectedProduct)} transparent animationType="slide">
      <View style={styles.detailsModalOverlay}>
        <View style={styles.detailsModalContent}>
          <TouchableOpacity style={styles.detailsCloseBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color={theme.colors.gray_800} />
          </TouchableOpacity>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
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
                    <Text style={styles.certBoxItem}>
                      Registro MAPA: {selectedProduct.numeroRegistro}
                    </Text>
                  )}
                </View>
              )}

              <Text style={styles.detailsStock}>
                Estoque disponível: {selectedProduct?.estoque}
              </Text>

              {selectedProduct?.descricao && (
                <View style={styles.descriptionBox}>
                  <Text style={styles.descriptionTitle}>Descrição do Produto</Text>
                  <Text style={styles.detailsDescriptionText}>
                    {selectedProduct.descricao}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.detailsFooter}>
            {selectedProduct?.estoqueValor === 0 ? (
              <TouchableOpacity
                style={[styles.detailsNegotiateBtn, styles.negotiateBtnDisabled]}
                disabled
              >
                <Text style={styles.detailsNegotiateBtnText}>Produto Indisponível</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  style={[styles.detailsNegotiateBtn, { flex: 1 }]}
                  onPress={() => onNavigateToMarket(selectedProduct)}
                >
                  <Ionicons name="storefront-outline" size={20} color={theme.colors.white} />
                  <Text style={[styles.detailsNegotiateBtnText, { fontSize: 16 }]}>
                    Ir para Mercado
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
