import { SurfaceCard } from "@/components/SurfaceCard";
import { useMapLogic } from "@/features/map/hooks/useMapLogic";
import { getProfileSummary } from "@/services/communityStore";
import { appTheme as theme } from "@/theme/appTheme";
import { formatDistanceLabel, getDistanceKm } from "@/utils/geoUtils";
import { Ionicons } from "@expo/vector-icons";
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";

export default function MapScreen() {
  const {
    screenWidth,
    androidCardWidth,
    iosNavigatorWidth,
    androidCardHeight,
    setAndroidCardHeight,
    mapRef,
    markerRefs,
    localUsuario,
    myFarmGate,
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
  } = useMapLogic();

  const _getDistanceFromUserKm = (coords: { latitude: number; longitude: number }) => {
    if (!localUsuario) return null;
    return getDistanceKm(localUsuario.coords, coords);
  };

  const _formatDistanceLabel = (coords: { latitude: number; longitude: number }) => {
    const distanceKm = _getDistanceFromUserKm(coords);
    return formatDistanceLabel(distanceKm);
  };

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
        onPress={onMapPress}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {filteredPoints.map((ponto) => {
          const matchedProduct = getMatchedProductLabel(ponto);
          const isActiveResult = activeResultId === ponto.id;
          const trustSummary = ponto.tipo === "fazenda" ? getProfileSummary(ponto.titulo) : null;
          const isFullyValidated = Boolean(trustSummary?.isCepValidated && trustSummary?.isGatePinConfirmed);
          const distanceLabel = _formatDistanceLabel(ponto.coords);
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
        })}

        {myFarmGate ? (
          <Marker
            coordinate={myFarmGate}
            pinColor={theme.colors.orange_500}
            title={Platform.OS === "ios" ? "Minha porteira" : undefined}
            description={
              Platform.OS === "ios"
                ? `Localizacao validada com CEP + pin manual.\n${_formatDistanceLabel(myFarmGate)}`
                : undefined
            }
          >
            {Platform.OS === "ios" ? (
              <Callout tooltip={true}>
                <SurfaceCard style={styles.customCallout} bordered={false}>
                  <Text style={styles.calloutTitle}>Minha porteira</Text>
                  <Text style={styles.calloutDesc}>Localizacao validada com CEP + pin manual.</Text>
                  <Text style={styles.calloutDistance}>{_formatDistanceLabel(myFarmGate)}</Text>
                </SurfaceCard>
              </Callout>
            ) : null}
          </Marker>
        ) : null}
      </MapView>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={theme.colors.gray_300} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar Insumos no Radar..."
          placeholderTextColor={theme.colors.gray_500}
          value={searchKeyword}
          onFocus={() => {
            if (Platform.OS === "ios") setIosNavigatorPosition(null);
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
                {_formatDistanceLabel(selectedAndroidPoint.coords)}
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
  gpsButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: theme.colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10,
  },
  toastContainer: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
    zIndex: 25,
  },
  toastText: { color: theme.colors.white, fontSize: 13, fontWeight: "600" },
  customCallout: { width: 220, padding: 12, borderRadius: 12 },
  calloutTitle: { fontSize: 16, fontWeight: "bold", color: theme.colors.gray_900, marginBottom: 4 },
  calloutDesc: { fontSize: 13, color: theme.colors.gray_500, marginBottom: 8 },
  calloutDistance: { fontSize: 12, color: theme.colors.primary, fontWeight: "bold", marginBottom: 8 },
  trustMarkerBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 7, paddingVertical: 4, borderRadius: 6, gap: 5, marginBottom: 8 },
  trustMarkerBadgeOk: { backgroundColor: "#10B981" },
  trustMarkerBadgeWarn: { backgroundColor: "#F59E0B" },
  trustMarkerBadgeText: { color: theme.colors.white, fontSize: 10, fontWeight: "bold" },
  matchedProductBadge: { flexDirection: "row", alignItems: "center", backgroundColor: theme.colors.orange_500, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 6, gap: 5, marginBottom: 8 },
  matchedProductText: { color: theme.colors.white, fontSize: 10, fontWeight: "bold" },
  calloutButton: { backgroundColor: theme.colors.primary, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  calloutButtonText: { color: theme.colors.white, fontSize: 12, fontWeight: "bold" },
  iosFloatingNavigator: { position: "absolute", backgroundColor: theme.colors.primary, borderRadius: 12, padding: 10, elevation: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, zIndex: 100 },
  calloutNavigatorText: { color: theme.colors.white, fontSize: 12, fontWeight: "bold", textAlign: "center", marginBottom: 8 },
  calloutNavigatorActions: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  calloutNavigatorButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.2)", paddingVertical: 5, borderRadius: 6, gap: 4 },
  calloutNavigatorButtonText: { color: theme.colors.white, fontSize: 11, fontWeight: "600" },
  androidPinCard: { position: "absolute", backgroundColor: theme.colors.white, borderRadius: 12, padding: 12, elevation: 10, zIndex: 100, borderWidth: 1, borderColor: theme.colors.gray_200 },
  androidCalloutTitle: { fontSize: 15 },
  androidCalloutDesc: { fontSize: 12 },
  androidCalloutDistance: { fontSize: 11 },
  androidTrustMarkerBadge: { alignSelf: "flex-start" },
  androidMatchedProductBadge: { alignSelf: "flex-start" },
  androidMatchedProductText: { fontSize: 9 },
  androidCalloutButton: { marginTop: 4 },
  androidCalloutButtonText: { fontSize: 11 },
  calloutNavigatorWrap: { marginTop: 2, marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.gray_100 },
});
