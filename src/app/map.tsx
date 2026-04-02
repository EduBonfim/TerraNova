import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform,
  Keyboard,
  Dimensions,
} from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SurfaceCard } from "../components/SurfaceCard";
import { getProfileSummary, initCommunityStore } from "../services/communityStore";
import { MARKETPLACE_OPPORTUNITIES } from "../services/marketplaceStore";

// 🎨 NOVA PALETA OFICIAL TERRA Nova
const theme = {
  colors: {
    primary: "#6B8E23",
    lightGreen: "#E8F5E9",
    brown_500: "#8B6F47", // Marrom Terra
    orange_500: "#F9A825",
    white: "#FFFFFF",
    background: "#F5F5F5",
    gray_200: "#E5E7EB",
    gray_300: "#D1D5DB",
    gray_500: "#6B7280",
    gray_800: "#1F2937",
    gray_900: "#111827",
  },
};

// 📍 DADOS REAIS TERRA Nova (Foco em Bioinsumos e Compostagem)
const PONTOS_LOGISTICOS = [
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

type LogisticPoint = (typeof PONTOS_LOGISTICOS)[number];

const toRadians = (value: number) => (value * Math.PI) / 180;

export default function MapScreen() {
  const screenWidth = Dimensions.get("window").width;
  const androidCardWidth = 206;
  const iosNavigatorWidth = 220;
  const [androidCardHeight, setAndroidCardHeight] = useState(220);
  const mapRef = useRef<MapView | null>(null);
  const markerRefs = useRef<Record<number, { showCallout: () => void } | null>>({});
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [localUsuario, setLocalUsuario] =
    useState<Location.LocationObject | null>(null);
  const [myFarmGate, setMyFarmGate] = useState<{ latitude: number; longitude: number } | null>(null);
  const [erroLocal, setErroLocal] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [showRecenterToast, setShowRecenterToast] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const [iosNavigatorPosition, setIosNavigatorPosition] =
    useState<{ x: number; y: number } | null>(null);
  const [dynamicProfilePoints, setDynamicProfilePoints] = useState<LogisticPoint[]>([]);
  const [selectedAndroidPoint, setSelectedAndroidPoint] =
    useState<(typeof PONTOS_LOGISTICOS)[number] | null>(null);
  const [androidCardPosition, setAndroidCardPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const router = useRouter();
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
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setShowRecenterToast(false);
    }, 1800);
  };

  const normalizeSearch = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const keyword = normalizeSearch(searchKeyword);
  const keywordTokens = keyword ? keyword.split(" ").filter(Boolean) : [];
  const tokenize = (value: string) =>
    normalizeSearch(value)
      .split(" ")
      .filter((token) => token.length > 2);

  const CONTEXT_STOPWORDS = new Set([
    "disponivel",
    "disponiveis",
    "para",
    "com",
    "sem",
    "ton",
    "tonelada",
    "toneladas",
    "kg",
    "rica",
    "rico",
    "solo",
    "imediata",
  ]);

  const marketplaceBySeller = MARKETPLACE_OPPORTUNITIES.reduce<
    Record<string, Array<{ id: string; raw: string; normalized: string; tokens: string[] }>>
  >(
    (acc, item) => {
      const key = normalizeSearch(item.vendedor);
      acc[key] = [
        ...(acc[key] || []),
        {
          id: item.id,
          raw: item.produto,
          normalized: normalizeSearch(item.produto),
          tokens: tokenize(item.produto),
        },
      ];
      return acc;
    },
    {},
  );

  const allLogisticPoints = useMemo(() => {
    const merged = [...PONTOS_LOGISTICOS, ...dynamicProfilePoints];
    const byTitle = new Map<string, LogisticPoint>();

    merged.forEach((point) => {
      const key = normalizeSearch(point.titulo);
      if (!byTitle.has(key)) {
        byTitle.set(key, point);
      }
    });

    return Array.from(byTitle.values());
  }, [dynamicProfilePoints]);

  const getMarketplaceOpportunityId = (ponto: (typeof PONTOS_LOGISTICOS)[number]) => {
    const title = normalizeSearch(ponto.titulo);
    const description = normalizeSearch(ponto.descricao);
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
        if (keywordMatches === keywordTokens.length) {
          score += 80;
        }
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

  const openMarketplaceFromPoint = (ponto: (typeof PONTOS_LOGISTICOS)[number]) => {
    const highlight = getMarketplaceOpportunityId(ponto);
    const params: any = {};
    
    if (highlight) {
      params.highlight = highlight;
    }
    
    if (ponto.tipo === "fazenda") {
      params.filterByVendor = ponto.titulo;
    }
    
    router.push({ pathname: "/profile", params });
  };

  const getMatchedProductLabel = (ponto: (typeof PONTOS_LOGISTICOS)[number]) => {
    if (!keywordTokens.length) return null;

    const title = normalizeSearch(ponto.titulo);
    const matchEntry = Object.entries(marketplaceBySeller).find(([seller, products]) => {
      const sellerMatchesPoint = seller.includes(title) || title.includes(seller);
      if (!sellerMatchesPoint) return false;
      return products.some((product) =>
        keywordTokens.every((token) => product.normalized.includes(token)),
      );
    });

    if (!matchEntry) return null;
    const foundProduct = matchEntry[1].find((product) =>
      keywordTokens.every((token) => product.normalized.includes(token)),
    );
    return foundProduct?.raw ?? null;
  };

  const filteredPoints = allLogisticPoints.filter((ponto) => {
    if (!keywordTokens.length) return true;

    const title = normalizeSearch(ponto.titulo);
    const description = normalizeSearch(ponto.descricao);
    const productsByPoint = Object.entries(marketplaceBySeller).find(([seller]) => {
      const sellerMatchesPoint = seller.includes(title) || title.includes(seller);
      return sellerMatchesPoint;
    });

    const productText = (productsByPoint?.[1] ?? []).map((item) => item.normalized).join(" ");
    const searchableText = `${title} ${description} ${productText}`;

    return keywordTokens.every((token) => searchableText.includes(token));
  });

  const getDistanceScore = (coords: { latitude: number; longitude: number }) => {
    const baseLatitude = localUsuario?.coords.latitude ?? initialRegion.latitude;
    const baseLongitude = localUsuario?.coords.longitude ?? initialRegion.longitude;
    const latDiff = coords.latitude - baseLatitude;
    const lngDiff = coords.longitude - baseLongitude;
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  };

  const getDistanceFromUserKm = (coords: { latitude: number; longitude: number }) => {
    if (!localUsuario) return null;

    const earthRadiusKm = 6371;
    const startLat = toRadians(localUsuario.coords.latitude);
    const startLng = toRadians(localUsuario.coords.longitude);
    const endLat = toRadians(coords.latitude);
    const endLng = toRadians(coords.longitude);

    const dLat = endLat - startLat;
    const dLng = endLng - startLng;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(startLat) * Math.cos(endLat) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusKm * c;
  };

  const formatDistanceLabel = (coords: { latitude: number; longitude: number }) => {
    const distanceKm = getDistanceFromUserKm(coords);
    if (distanceKm == null) return "Distancia indisponivel";
    return `${distanceKm.toFixed(1)} km de voce`;
  };

  const orderedSearchResults = useMemo(() => {
    if (!keywordTokens.length) return [] as LogisticPoint[];

    return [...filteredPoints].sort((a, b) => getDistanceScore(a.coords) - getDistanceScore(b.coords));
  }, [filteredPoints, keyword, localUsuario]);

  const activeResult =
    orderedSearchResults.length > 0
      ? orderedSearchResults[activeResultIndex % orderedSearchResults.length]
      : null;
  const activeResultId = activeResult?.id ?? null;

  const goToPreviousResult = () => {
    if (orderedSearchResults.length <= 1) return;
    setActiveResultIndex((prev) => {
      const next = prev - 1;
      return next < 0 ? orderedSearchResults.length - 1 : next;
    });
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

  const openAndroidPointCard = async (ponto: (typeof PONTOS_LOGISTICOS)[number]) => {
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

  // hook do GPS devolvido e verificado
  useEffect(() => {
    async function obterPermissaoLocal() {
      await initCommunityStore();

      const uniqueSellerPoints = new Map<string, LogisticPoint>();
      MARKETPLACE_OPPORTUNITIES.forEach((item, index) => {
        const sellerSummary = getProfileSummary(item.vendedor);
        if (sellerSummary.gateLatitude == null || sellerSummary.gateLongitude == null) return;

        const sellerKey = normalizeSearch(item.vendedor);
        if (uniqueSellerPoints.has(sellerKey)) return;

        uniqueSellerPoints.set(sellerKey, {
          id: 1000 + index,
          tipo: "fazenda",
          titulo: item.vendedor,
          descricao: `Disponível: ${item.produto}`,
          coords: {
            latitude: sellerSummary.gateLatitude,
            longitude: sellerSummary.gateLongitude,
          },
        });
      });
      setDynamicProfilePoints(Array.from(uniqueSellerPoints.values()));

      const summary = getProfileSummary(profileName);
      if (summary.gateLatitude != null && summary.gateLongitude != null) {
        setMyFarmGate({ latitude: summary.gateLatitude, longitude: summary.gateLongitude });
      }

      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setErroLocal("Acesso à localização negado.");
        setCarregando(false);
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocalUsuario(location);
      } catch (e) {
        setErroLocal("Não foi possível obter a sua localização exata.");
      }

      setCarregando(false);
    }

    obterPermissaoLocal();

    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setActiveResultIndex(0);
  }, [keyword]);

  useEffect(() => {
    if (!keywordTokens.length || orderedSearchResults.length === 0) {
      return;
    }

    const target = orderedSearchResults[activeResultIndex % orderedSearchResults.length];
    mapRef.current?.animateToRegion(
      {
        latitude: target.coords.latitude,
        longitude: target.coords.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      },
      550,
    );
  }, [keyword, activeResultIndex, orderedSearchResults]);

  useEffect(() => {
    if (!activeResult || !keywordTokens.length) {
      return;
    }

    if (Platform.OS === "android") {
      void openAndroidPointCard(activeResult);
      return;
    }

    void updateIosNavigatorPosition(activeResult.coords);

    const marker = markerRefs.current[activeResult.id];
    if (!marker) return;

    const timeoutId = setTimeout(() => {
      marker.showCallout();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [activeResult, keyword]);

  if (carregando) {
    return (
      <View style={styles.containerLoading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.textLoading}>Mapeando bioinsumos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onPress={() => {
          Keyboard.dismiss();
          if (Platform.OS === "ios") {
            setIosNavigatorPosition(null);
          }
          if (Platform.OS === "android") {
            setSelectedAndroidPoint(null);
            setAndroidCardPosition(null);
          }
        }}
        onRegionChangeComplete={() => {
          if (Platform.OS === "android" && selectedAndroidPoint) {
            void updateAndroidCardPosition(selectedAndroidPoint.coords);
          }

          if (Platform.OS === "ios" && activeResult) {
            void updateIosNavigatorPosition(activeResult.coords);
          }
        }}
      >
        {filteredPoints.map((ponto) => (
          (() => {
            const matchedProduct = getMatchedProductLabel(ponto);
            const isActiveResult = activeResultId === ponto.id;
            const trustSummary = ponto.tipo === "fazenda" ? getProfileSummary(ponto.titulo) : null;
            const isFullyValidated = Boolean(trustSummary?.isCepValidated && trustSummary?.isGatePinConfirmed);
            const distanceLabel = formatDistanceLabel(ponto.coords);
            const markerDescription = matchedProduct
              ? `${ponto.descricao}\n${distanceLabel}\nProduto encontrado: ${matchedProduct}${ponto.tipo === "fazenda" ? "\nToque para ver oportunidades" : ""}`
              : `${ponto.descricao}\n${distanceLabel}${ponto.tipo === "fazenda" ? "\nToque para ver oportunidades" : ""}`;

            return (
          <Marker
            key={ponto.id}
            ref={(ref) => {
              markerRefs.current[ponto.id] = ref;
            }}
            coordinate={ponto.coords}
            title={Platform.OS === "ios" ? ponto.titulo : undefined}
            description={Platform.OS === "ios" ? markerDescription : undefined}
            pinColor={
              isActiveResult
                ? theme.colors.orange_500
                : ponto.tipo === "armazem"
                ? theme.colors.brown_500
                : isFullyValidated
                ? theme.colors.primary
                : theme.colors.gray_500
            }
            onPress={() => {
              if (Platform.OS === "android") {
                void openAndroidPointCard(ponto);
              }
            }}
          >
            {Platform.OS === "ios" ? (
              <Callout
                tooltip={true}
                onPress={() => {
                  if (ponto.tipo === "fazenda") {
                    openMarketplaceFromPoint(ponto);
                  }
                }}
              >
                <SurfaceCard style={styles.customCallout} bordered={false}>
                  <Text style={styles.calloutTitle}>{ponto.titulo}</Text>
                  <Text style={styles.calloutDesc}>{ponto.descricao}</Text>
                  <Text style={styles.calloutDistance}>{distanceLabel}</Text>
                  {ponto.tipo === "fazenda" ? (
                    <View style={[styles.trustMarkerBadge, isFullyValidated ? styles.trustMarkerBadgeOk : styles.trustMarkerBadgeWarn]}>
                      <Ionicons
                        name={isFullyValidated ? "shield-checkmark" : "alert-circle-outline"}
                        size={12}
                        color={theme.colors.white}
                      />
                      <Text style={styles.trustMarkerBadgeText}>
                        {isFullyValidated ? "Perfil validado (CEP + Porteira)" : "Perfil sem validação completa"}
                      </Text>
                    </View>
                  ) : null}
                  {matchedProduct ? (
                    <View style={styles.matchedProductBadge}>
                      <Ionicons name="search" size={12} color={theme.colors.white} />
                      <Text style={styles.matchedProductText}>Produto encontrado: {matchedProduct}</Text>
                    </View>
                  ) : null}
                  {ponto.tipo === "fazenda" ? (
                    <View style={styles.calloutButton}>
                      <Text style={styles.calloutButtonText}>Ver Oportunidades</Text>
                    </View>
                  ) : null}
                </SurfaceCard>
              </Callout>
            ) : null}
          </Marker>
            );
          })()
        ))}

        {myFarmGate ? (
          <Marker
            coordinate={myFarmGate}
            pinColor={theme.colors.orange_500}
            title={Platform.OS === "ios" ? "Minha porteira" : undefined}
            description={
              Platform.OS === "ios"
                ? `Localizacao validada com CEP + pin manual.\n${formatDistanceLabel(myFarmGate)}`
                : undefined
            }
          >
            {Platform.OS === "ios" ? (
              <Callout tooltip={true}>
                <SurfaceCard style={styles.customCallout} bordered={false}>
                  <Text style={styles.calloutTitle}>Minha porteira</Text>
                  <Text style={styles.calloutDesc}>Localizacao validada com CEP + pin manual.</Text>
                  <Text style={styles.calloutDistance}>{formatDistanceLabel(myFarmGate)}</Text>
                </SurfaceCard>
              </Callout>
            ) : null}
          </Marker>
        ) : null}
      </MapView>
      {/* Cores da pesquisa e GPS atualizadas */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={theme.colors.gray_300} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar Insumos no Radar..."
          placeholderTextColor={theme.colors.gray_500}
          value={searchKeyword}
          onFocus={() => {
            if (Platform.OS === "ios") {
              setIosNavigatorPosition(null);
            }
            if (Platform.OS === "android") {
              setSelectedAndroidPoint(null);
              setAndroidCardPosition(null);
            }
          }}
          onChangeText={setSearchKeyword}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          selectionColor={theme.colors.primary}
        />
      </View>

      {keywordTokens.length > 0 && filteredPoints.length === 0 ? (
        <View style={styles.emptySearchBanner}>
          <Ionicons name="alert-circle-outline" size={16} color={theme.colors.gray_800} />
          <Text style={styles.emptySearchText}>
            Nenhum insumo encontrado para "{searchKeyword.trim()}".
          </Text>
        </View>
      ) : null}

      {keywordTokens.length > 0 && orderedSearchResults.length > 0 ? (
        null
      ) : null}

      <TouchableOpacity
        style={styles.gpsButton}
        onPress={recenterMap}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Recentralizar mapa"
      >
        <Ionicons name="locate" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {showRecenterToast ? (
        <View style={styles.toastContainer}>
          <Ionicons name="checkmark-circle" size={16} color={theme.colors.white} />
          <Text style={styles.toastText}>Mapa recentralizado</Text>
        </View>
      ) : null}

      {Platform.OS === "ios" && keywordTokens.length > 0 && orderedSearchResults.length > 0 && iosNavigatorPosition ? (
        <View
          style={[
            styles.iosFloatingNavigator,
            {
              left: Math.max(12, Math.min(screenWidth - iosNavigatorWidth - 12, iosNavigatorPosition.x - iosNavigatorWidth / 2)),
              top: Math.max(152, iosNavigatorPosition.y - 2),
              width: iosNavigatorWidth,
            },
          ]}
        >
          <Text style={styles.calloutNavigatorText}>
            Resultado {activeResultIndex + 1}/{orderedSearchResults.length}
          </Text>
          {orderedSearchResults.length > 1 ? (
            <View style={styles.calloutNavigatorActions}>
              <TouchableOpacity style={styles.calloutNavigatorButton} onPress={goToPreviousResult}>
                <Ionicons name="arrow-back" size={13} color={theme.colors.white} />
                <Text style={styles.calloutNavigatorButtonText}>Anterior</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.calloutNavigatorButton} onPress={goToNextResult}>
                <Ionicons name="arrow-forward" size={13} color={theme.colors.white} />
                <Text style={styles.calloutNavigatorButtonText}>Proximo</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      ) : null}

      {Platform.OS === "android" && selectedAndroidPoint && androidCardPosition ? (
        (() => {
          const selectedTrust =
            selectedAndroidPoint.tipo === "fazenda" ? getProfileSummary(selectedAndroidPoint.titulo) : null;
          const selectedValidated = Boolean(selectedTrust?.isCepValidated && selectedTrust?.isGatePinConfirmed);

          return (
        <View
          onLayout={(event) => {
            const nextHeight = event.nativeEvent.layout.height;
            if (nextHeight > 0 && Math.abs(nextHeight - androidCardHeight) > 2) {
              setAndroidCardHeight(nextHeight);
            }
          }}
          style={[
            styles.androidPinCard,
            {
              left: Math.max(
                12,
                Math.min(screenWidth - androidCardWidth - 12, androidCardPosition.x - androidCardWidth / 2),
              ),
              top: Math.max(152, androidCardPosition.y - androidCardHeight - 56),
              width: androidCardWidth,
            },
          ]}
        >
          <Text style={[styles.calloutTitle, styles.androidCalloutTitle]}>{selectedAndroidPoint.titulo}</Text>
          <Text style={[styles.calloutDesc, styles.androidCalloutDesc]}>{selectedAndroidPoint.descricao}</Text>
          <Text style={[styles.calloutDistance, styles.androidCalloutDistance]}>
            {formatDistanceLabel(selectedAndroidPoint.coords)}
          </Text>

          {selectedAndroidPoint.tipo === "fazenda" ? (
            <View style={[styles.trustMarkerBadge, selectedValidated ? styles.trustMarkerBadgeOk : styles.trustMarkerBadgeWarn, styles.androidTrustMarkerBadge]}>
              <Ionicons
                name={selectedValidated ? "shield-checkmark" : "alert-circle-outline"}
                size={12}
                color={theme.colors.white}
              />
              <Text style={styles.trustMarkerBadgeText}>
                {selectedValidated ? "Perfil validado" : "Validação pendente"}
              </Text>
            </View>
          ) : null}

          {keywordTokens.length > 0 && orderedSearchResults.length > 0 && activeResultId === selectedAndroidPoint.id ? (
            <View style={styles.calloutNavigatorWrap}>
              <Text style={styles.calloutNavigatorText}>
                Resultado {activeResultIndex + 1}/{orderedSearchResults.length}
              </Text>
              {orderedSearchResults.length > 1 ? (
                <View style={styles.calloutNavigatorActions}>
                  <TouchableOpacity style={styles.calloutNavigatorButton} onPress={goToPreviousResult}>
                    <Ionicons name="arrow-back" size={13} color={theme.colors.white} />
                    <Text style={styles.calloutNavigatorButtonText}>Anterior</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.calloutNavigatorButton} onPress={goToNextResult}>
                    <Ionicons name="arrow-forward" size={13} color={theme.colors.white} />
                    <Text style={styles.calloutNavigatorButtonText}>Proximo</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          ) : null}

          {(() => {
            const matchedProduct = getMatchedProductLabel(selectedAndroidPoint);
            if (!matchedProduct) return null;

            return (
              <View style={[styles.matchedProductBadge, styles.androidMatchedProductBadge]}>
                <Ionicons name="search" size={12} color={theme.colors.white} />
                <Text style={[styles.matchedProductText, styles.androidMatchedProductText]}>
                  Produto encontrado: {matchedProduct}
                </Text>
              </View>
            );
          })()}

          {selectedAndroidPoint.tipo === "fazenda" ? (
            <TouchableOpacity
              style={[styles.calloutButton, styles.androidCalloutButton]}
              onPress={() => {
                setSelectedAndroidPoint(null);
                setAndroidCardPosition(null);
                openMarketplaceFromPoint(selectedAndroidPoint);
              }}
            >
              <Text style={[styles.calloutButtonText, styles.androidCalloutButtonText]}>
                Ver Oportunidades
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
          );
        })()
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },
  containerLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.white,
  },
  textLoading: { marginTop: 10, fontSize: 16, color: theme.colors.gray_500 },
  searchBar: {
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    zIndex: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: theme.colors.gray_800,
    fontSize: 16,
  },
  emptySearchBanner: {
    position: "absolute",
    top: 126,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    zIndex: 22,
  },
  emptySearchText: {
    flex: 1,
    color: theme.colors.gray_800,
    fontSize: 12,
    fontWeight: "600",
  },
  resultNavigator: {
    position: "absolute",
    top: 126,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 22,
  },
  resultNavigatorText: {
    color: theme.colors.gray_800,
    fontSize: 12,
    fontWeight: "700",
  },
  resultNavigatorButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  resultNavigatorButtonText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  resultNavigatorActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  gpsButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: theme.colors.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    borderWidth: 2,
    borderColor: theme.colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    zIndex: 30,
  },
  toastContainer: {
    position: "absolute",
    bottom: 146,
    right: 20,
    backgroundColor: "rgba(31, 41, 55, 0.95)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    zIndex: 35,
  },
  toastText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  customCallout: {
    width: 220,
    padding: 15,
    marginBottom: 10,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 6,
    color: theme.colors.gray_900,
    textAlign: "center",
  },
  calloutDesc: {
    fontSize: 14,
    color: theme.colors.gray_500,
    marginBottom: 6,
    textAlign: "center",
  },
  calloutDistance: {
    fontSize: 13,
    color: theme.colors.gray_800,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  calloutButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  matchedProductBadge: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: theme.colors.orange_500,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 10,
  },
  matchedProductText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    flexShrink: 1,
  },
  trustMarkerBadge: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 10,
  },
  trustMarkerBadgeOk: {
    backgroundColor: theme.colors.primary,
  },
  trustMarkerBadgeWarn: {
    backgroundColor: theme.colors.orange_500,
  },
  trustMarkerBadgeText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    flexShrink: 1,
  },
  androidTrustMarkerBadge: {
    marginBottom: 7,
    paddingVertical: 5,
  },
  calloutButtonText: { color: "#FFF", fontSize: 14, fontWeight: "bold" },
  androidPinCard: {
    position: "absolute",
    backgroundColor: theme.colors.white,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
    alignItems: "center",
    zIndex: 40,
    elevation: 7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  androidCalloutTitle: {
    fontSize: 13,
    marginBottom: 3,
  },
  androidCalloutDesc: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 3,
  },
  androidCalloutDistance: {
    fontSize: 11,
    marginBottom: 7,
  },
  androidCalloutButton: {
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  androidCalloutButtonText: {
    fontSize: 12,
  },
  androidMatchedProductBadge: {
    paddingHorizontal: 6,
    paddingVertical: 5,
    marginBottom: 7,
  },
  androidMatchedProductText: {
    fontSize: 10,
  },
  calloutNavigatorWrap: {
    width: "100%",
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 7,
    marginBottom: 10,
  },
  calloutNavigatorText: {
    color: theme.colors.gray_800,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  calloutNavigatorActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  calloutNavigatorButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  calloutNavigatorButtonText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
  iosFloatingNavigator: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.97)",
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 7,
    zIndex: 38,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
});
