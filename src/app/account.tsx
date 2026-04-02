import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  Alert,
  Modal,
  Pressable,
  StatusBar,
  ActivityIndicator,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView, { Marker, type MapPressEvent } from "react-native-maps";
import { AppHeader } from "../components/AppHeader";
import { useAuth } from "../contexts/AuthContext";
import {
  addFarmPhoto,
  getFarmPhotos,
  getProfileAvatar,
  getProfileSummary,
  initCommunityStore,
  removeFarmPhoto,
  setProfileAvatar,
  updateProfileSummary,
} from "../services/communityStore";

const theme = {
  colors: {
    primary: "#6B8E23",
    lightGreen: "#E8F5E9",
    white: "#FFFFFF",
    background: "#F5F5F5",
    gray_200: "#E5E7EB",
    gray_300: "#D1D5DB",
    gray_500: "#6B7280",
    gray_800: "#1F2937",
    orange_500: "#F9A825",
    red_500: "#EF4444",
  },
};

const IOS_VISUAL = {
  modalCloseTop: 58,
  logoutBottomSpacer: 120,
};

const ANDROID_VISUAL = {
  modalCloseTop: 32,
  logoutBottomSpacer: 100,
};

const CURRENT_PLATFORM_UI = Platform.OS === "ios" ? IOS_VISUAL : ANDROID_VISUAL;
const PROFILE_BIO_MAX = 220;

type GateCoordinate = {
  latitude: number;
  longitude: number;
};

