import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AppHeader } from "@/components/AppHeader";
import { useAccountLogic } from "@/features/account/hooks/useAccountLogic";
import { appTheme as theme } from "@/theme/appTheme";

export default function MyOrdersScreen() {
  const router = useRouter();
  const { 
    myOrders, 
    selectedOrderTab, 
    setSelectedOrderTab 
  } = useAccountLogic();

  const ordersList = myOrders[selectedOrderTab] || [];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <AppHeader
        title="Minhas Vendas"
        onBackPress={() => router.back()}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.primary}
      />

      <View style={styles.orderTabsContainer}>
        {(["aguardando", "transporte", "finalizado"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.orderTab,
              selectedOrderTab === tab && styles.orderTabActive,
            ]}
            onPress={() => setSelectedOrderTab(tab)}
          >
            <Ionicons
              name={
                tab === "aguardando" 
                  ? "time-outline" 
                  : tab === "transporte" 
                  ? "car-outline" 
                  : "checkmark-circle-outline"
              }
              size={18}
              color={selectedOrderTab === tab ? theme.colors.white : theme.colors.gray_500}
            />
            <Text
              style={[
                styles.orderTabText,
                selectedOrderTab === tab && styles.orderTabTextActive,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        <View style={styles.ordersListContainer}>
          {ordersList.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderCardHeader}>
                <View>
                  <Text style={styles.orderCardId}>Pedido #{order.id}</Text>
                  <Text style={styles.orderCardProduct}>{order.produto}</Text>
                </View>
                <Text style={styles.orderCardValue}>{order.valor}</Text>
              </View>

              <View style={styles.orderCardDetails}>
                <View style={styles.orderDetail}>
                  <Ionicons name="cube-outline" size={16} color={theme.colors.primary} />
                  <Text style={styles.orderDetailText}>{order.quantidade}</Text>
                </View>
                <View style={styles.orderDetail}>
                  <Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />
                  <Text style={styles.orderDetailText}>{order.data}</Text>
                </View>
              </View>

              <View style={styles.orderCardFooter}>
                <Text style={styles.orderBuyer}>
                  {selectedOrderTab === "transporte" ? "Transportadora: " : "Comprador: "}
                  {selectedOrderTab === "transporte" && "transportadora" in order 
                    ? (order as any).transportadora 
                    : (order as any).comprador}
                </Text>
              </View>
            </View>
          ))}

          {ordersList.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="bag-outline" size={64} color={theme.colors.gray_300} />
              <Text style={styles.emptyStateText}>Nenhuma venda nesta categoria</Text>
              <Text style={styles.emptyStateSubtext}>Suas vendas aparecerão aqui assim que forem realizadas.</Text>
            </View>
          )}
          
          <View style={{ height: 40 }} />
        </View>
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
  orderTabsContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
    gap: 8,
  },
  orderTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
  },
  orderTabActive: {
    backgroundColor: theme.colors.primary,
  },
  orderTabText: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.colors.gray_500,
  },
  orderTabTextActive: {
    color: theme.colors.white,
  },
  ordersListContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
  },
  orderCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderCardId: {
    fontSize: 11,
    color: theme.colors.gray_500,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  orderCardProduct: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginTop: 2,
  },
  orderCardValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  orderCardDetails: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_100,
  },
  orderDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  orderDetailText: {
    fontSize: 13,
    color: theme.colors.gray_500,
  },
  orderCardFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderBuyer: {
    fontSize: 13,
    color: theme.colors.gray_500,
    fontStyle: "italic",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  emptyStateSubtext: {
    marginTop: 8,
    fontSize: 13,
    color: theme.colors.gray_500,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
