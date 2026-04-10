import { useEffect, useState } from "react";
import { Alert, Share, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { type MapPressEvent } from "react-native-maps";
import { useAuth } from "@/contexts/AuthContext";
import {
  addFarmPhoto,
  getFarmPhotos,
  getProfileAvatar,
  getProfileSummary,
  initCommunityStore,
  removeFarmPhoto,
  setProfileAvatar,
  updateProfileSummary,
} from "@/services/communityStore";
import { updateUserAvatarUri } from "@/services/authStore";
import {
  type GateCoordinate,
  DEFAULT_PIN_REGION,
  PROFILE_BIO_MAX,
  formatCep,
  normalizeCep,
} from "@/features/account/utils/accountUtils";
import { initOrdersStore, getOrdersByUser, Order } from "@/services/ordersStore";

export type OrderTab = "aguardando" | "transporte" | "finalizado";
export type SalesPeriod = "dias" | "semanas" | "meses" | "total";

export function useAccountLogic() {
  const { user, logout } = useAuth();
  const profileName = user?.username || "Sitio1";
  
  const summary = getProfileSummary(profileName);
  
  // -- REAL STATE --
  const [displayName, setDisplayName] = useState(summary.displayName);
  const [farmName, setFarmName] = useState(summary.farmName);
  const [producerRole, setProducerRole] = useState(summary.producerRole);
  const [farmAddress, setFarmAddress] = useState(summary.farmAddress);
  const [farmAddressNumber, setFarmAddressNumber] = useState(summary.farmAddressNumber);
  const [farmAddressReference, setFarmAddressReference] = useState(summary.farmAddressReference);
  const [farmCep, setFarmCep] = useState(summary.farmCep);
  const [gateCoords, setGateCoords] = useState<GateCoordinate | null>(
    summary.gateLatitude != null && summary.gateLongitude != null
      ? { latitude: summary.gateLatitude, longitude: summary.gateLongitude }
      : null,
  );
  const [isCepValidated, setIsCepValidated] = useState(summary.isCepValidated);
  const [isGatePinConfirmed, setIsGatePinConfirmed] = useState(summary.isGatePinConfirmed);
  const [locationValidatedAt, setLocationValidatedAt] = useState<string | null>(
    summary.locationValidatedAt ?? null
  );
  const [profileBio, setProfileBio] = useState(summary.bio);
  const [farmPhotos, setFarmPhotos] = useState<string[]>(getFarmPhotos(profileName));
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(
    summary.avatarUri ?? getProfileAvatar(profileName) ?? null
  );

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isCepResolving, setIsCepResolving] = useState(false);
  const [lastAutoValidatedCep, setLastAutoValidatedCep] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [hasNewMessages, setHasNewMessages] = useState(true);
  const [selectedOrderTab, setSelectedOrderTab] = useState<OrderTab>("aguardando");
  const [salesPeriod, setSalesPeriod] = useState<SalesPeriod>("total");
  const [orders, setOrders] = useState<Order[]>([]);

  // -- DRAFT STATE (Inside Edit Modal) --
  const [draftDisplayName, setDraftDisplayName] = useState(displayName);
  const [draftFarmName, setDraftFarmName] = useState(farmName);
  const [draftProducerRole, setDraftProducerRole] = useState(producerRole);
  const [draftFarmAddress, setDraftFarmAddress] = useState(farmAddress);
  const [draftFarmAddressNumber, setDraftFarmAddressNumber] = useState(farmAddressNumber);
  const [draftFarmAddressReference, setDraftFarmAddressReference] = useState(farmAddressReference);
  const [draftFarmCep, setDraftFarmCep] = useState(formatCep(farmCep));
  const [draftGateCoords, setDraftGateCoords] = useState<GateCoordinate | null>(gateCoords);
  const [draftIsCepValidated, setDraftIsCepValidated] = useState(isCepValidated);
  const [draftIsGatePinConfirmed, setDraftIsGatePinConfirmed] = useState(isGatePinConfirmed);
  const [draftLocationValidatedAt, setDraftLocationValidatedAt] = useState<string | null>(
    locationValidatedAt,
  );
  const [draftProfileBio, setDraftProfileBio] = useState(profileBio);

  // -- REAL ORDERS LOGIC --
  const myOrders = {
    aguardando: orders.filter(o => o.status === "aguardando"),
    transporte: orders.filter(o => o.status === "transporte"),
    finalizado: orders.filter(o => o.status === "finalizado"),
  };

  const getSalesDataByPeriod = () => {
    // Como os dados sao simulados, focamos no agrupamento por categoria das ordens finalizadas
    const finished = orders.filter(o => o.status === "finalizado");
    
    return {
      total: finished.reduce((acc, o) => acc + o.valorNumerico, 0),
      alimentos: finished.filter(o => o.categoria === "alimentos").reduce((acc, o) => acc + o.valorNumerico, 0),
      insumos: finished.filter(o => o.categoria === "insumos").reduce((acc, o) => acc + o.valorNumerico, 0),
      sementes: finished.filter(o => o.categoria === "sementes").reduce((acc, o) => acc + o.valorNumerico, 0),
    };
  };

  const salesData = getSalesDataByPeriod();

  // -- EFFECTS --
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      await initCommunityStore();
      await initOrdersStore();
      
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
      setLocationValidatedAt(nextSummary.locationValidatedAt ?? null);
      setProfileBio(nextSummary.bio);
      setFarmPhotos(getFarmPhotos(profileName));
      setProfilePhotoUri(nextSummary.avatarUri ?? getProfileAvatar(profileName) ?? null);

      const userOrders = await getOrdersByUser(profileName);
      setOrders(userOrders);
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // -- ACTIONS --
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
        ["Categoria", "Valor Total (R$)"],
        ["Alimentos", `R$ ${salesData.alimentos.toFixed(2)}`],
        ["Insumos", `R$ ${salesData.insumos.toFixed(2)}`],
        ["Sementes", `R$ ${salesData.sementes.toFixed(2)}`],
        [""],
        ["─────────────────────────────────────────"],
        ["TOTAL GERAL", `R$ ${salesData.total.toFixed(2)}`],
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
      });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível exportar o relatório");
    }
  };

  const openGalleryPicker = async (): Promise<string | null> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permissao necessaria", "Ative a permissao da galeria para selecionar fotos.");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: Platform.OS === "ios",
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) return null;
    return result.assets[0].uri;
  };

  const openCameraPicker = async (): Promise<string | null> => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permissao necessaria", "Ative a permissao da camera para tirar fotos.");
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: Platform.OS === "ios",
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) return null;
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
      Alert.alert("Limite atingido", "Você pode adicionar no máximo 5 fotos por perfil.");
      return;
    }
    setFarmPhotos(getFarmPhotos(profileName));
  };

  const onTakeFarmPhoto = async () => {
    const uri = await openCameraPicker();
    if (!uri) return;

    const result = addFarmPhoto(profileName, uri);
    if (!result.ok) {
      Alert.alert("Limite atingido", "Você pode adicionar no máximo 5 fotos por perfil.");
      return;
    }
    setFarmPhotos(getFarmPhotos(profileName));
  };

  const onRemovePhoto = (uri: string) => {
    removeFarmPhoto(profileName, uri);
    setFarmPhotos(getFarmPhotos(profileName));
  };

  const openPinPlacementModal = () => {
    setIsPinModalOpen(true);
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
      if (!response.ok) throw new Error("cep_lookup_failed");

      const data = await response.json();
      if (data.erro || !data.localidade || !data.uf) {
        Alert.alert("CEP nao encontrado", "Nao foi possivel validar esse CEP.");
        setLastAutoValidatedCep("");
        return;
      }

      const resolvedAddress = [data.logradouro, data.bairro, `${data.localidade} - ${data.uf}`]
        .filter(Boolean)
        .join(", ");

      if (resolvedAddress) setDraftFarmAddress(resolvedAddress);

      let suggestedCoords = draftGateCoords;
      try {
        const geocoded = await Location.geocodeAsync(`${resolvedAddress || `${data.localidade} - ${data.uf}`}, Brasil`);
        if (geocoded.length) {
          suggestedCoords = { latitude: geocoded[0].latitude, longitude: geocoded[0].longitude };
        }
      } catch {}

      if (!suggestedCoords) {
        try {
          const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          suggestedCoords = { latitude: current.coords.latitude, longitude: current.coords.longitude };
        } catch {
          suggestedCoords = { latitude: DEFAULT_PIN_REGION.latitude, longitude: DEFAULT_PIN_REGION.longitude };
        }
      }

      setDraftFarmCep(formatCep(cepDigits));
      setDraftGateCoords(suggestedCoords);
      setDraftIsCepValidated(true);
      setDraftIsGatePinConfirmed(false);
      setDraftLocationValidatedAt(null);
      openPinPlacementModal();
    } catch {
      Alert.alert("Falha ao validar CEP", "Nao foi possivel consultar esse CEP agora.");
      openPinPlacementModal();
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

    if (isCepResolving || cepDigits === lastAutoValidatedCep) return;
    setLastAutoValidatedCep(cepDigits);
    void resolveCepAndOpenPin(cepDigits);
  };

  const onMapPressSetGate = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setDraftGateCoords({ latitude, longitude });
  };


  const onSaveProfile = async () => {
    const nextName = draftDisplayName.trim();
    const nextFarm = draftFarmName.trim();
    const nextRole = draftProducerRole.trim();
    const nextAddress = draftFarmAddress.trim();
    const nextNumber = draftFarmAddressNumber.trim();
    const nextReference = draftFarmAddressReference.trim();
    const nextCep = normalizeCep(draftFarmCep);
    const nextBio = draftProfileBio.trim();

    if (!nextName || !nextFarm || !nextRole || !nextAddress || !nextNumber || !nextBio || !nextCep) {
      Alert.alert("Campos obrigatórios", "Preencha todos os campos.");
      return;
    }

    if (nextCep.length !== 8) {
      Alert.alert("CEP invalido", "O CEP deve ter 8 digitos.");
      return;
    }

    if (!draftGateCoords || !draftIsCepValidated || !draftIsGatePinConfirmed) {
      Alert.alert("Validacao pendente", "Valide o CEP e confirme a porteira.");
      return;
    }

    if (nextBio.length > PROFILE_BIO_MAX) {
      Alert.alert("Bio muito longa", `Máximo ${PROFILE_BIO_MAX} caracteres.`);
      return;
    }

    setDisplayName(nextName);
    setFarmName(nextFarm);
    setProducerRole(nextRole);
    setFarmAddress(nextAddress);
    setFarmAddressNumber(nextNumber);
    setFarmAddressReference(nextReference);
    setFarmCep(nextCep);
    setGateCoords(draftGateCoords);
    setIsCepValidated(draftIsCepValidated);
    setIsGatePinConfirmed(draftIsGatePinConfirmed);
    setLocationValidatedAt(draftLocationValidatedAt);
    setProfileBio(nextBio);

    // Wait for profile to be saved to AsyncStorage
    await updateProfileSummary(profileName, {
      displayName: nextName,
      farmName: nextFarm,
      producerRole: nextRole,
      farmAddress: nextAddress,
      farmAddressNumber: nextNumber,
      farmAddressReference: nextReference,
      farmCep: nextCep,
      gateLatitude: draftGateCoords.latitude,
      gateLongitude: draftGateCoords.longitude,
      isCepValidated: draftIsCepValidated,
      isGatePinConfirmed: draftIsGatePinConfirmed,
      locationValidatedAt: draftLocationValidatedAt ?? undefined,
      bio: nextBio,
    });

    // Persist profile photo if user picked a new one
    if (profilePhotoUri) {
      await setProfileAvatar(profileName, profilePhotoUri);
      
      // For buyers, also update avatarUri in authStore
      if (user?.role === "buyer") {
        updateUserAvatarUri(profileName, profilePhotoUri);
      }
    }
  };

  const onConfirmPin = () => {
    setDraftIsGatePinConfirmed(true);
    setDraftLocationValidatedAt(new Date().toISOString());
    setIsPinModalOpen(false);
  };

  const onClosePinModal = () => {
    setIsPinModalOpen(false);
  };

  return {
    // States
    displayName,
    farmName,
    farmAddress,
    profilePhotoUri,
    hasNewMessages,
    isPinModalOpen,
    selectedOrderTab,
    salesPeriod,
    salesData,
    myOrders,
    farmPhotos,
    previewPhoto,
    
    // Draft States
    draftDisplayName,
    draftFarmName,
    draftProducerRole,
    draftFarmAddress,
    draftFarmAddressNumber,
    draftFarmAddressReference,
    draftFarmCep,
    draftProfileBio,
    isCepResolving,
    draftGateCoords,
    
    // Setters
    setSelectedOrderTab,
    setSalesPeriod,
    setDraftDisplayName,
    setDraftFarmName,
    setDraftProducerRole,
    setDraftFarmAddress,
    setDraftFarmAddressNumber,
    setDraftFarmAddressReference,
    setDraftProfileBio,
    setPreviewPhoto,
    
    // Functions
    logout,
    exportToCSV,
    onPickProfilePhoto,
    onTakeProfilePhoto,
    onPickFarmPhoto,
    onTakeFarmPhoto,
    onRemovePhoto,
    resolveCepAndOpenPin,
    onDraftCepChange,
    onSaveProfile,
    onMapPressSetGate,
    onConfirmPin,
    onClosePinModal,
  };
}