const DEFAULT_PIN_REGION = {
  latitude: -17.7915,
  longitude: -50.9,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

const normalizeCep = (value: string) => value.replace(/\D/g, "").slice(0, 8);

const formatCep = (value: string) => {
  const digits = normalizeCep(value);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

const formatValidationTimestamp = (value?: string | null) => {
  if (!value) return "Nao validado";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Nao validado";
  return date.toLocaleString("pt-BR");
};

export default function AccountScreen() {
  const profileName = "Pedro Paulo";
  const { logout } = useAuth();
  const summary = getProfileSummary(profileName);
  const [displayName, setDisplayName] = useState(summary.displayName);
  const [farmName, setFarmName] = useState(summary.farmName);
  const [producerRole, setProducerRole] = useState(summary.producerRole);
  const [farmAddress, setFarmAddress] = useState(summary.farmAddress);
  const [farmCep, setFarmCep] = useState(summary.farmCep);
  const [gateCoords, setGateCoords] = useState<GateCoordinate | null>(
    summary.gateLatitude != null && summary.gateLongitude != null
      ? { latitude: summary.gateLatitude, longitude: summary.gateLongitude }
      : null,
  );
  const [isCepValidated, setIsCepValidated] = useState(summary.isCepValidated);
  const [isGatePinConfirmed, setIsGatePinConfirmed] = useState(summary.isGatePinConfirmed);
  const [locationValidatedAt, setLocationValidatedAt] = useState<string | null>(
    summary.locationValidatedAt,
  );
  const [profileBio, setProfileBio] = useState(summary.bio);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [draftDisplayName, setDraftDisplayName] = useState(displayName);
  const [draftFarmName, setDraftFarmName] = useState(farmName);
  const [draftProducerRole, setDraftProducerRole] = useState(producerRole);
  const [draftFarmAddress, setDraftFarmAddress] = useState(farmAddress);
  const [draftFarmCep, setDraftFarmCep] = useState(formatCep(farmCep));
  const [draftGateCoords, setDraftGateCoords] = useState<GateCoordinate | null>(gateCoords);
  const [draftIsCepValidated, setDraftIsCepValidated] = useState(isCepValidated);
  const [draftIsGatePinConfirmed, setDraftIsGatePinConfirmed] = useState(isGatePinConfirmed);
  const [draftLocationValidatedAt, setDraftLocationValidatedAt] = useState<string | null>(
    locationValidatedAt,
  );
  const [draftProfileBio, setDraftProfileBio] = useState(profileBio);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isCepResolving, setIsCepResolving] = useState(false);
  const [lastAutoValidatedCep, setLastAutoValidatedCep] = useState("");

  const [farmPhotos, setFarmPhotos] = useState<string[]>(getFarmPhotos(profileName));
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(
    summary.avatarUri ?? getProfileAvatar(profileName),
  );
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [isRatingsModalOpen, setIsRatingsModalOpen] = useState(false);
  const [isAccountHealthOpen, setIsAccountHealthOpen] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(true);
  const [isSalesMetricsOpen, setIsSalesMetricsOpen] = useState(false);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [selectedOrderTab, setSelectedOrderTab] = useState<"aguardando" | "transporte" | "finalizado">("aguardando");
  const [salesPeriod, setSalesPeriod] = useState<"dias" | "semanas" | "meses" | "total">("total");

  // Função para obter dados de vendas baseado no período
  const getSalesDataByPeriod = () => {
    switch (salesPeriod) {
      case "dias":
        return { total: 32, alimentos: 12, insumos: 9, sementes: 11 };
      case "semanas":
        return { total: 98, alimentos: 36, insumos: 30, sementes: 32 };
      case "meses":
        return { total: 180, alimentos: 67, insumos: 54, sementes: 59 };
      case "total":
        return { total: 213, alimentos: 92, insumos: 63, sementes: 58 };
      default:
        return { total: 213, alimentos: 92, insumos: 63, sementes: 58 };
    }
  };

  const myOrders = {
    aguardando: [
      { id: "VND001", produto: "Milho Amarelo Premium", quantidade: "50 kg", valor: "R$ 450,00", data: "01/04/2025", comprador: "João Silva" },
      { id: "VND002", produto: "Adubo NPK", quantidade: "25 kg", valor: "R$ 320,00", data: "31/03/2025", comprador: "Maria Santos" },
    ],
    transporte: [
      { id: "VND003", produto: "Sementes de Soja", quantidade: "100 kg", valor: "R$ 850,00", data: "30/03/2025", comprador: "Agropecuária XYZ", transportadora: "Translog" },
      { id: "VND004", produto: "Fertilizante Orgânico", quantidade: "200 kg", valor: "R$ 1.200,00", data: "28/03/2025", comprador: "Fazenda do Vale", transportadora: "Sedex Agro" },
    ],
    finalizado: [
      { id: "VND005", produto: "Feijão Carioca", quantidade: "80 kg", valor: "R$ 960,00", data: "25/03/2025", comprador: "Cooperativa Rural" },
      { id: "VND006", produto: "Milho Verde", quantidade: "40 kg", valor: "R$ 380,00", data: "24/03/2025", comprador: "Mercado Central" },
      { id: "VND007", produto: "Calcário Agrícola", quantidade: "500 kg", valor: "R$ 2.500,00", data: "20/03/2025", comprador: "Granja Pousada" },
    ],
  };

  const exportToCSV = async () => {
    try {
      const currentDate = new Date().toLocaleDateString("pt-BR");
      const currentTime = new Date().toLocaleTimeString("pt-BR");
      
      const periodLabels: Record<string, string> = {
        dias: "Últimos 7 dias",
        semanas: "Últimas 4 semanas",
        meses: "Últimos 3 meses",
        total: "Total acumulado"
      };

      const csvData = [
        ["🌾 TERRA NOVA - CONECTANDO FAZENDAS 🌾"],
        [""],
        ["RELATÓRIO DE VENDAS"],
        [""],
        ["Fazenda:", farmName],
        ["Produtor:", displayName],
        ["Endereço:", `${farmAddress}, CEP ${farmCep}`],
        [""],
        ["Período:", periodLabels[salesPeriod as keyof typeof periodLabels]],
        ["Data do Relatório:", `${currentDate} às ${currentTime}`],
        [""],
        ["─────────────────────────────────────────"],
        ["RESUMO DE VENDAS"],
        ["─────────────────────────────────────────"],
        [""],
        ["Categoria", "Quantidade", "% do Total"],
        ["Alimentos", salesData.alimentos, `${((salesData.alimentos / salesData.total) * 100).toFixed(1)}%`],
        ["Insumos", salesData.insumos, `${((salesData.insumos / salesData.total) * 100).toFixed(1)}%`],
        ["Sementes", salesData.sementes, `${((salesData.sementes / salesData.total) * 100).toFixed(1)}%`],
        [""],
        ["─────────────────────────────────────────"],
        ["TOTAL GERAL", salesData.total, "100%"],
        ["─────────────────────────────────────────"],
        [""],
        ["Relatório gerado automaticamente pelo app Terra Nova"],
        ["Conectando Fazendas - Marketplace Agrícola"],
      ]
        .map((row) => row.join(","))
        .join("\n");

      await Share.share({
        message: csvData,
        title: "Relatório de Vendas - Terra Nova",
        url: undefined,
      });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível exportar o relatório");
    }
  };

  const salesData = getSalesDataByPeriod();

  useEffect(() => {
    let isMounted = true;

    const loadCommunityProfile = async () => {
      await initCommunityStore();
      if (!isMounted) return;

      const nextSummary = getProfileSummary(profileName);
      setDisplayName(nextSummary.displayName);
      setFarmName(nextSummary.farmName);
      setProducerRole(nextSummary.producerRole);
      setFarmAddress(nextSummary.farmAddress);
      setFarmCep(nextSummary.farmCep);
      const nextCoords =
        nextSummary.gateLatitude != null && nextSummary.gateLongitude != null
          ? { latitude: nextSummary.gateLatitude, longitude: nextSummary.gateLongitude }
          : null;
      setGateCoords(nextCoords);
      setIsCepValidated(nextSummary.isCepValidated);
      setIsGatePinConfirmed(nextSummary.isGatePinConfirmed);
      setLocationValidatedAt(nextSummary.locationValidatedAt);
      setProfileBio(nextSummary.bio);
      setFarmPhotos(getFarmPhotos(profileName));
      setProfilePhotoUri(nextSummary.avatarUri ?? getProfileAvatar(profileName));
    };

    loadCommunityProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const openGalleryPicker = async (): Promise<string | null> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permissao necessaria",
        "Ative a permissao da galeria para selecionar fotos.",
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) {
      return null;
    }

    return result.assets[0].uri;
  };

  const openCameraPicker = async (): Promise<string | null> => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permissao necessaria", "Ative a permissao da camera para tirar fotos.");
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) {
      return null;
    }

    return result.assets[0].uri;
  };

  const onPickProfilePhoto = async () => {
    const uri = await openGalleryPicker();
    if (!uri) return;

    setProfileAvatar(profileName, uri);
    setProfilePhotoUri(uri);
  };

  const onTakeProfilePhoto = async () => {
    const uri = await openCameraPicker();
    if (!uri) return;

    setProfileAvatar(profileName, uri);
    setProfilePhotoUri(uri);
  };

  const onPickFarmPhoto = async () => {
    const uri = await openGalleryPicker();
    if (!uri) return;

    const result = addFarmPhoto(profileName, uri);
    if (!result.ok) {
      Alert.alert(
        "Limite atingido",
        "Você pode adicionar no máximo 5 fotos por perfil.",
      );
      return;
    }

    setFarmPhotos(getFarmPhotos(profileName));
  };

  const onTakeFarmPhoto = async () => {
    const uri = await openCameraPicker();
    if (!uri) return;

    const result = addFarmPhoto(profileName, uri);
    if (!result.ok) {
      Alert.alert(
        "Limite atingido",
        "Você pode adicionar no máximo 5 fotos por perfil.",
      );
      return;
    }

    setFarmPhotos(getFarmPhotos(profileName));
  };

  const onRemovePhoto = (uri: string) => {
    removeFarmPhoto(profileName, uri);
    setFarmPhotos(getFarmPhotos(profileName));
  };

  const openPinPlacementModal = () => {
    setIsEditProfileOpen(false);
    setTimeout(() => {
      setIsPinModalOpen(true);
    }, 120);
  };

  const resolveCepAndOpenPin = async (inputCep: string) => {
    const cepDigits = normalizeCep(inputCep);
    if (cepDigits.length !== 8) {
      Alert.alert("CEP invalido", "Informe um CEP com 8 digitos.");
      setLastAutoValidatedCep("");
      return;
    }

    try {
      setIsCepResolving(true);
      const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
      if (!response.ok) {
        throw new Error("cep_lookup_failed");
      }

      const data = (await response.json()) as {
        erro?: boolean;
        logradouro?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
      };

      if (data.erro || !data.localidade || !data.uf) {
        Alert.alert("CEP nao encontrado", "Nao foi possivel validar esse CEP.");
        setLastAutoValidatedCep("");
        return;
      }

      const resolvedAddress = [data.logradouro, data.bairro, `${data.localidade} - ${data.uf}`]
        .filter(Boolean)
        .join(", ");

      if (resolvedAddress) {
        setDraftFarmAddress(resolvedAddress);
      }

      let suggestedCoords: GateCoordinate | null = draftGateCoords;
      try {
        const geocoded = await Location.geocodeAsync(
          `${resolvedAddress || `${data.localidade} - ${data.uf}`}, Brasil`,
        );

        if (geocoded.length) {
          suggestedCoords = {
            latitude: geocoded[0].latitude,
            longitude: geocoded[0].longitude,
          };
        }
      } catch {
        // Continue with fallback flow when geocoding is unavailable.
      }

      if (!suggestedCoords) {
        try {
          const current = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          suggestedCoords = {
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
          };
        } catch {
          suggestedCoords = {
            latitude: DEFAULT_PIN_REGION.latitude,
            longitude: DEFAULT_PIN_REGION.longitude,
          };
        }
      }

      setDraftFarmCep(formatCep(cepDigits));
      setDraftGateCoords(suggestedCoords);
      setDraftIsCepValidated(true);
      setDraftIsGatePinConfirmed(false);
      setDraftLocationValidatedAt(null);
      openPinPlacementModal();
    } catch {
      Alert.alert(
        "Falha ao validar CEP",
        "Nao foi possivel consultar esse CEP agora. Voce ainda pode marcar a porteira manualmente.",
      );

      let fallbackCoords: GateCoordinate | null = draftGateCoords;
      if (!fallbackCoords) {
        try {
          const current = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          fallbackCoords = {
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
          };
        } catch {
          fallbackCoords = {
            latitude: DEFAULT_PIN_REGION.latitude,
            longitude: DEFAULT_PIN_REGION.longitude,
          };
        }
      }

      setDraftGateCoords(fallbackCoords);
      openPinPlacementModal();
      setLastAutoValidatedCep("");
    } finally {
      setIsCepResolving(false);
    }
  };

  const onDraftCepChange = (text: string) => {
    const formatted = formatCep(text);
    setDraftFarmCep(formatted);
    setDraftIsCepValidated(false);
    setDraftIsGatePinConfirmed(false);
    setDraftLocationValidatedAt(null);

    const cepDigits = normalizeCep(formatted);
    if (cepDigits.length < 8) {
      setLastAutoValidatedCep("");
      return;
    }

    if (isCepResolving || cepDigits === lastAutoValidatedCep) {
      return;
    }

    setLastAutoValidatedCep(cepDigits);
    void resolveCepAndOpenPin(cepDigits);
  };

  const onMapPressSetGate = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setDraftGateCoords({ latitude, longitude });
  };

  const openEditProfile = () => {
    setDraftDisplayName(displayName);
    setDraftFarmName(farmName);
    setDraftProducerRole(producerRole);
    setDraftFarmAddress(farmAddress);
    setDraftFarmCep(formatCep(farmCep));
    setDraftGateCoords(gateCoords);
    setDraftIsCepValidated(isCepValidated);
    setDraftIsGatePinConfirmed(isGatePinConfirmed);
    setDraftLocationValidatedAt(locationValidatedAt);
    setDraftProfileBio(profileBio);
    setIsEditProfileOpen(true);
  };

  const closeEditProfile = () => {
    setIsEditProfileOpen(false);
  };

  const onSaveProfile = () => {
    const nextName = draftDisplayName.trim();
    const nextFarm = draftFarmName.trim();
    const nextRole = draftProducerRole.trim();
    const nextAddress = draftFarmAddress.trim();
    const nextCep = normalizeCep(draftFarmCep);
    const nextBio = draftProfileBio.trim();

    if (!nextName || !nextFarm || !nextRole || !nextAddress || !nextBio || !nextCep) {
      Alert.alert("Campos obrigatórios", "Preencha nome, fazenda, função, endereço, CEP e descrição.");
      return;
    }

    if (nextCep.length !== 8) {
      Alert.alert("CEP invalido", "O CEP deve ter 8 digitos.");
      return;
    }

    if (!draftGateCoords) {
      Alert.alert("Defina a porteira", "Valide o CEP e marque o pin da porteira no mapa.");
      return;
    }

    if (!draftIsCepValidated || !draftIsGatePinConfirmed) {
      Alert.alert("Validacao pendente", "Valide o CEP e confirme manualmente o pin da porteira.");
      return;
    }

    if (nextBio.length > PROFILE_BIO_MAX) {
      Alert.alert("Bio muito longa", `Use no máximo ${PROFILE_BIO_MAX} caracteres.`);
      return;
    }

    setDisplayName(nextName);
    setFarmName(nextFarm);
    setProducerRole(nextRole);
    setFarmAddress(nextAddress);
    setFarmCep(nextCep);
    setGateCoords(draftGateCoords);
    setIsCepValidated(draftIsCepValidated);
    setIsGatePinConfirmed(draftIsGatePinConfirmed);
    setLocationValidatedAt(draftLocationValidatedAt);
    setProfileBio(nextBio);
    updateProfileSummary(profileName, {
      displayName: nextName,
      farmName: nextFarm,
      producerRole: nextRole,
      farmAddress: nextAddress,
      farmCep: nextCep,
      gateLatitude: draftGateCoords.latitude,
      gateLongitude: draftGateCoords.longitude,
      isCepValidated: draftIsCepValidated,
      isGatePinConfirmed: draftIsGatePinConfirmed,
      locationValidatedAt: draftLocationValidatedAt ?? undefined,
      bio: nextBio,
    });
    closeEditProfile();
  };

  return (
    <>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
        <AppHeader
          title="Central"
        onBackPress={() => router.replace("/home")}
        showBackButton={false}
        titleAlign="center"
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        borderColor={theme.colors.gray_200}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Header Section */}
        <View style={styles.profileHeaderSection}>
          <TouchableOpacity
            style={styles.profileHeaderContent}
            onPress={openEditProfile}
          >
            <Image
              source={
                profilePhotoUri
                  ? { uri: profilePhotoUri }
                  : require("../assets/perfil.png")
              }
              style={styles.profileHeaderAvatar}
            />
            <View style={styles.profileHeaderInfo}>
              <Text style={styles.profileHeaderName}>{displayName}</Text>
              <Text style={styles.profileHeaderSubtitle}>Meu perfil</Text>
              <Text style={styles.profileHeaderFarm}>{farmName}</Text>
              <Text style={styles.profileHeaderState}>
                {farmAddress.split("-")[1]?.trim() || "Estado não informado"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.gray_500} />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsQuickRow}>
          <TouchableOpacity
            style={styles.quickStatItem}
            onPress={() => setIsRatingsModalOpen(true)}
          >
            <Text style={styles.quickStatNumber}>4.9</Text>
            <Text style={styles.quickStatLabel}>
              <Ionicons name="star" size={11} color={theme.colors.orange_500} /> Avaliação
            </Text>
          </TouchableOpacity>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatNumber}>100%</Text>
            <Text style={styles.quickStatLabel}>Completo</Text>
          </View>
        </View>

        {/* Menu Section - My Activity */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Minha atividade</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/soil-reports")}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons
                name="document-text-outline"
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.menuItemText}>Meus Laudos de Solo</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.gray_500}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setIsMyOrdersOpen(true)}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons
                name="cart-outline"
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.menuItemText}>Minhas Vendas</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.gray_500}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/messages")}
          >
            <View style={[styles.menuIconContainer, styles.chatIconContainer]}>
              <Ionicons
                name="chatbubble-outline"
                size={24}
                color={theme.colors.primary}
              />
              {hasNewMessages && <View style={styles.notificationDot} />}
            </View>
            <Text style={styles.menuItemText}>Chat</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.gray_500}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/certificates")}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons
                name="shield-checkmark-outline"
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.menuItemText}>Certificados MAPA</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.gray_500}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/transport")}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons
                name="car-outline"
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.menuItemText}>Transporte e Frete</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.gray_500}
            />
          </TouchableOpacity>
        </View>

        {/* Menu Section - Discover */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Descubra</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setIsAccountHealthOpen(true)}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons
                name="heart-outline"
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.menuItemText}>Saúde da Conta</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.gray_500}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/organic")}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons
                name="leaf-outline"
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.menuItemText}>Seja Orgânico!</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.gray_500}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setIsSalesMetricsOpen(true)}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons
                name="bar-chart-outline"
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.menuItemText}>Relatórios e Métricas</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.gray_500}
            />
          </TouchableOpacity>
        </View>

        {/* Menu Section - Settings */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Configurações</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/privacy-lgpd")}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons
                name="shield-outline"
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.menuItemText}>Privacidade e LGPD</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.gray_500}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={openEditProfile}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons
                name="create-outline"
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.menuItemText}>Editar perfil</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.gray_500}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={() => {
            Alert.alert(
              "Confirmar",
              "Tem certeza que deseja sair da sua conta?",
              [
                { text: "Cancelar", onPress: () => {}, style: "cancel" },
                {
                  text: "Sair",
                  onPress: async () => {
                    await logout();
                    router.replace("/");
                  },
                  style: "destructive",
                },
              ],
            );
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.colors.red_500} />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>

        <View style={styles.logoutSpacer} />
      </ScrollView>

      <Modal
        visible={isEditProfileOpen}
        transparent
        animationType="slide"
        onRequestClose={closeEditProfile}
      >
        <View style={styles.editModalBackdrop}>
          <View style={styles.editModalCard}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Editar perfil</Text>
              <TouchableOpacity onPress={closeEditProfile}>
                <Ionicons name="close" size={22} color={theme.colors.gray_800} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.editLabel}>Meu nome</Text>
              <TextInput
                style={styles.photoInput}
                placeholder="Seu nome"
                placeholderTextColor={theme.colors.gray_500}
                value={draftDisplayName}
                onChangeText={setDraftDisplayName}
              />

              <Text style={styles.editLabel}>Nome da fazenda</Text>
              <TextInput
                style={styles.photoInput}
                placeholder="Nome da fazenda"
                placeholderTextColor={theme.colors.gray_500}
                value={draftFarmName}
                onChangeText={setDraftFarmName}
              />

              <Text style={styles.editLabel}>Função</Text>
              <TextInput
                style={styles.photoInput}
                placeholder="Ex: Agricultor Familiar"
                placeholderTextColor={theme.colors.gray_500}
                value={draftProducerRole}
                onChangeText={setDraftProducerRole}
              />

              <Text style={styles.editLabel}>Endereço da fazenda</Text>
              <TextInput
                style={styles.photoInput}
                placeholder="Ex: Rio Verde, GO - Bairro/Comunidade"
                placeholderTextColor={theme.colors.gray_500}
                value={draftFarmAddress}
                onChangeText={setDraftFarmAddress}
              />

              <Text style={styles.editLabel}>CEP da fazenda</Text>
              <TextInput
                style={styles.photoInput}
                placeholder="00000-000"
                placeholderTextColor={theme.colors.gray_500}
                value={draftFarmCep}
                onChangeText={onDraftCepChange}
                keyboardType="number-pad"
                maxLength={9}
              />
              <TouchableOpacity
                style={styles.validateCepButton}
                onPress={() => resolveCepAndOpenPin(draftFarmCep)}
                disabled={isCepResolving}
              >
                {isCepResolving ? (
                  <ActivityIndicator size="small" color={theme.colors.white} />
                ) : (
                  <>
                    <Ionicons name="pin-outline" size={16} color={theme.colors.white} />
                    <Text style={styles.validateCepButtonText}>Validar CEP e marcar porteira</Text>
                  </>
                )}
              </TouchableOpacity>
              <Text style={styles.cepHelperText}>
                Ao validar o CEP, um mapa abre para voce posicionar o pin exatamente na porteira.
              </Text>

              <Text style={styles.editLabel}>Descrição do perfil</Text>
              <TextInput
                style={[styles.photoInput, styles.profileBioInput]}
                placeholder="Conte um pouco sobre o seu trabalho"
                placeholderTextColor={theme.colors.gray_500}
                value={draftProfileBio}
                onChangeText={setDraftProfileBio}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={PROFILE_BIO_MAX}
              />
              <Text style={styles.profileBioCounter}>
                {draftProfileBio.length}/{PROFILE_BIO_MAX}
              </Text>

              <Text style={styles.editLabel}>Foto de perfil</Text>
              <View style={styles.editAvatarRow}>
                <Image
                  source={
                    profilePhotoUri
                      ? { uri: profilePhotoUri }
                      : require("../assets/perfil.png")
                  }
                  style={styles.editAvatar}
                />
                <View style={styles.editAvatarActionsCol}>
                  <TouchableOpacity style={styles.editActionPrimary} onPress={onPickProfilePhoto}>
                    <Ionicons name="images-outline" size={16} color={theme.colors.white} />
                    <Text style={styles.editActionPrimaryText}>Galeria</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editActionSecondary} onPress={onTakeProfilePhoto}>
                    <Ionicons name="camera-outline" size={16} color={theme.colors.primary} />
                    <Text style={styles.editActionSecondaryText}>Camera</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.editLabel}>Fotos da fazenda ({farmPhotos.length}/5)</Text>
              <TouchableOpacity style={styles.addPhotoGalleryButton} onPress={onPickFarmPhoto}>
                <Ionicons name="images-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.addPhotoGalleryButtonText}>Adicionar da galeria</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.addPhotoCameraButton} onPress={onTakeFarmPhoto}>
                <Ionicons name="camera-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.addPhotoCameraButtonText}>Adicionar da camera</Text>
              </TouchableOpacity>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.galleryRow}
              >
                {farmPhotos.map((uri) => (
                  <View key={uri} style={styles.photoBox}>
                    <TouchableOpacity onPress={() => setPreviewPhoto(uri)}>
                      <Image source={{ uri }} style={styles.farmPhoto} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.removePhotoButton} onPress={() => onRemovePhoto(uri)}>
                      <Ionicons name="close" size={12} color={theme.colors.white} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.editDoneButton}
                onPress={onSaveProfile}
              >
                <Text style={styles.editDoneButtonText}>Concluir edição</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={Boolean(previewPhoto)} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalClose} onPress={() => setPreviewPhoto(null)}>
            <Ionicons name="close" size={28} color={theme.colors.white} />
          </Pressable>
          {previewPhoto ? (
            <Image source={{ uri: previewPhoto }} style={styles.fullImage} resizeMode="contain" />
          ) : null}
        </View>
      </Modal>

      <Modal
        visible={isPinModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setIsPinModalOpen(false);
          setIsEditProfileOpen(true);
        }}
      >
        <View style={styles.pinModalBackdrop}>
          <View style={styles.pinModalCard}>
            <View style={styles.pinModalHeader}>
              <Text style={styles.pinModalTitle}>Marcar porteira</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsPinModalOpen(false);
                  setIsEditProfileOpen(true);
                }}
              >
                <Ionicons name="close" size={22} color={theme.colors.gray_800} />
              </TouchableOpacity>
            </View>

            <Text style={styles.pinModalSubtitle}>
              Toque no mapa para posicionar o pin no ponto exato da entrada da propriedade.
            </Text>

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
                <Marker coordinate={draftGateCoords} title="Porteira da fazenda" />
              ) : null}
            </MapView>

            <TouchableOpacity
              style={styles.pinConfirmButton}
              onPress={() => {
                if (!draftGateCoords) {
                  Alert.alert("Marque um ponto", "Toque no mapa para definir a porteira.");
                  return;
                }
                setDraftIsGatePinConfirmed(true);
                setDraftLocationValidatedAt(new Date().toISOString());
                setIsPinModalOpen(false);
                setIsEditProfileOpen(true);
              }}
            >
              <Text style={styles.pinConfirmButtonText}>Confirmar pin da porteira</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Ratings Modal */}
      <Modal
        visible={isRatingsModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsRatingsModalOpen(false)}
      >
        <View style={styles.ratingsModalBackdrop}>
          <View style={styles.ratingsModalCard}>
            <View style={styles.ratingsModalHeader}>
              <Text style={styles.ratingsModalTitle}>Minhas Avaliações</Text>
              <TouchableOpacity onPress={() => setIsRatingsModalOpen(false)}>
                <Ionicons name="close" size={24} color={theme.colors.gray_800} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.ratingsSummary}>
                <Text style={styles.ratingsSummaryNumber}>4.9</Text>
                <View style={styles.ratingsStars}>
                  <Ionicons name="star" size={16} color={theme.colors.orange_500} />
                  <Ionicons name="star" size={16} color={theme.colors.orange_500} />
                  <Ionicons name="star" size={16} color={theme.colors.orange_500} />
                  <Ionicons name="star" size={16} color={theme.colors.orange_500} />
                  <Ionicons name="star-half" size={16} color={theme.colors.orange_500} />
                </View>
                <Text style={styles.ratingsCount}>baseado em 47 avaliações</Text>
              </View>

              <View style={styles.ratingsBreakdown}>
                <View style={styles.ratingBar}>
                  <Text style={styles.ratingLabel}>5 estrelas</Text>
                  <View style={styles.ratingBarContainer}>
                    <View style={[styles.ratingBarFill, { width: "85%", backgroundColor: "#10B981" }]} />
                  </View>
                  <Text style={styles.ratingCount}>40</Text>
                </View>
                <View style={styles.ratingBar}>
                  <Text style={styles.ratingLabel}>4 estrelas</Text>
                  <View style={styles.ratingBarContainer}>
                    <View style={[styles.ratingBarFill, { width: "12%", backgroundColor: "#F59E0B" }]} />
                  </View>
                  <Text style={styles.ratingCount}>5</Text>
                </View>
                <View style={styles.ratingBar}>
                  <Text style={styles.ratingLabel}>3 estrelas</Text>
                  <View style={styles.ratingBarContainer}>
                    <View style={[styles.ratingBarFill, { width: "2%", backgroundColor: "#EF4444" }]} />
                  </View>
                  <Text style={styles.ratingCount}>1</Text>
                </View>
                <View style={styles.ratingBar}>
                  <Text style={styles.ratingLabel}>2 estrelas</Text>
                  <View style={styles.ratingBarContainer}>
                    <View style={[styles.ratingBarFill, { width: "0%", backgroundColor: "#EF4444" }]} />
                  </View>
                  <Text style={styles.ratingCount}>0</Text>
                </View>
                <View style={styles.ratingBar}>
                  <Text style={styles.ratingLabel}>1 estrela</Text>
                  <View style={styles.ratingBarContainer}>
                    <View style={[styles.ratingBarFill, { width: "1%", backgroundColor: "#EF4444" }]} />
                  </View>
                  <Text style={styles.ratingCount}>1</Text>
                </View>
              </View>

              <Text style={styles.reviewsTitle}>Avaliações recentes</Text>
              <View style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>João Silva</Text>
                  <View style={styles.reviewStars}>
                    <Ionicons name="star" size={12} color={theme.colors.orange_500} />
                    <Ionicons name="star" size={12} color={theme.colors.orange_500} />
                    <Ionicons name="star" size={12} color={theme.colors.orange_500} />
                    <Ionicons name="star" size={12} color={theme.colors.orange_500} />
                    <Ionicons name="star" size={12} color={theme.colors.orange_500} />
                  </View>
                </View>
                <Text style={styles.reviewDate}>2 dias atrás</Text>
                <Text style={styles.reviewText}>Excelente produto! Entrega rápida e bem embalado. Muito satisfeito!</Text>
              </View>

              <View style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>Maria Santos</Text>
                  <View style={styles.reviewStars}>
                    <Ionicons name="star" size={12} color={theme.colors.orange_500} />
                    <Ionicons name="star" size={12} color={theme.colors.orange_500} />
                    <Ionicons name="star" size={12} color={theme.colors.orange_500} />
                    <Ionicons name="star" size={12} color={theme.colors.orange_500} />
                    <Ionicons name="star-outline" size={12} color={theme.colors.gray_300} />
                  </View>
                </View>
                <Text style={styles.reviewDate}>1 semana atrás</Text>
                <Text style={styles.reviewText}>Bom produto, mas a entrega demorou um pouco mais que o esperado.</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Account Health Modal */}
      <Modal
        visible={isAccountHealthOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAccountHealthOpen(false)}
      >
        <View style={styles.healthModalBackdrop}>
          <View style={styles.healthModalCard}>
            <View style={styles.healthModalHeader}>
              <Text style={styles.healthModalTitle}>Saúde da Conta</Text>
              <TouchableOpacity onPress={() => setIsAccountHealthOpen(false)}>
                <Ionicons name="close" size={24} color={theme.colors.gray_800} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Health Status Bar */}
              <View style={styles.healthStatusContainer}>
                <View style={styles.healthStatusHeader}>
                  <Text style={styles.healthStatusLabel}>Status da Sua Conta</Text>
                  <View style={[styles.healthBadge, styles.healthBadgeGreen]}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.colors.white} />
                    <Text style={styles.healthBadgeText}>Saudável!</Text>
                  </View>
                </View>
                <View style={styles.healthBar}>
                  <View style={[styles.healthBarFill, { width: "95%", backgroundColor: "#10B981" }]} />
                </View>
                <Text style={styles.healthPercentage}>95% - Você é um usuário 100% confiável!</Text>
              </View>

              {/* Account Details */}
              <View style={styles.healthSection}>
                <Text style={styles.healthSectionTitle}>Comportamento do Usuário</Text>
                
                <View style={styles.healthDetailItem}>
                  <View style={styles.healthDetailIconGreen}>
                    <Ionicons name="checkmark" size={20} color={theme.colors.white} />
                  </View>
                  <View style={styles.healthDetailContent}>
                    <Text style={styles.healthDetailLabel}>Avaliação Média</Text>
                    <Text style={styles.healthDetailValue}>4.9 de 5 estrelas</Text>
                  </View>
                </View>

                <View style={styles.healthDetailItem}>
                  <View style={styles.healthDetailIconGreen}>
                    <Ionicons name="checkmark" size={20} color={theme.colors.white} />
                  </View>
                  <View style={styles.healthDetailContent}>
                    <Text style={styles.healthDetailLabel}>Taxa de Resposta</Text>
                    <Text style={styles.healthDetailValue}>98% de respostas em 24 horas</Text>
                  </View>
                </View>

                <View style={styles.healthDetailItem}>
                  <View style={styles.healthDetailIconGreen}>
                    <Ionicons name="checkmark" size={20} color={theme.colors.white} />
                  </View>
                  <View style={styles.healthDetailContent}>
                    <Text style={styles.healthDetailLabel}>Entregas no Prazo</Text>
                    <Text style={styles.healthDetailValue}>100% das entregas pontuais</Text>
                  </View>
                </View>

                <View style={styles.healthDetailItem}>
                  <View style={styles.healthDetailIconGreen}>
                    <Ionicons name="checkmark" size={20} color={theme.colors.white} />
                  </View>
                  <View style={styles.healthDetailContent}>
                    <Text style={styles.healthDetailLabel}>Cancelamentos</Text>
                    <Text style={styles.healthDetailValue}>0,2% taxa de cancelamento</Text>
                  </View>
                </View>
              </View>

              {/* Tips Section */}
              <View style={styles.healthSection}>
                <Text style={styles.healthSectionTitle}>Dicas para Manter a Saúde</Text>
                
                <View style={styles.healthTipItem}>
                  <View style={styles.healthTipNumber}>
                    <Text style={styles.healthTipNumberText}>1</Text>
                  </View>
                  <View style={styles.healthTipContent}>
                    <Text style={styles.healthTipTitle}>Responda rapidamente às mensagens</Text>
                    <Text style={styles.healthTipDescription}>Mantenha uma comunicação ativa com seus clientes</Text>
                  </View>
                </View>

                <View style={styles.healthTipItem}>
                  <View style={styles.healthTipNumber}>
                    <Text style={styles.healthTipNumberText}>2</Text>
                  </View>
                  <View style={styles.healthTipContent}>
                    <Text style={styles.healthTipTitle}>Cumpra os prazos de entrega</Text>
                    <Text style={styles.healthTipDescription}>Prepare e envie seus produtos dentro do prazo acordado</Text>
                  </View>
                </View>

                <View style={styles.healthTipItem}>
                  <View style={styles.healthTipNumber}>
                    <Text style={styles.healthTipNumberText}>3</Text>
                  </View>
                  <View style={styles.healthTipContent}>
                    <Text style={styles.healthTipTitle}>Mantenha descrições precisas</Text>
                    <Text style={styles.healthTipDescription}>Atualize seu perfil com informações corretas e fotos claras</Text>
                  </View>
                </View>

                <View style={styles.healthTipItem}>
                  <View style={styles.healthTipNumber}>
                    <Text style={styles.healthTipNumberText}>4</Text>
                  </View>
                  <View style={styles.healthTipContent}>
                    <Text style={styles.healthTipTitle}>Resolva conflitos amigavelmente</Text>
                    <Text style={styles.healthTipDescription}>Negocie soluções com seus clientes de forma respeitosa</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Sales Metrics Modal */}
      <Modal
        visible={isSalesMetricsOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSalesMetricsOpen(false)}
      >
        <View style={styles.metricsModalBackdrop}>
          <View style={styles.metricsModalCard}>
            <View style={styles.metricsModalHeader}>
              <Text style={styles.metricsModalTitle}>Relatórios e Métricas</Text>
              <TouchableOpacity onPress={() => setIsSalesMetricsOpen(false)}>
                <Ionicons name="close" size={24} color={theme.colors.gray_800} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.metricsScrollView}>
              {/* Period Selector */}
              <View style={styles.periodSelector}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {["dias", "semanas", "meses", "total"].map((period) => (
                    <TouchableOpacity
                      key={period}
                      style={[
                        styles.periodButton,
                        salesPeriod === period && styles.periodButtonActive,
                      ]}
                      onPress={() => setSalesPeriod(period as typeof salesPeriod)}
                    >
                      <Text
                        style={[
                          styles.periodButtonText,
                          salesPeriod === period && styles.periodButtonTextActive,
                        ]}
                      >
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Total Sales */}
              <View style={styles.totalSalesContainer}>
                <Text style={styles.totalSalesLabel}>Total de Vendas</Text>
                <Text style={styles.totalSalesNumber}>{salesData.total}</Text>
                <Text style={styles.totalSalesDescription}>vendas efetuadas neste período</Text>
              </View>

              {/* Sales Breakdown */}
              <View style={styles.salesBreakdownContainer}>
                <Text style={styles.breakdownTitle}>Vendas por Categoria</Text>
                
                {/* Bar Chart Visual */}
                <View style={styles.chartContainer}>
                  <View style={styles.chartBar}>
                    <View style={styles.chartBarLabel}>
                      <View style={[styles.chartBarColor, { backgroundColor: "#10B981" }]} />
                      <View style={styles.chartBarInfo}>
                        <Text style={styles.chartBarName}>Alimentos</Text>
                        <Text style={styles.chartBarStats}>
                          {salesData.alimentos} vendas ({Math.round((salesData.alimentos / salesData.total) * 100)}%)
                        </Text>
                      </View>
                    </View>
                    <View style={styles.barFillContainer}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${Math.round((salesData.alimentos / salesData.total) * 100)}%`, backgroundColor: "#10B981" },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.chartBar}>
                    <View style={styles.chartBarLabel}>
                      <View style={[styles.chartBarColor, { backgroundColor: "#F59E0B" }]} />
                      <View style={styles.chartBarInfo}>
                        <Text style={styles.chartBarName}>Insumos</Text>
                        <Text style={styles.chartBarStats}>
                          {salesData.insumos} vendas ({Math.round((salesData.insumos / salesData.total) * 100)}%)
                        </Text>
                      </View>
                    </View>
                    <View style={styles.barFillContainer}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${Math.round((salesData.insumos / salesData.total) * 100)}%`, backgroundColor: "#F59E0B" },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.chartBar}>
                    <View style={styles.chartBarLabel}>
                      <View style={[styles.chartBarColor, { backgroundColor: "#3B82F6" }]} />
                      <View style={styles.chartBarInfo}>
                        <Text style={styles.chartBarName}>Sementes</Text>
                        <Text style={styles.chartBarStats}>
                          {salesData.sementes} vendas ({Math.round((salesData.sementes / salesData.total) * 100)}%)
                        </Text>
                      </View>
                    </View>
                    <View style={styles.barFillContainer}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${Math.round((salesData.sementes / salesData.total) * 100)}%`, backgroundColor: "#3B82F6" },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Sales Summary Statistics */}
              <View style={styles.salesStats}>
                <Text style={styles.statsTitle}>Estatísticas</Text>

                <View style={styles.statRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxLabel}>Ticket Médio</Text>
                    <Text style={styles.statBoxValue}>R$ 425,00</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxLabel}>Maior Venda</Text>
                    <Text style={styles.statBoxValue}>R$ 2.100,00</Text>
                  </View>
                </View>

                <View style={styles.statRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxLabel}>Menor Venda</Text>
                    <Text style={styles.statBoxValue}>R$ 150,00</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxLabel}>Faturamento Total</Text>
                    <Text style={styles.statBoxValue}>R$ 104.775</Text>
                  </View>
                </View>
              </View>

              {/* Export Button */}
              <TouchableOpacity style={styles.exportButton} onPress={exportToCSV}>
                <Ionicons name="document-outline" size={18} color={theme.colors.white} />
                <Text style={styles.exportButtonText}>Exportar como CSV</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* My Orders Modal */}
      <Modal
        visible={isMyOrdersOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsMyOrdersOpen(false)}
      >
        <View style={styles.metricsModalBackdrop}>
          <View style={styles.metricsModalCard}>
            <View style={styles.metricsModalHeader}>
              <Text style={styles.metricsModalTitle}>Minhas Vendas</Text>
              <TouchableOpacity onPress={() => setIsMyOrdersOpen(false)}>
                <Ionicons name="close" size={24} color={theme.colors.gray_800} />
              </TouchableOpacity>
            </View>

            {/* Tab Buttons */}
            <View style={styles.orderTabsContainer}>
              <TouchableOpacity
                style={[
                  styles.orderTab,
                  selectedOrderTab === "aguardando" && styles.orderTabActive,
                ]}
                onPress={() => setSelectedOrderTab("aguardando")}
              >
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={selectedOrderTab === "aguardando" ? theme.colors.white : theme.colors.gray_500}
                />
                <Text
                  style={[
                    styles.orderTabText,
                    selectedOrderTab === "aguardando" && styles.orderTabTextActive,
                  ]}
                >
                  Aguardando
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.orderTab,
                  selectedOrderTab === "transporte" && styles.orderTabActive,
                ]}
                onPress={() => setSelectedOrderTab("transporte")}
              >
                <Ionicons
                  name="car-outline"
                  size={18}
                  color={selectedOrderTab === "transporte" ? theme.colors.white : theme.colors.gray_500}
                />
                <Text
                  style={[
                    styles.orderTabText,
                    selectedOrderTab === "transporte" && styles.orderTabTextActive,
                  ]}
                >
                  Transporte
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.orderTab,
                  selectedOrderTab === "finalizado" && styles.orderTabActive,
                ]}
                onPress={() => setSelectedOrderTab("finalizado")}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color={selectedOrderTab === "finalizado" ? theme.colors.white : theme.colors.gray_500}
                />
                <Text
                  style={[
                    styles.orderTabText,
                    selectedOrderTab === "finalizado" && styles.orderTabTextActive,
                  ]}
                >
                  Finalizado
                </Text>
              </TouchableOpacity>
            </View>

            {/* Orders List */}
            <ScrollView showsVerticalScrollIndicator={false} style={styles.ordersListContainer}>
              {myOrders[selectedOrderTab].map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderCardHeader}>
                    <View>
                      <Text style={styles.orderCardId}>Pedido #{order.id}</Text>
                      <Text style={styles.orderCardProduct}>{order.produto}</Text>
                    </View>
                    <Text style={styles.orderCardValue}>{order.valor}</Text>
                  </View>

                  <View style={styles.orderCardDetails}>
                    <View style={styles.orderDetail}>
                      <Ionicons name="cube-outline" size={16} color={theme.colors.primary} />
                      <Text style={styles.orderDetailText}>{order.quantidade}</Text>
                    </View>
                    <View style={styles.orderDetail}>
                      <Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />
                      <Text style={styles.orderDetailText}>{order.data}</Text>
                    </View>
                  </View>

                  <View style={styles.orderCardFooter}>
                    <Text style={styles.orderBuyer}>
                      {selectedOrderTab === "transporte" ? "Transportadora: " : "Comprador: "}
                      {selectedOrderTab === "transporte" && "transportadora" in order ? order.transportadora : order.comprador}
                    </Text>
                  </View>
                </View>
              ))}

              {myOrders[selectedOrderTab].length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="bag-outline" size={48} color={theme.colors.gray_300} />
                  <Text style={styles.emptyStateText}>Nenhuma venda nesta categoria</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>


    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: theme.colors.background },
  profileSection: {
    backgroundColor: theme.colors.white,
    alignItems: "center",
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
  },
  avatarWrap: {
    position: "relative",
    marginBottom: 12,
  },
  avatarLarge: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
  avatarEditButton: {
    position: "absolute",
    right: -2,
    bottom: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  userName: { fontSize: 22, fontWeight: "bold", color: theme.colors.gray_800 },
  userRole: { fontSize: 14, color: theme.colors.gray_500, marginTop: 4 },
  userAddress: { fontSize: 13, color: theme.colors.gray_500, marginTop: 4 },
  userBio: {
    fontSize: 12,
    color: theme.colors.gray_500,
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 22,
  },
  trustCard: {
    marginTop: 12,
    backgroundColor: theme.colors.lightGreen,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: "90%",
  },
  trustTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 8,
    textAlign: "center",
  },
  trustRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  trustText: {
    fontSize: 12,
    color: theme.colors.gray_800,
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 16,
    backgroundColor: theme.colors.background,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  statItem: { alignItems: "center", paddingHorizontal: 16 },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  statLabel: { fontSize: 12, color: theme.colors.gray_500, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: theme.colors.gray_300 },

  editProfileButton: {
    marginTop: 14,
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  editProfileButtonText: {
    color: theme.colors.white,
    fontSize: 13,
    fontWeight: "bold",
  },

  actionButtonsContainer: { padding: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 12,
  },
  sectionTitleCentered: {
    textAlign: "center",
    flex: 1,
  },
  section: { paddingHorizontal: 20, marginBottom: 24 },

  galleryHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gallerySideSpacer: {
    width: 34,
  },
  galleryCount: {
    fontSize: 12,
    color: theme.colors.gray_500,
    fontWeight: "bold",
  },
  galleryHelperText: {
    fontSize: 13,
    color: theme.colors.gray_500,
    marginBottom: 10,
  },
  galleryRow: { paddingRight: 10 },
  photoBox: { marginRight: 10, position: "relative" },
  farmPhoto: { width: 110, height: 90, borderRadius: 10 },
  removePhotoButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonsRow: { flexDirection: "row", justifyContent: "space-between" },
  primaryActionButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  actionIconSpacing: { marginBottom: 4 },

  myAdCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
  },
  myAdIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.lightGreen,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  myAdContent: { flex: 1 },
  myAdTitle: { fontSize: 15, fontWeight: "bold", color: theme.colors.gray_800 },
  myAdSubtitle: { fontSize: 13, color: theme.colors.gray_500, marginTop: 2 },
  myAdDetails: { fontSize: 12, color: theme.colors.gray_500, marginTop: 4 },
  myAdThumb: {
    width: 72,
    height: 56,
    borderRadius: 8,
    marginTop: 8,
  },

  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingsText: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.gray_800,
    marginLeft: 12,
  },

  // New Mercado Livre style sections
  profileHeaderSection: {
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  profileHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileHeaderAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileHeaderInfo: {
    flex: 1,
  },
  profileHeaderName: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  profileHeaderSubtitle: {
    fontSize: 12,
    color: theme.colors.gray_500,
    marginTop: 2,
  },
  profileHeaderFarm: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.gray_800,
    marginTop: 6,
  },
  profileHeaderState: {
    fontSize: 11,
    color: theme.colors.gray_500,
    marginTop: 2,
  },

  statsQuickRow: {
    flexDirection: "row",
    backgroundColor: theme.colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
  },
  quickStatItem: {
    flex: 1,
    alignItems: "center",
  },
  quickStatNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  quickStatLabel: {
    fontSize: 11,
    color: theme.colors.gray_500,
    marginTop: 2,
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: theme.colors.gray_200,
  },

  menuSection: {
    backgroundColor: theme.colors.white,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray_200,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
    paddingVertical: 0,
  },
  menuSectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: theme.colors.gray_500,
    paddingHorizontal: 16,
    paddingVertical: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.lightGreen,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.gray_800,
    fontWeight: "500",
  },
  badgeNew: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeNewText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: "bold",
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    marginTop: 10,
  },
  logoutText: {
    color: theme.colors.red_500,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  logoutSpacer: { height: CURRENT_PLATFORM_UI.logoutBottomSpacer },

  editModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.45)",
    justifyContent: "flex-end",
  },
  editModalCard: {
    maxHeight: "94%",
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  editModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  editModalTitle: {
    fontSize: 18,
    color: theme.colors.gray_800,
    fontWeight: "bold",
  },
  editLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 8,
    marginTop: 6,
  },
  editAvatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  editAvatarActionsCol: {
    flex: 1,
    gap: 8,
  },
  editAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  editActionPrimary: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  editActionPrimaryText: {
    color: theme.colors.white,
    fontWeight: "bold",
    fontSize: 13,
    textAlign: "center",
    width: "100%",
  },
  editActionSecondary: {
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  editActionSecondaryText: {
    color: theme.colors.primary,
    fontWeight: "bold",
    fontSize: 13,
  },
  photoInput: {
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.colors.gray_800,
    marginBottom: 10,
  },
  profileBioInput: {
    minHeight: 86,
  },
  profileBioCounter: {
    textAlign: "right",
    color: theme.colors.gray_500,
    fontSize: 12,
    marginTop: -4,
    marginBottom: 8,
  },
  validateCepButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  validateCepButtonText: {
    color: theme.colors.white,
    fontWeight: "bold",
    fontSize: 13,
  },
  cepHelperText: {
    color: theme.colors.gray_500,
    fontSize: 12,
    marginBottom: 10,
  },
  addPhotoGalleryButton: {
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  addPhotoGalleryButtonText: {
    color: theme.colors.primary,
    fontWeight: "bold",
    fontSize: 13,
  },
  addPhotoCameraButton: {
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  addPhotoCameraButtonText: {
    color: theme.colors.primary,
    fontWeight: "bold",
    fontSize: 13,
  },
  editDoneButton: {
    marginTop: 12,
    backgroundColor: theme.colors.gray_800,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
  },
  editDoneButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: "bold",
  },

  editAdBackdrop: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.45)",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  editAdCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 16,
    maxHeight: "88%",
  },
  editAdBody: {
    maxHeight: "100%",
  },
  editAdBodyContent: {
    paddingBottom: 4,
  },
  editAdHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  editAdTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  editAdLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 8,
  },
  editAdPhotosHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editAdPhotosCount: {
    fontSize: 12,
    color: theme.colors.gray_500,
    fontWeight: "bold",
  },
  editAdTypeRow: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
  },
  editAdTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    borderRadius: 8,
    paddingVertical: 10,
  },
  editAdTypeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  editAdTypeButtonActiveOrange: {
    backgroundColor: theme.colors.orange_500,
    borderColor: theme.colors.orange_500,
  },
  editAdTypeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.colors.gray_500,
  },
  editAdTypeTextActive: {
    color: theme.colors.white,
  },
  editAdInlineRow: {
    flexDirection: "row",
    gap: 8,
  },
  editAdInlineCol: {
    flex: 1,
  },
  editAdInput: {
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.colors.gray_800,
    marginBottom: 10,
    backgroundColor: theme.colors.white,
  },
  editAdInputTextArea: {
    minHeight: 90,
  },
  editAdSaveMainButton: {
    flexDirection: "row",
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 10,
    gap: 8,
    elevation: 2,
  },
  editAdSaveMainText: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: "bold",
  },
  editAdActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  editAdDeleteButton: {
    borderWidth: 1,
    borderColor: theme.colors.red_500,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  editAdDeleteText: {
    color: theme.colors.red_500,
    fontWeight: "700",
  },
  editAdCancelButton: {
    borderWidth: 1,
    borderColor: theme.colors.gray_300,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  editAdCancelText: {
    color: theme.colors.gray_800,
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalClose: {
    position: "absolute",
    top: CURRENT_PLATFORM_UI.modalCloseTop,
    right: 18,
    zIndex: 2,
    padding: 6,
  },
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
  fullImage: { width: "94%", height: "82%" },

  // Notification dot for chat
  chatIconContainer: {
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.red_500,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },

  // Ratings Modal Styles
  ratingsModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.45)",
    justifyContent: "flex-end",
  },
  ratingsModalCard: {
    maxHeight: "90%",
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
  },
  ratingsModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  ratingsModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  ratingsSummary: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  ratingsSummaryNumber: {
    fontSize: 48,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  ratingsStars: {
    flexDirection: "row",
    gap: 4,
    marginVertical: 8,
  },
  ratingsCount: {
    fontSize: 12,
    color: theme.colors.gray_500,
  },
  ratingsBreakdown: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  ratingBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 12,
    color: theme.colors.gray_800,
    width: 80,
  },
  ratingBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.gray_200,
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  ratingBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: theme.colors.gray_500,
    width: 30,
    textAlign: "right",
  },
  reviewsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 12,
  },
  reviewItem: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.gray_800,
  },
  reviewStars: {
    flexDirection: "row",
    gap: 2,
  },
  reviewDate: {
    fontSize: 11,
    color: theme.colors.gray_500,
    marginBottom: 6,
  },
  reviewText: {
    fontSize: 12,
    color: theme.colors.gray_800,
    lineHeight: 18,
  },

  // Health Modal Styles
  healthModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.45)",
    justifyContent: "flex-end",
  },
  healthModalCard: {
    maxHeight: "92%",
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
  },
  healthModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  healthModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  healthStatusContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  healthStatusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  healthStatusLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  healthBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  healthBadgeGreen: {
    backgroundColor: "#10B981",
  },
  healthBadgeOrange: {
    backgroundColor: "#F59E0B",
  },
  healthBadgeRed: {
    backgroundColor: theme.colors.red_500,
  },
  healthBadgeText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  healthBar: {
    height: 12,
    backgroundColor: theme.colors.gray_200,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  healthBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  healthPercentage: {
    fontSize: 12,
    color: theme.colors.gray_500,
    fontWeight: "500",
  },
  healthSection: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  healthSectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 12,
  },
  healthDetailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  healthDetailIconGreen: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  healthDetailIconOrange: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F59E0B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  healthDetailContent: {
    flex: 1,
  },
  healthDetailLabel: {
    fontSize: 12,
    color: theme.colors.gray_500,
  },
  healthDetailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.gray_800,
    marginTop: 2,
  },
  healthTipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  healthTipNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  healthTipNumberText: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.white,
  },
  healthTipContent: {
    flex: 1,
  },
  healthTipTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.gray_800,
  },
  healthTipDescription: {
    fontSize: 12,
    color: theme.colors.gray_500,
    marginTop: 2,
  },

  // Sales Metrics Modal Styles
  metricsModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.45)",
    justifyContent: "flex-end",
  },
  metricsModalCard: {
    maxHeight: "94%",
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 0,
    paddingTop: 14,
    paddingBottom: 20,
  },
  metricsScrollView: {
    paddingHorizontal: 16,
  },
  metricsModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  metricsModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.gray_800,
  },
  periodSelector: {
    marginBottom: 16,
  },
  periodButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
    marginRight: 6,
  },
  periodButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  periodButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.gray_500,
  },
  periodButtonTextActive: {
    color: theme.colors.white,
  },
  totalSalesContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  totalSalesLabel: {
    fontSize: 13,
    color: theme.colors.gray_500,
    marginBottom: 4,
  },
  totalSalesNumber: {
    fontSize: 42,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  totalSalesDescription: {
    fontSize: 12,
    color: theme.colors.gray_500,
    marginTop: 4,
  },
  salesBreakdownContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 16,
  },
  chartContainer: {
    marginTop: 12,
  },
  chartBar: {
    marginBottom: 16,
  },
  chartBarLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  chartBarColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 10,
  },
  chartBarInfo: {
    flex: 1,
  },
  chartBarName: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.gray_800,
  },
  chartBarStats: {
    fontSize: 11,
    color: theme.colors.gray_500,
    marginTop: 2,
  },
  barFillContainer: {
    height: 24,
    backgroundColor: theme.colors.gray_200,
    borderRadius: 6,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 6,
  },
  salesStats: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.gray_800,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  statBoxLabel: {
    fontSize: 11,
    color: theme.colors.gray_500,
    marginBottom: 4,
  },
  statBoxValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  exportButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  exportButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: "bold",
  },

  // Order Tabs
  orderTabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
    gap: 8,
  },
  orderTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
  },
  orderTabActive: {
    backgroundColor: theme.colors.primary,
  },
  orderTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.gray_500,
  },
  orderTabTextActive: {
    color: theme.colors.white,
  },

  // Orders List
  ordersListContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  orderCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray_200,
  },
  orderCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  orderCardId: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary,
    marginBottom: 4,
  },
  orderCardProduct: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.gray_800,
  },
  orderCardValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  orderCardDetails: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray_200,
  },
  orderDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  orderDetailText: {
    fontSize: 12,
    color: theme.colors.gray_500,
    fontWeight: "500",
  },
  orderCardFooter: {
    paddingTop: 8,
  },
  orderBuyer: {
    fontSize: 12,
    color: theme.colors.gray_500,
    fontWeight: "500",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: theme.colors.gray_500,
    marginTop: 12,
    fontWeight: "500",
  },

 
});

