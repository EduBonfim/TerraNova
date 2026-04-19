import { DEFAULT_PIN_REGION } from '@/features/account/utils/accountUtils';
import { appTheme as theme } from '@/theme/appTheme';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { MapPressEvent, Marker } from 'react-native-maps';

interface PinModalProps {
  visible: boolean;
  onClose: () => void;
  draftGateCoords: { latitude: number; longitude: number; } | null;
  onMapPressSetGate: (e: MapPressEvent) => void;
  onConfirmPin: () => void;
  /** Quando true, usa linguagem de endereço residencial em vez de porteira/fazenda */
  isBuyer?: boolean;
}

export function PinModal({
  visible,
  onClose,
  draftGateCoords,
  onMapPressSetGate,
  onConfirmPin,
  isBuyer = false,
}: PinModalProps) {
  const title    = isBuyer ? "Meu endereço" : "Marcar porteira";
  const subtitle = isBuyer
    ? "Mova o mapa para a porta da sua casa e toque para posicionar o pin."
    : "Toque no mapa para posicionar o pin no ponto exato da entrada da propriedade.";
  const markerTitle  = isBuyer ? "Meu endereço" : "Porteira da fazenda";
  const alertMsg     = isBuyer ? "Toque no mapa para definir o seu endereço." : "Toque no mapa para definir a porteira.";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.pinModalBackdrop}>
        <View style={styles.pinModalCard}>
          <View style={styles.pinModalHeader}>
            <Text style={styles.pinModalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={theme.colors.gray_800} />
            </TouchableOpacity>
          </View>

          <Text style={styles.pinModalSubtitle}>{subtitle}</Text>

          <MapView
            style={styles.pinMap}
            initialRegion={
              draftGateCoords
                ? {
                    latitude: draftGateCoords.latitude,
                    longitude: draftGateCoords.longitude,
                    latitudeDelta: DEFAULT_PIN_REGION.latitudeDelta,
                    longitudeDelta: DEFAULT_PIN_REGION.longitudeDelta,
                  }
                : DEFAULT_PIN_REGION
            }
            onPress={onMapPressSetGate}
          >
            {draftGateCoords ? (
              <Marker coordinate={draftGateCoords} title={markerTitle} />
            ) : null}
          </MapView>

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
