import { DEFAULT_PIN_REGION } from "@/features/account/utils/accountUtils";
import { appTheme as theme } from "@/theme/appTheme";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SafeMapView, {
  SafeMarker,
  PROVIDER_GOOGLE,
} from "@/components/SafeMapView";

export function PinModal({
  visible,
  onClose,
  draftGateCoords,
  onMapPressSetGate,
  onConfirmPin,
  isBuyer = false,
}) {
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);

  useEffect(() => {
    if (!visible) return;
    let isMounted = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (isMounted) setHasLocationPermission(status === "granted");
      } catch {
        if (isMounted) setHasLocationPermission(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [visible]);

  // Anima o mapa para a região do pin quando o modal abrir, se já tiver coordenadas definidas
  useEffect(() => {
    if (visible && draftGateCoords && mapRef.current) {
      const timer = setTimeout(() => {
        mapRef.current?.animateToRegion(
          {
            latitude: draftGateCoords.latitude,
            longitude: draftGateCoords.longitude,
            latitudeDelta: DEFAULT_PIN_REGION.latitudeDelta,
            longitudeDelta: DEFAULT_PIN_REGION.longitudeDelta,
          },
          500
        );
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const title = isBuyer ? "Meu endereço" : "Marcar porteira";
  const subtitle = isBuyer
    ? "Mova o mapa para a porta da sua casa e toque para posicionar o pin."
    : "Toque no mapa para posicionar o pin no ponto exato da entrada da propriedade.";
  const markerTitle = isBuyer ? "Meu endereço" : "Porteira da fazenda";
  const alertMsg = isBuyer
    ? "Toque no mapa para definir o seu endereço."
    : "Toque no mapa para definir a porteira.";

  const initialRegion = useMemo(() => {
    return draftGateCoords
      ? {
          latitude: draftGateCoords.latitude,
          longitude: draftGateCoords.longitude,
          latitudeDelta: DEFAULT_PIN_REGION.latitudeDelta,
          longitudeDelta: DEFAULT_PIN_REGION.longitudeDelta,
        }
      : DEFAULT_PIN_REGION;
  }, [draftGateCoords]);

  // Mudança de chave força o SafeMapView a re-renderizar, garantindo que as permissões de localização sejam aplicadas corretamente ao abrir o modal
  const mapKey = useMemo(() => {
    return `pin-map-${visible ? "open" : "closed"}`;
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.pinModalBackdrop}>
        <View
          style={[
            styles.pinModalCard,
            { paddingBottom: Math.max(insets.bottom, 14) },
          ]}
        >
          <View style={styles.pinModalHeader}>
            <Text style={styles.pinModalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={theme.colors.gray_800} />
            </TouchableOpacity>
          </View>

          <Text style={styles.pinModalSubtitle}>{subtitle}</Text>

          <SafeMapView
            ref={mapRef}
            key={mapKey}
            style={styles.pinMap}
            provider={PROVIDER_GOOGLE}
            showsUserLocation={hasLocationPermission}
            showsMyLocationButton={hasLocationPermission}
            initialRegion={initialRegion}
            onPress={onMapPressSetGate}
          >
            {draftGateCoords ? (
              <SafeMarker
                coordinate={draftGateCoords}
                title={markerTitle}
                pinColor={theme.colors.primary}
              />
            ) : null}
          </SafeMapView>

          <TouchableOpacity
            style={styles.pinConfirmButton}
            onPress={() => {
              if (!draftGateCoords) {
                Alert.alert("Marque um ponto", alertMsg);
                return;
              }
              onConfirmPin();
            }}
          >
            <Text style={styles.pinConfirmButtonText}>Inserir Pin</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  pinModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.45)",
    justifyContent: "flex-end",
  },
  pinModalCard: {
    height: "82%",
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 14,
  },
  pinModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  pinModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  pinModalSubtitle: {
    fontSize: 13,
    color: theme.colors.gray_500,
    marginBottom: 10,
  },
  pinMap: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  pinConfirmButton: {
    backgroundColor: theme.colors.gray_800,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  pinConfirmButtonText: {
    color: theme.colors.white,
    fontWeight: "bold",
    fontSize: 14,
  },
});
