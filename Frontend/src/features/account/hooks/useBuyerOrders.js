import { getOrdersByBuyer } from "@/services/ordersStore";
import { useCallback, useState } from "react";

export function useBuyerOrders(username) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("pagar");
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [counts, setCounts] = useState({
    pagar: 0,
    preparando: 0,
    caminho: 0,
    avaliar: 0,
  });

  const loadOrdersByStatus = useCallback(
    async (status) => {
      setIsLoadingOrders(true);
      try {
        const userOrders = await getOrdersByBuyer(username || "");
        setSelectedStatus(status);
        setModalVisible(true);

        let filtered = userOrders;
        if (status === "pagar") {
          filtered = [];
        } else if (status === "preparando") {
          filtered = userOrders.filter((o) => o.status === "aguardando");
        } else if (status === "caminho") {
          filtered = userOrders.filter((o) => o.status === "transporte");
        } else if (status === "avaliar") {
          filtered = userOrders.filter((o) => o.status === "finalizado");
        }
        setOrders(filtered);
      } finally {
        setIsLoadingOrders(false);
      }
    },
    [username]
  );

  const refreshCounts = useCallback(async (user) => {
    const all = await getOrdersByBuyer(user);
    setCounts({
      pagar: 0,
      preparando: all.filter((o) => o.status === "aguardando").length,
      caminho: all.filter((o) => o.status === "transporte").length,
      avaliar: all.filter((o) => o.status === "finalizado").length,
    });
  }, []);

  return {
    modalVisible,
    setModalVisible,
    selectedStatus,
    orders,
    isLoadingOrders,
    counts,
    loadOrdersByStatus,
    refreshCounts,
  };
}
