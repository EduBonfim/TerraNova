import { useAuth } from "@/contexts/AuthContext";
import {
  getAverageRating,
  getProfileSummary,
  getReviews,
  initCommunityStore,
} from "@/services/communityStore";
import { getMarketplaceItems } from "@/services/marketplaceStore"; // Removida a importação do tipo MarketplaceOpportunity
import { normalizeText } from "@/utils/textUtils";
import { useIsFocused } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

export function useMarketplaceLogic(cartVendorName, isBuyerView = false) {
  const router = useRouter();
  const { user } = useAuth();
  const isFocused = useIsFocused();

  const params = useLocalSearchParams();

  const highlight = Array.isArray(params.highlight)
    ? params.highlight[0]
    : params.highlight;
  const filterByVendor = Array.isArray(params.filterByVendor)
    ? params.filterByVendor[0]
    : params.filterByVendor;
  const paramSubcat = Array.isArray(params.subcategory)
    ? params.subcategory[0]
    : params.subcategory;
  const highlightedItemId = highlight;

  const [activeHighlightId, setActiveHighlightId] = useState(null);
  const [internalHighlightId, setInternalHighlightId] = useState(null);
  const [imageModalUri, setImageModalUri] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [storeVersion, setStoreVersion] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(paramSubcat || null);

  useEffect(() => {
    if (paramSubcat) {
      setSelectedCategory(paramSubcat);
      const t = setTimeout(
        () => router.setParams({ subcategory: undefined }),
        0
      );
      return () => clearTimeout(t);
    }
  }, [paramSubcat, router]);

  const [searchQuery, setSearchQuery] = useState("");
  const [maxDistance, setMaxDistance] = useState(null);
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const searchInputRef = useRef(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await getMarketplaceItems();
      setMarketplaceItems(data);
      setStoreVersion((prev) => prev + 1);
    } catch (error) {
      console.warn("[Marketplace] Falha ao atualizar itens:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const ratingBySeller = useMemo(() => {
    const result = {};
    marketplaceItems.forEach((item) => {
      const avg = getAverageRating(item.vendedor);
      const total = getReviews(item.vendedor).length;
      result[item.vendedor] = { avg, total };
    });
    return result;
  }, [marketplaceItems, storeVersion]);

  const trustBySeller = useMemo(() => {
    const result = {};
    marketplaceItems.forEach((item) => {
      const summary = getProfileSummary(item.vendedor);
      result[item.vendedor] = {
        cep: summary.isCepValidated,
        pin: summary.isGatePinConfirmed,
      };
    });
    return result;
  }, [marketplaceItems, storeVersion]);

  const categories = useMemo(() => {
    const uniqueSubcategorias = new Set();
    marketplaceItems.forEach((item) => {
      if (item.subcategoria) {
        uniqueSubcategorias.add(item.subcategoria);
      }
    });
    return ["Todos", ...Array.from(uniqueSubcategorias).sort()];
  }, [marketplaceItems]);

  const getProductRating = useCallback(
    (vendedor, produto) => {
      const reviews = getReviews(vendedor).filter(
        (r) => r.negotiatedItem === produto
      );
      if (reviews.length === 0) return 0;
      const sum = reviews.reduce((acc, item) => acc + item.stars, 0);
      return sum / reviews.length;
    },
    [storeVersion]
  );

  const getProductReviewStats = useCallback(
    (vendedor, produto) => {
      const reviews = getReviews(vendedor).filter(
        (r) => r.negotiatedItem === produto
      );
      if (reviews.length === 0) return { avg: 0, total: 0 };
      const sum = reviews.reduce((acc, item) => acc + item.stars, 0);
      return { avg: sum / reviews.length, total: reviews.length };
    },
    [storeVersion]
  );

  const getMockDistance = useCallback(
    (vendedor) => {
      if (user?.username === vendedor) return 0;

      let hash = 0;
      for (let i = 0; i < vendedor.length; i++) {
        hash = vendedor.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash) % 300; // 0 a 300km
    },
    [user?.username]
  );

  const filteredMarketplaceItems = useMemo(() => {
    let items = marketplaceItems;

    // SEGURANÇA: Usa isBuyerView passado pelo componente pai em vez de user.role
    // Evita "role leak" onde o contexto stale de buyer filtra a visão do produtor
    if (isBuyerView) {
      items = items.filter((item) => item.categoria === "Mercado");
    }

    // Oculta os próprios produtos da listagem — o produtor não precisa ver seus
    // próprios anúncios enquanto navega no mercado (sem prejudicar o filtro por vendedor)
    if (user?.username && !cartVendorName && !filterByVendor) {
      const ownUsername = normalizeText(user.username);
      items = items.filter((item) => {
        const itemVendor = normalizeText(
          item.vendedor || item.vendedorUsername || ""
        );
        return itemVendor !== ownUsername;
      });
    }

    const effectiveVendorFilter = cartVendorName || filterByVendor;

    if (effectiveVendorFilter) {
      const normalizedFilter = normalizeText(effectiveVendorFilter);
      items = items.filter(
        (item) => normalizeText(item.vendedor) === normalizedFilter
      );
    }

    if (selectedCategory && selectedCategory !== "Todos") {
      items = items.filter((item) => item.subcategoria === selectedCategory);
    }

    if (searchQuery.trim()) {
      const normalizedSearch = normalizeText(searchQuery);
      items = items.filter(
        (item) =>
          normalizeText(item.produto).includes(normalizedSearch) ||
          normalizeText(item.vendedor).includes(normalizedSearch) ||
          normalizeText(item.subcategoria || "").includes(normalizedSearch)
      );
    }

    if (maxDistance !== null) {
      items = items.filter(
        (item) => getMockDistance(item.vendedor) <= maxDistance
      );
    }

    const now = Date.now();
    items = items.filter((item) => {
      if (item.estoqueValor === 0 && item.esgotadoEm) {
        const outOfStockTime = new Date(item.esgotadoEm).getTime();
        const hoursPassed = (now - outOfStockTime) / (1000 * 60 * 60);
        if (hoursPassed > 24) return false;
      }
      return true;
    });

    items.sort((a, b) => {
      const aInStock = a.estoqueValor > 0;
      const bInStock = b.estoqueValor > 0;
      if (aInStock && !bInStock) return -1;
      if (!aInStock && bInStock) return 1;

      const ratingA = getProductRating(a.vendedor, a.produto);
      const ratingB = getProductRating(b.vendedor, b.produto);
      if (ratingA !== ratingB) {
        return ratingB - ratingA;
      }

      const distA = getMockDistance(a.vendedor);
      const distB = getMockDistance(b.vendedor);
      return distA - distB;
    });

    if (internalHighlightId) {
      const targetIndex = items.findIndex(
        (item) => item.id === internalHighlightId
      );
      if (targetIndex > 0) {
        const item = items[targetIndex];
        items = [...items];
        items.splice(targetIndex, 1);
        items.unshift(item);
      }
    }

    return items;
  }, [
    marketplaceItems,
    filterByVendor,
    cartVendorName,
    selectedCategory,
    searchQuery,
    maxDistance,
    internalHighlightId,
    getProductRating,
    getMockDistance,
    user,
  ]);

  useEffect(() => {
    if (highlightedItemId) {
      setInternalHighlightId(highlightedItemId);
      const t = setTimeout(() => router.setParams({ highlight: undefined }), 0);
      return () => clearTimeout(t);
    }
  }, [highlightedItemId, router]);

  useEffect(() => {
    if (
      !isFocused ||
      !internalHighlightId ||
      filteredMarketplaceItems.length === 0
    )
      return;

    setActiveHighlightId(internalHighlightId);

    const clearGlowTemp = setTimeout(() => {
      setActiveHighlightId(null);
    }, 4000);

    return () => clearTimeout(clearGlowTemp);
  }, [internalHighlightId, isFocused, filteredMarketplaceItems.length]);

  useEffect(() => {
    if (!isFocused) {
      setActiveHighlightId(null);
      setInternalHighlightId(null);
    }
  }, [isFocused]);

  useEffect(() => {
    let mounted = true;
    const loadMarketplace = async () => {
      if (!isFocused) return;
      if (mounted) {
        setIsLoading(true);
      }

      try {
        const data = await getMarketplaceItems();
        if (mounted) {
          setMarketplaceItems(data);
        }
      } catch (error) {
        console.warn("[Marketplace] Falha ao carregar itens:", error);
        if (mounted) {
          setMarketplaceItems([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadMarketplace();
    return () => {
      mounted = false;
    };
  }, [isFocused, isRefreshing]);

  useEffect(() => {
    let mounted = true;
    const ensureStoreReady = async () => {
      try {
        await initCommunityStore();
        if (mounted) {
          setStoreVersion((prev) => prev + 1);
        }
      } catch (error) {
        console.warn("[Marketplace] Falha ao inicializar comunidade:", error);
      }
    };

    ensureStoreReady();
    return () => {
      mounted = false;
    };
  }, []);

  return {
    router,
    filterByVendor,
    activeHighlightId,
    imageModalUri,
    setImageModalUri,
    isRefreshing,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    searchInputRef,
    filteredMarketplaceItems,
    marketplaceItems,
    categories,
    ratingBySeller,
    trustBySeller,
    handleRefresh,
    maxDistance,
    setMaxDistance,
    getMockDistance,
    getProductRating,
    getProductReviewStats,
    isLoading, // Adicionado ao retorno para controle de UI
  };
}
