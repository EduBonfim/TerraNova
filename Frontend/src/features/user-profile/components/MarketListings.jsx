import { SurfaceCard } from "@/components/SurfaceCard";
import { profileStyles as styles } from "@/features/user-profile/styles/user-profile.styles";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export function MarketListings({ userListings, onSelectProduct }) {
  return (
    <SurfaceCard style={styles.card}>
      <Text style={styles.sectionTitle}>Itens à venda</Text>
      {userListings.length === 0 ? (
        <Text style={styles.emptyText}>Sem itens disponíveis no mercado.</Text>
      ) : (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginHorizontal: -4,
          }}
        >
          {userListings.map((item) => (
            <View key={item.id} style={styles.cardWrapper}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={{ flex: 1 }}
                onPress={() => onSelectProduct(item)}
              >
                <SurfaceCard style={styles.productCard}>
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

                  <View style={styles.footer}>
                    <View style={styles.priceSection}>
                      <Text style={styles.price}>{item.preco}</Text>
                      <Text style={styles.stock} numberOfLines={1}>
                        {item.estoque}
                      </Text>
                    </View>
                  </View>
                </SurfaceCard>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </SurfaceCard>
  );
}
