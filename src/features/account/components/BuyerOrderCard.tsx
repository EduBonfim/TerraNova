import { type Order } from "@/services/ordersStore";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
    CATEGORIA_LABELS,
    STATUS_COLORS,
    STATUS_ICONS,
} from "../utils/orderConstants";

interface BuyerOrderCardProps {
  item: Order;
}

export function BuyerOrderCard({ item }: BuyerOrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const color = STATUS_COLORS[item.status] || theme.colors.orange_500;

  return (
    <TouchableOpacity
      style={[styles.orderCard, { borderLeftColor: color }]}
      onPress={() => setExpanded((v) => !v)}
      activeOpacity={0.75}
    >
      <View style={styles.orderCardMain}>
        <View
          style={[styles.orderStatusIcon, { backgroundColor: color + "20" }]}
        >
          <Ionicons
            name={STATUS_ICONS[item.status] as never}
            size={18}
            color={color}
          />
        </View>
        <View style={styles.orderInfo}>
          <Text style={styles.orderProduct} numberOfLines={1}>
            {item.produto}
          </Text>
          <Text style={styles.orderBuyer}>🏪 {item.vendedorUsername}</Text>
        </View>
        <View style={styles.orderRight}>
          <Text style={[styles.price, { color }]}>{item.valor}</Text>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={14}
            color={theme.colors.gray_400}
            style={{ marginTop: 4 }}
          />
        </View>
      </View>
      {expanded && (
        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Ionicons
              name="calendar-outline"
              size={13}
              color={theme.colors.gray_500}
            />
            <Text style={styles.detailText}>Data: {item.data}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons
              name="cube-outline"
              size={13}
              color={theme.colors.gray_500}
            />
            <Text style={styles.detailText}>Quantidade: {item.quantidade}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons
              name="pricetag-outline"
              size={13}
              color={theme.colors.gray_500}
            />
            <Text style={styles.detailText}>
              Categoria: {CATEGORIA_LABELS[item.categoria] || item.categoria}
            </Text>
          </View>
          {item.transportadora && (
            <View style={styles.detailRow}>
              <Ionicons
                name="car-outline"
                size={13}
                color={theme.colors.gray_500}
              />
              <Text style={styles.detailText}>
                Transportadora: {item.transportadora}
              </Text>
            </View>
          )}
          <View style={[styles.detailRow, { marginTop: 4 }]}>
            <View
              style={[styles.statusChip, { backgroundColor: color + "20" }]}
            >
              <Text style={[styles.statusChipText, { color }]}>
                {item.status === "aguardando" && "Em Preparo"}
                {item.status === "transporte" && "A Caminho"}
                {item.status === "finalizado" && "Entregue"}
              </Text>
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  orderCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 14,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  orderCardMain: { flexDirection: "row", alignItems: "center", gap: 10 },
  orderStatusIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  orderInfo: { flex: 1 },
  orderProduct: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.gray_800,
  },
  orderBuyer: { fontSize: 12, color: theme.colors.gray_500, marginTop: 2 },
  orderRight: { alignItems: "flex-end" },
  price: { fontSize: 14, fontWeight: "700" },
  orderDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray_100,
    gap: 6,
  },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  detailText: { fontSize: 12, color: theme.colors.gray_600 },
  statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusChipText: { fontSize: 11, fontWeight: "700" },
});
