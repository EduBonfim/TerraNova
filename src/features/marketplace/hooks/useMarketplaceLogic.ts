import { useAuth } from "@/contexts/AuthContext";
import {
    getAverageRating,
    getProfileSummary,
    getReviews,
    initCommunityStore,
} from "@/services/communityStore";
import {
    getMarketplaceItems,
    MarketplaceOpportunity,
} from "@/services/marketplaceStore";
import { normalizeText } from "@/utils/textUtils";
import { useIsFocused } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { TextInput } from "react-native";

const ESTIMATED_CARD_HEIGHT = 320;

export function useMarketplaceLogic(cartVendorName?: string | null) {
  const router = useRouter();
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const params = useLocalSearchParams<{
    highlight?: string;
    filterByVendor?: string;
    subcategory?: string;
  }>();

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

  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(
    null,
  );
  const [internalHighlightId, setInternalHighlightId] = useState<string | null>(
    null,
  );
  const [imageModalUri, setImageModalUri] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [storeVersion, setStoreVersion] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    paramSubcat || null,
  );

  useEffect(() => {
    if (paramSubcat) {
      setSelectedCategory(paramSubcat);
      router.setParams({ subcategory: undefined });
    }
  }, [paramSubcat, router]);

  const [searchQuery, setSearchQuery] = useState("");
  const [marketplaceItems, setMarketplaceItems] = useState<
    MarketplaceOpportunity[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const searchInputRef = useRef<TextInput>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await getMarketplaceItems();
      setMarketplaceItems(data);
      setStoreVersion(prev => prev + 1);
    } finally {
      setIsRefreshing(false);
    }
  };

  const ratingBySeller = useMemo(() => {
    const result: Record<string, { avg: number; total: number }> = {};
    marketplaceItems.forEach((item) => {
      const avg = getAverageRating(item.vendedor);
      const total = getReviews(item.vendedor).length;
      result[item.vendedor] = { avg, total };
    });
    return result;
  }, [marketplaceItems, storeVersion]);

  const trustBySeller = useMemo(() => {
    const result: Record<string, { cep: boolean; pin: boolean }> = {};
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
    const uniqueSubcategorias = new Set<string>();
    marketplaceItems.forEach((item) => {
      if (item.subcategoria) {
        uniqueSubcategorias.add(item.subcategoria);
      }
    });
    return ["Todos", ...Array.from(uniqueSubcategorias).sort()];
  }, [marketplaceItems]);

  const filteredMarketplaceItems = useMemo(() => {
    let items = marketplaceItems;

    // Filter Cultivo out for buyers
    if (user?.role === "buyer") {
      items = items.filter((item) => item.categoria === "Mercado");
    }

    const effectiveVendorFilter = cartVendorName || filterByVendor;

    if (effectiveVendorFilter) {
      const normalizedFilter = normalizeText(effectiveVendorFilter);
      items = items.filter(
        (item) => normalizeText(item.vendedor) === normalizedFilter,
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
          normalizeText(item.subcategoria || "").includes(normalizedSearch),
      );
    }

    // Sort highlighted item to the very top to bypass complex async offset math
    if (internalHighlightId) {
      const targetIndex = items.findIndex(
        (item) => item.id === internalHighlightId,
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
    internalHighlightId,
  ]);

  useEffect(() => {
    if (highlightedItemId) {
      setInternalHighlightId(highlightedItemId);
      router.setParams({ highlight: undefined });
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
      setActiveHighlightId(null); // Remove only the highlight effect, keep product at top
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
      const data = await getMarketplaceItems();
      if (mounted) {
        setMarketplaceItems(data);
        setIsLoading(false);
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
      await initCommunityStore();
      if (mounted) setStoreVersion((prev) => prev + 1);
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
  };
}
