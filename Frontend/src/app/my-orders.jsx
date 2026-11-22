import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useAccountLogic } from "@/features/account/hooks/useAccountLogic";
import { getProfileSummary } from "@/services/communityStore";
import { MARKETPLACE_OPPORTUNITIES } from "@/services/marketplaceStore";
import {
  confirmShipment,
  confirmReceipt,
  cancelOrder,
  submitBuyerReview,
  submitSellerReview,
} from "@/services/ordersStore";
import { ordersStyles as styles } from "@/styles/ordersAndMetricsStyles";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import {
  useLocalSearchParams,
  useGlobalSearchParams,
  useRouter,
} from "expo-router";
import { useMemo, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyOrdersScreen() {
  const router = useRouter();
  const localParams = useLocalSearchParams();
  const globalParams = useGlobalSearchParams();
  const type = localParams.type || globalParams.type;

  const { user } = useAuth();
  const actualType = Array.isArray(type) ? type[0] : type;
  const isBuyerMode = actualType
    ? actualType === "purchases"
    : user?.role === "buyer";
  const {
    myOrders,
    selectedOrderTab,
    setSelectedOrderTab,
    refreshProfileData,
  } = useAccountLogic({ mode: isBuyerMode ? "purchases" : "sales" });

  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Lógica para destacar um pedido específico com base nos parâmetros da URL
  useEffect(() => {
    const targetOrderId =
      localParams.highlight ||
      globalParams.highlight ||
      localParams.id ||
      globalParams.id;
    if (!targetOrderId) return;

    const targetIdStr = String(targetOrderId);
    const allStatuses = ["aguardando", "transporte", "finalizado"];
    for (const tab of allStatuses) {
      const foundOrder = (myOrders[tab] || []).find(
        (o) => String(o.id) === targetIdStr
      );
      if (foundOrder) {
        if (selectedOrderTab !== tab) {
          setSelectedOrderTab(tab);
        }
        if (
          expandedOrderId === null ||
          String(expandedOrderId) !== targetIdStr
        ) {
          setExpandedOrderId(targetIdStr);
        }
        break;
      }
    }
  }, [
    localParams.highlight,
    globalParams.highlight,
    localParams.id,
    globalParams.id,
    myOrders,
    selectedOrderTab,
    expandedOrderId,
  ]);

  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [_targetSeller, setTargetSeller] = useState("");
  const [_targetItemName, setTargetItemName] = useState("");
  const [targetOrderId, setTargetOrderId] = useState(null);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [reviewedOrderIds, setReviewedOrderIds] = useState(new Set());

  // Pré-popular reviewedOrderIds com base nas avaliações salvas no backend
  useEffect(() => {
    const evaluatedIds = new Set();
    const allStatuses = ["aguardando", "transporte", "finalizado"];

    allStatuses.forEach((tab) => {
      const orders = myOrders[tab] || [];
      orders.forEach((order) => {
        if (isBuyerMode) {
          if (order.compradorAvaliou) {
            evaluatedIds.add(String(order.id));
          }
        } else {
          if (order.vendedorAvaliou) {
            evaluatedIds.add(String(order.id));
          }
        }
      });
    });

    // Vacina contra loop infinito de render: só atualiza o estado se o conteúdo do Set mudou de fato
    const hasChanged =
      evaluatedIds.size !== reviewedOrderIds.size ||
      [...evaluatedIds].some((id) => !reviewedOrderIds.has(String(id)));
    if (hasChanged) {
      setReviewedOrderIds(evaluatedIds);
    }
  }, [myOrders, isBuyerMode, reviewedOrderIds]);

  const submitOrderReview = async () => {
    if (!targetOrderId || stars === 0) {
      Alert.alert("Erro", "Por favor, selecione uma nota");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const isBuyer = isBuyerMode;
      let result;

      if (isBuyer) {
        result = await submitBuyerReview(targetOrderId, stars, comment.trim());
      } else {
        result = await submitSellerReview(targetOrderId, stars, comment.trim());
      }

      // Marca como avaliado — tanto em caso de sucesso quanto de "já avaliou"
      setReviewedOrderIds((prev) => new Set([...prev, targetOrderId]));
      setReviewModalVisible(false);
      setComment("");
      setStars(5);
      setTargetSeller("");
      setTargetItemName("");
      setTargetOrderId(null);

      if (!result?.alreadyReviewed) {
        // Só mostra o alert de sucesso se foi uma avaliação nova
        Alert.alert(
          "Sucesso",
          isBuyer
            ? "Sua avaliação do vendedor foi publicada!"
            : "Sua avaliação do comprador foi publicada!"
        );
        await refreshProfileData();
      }
    } catch (error) {
      Alert.alert("Erro", error.message || "Falha ao enviar avaliação");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleConfirmSale = (group) => {
    if (isProcessingAction) return;
    Alert.alert(
      "Confirmar Envio",
      "Deseja confirmar o envio deste pedido para o comprador?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            setIsProcessingAction(true);
            try {
              await confirmShipment(group.id);
              Alert.alert(
                "Sucesso",
                "Envio confirmado! Comprador será notificado."
              );
              await refreshProfileData();
              setSelectedOrderTab("transporte");
            } catch (error) {
              Alert.alert("Erro", error.message || "Falha ao confirmar envio");
            } finally {
              setIsProcessingAction(false);
            }
          },
        },
      ]
    );
  };

  const handleConfirmReceipt = (group) => {
    if (isProcessingAction) return;
    Alert.alert(
      "Confirmar Recebimento",
      "Confirma que recebeu o pedido em perfeito estado?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            setIsProcessingAction(true);
            try {
              await confirmReceipt(group.id);
              Alert.alert(
                "Sucesso",
                "Recebimento confirmado! Agora você pode avaliar o vendedor."
              );
              await refreshProfileData();
              setSelectedOrderTab("finalizado");
            } catch (error) {
              Alert.alert(
                "Erro",
                error.message || "Falha ao confirmar recebimento"
              );
            } finally {
              setIsProcessingAction(false);
            }
          },
        },
      ]
    );
  };

  const handleCancelOrder = (group) => {
    if (isProcessingAction) return;
    Alert.alert(
      "Cancelar Pedido",
      "Tem certeza que deseja cancelar este pedido? O vendedor será notificado.",
      [
        { text: "Manter", style: "cancel" },
        {
          text: "Cancelar Pedido",
          onPress: async () => {
            setIsProcessingAction(true);
            try {
              await cancelOrder(group.id, "Solicitação do comprador");
              Alert.alert("Sucesso", "Pedido cancelado.");
              await refreshProfileData();
              // Se o pedido cancelado estava em "aguardando", permanece na aba, mas se estava em "transporte", volta para "aguardando"
            } catch (error) {
              Alert.alert("Erro", error.message || "Falha ao cancelar pedido");
            } finally {
              setIsProcessingAction(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

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
    const groups = {};
    ordersList.forEach((order) => {
      const _party = isBuyer ? order.vendedorUsername : order.comprador;
      // Usa o ID do pedido como chave para não misturar compras diferentes no mesmo dia
      const key = order.id;
      if (!groups[key]) groups[key] = [];
      groups[key].push(order);
    });

    // Converter data DD/MM/YYYY para Date como fallback para dados locais/legados
    const parseDate = (dateStr) => {
      if (!dateStr) return new Date(0);
      const [day, month, year] = dateStr.split("/").map(Number);
      return new Date(year, month - 1, day);
    };

    return Object.entries(groups)
      .map(([key, items]) => {
        const party = isBuyer ? items[0].vendedorUsername : items[0].comprador;
        const data = items[0].data;
        const rawTimestamp = items[0].rawTimestamp;
        const totalValue = items.reduce(
          (acc, current) => acc + current.valorNumerico,
          0
        );
        const totalItemsCount = items.reduce(
          (acc, current) => acc + (current.quantidadeNum || 1),
          0
        );
        const transportadora = items.find(
          (i) => i.transportadora
        )?.transportadora;

        // Prioriza o timestamp completo do backend para ordenação precisa
        const sortDate = rawTimestamp
          ? new Date(rawTimestamp)
          : parseDate(data);

        return {
          id: key,
          displayId: data,
          data,
          rawTimestamp,
          party,
          partyDisplayName: isBuyer
            ? MARKETPLACE_OPPORTUNITIES.find(
                (p) => p.vendedorUsername === party
              )?.vendedorNome ||
              getProfileSummary(party)?.farmName ||
              party
            : getProfileSummary(party)?.displayName || party,
          items,
          totalItemsCount,
          totalValue,
          transportadora,
          dateObj: sortDate,
        };
      })
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime()); // Do mais recente para mais antigo
  }, [ordersList, isBuyer]);

  const toggleExpand = (id) => {
    setExpandedOrderId((prev) => (prev === id ? null : id));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />
      <AppHeader
        title={isBuyer ? "Minhas Compras" : "Minhas Vendas"}
        onBackPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.navigate(
              isBuyer ? "/(buyer)/account" : "/(producer)/account"
            );
          }
        }}
        showBackButton={true}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.primary}
      />

      <View style={styles.orderTabsContainer}>
        {["aguardando", "transporte", "finalizado"].map((tab) => (
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
          {selectedOrderTab === "aguardando" &&
            !isBuyer &&
            groupedOrders.length > 0 && (
              <View
                style={{
                  backgroundColor: theme.colors.orange_50,
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  borderWidth: 1,
                  borderColor: theme.colors.orange_200,
                }}
              >
                <Ionicons
                  name="alert-circle"
                  size={20}
                  color={theme.colors.orange_500}
                />
                <Text
                  style={{
                    flex: 1,
                    color: theme.colors.orange_700,
                    fontSize: 13,
                    fontWeight: "500",
                  }}
                >
                  Você tem {groupedOrders.length} pedido(s) aguardando sua
                  confirmação.
                </Text>
              </View>
            )}

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
                      {group.partyDisplayName}
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
                        {group.items.length} produto(s) •{" "}
                        {group.totalItemsCount} unid.
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
                          {group.items.length} produto(s) •{" "}
                          {group.totalItemsCount} unid.
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

                    <View
                      style={[
                        styles.groupedItemsList,
                        {
                          padding: 12,
                          backgroundColor: theme.colors.gray_50,
                          borderRadius: 8,
                        },
                      ]}
                    >
                      {/* Cabeçalho da Tabela */}
                      <View
                        style={{
                          flexDirection: "row",
                          borderBottomWidth: 1,
                          borderBottomColor: theme.colors.gray_200,
                          paddingBottom: 8,
                          marginBottom: 8,
                        }}
                      >
                        <Text
                          style={{
                            width: 35,
                            fontSize: 12,
                            fontWeight: "bold",
                            color: theme.colors.gray_600,
                          }}
                        >
                          Item
                        </Text>
                        <Text
                          style={{
                            flex: 1,
                            fontSize: 12,
                            fontWeight: "bold",
                            color: theme.colors.gray_600,
                          }}
                        >
                          Descrição
                        </Text>
                        <Text
                          style={{
                            width: 60,
                            fontSize: 12,
                            fontWeight: "bold",
                            color: theme.colors.gray_600,
                            textAlign: "center",
                          }}
                        >
                          Quant
                        </Text>
                        <Text
                          style={{
                            width: 70,
                            fontSize: 12,
                            fontWeight: "bold",
                            color: theme.colors.gray_600,
                            textAlign: "right",
                          }}
                        >
                          Valor
                        </Text>
                      </View>

                      {/* Linhas da Tabela */}
                      {group.items.map((item, index) => {
                        const qtdLabel =
                          item.quantidade &&
                          item.quantidade.toString().match(/[a-zA-Z]/)
                            ? item.quantidade
                            : `${item.quantidade} unid`;

                        return (
                          <View
                            key={`${item.id}_${index}`}
                            style={{
                              flexDirection: "row",
                              paddingVertical: 6,
                              alignItems: "center",
                            }}
                          >
                            <Text
                              style={{
                                width: 35,
                                fontSize: 12,
                                color: theme.colors.gray_800,
                              }}
                            >
                              {index + 1}
                            </Text>
                            <Text
                              style={{
                                flex: 1,
                                fontSize: 12,
                                color: theme.colors.gray_800,
                              }}
                              numberOfLines={2}
                            >
                              {item.produto}
                            </Text>
                            <Text
                              style={{
                                width: 60,
                                fontSize: 12,
                                color: theme.colors.gray_800,
                                textAlign: "center",
                              }}
                            >
                              {qtdLabel}
                            </Text>
                            <Text
                              style={{
                                width: 70,
                                fontSize: 12,
                                color: theme.colors.gray_800,
                                textAlign: "right",
                              }}
                            >
                              {item.valor}
                            </Text>
                          </View>
                        );
                      })}

                      {/* Total */}
                      <View
                        style={{
                          flexDirection: "row",
                          borderTopWidth: 1,
                          borderTopColor: theme.colors.gray_300,
                          paddingTop: 10,
                          marginTop: 8,
                          justifyContent: "flex-end",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "bold",
                            color: theme.colors.gray_800,
                            marginRight: 10,
                          }}
                        >
                          Total:
                        </Text>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "bold",
                            color: theme.colors.primary,
                            minWidth: 70,
                            textAlign: "right",
                          }}
                        >
                          {formattedTotal}
                        </Text>
                      </View>
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
                            : group.partyDisplayName}
                        </Text>
                      </Text>
                    </View>
                  </View>
                )}

                {/* Botões sempre visíveis */}
                {((selectedOrderTab === "finalizado" && isBuyer) ||
                  (selectedOrderTab === "aguardando" && !isBuyer) ||
                  (selectedOrderTab === "transporte" && isBuyer) ||
                  (selectedOrderTab === "aguardando" && isBuyer)) && (
                  <View
                    style={{
                      marginTop: isExpanded ? 0 : 12,
                      borderTopWidth: isExpanded ? 0 : 1,
                      borderTopColor: isExpanded
                        ? "transparent"
                        : theme.colors.gray_200,
                      paddingTop: isExpanded ? 0 : 12,
                    }}
                  >
                    {/* Botões de ação sempre visíveis */}
                    {selectedOrderTab === "finalizado" && isBuyer && (
                      <TouchableOpacity
                        style={{
                          backgroundColor: reviewedOrderIds.has(group.id)
                            ? theme.colors.orange_500 ?? "#F97316"
                            : theme.colors.primary,
                          paddingVertical: 10,
                          paddingHorizontal: 16,
                          borderRadius: 8,
                          alignSelf: "flex-start",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                        onPress={() => {
                          if (reviewedOrderIds.has(group.id)) return;
                          setTargetOrderId(group.id);
                          setTargetSeller(group.party);
                          setTargetItemName(
                            group.items.map((i) => i.produto).join(", ")
                          );
                          setReviewModalVisible(true);
                        }}
                        disabled={reviewedOrderIds.has(group.id)}
                      >
                        <Ionicons
                          name={
                            reviewedOrderIds.has(group.id)
                              ? "checkmark-circle"
                              : "star"
                          }
                          size={16}
                          color={theme.colors.white}
                        />
                        <Text
                          style={{
                            color: theme.colors.white,
                            fontWeight: "600",
                            fontSize: 13,
                          }}
                        >
                          {reviewedOrderIds.has(group.id)
                            ? "Avaliado"
                            : "Avaliar Vendedor"}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {selectedOrderTab === "transporte" && isBuyer && (
                      <TouchableOpacity
                        style={{
                          backgroundColor: isProcessingAction
                            ? theme.colors.gray_400
                            : theme.colors.primary,
                          paddingVertical: 10,
                          paddingHorizontal: 16,
                          borderRadius: 8,
                          alignSelf: "flex-start",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                        onPress={() => handleConfirmReceipt(group)}
                        disabled={isProcessingAction}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color={theme.colors.white}
                        />
                        <Text
                          style={{
                            color: theme.colors.white,
                            fontWeight: "600",
                            fontSize: 13,
                          }}
                        >
                          Confirmar Recebimento
                        </Text>
                      </TouchableOpacity>
                    )}

                    {selectedOrderTab === "aguardando" && isBuyer && (
                      <TouchableOpacity
                        style={{
                          backgroundColor: theme.colors.error,
                          paddingVertical: 10,
                          paddingHorizontal: 16,
                          borderRadius: 8,
                          alignSelf: "flex-start",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                        onPress={() => handleCancelOrder(group)}
                      >
                        <Ionicons
                          name="close-circle"
                          size={16}
                          color={theme.colors.white}
                        />
                        <Text
                          style={{
                            color: theme.colors.white,
                            fontWeight: "600",
                            fontSize: 13,
                          }}
                        >
                          Cancelar Pedido
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* Botões de ação para vendedores */}
                    {selectedOrderTab === "aguardando" && !isBuyer && (
                      <TouchableOpacity
                        style={{
                          backgroundColor: isProcessingAction
                            ? theme.colors.gray_400
                            : theme.colors.primary,
                          paddingVertical: 10,
                          paddingHorizontal: 16,
                          borderRadius: 8,
                          alignSelf: "flex-start",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                        onPress={() => handleConfirmSale(group)}
                        disabled={isProcessingAction}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color={theme.colors.white}
                        />
                        <Text
                          style={{
                            color: theme.colors.white,
                            fontWeight: "600",
                            fontSize: 13,
                          }}
                        >
                          Confirmar Envio
                        </Text>
                      </TouchableOpacity>
                    )}

                    {selectedOrderTab === "finalizado" && !isBuyer && (
                      <TouchableOpacity
                        style={{
                          backgroundColor: reviewedOrderIds.has(group.id)
                            ? theme.colors.orange_500 ?? "#F97316"
                            : theme.colors.primary,
                          paddingVertical: 10,
                          paddingHorizontal: 16,
                          borderRadius: 8,
                          alignSelf: "flex-start",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                        onPress={() => {
                          if (reviewedOrderIds.has(group.id)) return;
                          setTargetOrderId(group.id);
                          setTargetSeller(group.party);
                          setTargetItemName(
                            group.items.map((i) => i.produto).join(", ")
                          );
                          setReviewModalVisible(true);
                        }}
                        disabled={reviewedOrderIds.has(group.id)}
                      >
                        <Ionicons
                          name={
                            reviewedOrderIds.has(group.id)
                              ? "checkmark-circle"
                              : "star"
                          }
                          size={16}
                          color={theme.colors.white}
                        />
                        <Text
                          style={{
                            color: theme.colors.white,
                            fontWeight: "600",
                            fontSize: 13,
                          }}
                        >
                          {reviewedOrderIds.has(group.id)
                            ? "Avaliado"
                            : "Avaliar Comprador"}
                        </Text>
                      </TouchableOpacity>
                    )}
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

      <Modal visible={reviewModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "flex-end",
            }}
          >
            <View
              style={{
                backgroundColor: theme.colors.white,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: 20,
                minHeight: 300,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: theme.colors.gray_800,
                  }}
                >
                  {isBuyerMode ? "Avaliar Vendedor" : "Avaliar Comprador"}
                </Text>
                <TouchableOpacity
                  onPress={() => setReviewModalVisible(false)}
                  disabled={isSubmittingReview}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={theme.colors.gray_500}
                  />
                </TouchableOpacity>
              </View>

              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.gray_600,
                  marginBottom: 12,
                }}
              >
                {isBuyerMode
                  ? "Qual foi sua experiência com este vendedor?"
                  : "Qual foi sua experiência com este comprador?"}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 10,
                  marginBottom: 24,
                }}
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <TouchableOpacity
                    key={value}
                    onPress={() => setStars(value)}
                    disabled={isSubmittingReview}
                  >
                    <Ionicons
                      name={value <= stars ? "star" : "star-outline"}
                      size={36}
                      color={theme.colors.primary}
                      style={{ opacity: isSubmittingReview ? 0.5 : 1 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={{
                  backgroundColor: theme.colors.gray_100,
                  borderRadius: 8,
                  padding: 12,
                  minHeight: 100,
                  textAlignVertical: "top",
                  color: theme.colors.gray_800,
                  opacity: isSubmittingReview ? 0.5 : 1,
                }}
                value={comment}
                onChangeText={setComment}
                placeholder="Escreva um comentário (opcional)"
                placeholderTextColor={theme.colors.placeholder}
                multiline
                editable={!isSubmittingReview}
              />

              <TouchableOpacity
                style={{
                  backgroundColor: isSubmittingReview
                    ? theme.colors.gray_400
                    : theme.colors.primary,
                  borderRadius: 8,
                  paddingVertical: 14,
                  alignItems: "center",
                  marginTop: 20,
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 8,
                }}
                onPress={submitOrderReview}
                disabled={isSubmittingReview}
              >
                {isSubmittingReview && (
                  <ActivityIndicator color={theme.colors.white} size="small" />
                )}
                <Text
                  style={{
                    color: theme.colors.white,
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  {isSubmittingReview ? "Enviando..." : "Publicar Avaliação"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
