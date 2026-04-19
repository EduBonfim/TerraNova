import { getUsers } from "@/services/authStore";
import { getProfileSummary, initCommunityStore } from "@/services/communityStore";
import { MARKETPLACE_OPPORTUNITIES } from "@/services/marketplaceStore";
import { getDistanceScore } from "@/utils/geoUtils";
import { SEARCH_STOPWORDS as CONTEXT_STOPWORDS, normalizeText, tokenize } from "@/utils/textUtils";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, Keyboard, Platform } from "react-native";
import MapView from "react-native-maps";

// 📍 DADOS REAIS TERRA Nova (Foco em Bioinsumos e Compostagem)
export const PONTOS_LOGISTICOS = [
  {
    id: 1,
    tipo: "armazem",
    titulo: "Central de Compostagem Comunitária",
    descricao: "Recebimento de palhada e esterco para processamento.",
    coords: { latitude: -17.7915, longitude: -50.9201 },
  },
  {
    id: 2,
    tipo: "fazenda",
    titulo: "Fazenda São João",
    descricao: "Disponível: Cama de Frango (Rica em Nitrogênio e Fósforo)",
    coords: { latitude: -17.8205, longitude: -50.8878 },
  },
  {
    id: 3,
    tipo: "fazenda",
    titulo: "Sítio Esperança",
    descricao: "Disponível: Esterco Bovino Curtido (2 Toneladas)",
    coords: { latitude: -17.7681, longitude: -50.9523 },
  },
  {
    id: 4,
    tipo: "fazenda",
    titulo: "Fazenda Vale Verde",
    descricao: "Disponível: Palhada de Milho para cobertura de solo",
    coords: { latitude: -17.799, longitude: -50.851 },
  },
];

export type LogisticPoint = (typeof PONTOS_LOGISTICOS)[number];

