import { useAuth } from "@/contexts/AuthContext";
import {
  DEFAULT_PIN_REGION,
  formatCep,
  normalizeCep,
  PROFILE_BIO_MAX,
} from "@/features/account/utils/accountUtils";
import {
  updateUserAvatarUri,
  updateUserBuyerProfile,
  updateUserMAPA,
  getUserByUsername,
} from "@/services/authStore";
import {
  addFarmPhoto,
  getFarmPhotos,
  getProfileAvatar,
  getProfileSummary,
  removeFarmPhoto,
  setProfileAvatar,
  updateProfileSummary,
  syncProfileFromUser,
} from "@/services/communityStore";
import {
  getOrdersByBuyer,
  getOrdersByUser,
  initOrdersStore,
} from "@/services/ordersStore";
import { uploadImage } from "@/services/imageUploadService";
import { exportToPlatform } from "@/utils/csvExport";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Platform } from "react-native";

export function useAccountLogic(options) {
  const mode = options?.mode || "sales";
  const { user, logout, refreshUser } = useAuth();
  const profileName = user?.username || "Sitio1";

  // Estado para forçar re-render após sincronização com backend
  const [syncCounter, setSyncCounter] = useState(0);

  // Apenas pega summary após sincronização (syncCounter muda)
  const summary = getProfileSummary(profileName);

  // -- REAL STATE -- (prioriza user do contexto sobre cache local)
  const [displayName, setDisplayName] = useState(
    user?.fullName || summary.displayName || ""
  );
  const [farmName, setFarmName] = useState(summary.farmName);
  const [producerRole, setProducerRole] = useState(summary.producerRole);
  const [farmAddress, setFarmAddress] = useState(summary.farmAddress);
  const [farmAddressNumber, setFarmAddressNumber] = useState(
    summary.farmAddressNumber
  );
  const [farmAddressReference, setFarmAddressReference] = useState(
    summary.farmAddressReference
  );
  const [farmCep, setFarmCep] = useState(summary.farmCep);
  const [gateCoords, setGateCoords] = useState(
    summary.gateLatitude != null && summary.gateLongitude != null
      ? { latitude: summary.gateLatitude, longitude: summary.gateLongitude }
      : null
  );
  const [isCepValidated, setIsCepValidated] = useState(summary.isCepValidated);
  const [isGatePinConfirmed, setIsGatePinConfirmed] = useState(
    summary.isGatePinConfirmed
  );
  const [locationValidatedAt, setLocationValidatedAt] = useState(
    summary.locationValidatedAt ?? null
  );
  const [profileBio, setProfileBio] = useState(user?.bio || summary.bio || "");
  const [farmPhotos, setFarmPhotos] = useState(
    user?.role === "producer" ? getFarmPhotos(profileName) : []
  );
  const [profilePhotoUri, setProfilePhotoUri] = useState(
    user?.avatarUri ??
      summary.avatarUri ??
      getProfileAvatar(profileName) ??
      null
  );

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isCepResolving, setIsCepResolving] = useState(false);
  const [lastAutoValidatedCep, setLastAutoValidatedCep] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [hasNewMessages, _setHasNewMessages] = useState(true);
  const [selectedOrderTab, setSelectedOrderTab] = useState("aguardando");
  const [salesPeriod, setSalesPeriod] = useState("total");
  const [orders, setOrders] = useState([]);

  // -- DRAFT STATE (Inside Edit Modal) --
  const [draftDisplayName, setDraftDisplayName] = useState(displayName);
  const [draftFarmName, setDraftFarmName] = useState(farmName);
  const [draftProducerRole, setDraftProducerRole] = useState(producerRole);
  const [draftFarmAddress, setDraftFarmAddress] = useState(farmAddress);
  const [draftFarmAddressNumber, setDraftFarmAddressNumber] =
    useState(farmAddressNumber);
  const [draftFarmAddressReference, setDraftFarmAddressReference] =
    useState(farmAddressReference);
  const [draftFarmCep, setDraftFarmCep] = useState(formatCep(farmCep));
  const [draftGateCoords, setDraftGateCoords] = useState(gateCoords);
  const [draftIsCepValidated, setDraftIsCepValidated] =
    useState(isCepValidated);
  const [draftIsGatePinConfirmed, setDraftIsGatePinConfirmed] =
    useState(isGatePinConfirmed);
  const [draftLocationValidatedAt, setDraftLocationValidatedAt] =
    useState(locationValidatedAt);
  const [draftProfileBio, setDraftProfileBio] = useState(profileBio);
  const [draftPhone, setDraftPhone] = useState(user?.phone || "");
  const [draftGender, setDraftGender] = useState(user?.gender);
  const [draftMapaRegistration, setDraftMapaRegistration] = useState(
    user?.mapaRegistrationNumber || ""
  );

  // -- REAL ORDERS LOGIC --
  const myOrders = useMemo(
    () => ({
      aguardando: orders.filter((o) => o.status === "aguardando"),
      transporte: orders.filter((o) => o.status === "transporte"),
      finalizado: orders.filter((o) => o.status === "finalizado"),
    }),
    [orders]
  );

  const salesData = useMemo(() => {
    const finished = orders.filter((o) => o.status === "finalizado");

    // Filtrar por período baseado na data do pedido (formato DD/MM/YYYY)
    const parseOrderDate = (dateStr) => {
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        return new Date(
          Number(parts[2]),
          Number(parts[1]) - 1,
          Number(parts[0])
        );
      }
      return new Date(0);
    };

    const now = new Date();
    const filtered = finished.filter((o) => {
      const d = parseOrderDate(o.data);
      if (salesPeriod === "dias") {
        const limit = new Date(now);
        limit.setDate(now.getDate() - 7);
        return d >= limit;
      } else if (salesPeriod === "semanas") {
        const limit = new Date(now);
        limit.setDate(now.getDate() - 28);
        return d >= limit;
      } else if (salesPeriod === "meses") {
        const limit = new Date(now);
        limit.setMonth(now.getMonth() - 3);
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
      alimentos: filtered
        .filter((o) => o.categoria === "alimentos")
        .reduce((acc, o) => acc + o.valorNumerico, 0),
      insumos: filtered
        .filter((o) => o.categoria === "insumos")
        .reduce((acc, o) => acc + o.valorNumerico, 0),
      sementes: filtered
        .filter((o) => o.categoria === "sementes")
        .reduce((acc, o) => acc + o.valorNumerico, 0),
      recentOrders: [...finished]
        .sort((a, b) => {
          return (
            parseOrderDate(b.data).getTime() - parseOrderDate(a.data).getTime()
          );
        })
        .slice(0, 5),
    };
  }, [orders, salesPeriod]);

  const refreshProfileData = useCallback(async () => {
    // NÃO reinicialize a store aqui, pois ela redefine com dados padrão
    // await initCommunityStore();
    await initOrdersStore();

    // Refresh user from context (atualiza phone, gender, etc do backend)
    await refreshUser();

    // Fetch user updated data from backend if available
    if (user?.id) {
      try {
        const backendUser = await getUserByUsername(user.username);
        if (backendUser) {
          // Sync backend data to community store
          await syncProfileFromUser(backendUser);
        }
      } catch (e) {
        console.debug(
          "[useAccountLogic] Falha ao sincronizar dados do backend:",
          e
        );
      }
    }

    // Refresh user from store to get latest phone/gender
    const nextSummary = getProfileSummary(profileName);
    setDisplayName(user?.fullName || nextSummary.displayName || "");
    setFarmName(nextSummary.farmName);
    setProducerRole(nextSummary.producerRole);
    setFarmAddress(nextSummary.farmAddress);
    setFarmAddressNumber(nextSummary.farmAddressNumber || "");
    setFarmAddressReference(nextSummary.farmAddressReference || "");
    setFarmCep(nextSummary.farmCep);

    let nextCoords =
      nextSummary.gateLatitude != null && nextSummary.gateLongitude != null
        ? {
            latitude: nextSummary.gateLatitude,
            longitude: nextSummary.gateLongitude,
          }
        : null;

    let isCepValidatedVal = nextSummary.isCepValidated;
    let isGatePinConfirmedVal = nextSummary.isGatePinConfirmed;
    let locationValidatedAtVal = nextSummary.locationValidatedAt ?? null;

    // Se o produtor não tem coordenadas salvas ainda (ex: nova conta) mas tem CEP cadastrado
    if (!nextCoords && nextSummary.farmCep) {
      try {
        const cleanedCep = normalizeCep(nextSummary.farmCep);
        if (cleanedCep.length === 8) {
          const geocoded = await Location.geocodeAsync(
            `CEP ${cleanedCep}, Brasil`
          );
          if (geocoded.length) {
            nextCoords = {
              latitude: geocoded[0].latitude,
              longitude: geocoded[0].longitude,
            };
            isCepValidatedVal = true;
          }
        }
      } catch (err) {
        console.debug(
          "Falha ao geocodificar CEP inicial do novo produtor:",
          err
        );
      }
    }

    setGateCoords(nextCoords);
    setIsCepValidated(isCepValidatedVal);
    setIsGatePinConfirmed(isGatePinConfirmedVal);
    setLocationValidatedAt(locationValidatedAtVal);
    setProfileBio(nextSummary.bio || user?.bio || "");
    setFarmPhotos(getFarmPhotos(profileName));
    setProfilePhotoUri(
      user?.avatarUri ??
        nextSummary.avatarUri ??
        getProfileAvatar(profileName) ??
        null
    );

    // Drafts update (usa dados atualizados do user)
    setDraftDisplayName(user?.fullName || nextSummary.displayName || "");
    setDraftFarmName(nextSummary.farmName);
    setDraftProducerRole(nextSummary.producerRole);
    setDraftFarmAddress(nextSummary.farmAddress);
    setDraftFarmAddressNumber(nextSummary.farmAddressNumber || "");
    setDraftFarmAddressReference(nextSummary.farmAddressReference || "");
    setDraftFarmCep(formatCep(nextSummary.farmCep));
    setDraftGateCoords(nextCoords);
    setDraftIsCepValidated(isCepValidatedVal);
    setDraftIsGatePinConfirmed(isGatePinConfirmedVal);
    setDraftLocationValidatedAt(locationValidatedAtVal);
    setDraftProfileBio(nextSummary.bio || user?.bio || "");
    setDraftPhone(user?.phone || "");
    setDraftGender(user?.gender);
    setDraftMapaRegistration(user?.mapaRegistrationNumber || "");

    const userSearchName = profileName; // Use username, not fullName, because the API expects username
    const userOrders =
      user?.role === "buyer" || mode === "purchases"
        ? await getOrdersByBuyer(userSearchName)
        : await getOrdersByUser(profileName);
    setOrders(userOrders);
  }, [
    profileName,
    user?.fullName,
    user?.role,
    user?.phone,
    user?.gender,
    mode,
    refreshUser,
    syncCounter,
  ]);

  // -- EFFECTS --
  // Sincronizar com backend PRIMEIRO antes de carregar dados
  useEffect(() => {
    const syncWithBackend = async () => {
      try {
        // Força refresh dos dados do backend
        await refreshUser();
        // Sincroniza comunidade com dados atualizados do backend
        if (user?.id) {
          const backendUser = await getUserByUsername(user.username);
          if (backendUser) {
            await syncProfileFromUser(backendUser);
          }
        }
      } catch (e) {
        console.debug(
          "[useAccountLogic] Erro ao sincronizar com backend no init:",
          e
        );
      } finally {
        // Força re-render para pegar dados sincronizados
        setSyncCounter((c) => c + 1);
      }
    };
    syncWithBackend();
  }, [user?.id, user?.username, refreshUser]);

  useEffect(() => {
    refreshProfileData();
  }, [refreshProfileData, syncCounter]);

  // -- ACTIONS --
  const exportToCSV = async () => {
    try {
      const currentDate = new Date().toLocaleDateString("pt-BR");
      const currentTime = new Date().toLocaleTimeString("pt-BR");

      const periodLabels = {
        dias: "Últimos 7 dias",
        semanas: "Últimas 4 semanas",
        meses: "Últimos 3 meses",
        total: "Total acumulado",
      };

      // Seção de Detalhamento de Pedidos
      const orderDetails = orders
        .map(
          (o) =>
            `${o.id};${o.data};${o.produto};${o.categoria};${
              o.quantidade
            };R$ ${o.valorNumerico.toFixed(2)};${o.status}`
        )
        .join("\n");

      // Formatação para Excel (Ponto-e-vírgula e BOM)
      const csvContent = [
        ["TERRA NOVA - RELATÓRIO EXECUTIVO DE VENDAS"],
        [""],
        ["INFO DA PROPRIEDADE"],
        [`Fazenda:;${farmName}`],
        [`Produtor:;${displayName}`],
        [`Endereço:;${farmAddress};CEP:;${farmCep}`],
        [`Período:;${periodLabels[salesPeriod]}`],
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

  const openGalleryPicker = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permissao necessaria",
        "Ative a permissao da galeria para selecionar fotos."
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: Platform.OS === "ios",
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) return null;
    return result.assets[0].uri;
  };

  const openCameraPicker = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permissao necessaria",
        "Ative a permissao da camera para tirar fotos."
      );
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: Platform.OS === "ios",
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) return null;
    return result.assets[0].uri;
  };

  const onPickProfilePhoto = async () => {
    const uri = await openGalleryPicker();
    if (!uri) return;

    // Upload to server and get URL
    const uploadedUrl = await uploadImage(uri);
    if (!uploadedUrl) {
      Alert.alert(
        "Erro",
        "Não foi possível fazer upload da foto. Verifique a conexão."
      );
      return;
    }

    // Save server URL instead of local URI
    await setProfileAvatar(profileName, uploadedUrl);
    setProfilePhotoUri(uploadedUrl);
  };

  const onTakeProfilePhoto = async () => {
    const uri = await openCameraPicker();
    if (!uri) return;

    // Upload to server and get URL
    const uploadedUrl = await uploadImage(uri);
    if (!uploadedUrl) {
      Alert.alert(
        "Erro",
        "Não foi possível fazer upload da foto. Verifique a conexão."
      );
      return;
    }

    // Save server URL instead of local URI
    await setProfileAvatar(profileName, uploadedUrl);
    setProfilePhotoUri(uploadedUrl);
  };

  const onPickFarmPhoto = async () => {
    const uri = await openGalleryPicker();
    if (!uri) return;

    const result = addFarmPhoto(profileName, uri);
    if (!result.ok) {
      Alert.alert(
        "Limite atingido",
        "Você pode adicionar no máximo 5 fotos por perfil."
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
        "Você pode adicionar no máximo 5 fotos por perfil."
      );
      return;
    }
    setFarmPhotos(getFarmPhotos(profileName));
  };

  const onRemovePhoto = (uri) => {
    removeFarmPhoto(profileName, uri);
    setFarmPhotos(getFarmPhotos(profileName));
  };

  const openPinPlacementModal = () => {
    setIsPinModalOpen(true);
  };

  const resolveCepAndOpenPin = async (inputCep) => {
    const cepDigits = normalizeCep(inputCep);
    if (cepDigits.length !== 8) {
      Alert.alert("CEP invalido", "Informe um CEP com 8 digitos.");
      setLastAutoValidatedCep("");
      return;
    }

    try {
      setIsCepResolving(true);
      const response = await fetch(
        `https://viacep.com.br/ws/${cepDigits}/json/`
      );
      if (!response.ok) throw new Error("cep_lookup_failed");

      const data = await response.json();
      if (data.erro || !data.localidade || !data.uf) {
        Alert.alert("CEP nao encontrado", "Nao foi possivel validar esse CEP.");
        setLastAutoValidatedCep("");
        return;
      }

      const resolvedAddress = [
        data.logradouro,
        data.bairro,
        `${data.localidade} - ${data.uf}`,
      ]
        .filter(Boolean)
        .join(", ");

      if (resolvedAddress) setDraftFarmAddress(resolvedAddress);

      let suggestedCoords = draftGateCoords;
      try {
        const geocoded = await Location.geocodeAsync(
          `${resolvedAddress || `${data.localidade} - ${data.uf}`}, Brasil`
        );
        if (geocoded.length) {
          suggestedCoords = {
            latitude: geocoded[0].latitude,
            longitude: geocoded[0].longitude,
          };
        }
      } catch {}

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
        "Nao foi possivel consultar esse CEP agora."
      );
      openPinPlacementModal();
    } finally {
      setIsCepResolving(false);
    }
  };

  const onDraftCepChange = (text) => {
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

  const onMapPressSetGate = (event) => {
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
    }
    if (!isBuyer) {
      // Regras para Produtor (Sítio)
      if (
        !nextName ||
        !nextFarm ||
        !nextRole ||
        !nextAddress ||
        !nextNumber ||
        !nextCep
      ) {
        Alert.alert(
          "Campos obrigatórios",
          "Para produtores, todos os dados da fazenda e endereço são necessários."
        );
        return;
      }

      if (nextCep.length !== 8) {
        Alert.alert("CEP inválido", "O CEP deve ter 8 dígitos.");
        return;
      }
      // NOTA: A validação de pin de porteira é opcional enquanto a build nativa
      // não estiver disponível — não deve bloquear o save dos outros campos.
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

    // Profile photo is already saved during selection (onPickProfilePhoto/onTakProfilePhoto)
    // Just ensure it's persisted with other profile data
    if (profilePhotoUri) {
      await updateProfileSummary(profileName, { avatarUri: profilePhotoUri });
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
        avatarUri: profilePhotoUri || undefined,
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
        avatarUri: profilePhotoUri || undefined,
      });

      // Persistir no authStore para que as telas (como a Central) atualizem
      await updateUserBuyerProfile(profileName, {
        fullName: nextName,
        farmName: nextFarm,
        phone: draftPhone,
        gender: draftGender,
        bio: nextBio,
        gateLatitude: draftGateCoords?.latitude,
        gateLongitude: draftGateCoords?.longitude,
        isCepValidated: draftIsCepValidated,
        isGatePinConfirmed: draftIsGatePinConfirmed,
        locationValidatedAt: draftLocationValidatedAt ?? undefined,
        avatarUri: profilePhotoUri || undefined,
        address: {
          street: draftFarmAddress,
          number: draftFarmAddressNumber,
          cep: draftFarmCep,
          neighborhood: "",
          city: "",
          state: "",
        },
      });

      if (profilePhotoUri) {
        await updateUserAvatarUri(profileName, profilePhotoUri);
      }

      // Atualiza registro MAPA (mesmo para compradores, caso tenham preenchido o campo)
      await updateUserMAPA(profileName, draftMapaRegistration);
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
    draftMapaRegistration,
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
    setDraftMapaRegistration,
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
