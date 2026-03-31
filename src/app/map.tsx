import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SurfaceCard } from "../components/SurfaceCard";
import { getProfileSummary, initCommunityStore } from "../services/communityStore";

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

export default function MapScreen() {
  const [localUsuario, setLocalUsuario] =
    useState<Location.LocationObject | null>(null);
  const [myFarmGate, setMyFarmGate] = useState<{ latitude: number; longitude: number } | null>(null);
  const [erroLocal, setErroLocal] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();
  const profileName = "Pedro Paulo";

  const initialRegion = {
    latitude: -17.7915,
    longitude: -50.9,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  // hook do GPS devolvido e verificado
  useEffect(() => {
    async function obterPermissaoLocal() {
      await initCommunityStore();
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
  }, []);

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
        style={styles.map}
        initialRegion={initialRegion}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {PONTOS_LOGISTICOS.map((ponto) => (
          <Marker
            key={ponto.id}
            coordinate={ponto.coords}
            pinColor={
              ponto.tipo === "armazem"
                ? theme.colors.brown_500
                : theme.colors.primary
            }
            onCalloutPress={() => {
              if (ponto.tipo === "fazenda") router.push("/profile");
            }}
          >
            <Callout
              tooltip={true}
              onPress={() => {
                if (ponto.tipo === "fazenda") router.push("/profile");
              }}
            >
              <SurfaceCard style={styles.customCallout} bordered={false}>
                <Text style={styles.calloutTitle}>{ponto.titulo}</Text>
                <Text style={styles.calloutDesc}>{ponto.descricao}</Text>
                {ponto.tipo === "fazenda" && (
                  <View style={styles.calloutButton}>
                    <Text style={styles.calloutButtonText}>
                      Ver Oportunidades
                    </Text>
                  </View>
                )}
              </SurfaceCard>
            </Callout>
          </Marker>
        ))}

        {myFarmGate ? (
          <Marker coordinate={myFarmGate} pinColor={theme.colors.orange_500}>
            <Callout tooltip>
              <SurfaceCard style={styles.customCallout} bordered={false}>
                <Text style={styles.calloutTitle}>Minha porteira</Text>
                <Text style={styles.calloutDesc}>Localizacao validada com CEP + pin manual.</Text>
              </SurfaceCard>
            </Callout>
          </Marker>
        ) : null}
      </MapView>
      {/* Cores da pesquisa e GPS atualizadas */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={theme.colors.gray_300} />
        <Text style={styles.searchPlaceholder}>Buscar Insumos no Radar...</Text>
      </View>
      <TouchableOpacity style={styles.gpsButton}>
        <Ionicons name="locate" size={24} color="#FFFFFF" />
      </TouchableOpacity>
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
    top: 60,
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
  },
  searchPlaceholder: {
    marginLeft: 10,
    color: theme.colors.gray_300,
    fontSize: 16,
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
  calloutButtonText: { color: "#FFF", fontSize: 14, fontWeight: "bold" },
});