export function useMapLogic() {
  const router = useRouter();
  const screenWidth = Dimensions.get("window").width;
  const androidCardWidth = 206;
  const iosNavigatorWidth = 220;
  
  const [androidCardHeight, setAndroidCardHeight] = useState(220);
  const mapRef = useRef<MapView | null>(null);
  const markerRefs = useRef<Record<number, { showCallout: () => void } | null>>({});
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [localUsuario, setLocalUsuario] = useState<Location.LocationObject | null>(null);
  const [myFarmGate, setMyFarmGate] = useState<{ latitude: number; longitude: number } | null>(null);
  const [erroLocal, setErroLocal] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [showRecenterToast, setShowRecenterToast] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const [iosNavigatorPosition, setIosNavigatorPosition] = useState<{ x: number; y: number } | null>(null);
  const [dynamicProfilePoints, setDynamicProfilePoints] = useState<LogisticPoint[]>([]);
  const [selectedAndroidPoint, setSelectedAndroidPoint] = useState<LogisticPoint | null>(null);
  const [androidCardPosition, setAndroidCardPosition] = useState<{ x: number; y: number } | null>(null);
  
  const profileName = "Pedro Paulo";
  const initialRegion = {
    latitude: -17.7915,
    longitude: -50.9,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  const recenterMap = () => {
    const target = localUsuario
      ? {
          latitude: localUsuario.coords.latitude,
          longitude: localUsuario.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }
      : myFarmGate
        ? {
            latitude: myFarmGate.latitude,
            longitude: myFarmGate.longitude,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          }
        : initialRegion;

    mapRef.current?.animateToRegion(target, 450);
    setShowRecenterToast(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setShowRecenterToast(false), 1800);
  };

  const keyword = normalizeText(searchKeyword);
  const keywordTokens = useMemo(() => (keyword ? keyword.split(" ").filter(Boolean) : []), [keyword]);

  const marketplaceBySeller = useMemo(() => {
    return MARKETPLACE_OPPORTUNITIES.reduce<
      Record<string, Array<{ id: string; raw: string; normalized: string; tokens: string[] }>>
    >((acc, item) => {
      const key = normalizeText(item.vendedor);
      acc[key] = [
        ...(acc[key] || []),
        {
          id: item.id,
          raw: item.produto,
          normalized: normalizeText(item.produto),
          tokens: tokenize(item.produto),
        },
      ];
      return acc;
    }, {});
  }, []);

  const allLogisticPoints = useMemo(() => {
    const merged = [...PONTOS_LOGISTICOS, ...dynamicProfilePoints];
    const byTitle = new Map<string, LogisticPoint>();
    merged.forEach((point) => {
      const key = normalizeText(point.titulo);
      if (!byTitle.has(key)) byTitle.set(key, point);
    });
    return Array.from(byTitle.values());
  }, [dynamicProfilePoints]);

  const getMarketplaceOpportunityId = (ponto: LogisticPoint) => {
    const title = normalizeText(ponto.titulo);
    const sellerEntry = Object.entries(marketplaceBySeller).find(([seller]) =>
      seller.includes(title) || title.includes(seller),
    );

    if (!sellerEntry || sellerEntry[1].length === 0) return null;

    const contextTokens = [
      ...tokenize(ponto.titulo),
      ...tokenize(ponto.descricao),
    ].filter((token) => !CONTEXT_STOPWORDS.has(token));

    let bestProduct = sellerEntry[1][0];
    let bestScore = -1;

    sellerEntry[1].forEach((product) => {
      let score = 0;
      if (keywordTokens.length > 0) {
        const keywordMatches = keywordTokens.filter((token) => product.normalized.includes(token)).length;
        score += keywordMatches * 30;
        if (keywordMatches === keywordTokens.length) score += 80;
      }
      const contextMatches = product.tokens.filter((token) => contextTokens.includes(token)).length;
      score += contextMatches * 10;
      if (score > bestScore) {
        bestScore = score;
        bestProduct = product;
      }
    });

    return bestProduct.id;
  };

  const openMarketplaceFromPoint = (ponto: LogisticPoint) => {
    const highlight = getMarketplaceOpportunityId(ponto);
    const params: any = {};
    if (highlight) params.highlight = highlight;
    if (ponto.tipo === "fazenda") params.filterByVendor = ponto.titulo;
    router.push({ pathname: "/user-profile", params });
  };

  const getMatchedProductLabel = (ponto: LogisticPoint) => {
    if (!keywordTokens.length) return null;
    const title = normalizeText(ponto.titulo);
    const matchEntry = Object.entries(marketplaceBySeller).find(([seller, products]) => {
      const sellerMatchesPoint = seller.includes(title) || title.includes(seller);
      if (!sellerMatchesPoint) return false;
      return products.some((product) =>
        keywordTokens.every((token) => product.normalized.includes(token)),
      );
    });
    if (!matchEntry) return null;
    return matchEntry[1].find((product) =>
      keywordTokens.every((token) => product.normalized.includes(token)),
    )?.raw ?? null;
  };

  const filteredPoints = useMemo(() => {
    return allLogisticPoints.filter((ponto) => {
      if (!keywordTokens.length) return true;
      const title = normalizeText(ponto.titulo);
      const description = normalizeText(ponto.descricao);
      const productsByPoint = Object.entries(marketplaceBySeller).find(([seller]) =>
        seller.includes(title) || title.includes(seller),
      );
      const productText = (productsByPoint?.[1] ?? []).map((item) => item.normalized).join(" ");
      const searchableText = `${title} ${description} ${productText}`;
      return keywordTokens.every((token) => searchableText.includes(token));
    });
  }, [allLogisticPoints, keywordTokens, marketplaceBySeller]);

  const _getDistanceScore = (coords: { latitude: number; longitude: number }) => {
    const base = localUsuario ? localUsuario.coords : initialRegion;
    return getDistanceScore(base, coords);
  };

  const orderedSearchResults = useMemo(() => {
    if (!keywordTokens.length) return [] as LogisticPoint[];
    return [...filteredPoints].sort((a, b) => _getDistanceScore(a.coords) - _getDistanceScore(b.coords));
  }, [filteredPoints, keywordTokens, localUsuario]);

  const activeResult = useMemo(() => {
    return orderedSearchResults.length > 0
      ? orderedSearchResults[activeResultIndex % orderedSearchResults.length]
      : null;
  }, [orderedSearchResults, activeResultIndex]);

  const activeResultId = activeResult?.id ?? null;

  const goToPreviousResult = () => {
    if (orderedSearchResults.length <= 1) return;
    setActiveResultIndex((prev) => (prev - 1 < 0 ? orderedSearchResults.length - 1 : prev - 1));
  };

  const goToNextResult = () => {
    if (orderedSearchResults.length <= 1) return;
    setActiveResultIndex((prev) => (prev + 1) % orderedSearchResults.length);
  };

  const updateAndroidCardPosition = async (coords: { latitude: number; longitude: number }) => {
    if (Platform.OS !== "android" || !mapRef.current) return;
    try {
      const point = await mapRef.current.pointForCoordinate(coords);
      setAndroidCardPosition(point);
    } catch {
      setAndroidCardPosition(null);
    }
  };

  const openAndroidPointCard = async (ponto: LogisticPoint) => {
    if (Platform.OS !== "android") return;
    setSelectedAndroidPoint(ponto);
    await updateAndroidCardPosition(ponto.coords);
  };

  const updateIosNavigatorPosition = async (coords: { latitude: number; longitude: number }) => {
    if (Platform.OS !== "ios" || !mapRef.current) return;
    try {
      const point = await mapRef.current.pointForCoordinate(coords);
      setIosNavigatorPosition(point);
    } catch {
      setIosNavigatorPosition(null);
    }
  };

  useEffect(() => {
    async function obterPermissaoLocal() {
      await initCommunityStore();
      const uniqueSellerPoints = new Map<string, LogisticPoint>();
      MARKETPLACE_OPPORTUNITIES.forEach((item, index) => {
        const sellerSummary = getProfileSummary(item.vendedor);
        if (sellerSummary.gateLatitude == null || sellerSummary.gateLongitude == null) return;
        const sellerKey = normalizeText(item.vendedor);
        if (uniqueSellerPoints.has(sellerKey)) return;
        uniqueSellerPoints.set(sellerKey, {
          id: 1000 + index,
          tipo: "fazenda",
          titulo: item.vendedor,
          descricao: `Disponível: ${item.produto}`,
          coords: { latitude: sellerSummary.gateLatitude, longitude: sellerSummary.gateLongitude },
        });
      });
      setDynamicProfilePoints(Array.from(uniqueSellerPoints.values()));

      const summary = getProfileSummary(profileName);
      // ⚠️  Não exibir pins de compradores (role "buyer") no mapa de porteiras
      const allUsers = getUsers();
      const producerUsernames = new Set(
        allUsers
          .filter((u) => u.role !== "buyer" && u.role !== "admin")
          .map((u) => u.username.toLowerCase())
      );
      const isProducer = producerUsernames.has(profileName.toLowerCase()) || true; // fallback: exibe se não encontrado
      if (isProducer && summary.gateLatitude != null && summary.gateLongitude != null) {
        setMyFarmGate({ latitude: summary.gateLatitude, longitude: summary.gateLongitude });
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErroLocal("Acesso à localização negado.");
        setCarregando(false);
        return;
      }
      try {
        let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocalUsuario(location);
      } catch (e) {
        setErroLocal("Não foi possível obter a sua localização exata.");
      }
      setCarregando(false);
    }
    obterPermissaoLocal();
    return () => { if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current); };
  }, []);

  useEffect(() => { setActiveResultIndex(0); }, [keyword]);

  useEffect(() => {
    if (!keywordTokens.length || orderedSearchResults.length === 0) return;
    const target = orderedSearchResults[activeResultIndex % orderedSearchResults.length];
    mapRef.current?.animateToRegion({
      latitude: target.coords.latitude,
      longitude: target.coords.longitude,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    }, 550);
  }, [keywordTokens, activeResultIndex, orderedSearchResults]);

  useEffect(() => {
    if (!activeResult || !keywordTokens.length) return;
    if (Platform.OS === "android") {
      void openAndroidPointCard(activeResult);
      return;
    }
    void updateIosNavigatorPosition(activeResult.coords);
    const marker = markerRefs.current[activeResult.id];
    if (!marker) return;
    const timeoutId = setTimeout(() => marker.showCallout(), 300);
    return () => clearTimeout(timeoutId);
  }, [activeResult, keywordTokens]);

  const onMapPress = () => {
    Keyboard.dismiss();
    if (Platform.OS === "ios") setIosNavigatorPosition(null);
    if (Platform.OS === "android") {
      setSelectedAndroidPoint(null);
      setAndroidCardPosition(null);
    }
  };

  const onRegionChangeComplete = () => {
    if (Platform.OS === "android" && selectedAndroidPoint) {
      void updateAndroidCardPosition(selectedAndroidPoint.coords);
    }
    if (Platform.OS === "ios" && activeResult) {
      void updateIosNavigatorPosition(activeResult.coords);
    }
  };

  return {
    screenWidth,
    androidCardWidth,
    iosNavigatorWidth,
    androidCardHeight,
    setAndroidCardHeight,
    mapRef,
    markerRefs,
    localUsuario,
    myFarmGate,
    erroLocal,
    carregando,
    showRecenterToast,
    searchKeyword,
    setSearchKeyword,
    activeResultIndex,
    iosNavigatorPosition,
    setIosNavigatorPosition,
    selectedAndroidPoint,
    setSelectedAndroidPoint,
    androidCardPosition,
    setAndroidCardPosition,
    initialRegion,
    keywordTokens,
    filteredPoints,
    activeResult,
    activeResultId,
    orderedSearchResults,
    recenterMap,
    openMarketplaceFromPoint,
    getMatchedProductLabel,
    goToPreviousResult,
    goToNextResult,
    openAndroidPointCard,
    onMapPress,
    onRegionChangeComplete,
  };
}
