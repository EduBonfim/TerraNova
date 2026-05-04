import { useAuth } from "@/contexts/AuthContext";
import {
    type GateCoordinate,
    DEFAULT_PIN_REGION,
    formatCep,
    normalizeCep,
    PROFILE_BIO_MAX,
} from "@/features/account/utils/accountUtils";
import { AppUser, updateUserAvatarUri, updateUserBuyerProfile } from "@/services/authStore";
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
import { getOrdersByBuyer, getOrdersByUser, initOrdersStore, Order } from "@/services/ordersStore";
import { exportToPlatform } from "@/utils/csvExport";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import { type MapPressEvent } from "react-native-maps";

export type OrderTab = "aguardando" | "transporte" | "finalizado";
export type SalesPeriod = "dias" | "semanas" | "meses" | "total";

export function useAccountLogic(options?: { mode?: "sales" | "purchases" }) {
  const mode = options?.mode || "sales";
  const { user, logout } = useAuth();
  const profileName = user?.username || "Sitio1";
  
  const summary = getProfileSummary(profileName);
  
  // -- REAL STATE --
  const [displayName, setDisplayName] = useState(summary.displayName || user?.fullName || "");
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
  const [profileBio, setProfileBio] = useState(summary.bio || "");
  const [farmPhotos, setFarmPhotos] = useState<string[]>(
    user?.role === "producer" ? getFarmPhotos(profileName) : []
  );
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(
    summary.avatarUri ?? user?.avatarUri ?? getProfileAvatar(profileName) ?? null
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
  const [draftPhone, setDraftPhone] = useState(user?.phone || "");
  const [draftGender, setDraftGender] = useState<AppUser["gender"]>(user?.gender);

  // -- REAL ORDERS LOGIC --
  const myOrders = {
    aguardando: orders.filter(o => o.status === "aguardando"),
    transporte: orders.filter(o => o.status === "transporte"),
    finalizado: orders.filter(o => o.status === "finalizado"),
  };

  const getSalesDataByPeriod = () => {
    const finished = orders.filter(o => o.status === "finalizado");

    // Filtrar por período baseado na data do pedido (formato DD/MM/YYYY)
    const parseOrderDate = (dateStr: string): Date => {
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
      return new Date(0);
    };

    const now = new Date();
    const filtered = finished.filter(o => {
      const d = parseOrderDate(o.data);
      if (salesPeriod === "dias") {
        const limit = new Date(now); limit.setDate(now.getDate() - 7);
        return d >= limit;
      } else if (salesPeriod === "semanas") {
        const limit = new Date(now); limit.setDate(now.getDate() - 28);
        return d >= limit;
      } else if (salesPeriod === "meses") {
        const limit = new Date(now); limit.setMonth(now.getMonth() - 3);
        return d >= limit;
      }
      return true; // "total" — sem filtro de data
    });

    const total = filtered.reduce((acc, o) => acc + o.valorNumerico, 0);
    const count = filtered.length;
    return {
      total,
      count,
      ticketMedio: count > 0 ? total / count : 0,
      alimentos: filtered.filter(o => o.categoria === "alimentos").reduce((acc, o) => acc + o.valorNumerico, 0),
      insumos: filtered.filter(o => o.categoria === "insumos").reduce((acc, o) => acc + o.valorNumerico, 0),
      sementes: filtered.filter(o => o.categoria === "sementes").reduce((acc, o) => acc + o.valorNumerico, 0),
      recentOrders: [...finished].sort((a, b) => {
        return parseOrderDate(b.data).getTime() - parseOrderDate(a.data).getTime();
      }).slice(0, 5),
    };
  };

  const salesData = getSalesDataByPeriod();

  const refreshProfileData = useCallback(async () => {
    await initCommunityStore();
    await initOrdersStore();
    
    // Refresh user from store to get latest phone/gender
    const nextSummary = getProfileSummary(profileName);
    setDisplayName(nextSummary.displayName);
    setFarmName(nextSummary.farmName);
    setProducerRole(nextSummary.producerRole);
    setFarmAddress(nextSummary.farmAddress);
    setFarmAddressNumber(nextSummary.farmAddressNumber || "");
    setFarmAddressReference(nextSummary.farmAddressReference || "");
    setFarmCep(nextSummary.farmCep);
    
    const nextCoords =
      nextSummary.gateLatitude != null && nextSummary.gateLongitude != null
        ? { latitude: nextSummary.gateLatitude, longitude: nextSummary.gateLongitude }
        : null;
    
    setGateCoords(nextCoords);
    setIsCepValidated(nextSummary.isCepValidated);
    setIsGatePinConfirmed(nextSummary.isGatePinConfirmed);
    setLocationValidatedAt(nextSummary.locationValidatedAt ?? null);
    setProfileBio(nextSummary.bio || "");
    setFarmPhotos(getFarmPhotos(profileName));
    setProfilePhotoUri(nextSummary.avatarUri ?? user?.avatarUri ?? getProfileAvatar(profileName) ?? null);

    // Drafts update
    setDraftDisplayName(nextSummary.displayName || user?.fullName || "");
    setDraftFarmName(nextSummary.farmName);
    setDraftProducerRole(nextSummary.producerRole);
    setDraftFarmAddress(nextSummary.farmAddress);
    setDraftFarmAddressNumber(nextSummary.farmAddressNumber || "");
    setDraftFarmAddressReference(nextSummary.farmAddressReference || "");
    setDraftFarmCep(formatCep(nextSummary.farmCep));
    setDraftGateCoords(nextCoords);
    setDraftIsCepValidated(nextSummary.isCepValidated);
    setDraftIsGatePinConfirmed(nextSummary.isGatePinConfirmed);
    setDraftLocationValidatedAt(nextSummary.locationValidatedAt ?? null);
    setDraftProfileBio(nextSummary.bio || "");
    setDraftPhone(user?.phone || "");
    setDraftGender(user?.gender as AppUser["gender"]);

    let userOrders: Order[] = [];
    const userSearchName = user?.fullName || profileName;
    
    if (user?.role === "buyer" || mode === "purchases") {
      userOrders = await getOrdersByBuyer(userSearchName);
    } else {
      userOrders = await getOrdersByUser(profileName);
    }
    setOrders(userOrders);
  }, [profileName, user?.fullName, user?.role, user?.phone, user?.gender, mode]);

  // -- EFFECTS --
  useEffect(() => {
    refreshProfileData();
  }, [refreshProfileData]);

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

      // Seção de Detalhamento de Pedidos
      const orderDetails = orders.map(o => 
        `${o.id};${o.data};${o.produto};${o.categoria};${o.quantidade};R$ ${o.valorNumerico.toFixed(2)};${o.status}`
      ).join("\n");

      // Formatação profissional para Excel (Ponto-e-vírgula e BOM)
      const csvContent = [
        ["TERRA NOVA - RELATÓRIO EXECUTIVO DE VENDAS"],
        [""],
        ["INFO DA PROPRIEDADE"],
        [`Fazenda:;${farmName}`],
        [`Produtor:;${displayName}`],
        [`Endereço:;${farmAddress};CEP:;${farmCep}`],
        [`Período:;${periodLabels[salesPeriod as keyof typeof periodLabels]}`],
        [`Data de Geração:;${currentDate} às ${currentTime}`],
        [""],
        ["RESUMO POR CATEGORIA"],
        ["Categoria;Faturamento Total"],
        [`Alimentos;R$ ${salesData.alimentos.toFixed(2)}`],
        [`Insumos;R$ ${salesData.insumos.toFixed(2)}`],
        [`Sementes;R$ ${salesData.sementes.toFixed(2)}`],
        [""],
        [`VALOR TOTAL ACUMULADO;R$ ${salesData.total.toFixed(2)}`],
        [""],
        ["──────────────────────────────────────────"],
        ["LISTA DETALHADA DE TRANSAÇÕES"],
        ["──────────────────────────────────────────"],
        ["ID Pedido;Data;Produto;Categoria;Qtd;Valor Unit.;Status"],
        orderDetails,
        [""],
        ["Relatório gerado automaticamente pelo App Terra Nova"],
        ["Marketplace de Pequenos Produtores"],
      ].join("\n");

      // Adiciona o BOM para suporte a acentos no Excel
      const finalCsv = "\ufeff" + csvContent;
      const filename = `vendas_detalhado_${salesPeriod}_${new Date().getTime()}.csv`;

      await exportToPlatform(filename, finalCsv);
    } catch (error) {
      console.error("Erro ao exportar relatório do produtor:", error);
      Alert.alert("Erro", "Não foi possível exportar o relatório de vendas.");
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

    const isBuyer = user?.role === "buyer";
    
    // Validação de Campos Obrigatórios de acordo com o Perfil
    if (isBuyer) {
      if (!nextName) {
        Alert.alert("Campo obrigatório", "O nome não pode estar vazio.");
        return;
      }
    } else {
      // Regras para Produtor (Sítio)
      if (!nextName || !nextFarm || !nextRole || !nextAddress || !nextNumber || !nextCep) {
        Alert.alert("Campos obrigatórios", "Para produtores, todos os dados da fazenda e endereço são necessários.");
        return;
      }
      
      if (nextCep.length !== 8) {
        Alert.alert("CEP inválido", "O CEP deve ter 8 dígitos.");
        return;
      }

      if (!draftGateCoords || !draftIsCepValidated || !draftIsGatePinConfirmed) {
        Alert.alert("Validação pendente", "Valide o CEP e confirme a localização da porteira no mapa.");
        return;
      }
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
    // Persist profile photo if user picked a new one
    if (profilePhotoUri) {
      await setProfileAvatar(profileName, profilePhotoUri);
    }

    // Para Compradores, atualizar campos extras
    if (isBuyer) {
      await updateProfileSummary(profileName, {
        displayName: nextName,
        bio: nextBio,
        phone: draftPhone,
        gender: draftGender,
        avatarUri: profilePhotoUri ?? undefined,
      });

      // Persistir no authStore para que as telas (como a Central) atualizem
      await updateUserBuyerProfile(profileName, {
        fullName: nextName,
        phone: draftPhone,
        gender: draftGender,
        bio: nextBio,
      });
      
      // Update avatarUri in authStore
      if (profilePhotoUri) {
          await updateUserAvatarUri(profileName, profilePhotoUri);
      }
    } else {
      // Para Produtores, atualizar campos de sítio
      await updateProfileSummary(profileName, {
        displayName: nextName,
        farmName: nextFarm,
        producerRole: nextRole,
        farmAddress: nextAddress,
        farmAddressNumber: nextNumber,
        farmAddressReference: nextReference,
        farmCep: nextCep,
        gateLatitude: draftGateCoords?.latitude,
        gateLongitude: draftGateCoords?.longitude,
        isCepValidated: draftIsCepValidated,
        isGatePinConfirmed: draftIsGatePinConfirmed,
        locationValidatedAt: draftLocationValidatedAt ?? undefined,
        bio: nextBio,
      });

      // Sync basic info to AuthStore for consistency
      await updateUserBuyerProfile(profileName, {
        fullName: nextName,
        phone: draftPhone,
        bio: nextBio,
        address: {
          street: draftFarmAddress,
          number: draftFarmAddressNumber,
          cep: draftFarmCep,
          neighborhood: "",
          city: "",
          state: "",
        },
      });if (profilePhotoUri) {
        await updateUserAvatarUri(profileName, profilePhotoUri);
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
    draftPhone,
    draftGender,
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
    setDraftPhone,
    setDraftGender,
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
    refreshProfileData,
  };
}
