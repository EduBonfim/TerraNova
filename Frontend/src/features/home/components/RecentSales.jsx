import React, { useRef } from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import { homeStyles as styles } from "@/features/home/styles/home.styles";

const SCREEN_WIDTH = Dimensions.get("window").width;

export function RecentSales({ recentSales }) {
  const salesCarouselRef = useRef(null);

  if (recentSales.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📦 Últimas Vendas</Text>
      <ScrollView
        ref={salesCarouselRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: 0 }}
        style={styles.salesCarouselScroll}
      >
        {recentSales.map((sale) => (
          <View
            key={sale.id}
            style={[styles.saleCard, { width: SCREEN_WIDTH - 48 }]}
          >
            <View style={styles.saleHeader}>
              <View style={styles.saleInfo}>
                <Text style={styles.saleProductName} numberOfLines={1}>
                  {sale.productName}
                </Text>
                <Text style={styles.saleBuyerName} numberOfLines={1}>
                  {sale.buyerName}
                </Text>
              </View>
              <View
                style={[
                  styles.saleStatusBadge,
                  sale.status === "completed" && styles.saleStatusCompleted,
                  sale.status === "pending" && styles.saleStatusPending,
                  sale.status === "cancelled" && styles.saleStatusCancelled,
                ]}
              >
                <Text style={styles.saleStatusText}>
                  {sale.status === "completed"
                    ? "✓ Concluída"
                    : sale.status === "pending"
                    ? "⏳ Pendente"
                    : "✕ Cancelada"}
                </Text>
              </View>
            </View>

            <View style={styles.saleBody}>
              <View style={styles.saleDetail}>
                <Text style={styles.saleDetailLabel}>Quantidade</Text>
                <Text style={styles.saleDetailValue}>{sale.quantity} un</Text>
              </View>
              <View style={styles.saleDivider} />
              <View style={styles.saleDetail}>
                <Text style={styles.saleDetailLabel}>Total</Text>
                <Text style={styles.saleDetailValue}>
                  R$ {sale.totalPrice.toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.saleFooter}>
              <Text style={styles.saleDateText}>{sale.date}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
