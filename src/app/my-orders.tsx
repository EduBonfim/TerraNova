import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useAccountLogic } from "@/features/account/hooks/useAccountLogic";
import { ordersStyles as styles } from "@/styles/ordersAndMetricsStyles";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyOrdersScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type?: "sales" | "purchases" }>();
  const { user } = useAuth();
  
  const isBuyerMode = user?.role === "buyer" || type === "purchases";
  const { myOrders, selectedOrderTab, setSelectedOrderTab } = useAccountLogic({ mode: isBuyerMode ? "purchases" : "sales" });

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  if (!user) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.primary,
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={theme.colors.white} />
      </View>
    );
  }

  const isBuyer = isBuyerMode;
  const ordersList = myOrders[selectedOrderTab] || [];

  const groupedOrders = useMemo(() => {
    const groups: Record<string, typeof ordersList> = {};
    ordersList.forEach((order) => {
      const party = isBuyer ? order.vendedorUsername : order.comprador;
      const key = `${order.data}_${party}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(order);
    });

    // Converter data DD/MM/YYYY para Date para ordenação correta
    const parseDate = (dateStr: string) => {
      const [day, month, year] = dateStr.split("/").map(Number);
      return new Date(year, month - 1, day);
    };

    return Object.entries(groups)
      .map(([key, items]) => {
        const party = isBuyer ? items[0].vendedorUsername : items[0].comprador;
        const data = items[0].data;
        const totalValue = items.reduce(
          (acc, current) => acc + current.valorNumerico,
          0,
        );
        const transportadora = items.find(
          (i) => i.transportadora,
        )?.transportadora;

        return {
          id: `COMPRA_${key}`,
          displayId: data, // Usar data em vez de número
          data,
          party,
          items,
          totalValue,
          transportadora,
          dateObj: parseDate(data), // Para ordenação
        };
      })
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime()); // Do mais recente para mais antigo
  }, [ordersList, isBuyer]);

  const toggleExpand = (id: string) => {
    setExpandedOrderId((prev) => (prev === id ? null : id));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />
      <AppHeader
        title={isBuyer ? "Meus Pedidos" : "Minhas Vendas"}
        onBackPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.navigate(
              isBuyer ? "/(buyer)/account" : "/(producer)/account",
            );
          }
        }}
        showBackButton={true}
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
              size={16}
              color={
                selectedOrderTab === tab
                  ? theme.colors.primary
                  : theme.colors.gray_500
              }
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
          {groupedOrders.map((group) => {
            const isExpanded = expandedOrderId === group.id;
            const formattedTotal = `R$ ${group.totalValue
              .toFixed(2)
              .replace(".", ",")}`;

            return (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.orderCard,
                  isExpanded && styles.orderCardExpanded,
                ]}
                onPress={() => toggleExpand(group.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.orderCardHeader,
                    isExpanded && styles.orderCardHeaderExpanded,
                  ]}
                >
                  <View style={styles.orderLeftCol}>
                    <Text style={styles.orderCardId}>
                      {isBuyer ? "COMPRA" : "VENDA"} - {group.displayId}
                    </Text>
                    <Text style={styles.orderCardProduct} numberOfLines={1}>
                      {group.party}
                    </Text>
                    <View style={{ marginTop: 8 }}>
                      <StatusBadge status={selectedOrderTab} size="sm" />
                    </View>
                  </View>
                  <View style={styles.orderRightCol}>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.orderCardValue}>
                        {formattedTotal}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: theme.colors.gray_500,
                          marginTop: 2,
                        }}
                      >
                        {group.items.length} item(ns)
                      </Text>
                    </View>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={20}
                      color={theme.colors.primary}
                    />
                  </View>
                </View>

                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <View style={styles.orderCardDetails}>
                      <View style={styles.orderDetail}>
                        <Ionicons
                          name="cube-outline"
                          size={14}
                          color={theme.colors.primary}
                        />
                        <Text style={styles.orderDetailText}>
                          {group.items.length} item(ns)
                        </Text>
                      </View>
                      <View style={styles.orderDetail}>
                        <Ionicons
                          name="calendar-outline"
                          size={14}
                          color={theme.colors.primary}
                        />
                        <Text style={styles.orderDetailText}>{group.data}</Text>
                      </View>
                    </View>

                    <View style={styles.groupedItemsList}>
                      {group.items.map((item, index) => (
                        <View
                          key={item.id}
                          style={[
                            styles.groupedItemRow,
                            index === group.items.length - 1 && {
                              borderBottomWidth: 0,
                            },
                          ]}
                        >
                          <Text style={styles.groupedItemQtd}>
                            {item.quantidade}
                          </Text>
                          <Text
                            style={styles.groupedItemName}
                            numberOfLines={2}
                          >
                            {item.produto}
                          </Text>
                          <Text style={styles.groupedItemValue}>
                            {item.valor}
                          </Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.orderCardFooter}>
                      <Text style={styles.orderBuyer}>
                        {selectedOrderTab === "transporte"
                          ? "Transportadora: "
                          : isBuyer
                          ? "Vendedor: "
                          : "Comprador: "}
                        <Text style={styles.orderBuyerBold}>
                          {selectedOrderTab === "transporte" &&
                          group.transportadora
                            ? group.transportadora
                            : group.party}
                        </Text>
                      </Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {groupedOrders.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons
                name="bag-outline"
                size={64}
                color={theme.colors.gray_300}
              />
              <Text style={styles.emptyStateText}>
                {isBuyer
                  ? "Nenhum pedido nesta categoria"
                  : "Nenhuma venda nesta categoria"}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {isBuyer
                  ? "Seus pedidos aparecerão aqui assim que forem realizados."
                  : "Suas vendas aparecerão aqui assim que forem realizadas."}
              </Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
