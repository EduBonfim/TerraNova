import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  http,
  isBackendTemporarilyUnavailable,
  post,
  get,
  put,
  httpDelete,
} from "./api";

export const LGPD_TERMS_VERSION = "2026.04";
export const TERMS_OF_USE_VERSION = "2026.10";
const DEFAULT_USERS = [];

// Estado em memória apenas - sem persistência local
let usersState = [...DEFAULT_USERS];
let isInitialized = false;
let currentSession = null;

const normalizeDocument = (value) => value.replace(/\D/g, "");

export const maskDocument = (value, visibleDigits = 4) => {
  const digits = normalizeDocument(value || "");
  if (!digits) return "Não informado";
  const keep = Math.max(1, Math.min(visibleDigits, digits.length));
  const hidden = "*".repeat(Math.max(0, digits.length - keep));
  return `${hidden}${digits.slice(-keep)}`;
};

export const maskEmail = (email) => {
  if (!email || !email.includes("@")) return "Não informado";
  const [user, domain] = email.split("@");
  if (user.length <= 2) return `**@${domain}`;
  return `${user.slice(0, 2)}${"*".repeat(user.length - 2)}@${domain}`;
};

export const maskPhone = (phone) => {
  const digits = normalizeDocument(phone || "");
  if (!digits) return "Não informado";
  if (digits.length <= 4) return "****";
  return `(${digits.slice(0, 2)}) *****-${digits.slice(-4)}`;
};

const AUTH_SESSION_STORAGE_KEY = "@terra_nova/current_session";
const AUTH_USER_STORAGE_KEY = "@terra_nova/current_user";

const persistCurrentUser = async (user) => {
  try {
    if (user) {
      await AsyncStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(AUTH_USER_STORAGE_KEY);
    }
  } catch (error) {
    console.error("Failed to persist current user to AsyncStorage", error);
  }
};

const persistUsers = async () => {
  // Não persiste mais em AsyncStorage, apenas memória
};

const persistSession = async (session) => {
  currentSession = session;
  try {
    if (session) {
      await AsyncStorage.setItem(
        AUTH_SESSION_STORAGE_KEY,
        JSON.stringify(session)
      );
      await persistCurrentUser(session.user);
    } else {
      await AsyncStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
      await persistCurrentUser(null);
    }
  } catch (error) {
    console.error("Failed to persist session to AsyncStorage", error);
  }
};

const persistUpdatedSessionUserIfCurrent = async (updatedUser) => {
  const normalized = updatedUser.username.trim().toLowerCase();
  if (currentSession?.user?.username?.trim().toLowerCase() === normalized) {
    await persistSession({
      token: currentSession.token,
      user: { ...currentSession.user, ...updatedUser },
    });
  } else {
    try {
      const cached = await AsyncStorage.getItem(AUTH_USER_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.username?.trim().toLowerCase() === normalized) {
          await persistCurrentUser({ ...parsed, ...updatedUser });
        }
      }
    } catch (e) {
      console.warn("Failed to update current user cache", e);
    }
  }
};

const syncCachedUser = async (user) => {
  const index = usersState.findIndex(
    (item) =>
      item.username.trim().toLowerCase() === user.username.trim().toLowerCase()
  );
  if (index === -1) {
    usersState = [...usersState, user];
  } else {
    usersState[index] = { ...usersState[index], ...user };
  }
  await persistUsers();
};

const mapBackendUserToAppUser = (backendUser) => {
  const address =
    backendUser?.addressCep ||
    backendUser?.addressStreet ||
    backendUser?.addressNumber ||
    backendUser?.addressNeighborhood ||
    backendUser?.addressCity ||
    backendUser?.addressState ||
    backendUser?.addressComplement
      ? {
          cep: backendUser?.addressCep || "",
          street: backendUser?.addressStreet || "",
          number: backendUser?.addressNumber || "",
          neighborhood: backendUser?.addressNeighborhood || "",
          city: backendUser?.addressCity || "",
          state: backendUser?.addressState || "",
          complement: backendUser?.addressComplement || undefined,
        }
      : undefined;

  return {
    id: backendUser?.id ? String(backendUser.id) : undefined,
    username: backendUser?.username || "",
    password: "",
    role: backendUser?.role || "producer",
    lgpdAcceptedAt: backendUser?.lgpdAcceptedAt || undefined,
    lgpdTermsVersion: backendUser?.lgpdTermsVersion || undefined,
    pendingLgpdReacceptance: backendUser?.pendingLgpdReacceptance ?? undefined,
    termsAcceptedAt: backendUser?.termsAcceptedAt || undefined,
    termsVersion: backendUser?.termsVersion || undefined,
    fullName: backendUser?.fullName || undefined,
    recipientName:
      backendUser?.recipientName || backendUser?.fullName || undefined,
    farmName: backendUser?.farmName || undefined,
    farmDocument: backendUser?.farmDocument || undefined,
    farmDocumentType: backendUser?.farmDocumentType || undefined,
    isOrganicCertified: backendUser?.isOrganicCertified ?? undefined,
    mapaRegistrationNumber: backendUser?.mapaRegistrationNumber ?? undefined,
    cpf: backendUser?.cpf || undefined,
    email: backendUser?.email || undefined,
    phone: backendUser?.phone || undefined,
    bio: backendUser?.bio || undefined,
    gender: backendUser?.gender || undefined,
    address,
    avatarUri: backendUser?.avatarUri || undefined,
    blockMessages: backendUser?.blockMessages ?? undefined,
    gateLatitude: backendUser?.gateLatitude ?? undefined,
    gateLongitude: backendUser?.gateLongitude ?? undefined,
    isCepValidated: backendUser?.isCepValidated ?? undefined,
    isGatePinConfirmed: backendUser?.isGatePinConfirmed ?? undefined,
    locationValidatedAt: backendUser?.locationValidatedAt || undefined,
  };
};

const toRegisterPayload = (payload, role) => ({
  username: payload.username.trim(),
  password: payload.password.trim(),
  role,
  fullName: payload.fullName?.trim() || undefined,
  email: payload.email?.trim() || undefined,
  phone: payload.phone?.trim() || undefined,
  avatarUri: payload.avatarUri,
  farmName: payload.farmName?.trim() || undefined,
  farmDocument: payload.farmDocument?.trim() || undefined,
  farmDocumentType: payload.farmDocumentType,
  cpf: payload.cpf ? normalizeDocument(payload.cpf) : undefined,
  bio: payload.bio?.trim() || undefined,
  gender: payload.gender,
  addressCep: payload.address?.cep?.trim() || undefined,
  addressStreet: payload.address?.street?.trim() || undefined,
  addressNumber: payload.address?.number?.trim() || undefined,
  addressNeighborhood: payload.address?.neighborhood?.trim() || undefined,
  addressCity: payload.address?.city?.trim() || undefined,
  addressState: payload.address?.state
    ? payload.address.state.trim().toUpperCase()
    : undefined,
  addressComplement: payload.address?.complement?.trim() || undefined,
  acceptLgpd: payload.acceptLgpd,
  privacyVersion: LGPD_TERMS_VERSION,
  acceptTerms: payload.acceptTerms,
  termsVersion: TERMS_OF_USE_VERSION,
});

export const getCurrentSession = async () => {
  if (!isInitialized) {
    await initAuthStore();
  }
  return currentSession;
};

export const clearCurrentSession = async () => {
  await persistSession(null);
};

export const initAuthStore = async () => {
  if (isInitialized) return;
  try {
    const sessionJson = await AsyncStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    if (sessionJson) {
      currentSession = JSON.parse(sessionJson);
      if (currentSession?.user) {
        usersState = [currentSession.user];
      }
    } else {
      usersState = [];
    }
  } catch (error) {
    console.error("Failed to load session from AsyncStorage", error);
    usersState = [];
  }
  isInitialized = true;
};

export const getUsers = async () => {
  const session = await getCurrentSession();
  if (session?.token) {
    try {
      const response = await get("/api/v1/usuarios");
      if (response.success && response.data) {
        const fetchedUsers = response.data.map(mapBackendUserToAppUser);
        fetchedUsers.forEach((u) => {
          const index = usersState.findIndex(
            (ex) => ex.username.toLowerCase() === u.username.toLowerCase()
          );
          if (index !== -1) {
            usersState[index] = { ...usersState[index], ...u };
          } else {
            usersState.push(u);
          }
        });
        return fetchedUsers;
      }
    } catch (e) {
      console.warn("Failed to fetch all users from backend", e);
    }
  }
  return usersState.map((item) => ({ ...item }));
};

export const getUserByUsername = async (username) => {
  await initAuthStore();
  const normalized = username.trim().toLowerCase();
  const session = await getCurrentSession();
  if (session?.token && !isBackendTemporarilyUnavailable()) {
    const response = await http(
      `/api/v1/usuarios/username/${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      }
    );
    if (response.success && response.data) {
      const user = mapBackendUserToAppUser(response.data);
      if (user.username) {
        await syncCachedUser(user);
      }
      return user.username ? { ...user } : null;
    }
  }
  if (
    session?.user &&
    session.user.username.trim().toLowerCase() === normalized
  ) {
    return { ...session.user };
  }
  const user = usersState.find(
    (item) => item.username.trim().toLowerCase() === normalized
  );
  return user ? { ...user } : null;
};

export const getAdminUserSummaries = async () => {
  await initAuthStore();
  const allUsers = await getUsers();
  return allUsers.map((item) => ({
    username: item.username,
    role: item.role || "producer",
    fullName: item.fullName,
    farmName: item.farmName,
    farmDocumentMasked: maskDocument(item.farmDocument, 4),
    farmDocumentType: item.farmDocumentType,
    cpf: maskDocument(item.cpf, 4),
  }));
};

export const authenticateUser = async (usernameOrEmail, password) => {
  const response = await post("/api/v1/auth/login", {
    username: usernameOrEmail.trim(),
    password: password.trim(),
  });
  if (!response.success && response.status === 0) {
    throw new Error(response.error || "Falha ao conectar com o backend");
  }
  if (response.success && response.data?.token) {
    const backendUser = response.data.user || {
      username: response.data.username,
      role: response.data.roles?.[0]?.replace("ROLE_", "").toLowerCase(),
    };
    const appUser = mapBackendUserToAppUser(backendUser);
    if (!appUser.username) {
      return null;
    }
    await syncCachedUser(appUser);
    await persistSession({ token: response.data.token, user: appUser });
    return { ...appUser };
  }
  return null;
};

const mapRegisterErrorResponse = (response) => {
  if (response.status === 0) {
    return {
      ok: false,
      reason: "network",
      message:
        response.error ||
        "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
    };
  }

  const code = (response.code || "").toUpperCase();
  const errorText = (response.error || "").trim();
  const errorUpper = errorText.toUpperCase();

  if (code === "USER_BANNED" || errorUpper.includes("USER_BANNED")) {
    return {
      ok: false,
      reason: "banned",
      message:
        errorText && errorUpper !== "USER_BANNED"
          ? errorText
          : "Este CPF está impedido de criar uma nova conta na plataforma.",
    };
  }

  if (code === "USERNAME_EXISTS" || errorUpper.includes("USERNAME_EXISTS")) {
    return {
      ok: false,
      reason: "exists",
      message:
        errorText && errorUpper !== "USERNAME_EXISTS"
          ? errorText
          : "Este nome de usuário/login já está em uso. Escolha outro para cadastrar.",
    };
  }

  if (code === "EMAIL_EXISTS" || errorUpper.includes("EMAIL_EXISTS")) {
    return {
      ok: false,
      reason: "email_exists",
      message:
        errorText && errorUpper !== "EMAIL_EXISTS"
          ? errorText
          : "Este e-mail já está cadastrado em outra conta.",
    };
  }

  if (code === "CPF_EXISTS" || errorUpper.includes("CPF_EXISTS")) {
    return {
      ok: false,
      reason: "cpf_exists",
      message:
        errorText && errorUpper !== "CPF_EXISTS"
          ? errorText
          : "Este CPF já está cadastrado em outra conta.",
    };
  }

  if (
    code === "DOCUMENT_EXISTS" ||
    code === "FARM_DOCUMENT_EXISTS" ||
    errorUpper.includes("DOCUMENT_EXISTS")
  ) {
    return {
      ok: false,
      reason: "document_exists",
      message:
        errorText && errorUpper !== "DOCUMENT_EXISTS"
          ? errorText
          : "Já existe uma propriedade cadastrada com este CPF/CNPJ.",
    };
  }

  const isGenericHttpError = !errorText || /^HTTP \d+$/.test(errorText);
  return {
    ok: false,
    reason: "invalid",
    message: isGenericHttpError
      ? `Não foi possível concluir o cadastro (erro ${response.status}). Verifique os dados informados e tente novamente.`
      : errorText,
  };
};

export const registerUser = async (payload) => {
  await initAuthStore();
  const username = payload.username.trim();
  const password = payload.password.trim();
  if (!username) {
    return {
      ok: false,
      reason: "invalid",
      message: "Informe o e-mail ou CPF para login.",
    };
  }
  if (!password) {
    return {
      ok: false,
      reason: "invalid",
      message: "Informe uma senha para concluir o cadastro.",
    };
  }
  if (!payload.acceptTerms) {
    return {
      ok: false,
      reason: "invalid",
      message: "Você precisa aceitar os Termos de Uso para concluir o cadastro.",
    };
  }
  if (!payload.acceptLgpd) {
    return {
      ok: false,
      reason: "invalid",
      message:
        "Você precisa aceitar a Política de Privacidade (LGPD) para concluir o cadastro.",
    };
  }
  const normalizedFarmDocument = normalizeDocument(payload.farmDocument || "");
  const documentType =
    normalizedFarmDocument.length === 11
      ? "cpf"
      : normalizedFarmDocument.length === 14
      ? "cnpj"
      : undefined;
  if (!documentType) {
    return {
      ok: false,
      reason: "invalid",
      message:
        "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido para a propriedade.",
    };
  }
  const response = await post(
    "/api/v1/auth/register/producer",
    toRegisterPayload(
      {
        ...payload,
        farmDocument: normalizedFarmDocument,
        farmDocumentType: documentType,
      },
      "producer"
    )
  );
  if (!response.success) {
    return mapRegisterErrorResponse(response);
  }
  const createdUser = mapBackendUserToAppUser(response.data);
  if (createdUser.username) {
    await syncCachedUser(createdUser);
  }
  return { ok: true };
};

export const registerBuyer = async (payload) => {
  await initAuthStore();
  const username = payload.username.trim();
  const password = payload.password.trim();
  const normalizedCpf = normalizeDocument(payload.cpf || "");
  if (!username) {
    return {
      ok: false,
      reason: "invalid",
      message: "Informe um nome de usuário.",
    };
  }
  if (!password) {
    return {
      ok: false,
      reason: "invalid",
      message: "Informe uma senha para concluir o cadastro.",
    };
  }
  if (!payload.acceptTerms) {
    return {
      ok: false,
      reason: "invalid",
      message: "Você precisa aceitar os Termos de Uso para concluir o cadastro.",
    };
  }
  if (!payload.acceptLgpd) {
    return {
      ok: false,
      reason: "invalid",
      message:
        "Você precisa aceitar a Política de Privacidade (LGPD) para concluir o cadastro.",
    };
  }
  if (normalizedCpf.length !== 11) {
    return {
      ok: false,
      reason: "invalid",
      message: "Informe um CPF válido com 11 dígitos.",
    };
  }
  const response = await post(
    "/api/v1/auth/register/buyer",
    toRegisterPayload(
      {
        ...payload,
        cpf: normalizedCpf,
      },
      "buyer"
    )
  );
  if (!response.success) {
    return mapRegisterErrorResponse(response);
  }
  const createdUser = mapBackendUserToAppUser(response.data);
  if (createdUser.username) {
    await syncCachedUser(createdUser);
  }
  return { ok: true };
};

export const exportUserPersonalData = async (username) => {
  await initAuthStore();
  const normalized = username.trim().toLowerCase();
  const user = usersState.find(
    (item) => item.username.trim().toLowerCase() === normalized
  );
  if (!user) return null;

  if (user.id && !isBackendTemporarilyUnavailable()) {
    try {
      const response = await get(`/api/v1/usuarios/${user.id}/exportar`);
      if (response.success && response.data) {
        const mappedUser = mapBackendUserToAppUser(response.data);
        return {
          username: mappedUser.username,
          role: mappedUser.role || "producer",
          fullName: mappedUser.fullName,
          farmName: mappedUser.farmName,
          farmDocument: mappedUser.farmDocument,
          farmDocumentType: mappedUser.farmDocumentType,
          cpf: mappedUser.cpf,
          address: mappedUser.address,
          lgpdAcceptedAt: mappedUser.lgpdAcceptedAt,
          lgpdTermsVersion: mappedUser.lgpdTermsVersion,
        };
      }
    } catch (e) {
      console.error("Erro na requisição de exportação", e);
    }
  }

  return {
    username: user.username,
    role: user.role || "producer",
    fullName: user.fullName,
    farmName: user.farmName,
    farmDocument: user.farmDocument,
    farmDocumentType: user.farmDocumentType,
    cpf: user.cpf,
    address: user.address,
    lgpdAcceptedAt: user.lgpdAcceptedAt,
    lgpdTermsVersion: user.lgpdTermsVersion,
  };
};

export const deleteUserAccount = async (username) => {
  await initAuthStore();
  const normalized = username.trim().toLowerCase();
  const user = usersState.find(
    (item) => item.username.trim().toLowerCase() === normalized
  );
  if (!user) return false;
  if (user.id && !isBackendTemporarilyUnavailable()) {
    try {
      const response = await httpDelete(`/api/v1/usuarios/${user.id}`);
      if (!response.success && response.status !== 404) {
        console.error("Falha ao excluir usuário no backend", response.error);
        return false;
      }
    } catch (e) {
      console.error("Erro na requisição DELETE", e);
      return false;
    }
  }
  const before = usersState.length;
  usersState = usersState.filter(
    (item) => item.username.trim().toLowerCase() !== normalized
  );
  if (usersState.length === before) return false;
  try {
    const {
      wipeCommunityProfileLocally,
    } = require("@/services/communityStore");
    await wipeCommunityProfileLocally(normalized);
  } catch (e) {
    console.error("Failed to wipe local community profile", e);
  }
  await persistUsers();
  return true;
};

export const acceptLgpdForUser = async (username) => {
  await initAuthStore();
  const normalized = username.trim().toLowerCase();
  const index = usersState.findIndex(
    (item) => item.username.trim().toLowerCase() === normalized
  );
  if (index === -1) return null;

  let acceptedAt = new Date().toISOString();
  let acceptedVersion = LGPD_TERMS_VERSION;

  if (usersState[index].id) {
    const response = await post(
      `/api/v1/usuarios/${usersState[index].id}/aceite-legal`,
      { acceptLgpd: true, privacyVersion: LGPD_TERMS_VERSION }
    );
    if (!response.success) {
      console.error("Falha ao registrar aceite LGPD no backend", response.error);
      return null;
    }
    acceptedAt = response.data?.lgpdAcceptedAt || acceptedAt;
    acceptedVersion = response.data?.lgpdTermsVersion || acceptedVersion;
  }

  usersState[index] = {
    ...usersState[index],
    lgpdAcceptedAt: acceptedAt,
    lgpdTermsVersion: acceptedVersion,
    pendingLgpdReacceptance: false,
  };
  await persistUsers();
  await persistUpdatedSessionUserIfCurrent(usersState[index]);
  return { ...usersState[index] };
};

export const updateUserAvatarUri = async (username, avatarUri) => {
  await initAuthStore();
  const normalized = username.trim().toLowerCase();
  const index = usersState.findIndex(
    (item) => item.username.trim().toLowerCase() === normalized
  );
  if (index === -1) return null;
  usersState[index] = {
    ...usersState[index],
    avatarUri: avatarUri || undefined,
  };
  await persistUsers();
  try {
    const session = await getCurrentSession();
    if (session?.token && usersState[index].id) {
      await put(`/api/v1/usuarios/${usersState[index].id}`, {
        avatarUri: avatarUri || null,
      });
    }
  } catch (e) {
    console.warn("Falha ao sincronizar avatarUri com backend", e);
  }
  await persistUpdatedSessionUserIfCurrent(usersState[index]);
  return { ...usersState[index] };
};

export const updateUserMAPA = async (username, mapaRegistrationNumber) => {
  await initAuthStore();
  const normalized = username.trim().toLowerCase();
  const index = usersState.findIndex(
    (item) => item.username.trim().toLowerCase() === normalized
  );
  if (index === -1) return null;
  usersState[index] = {
    ...usersState[index],
    mapaRegistrationNumber: mapaRegistrationNumber,
    isOrganicCertified: !!mapaRegistrationNumber.trim(),
  };
  await persistUsers();
  try {
    const session = await getCurrentSession();
    if (session?.token && usersState[index].id) {
      await put(`/api/v1/usuarios/${usersState[index].id}`, {
        mapaRegistrationNumber: mapaRegistrationNumber,
        isOrganicCertified: !!mapaRegistrationNumber.trim(),
      });
    }
  } catch (e) {
    console.warn("Falha ao sincronizar MAPA com backend", e);
  }
  await persistUpdatedSessionUserIfCurrent(usersState[index]);
  return { ...usersState[index] };
};

export const updateUserBuyerProfile = async (username, payload) => {
  await initAuthStore();
  const normalized = username.trim().toLowerCase();
  const index = usersState.findIndex(
    (item) => item.username.trim().toLowerCase() === normalized
  );
  if (index === -1) return null;
  usersState[index] = {
    ...usersState[index],
    fullName: payload.fullName ?? usersState[index].fullName,
    phone: payload.phone ?? usersState[index].phone,
    gender: payload.gender ?? usersState[index].gender,
    bio: payload.bio ?? usersState[index].bio,
    farmName: payload.farmName ?? usersState[index].farmName,
    recipientName: payload.recipientName ?? usersState[index].recipientName,
    gateLatitude: payload.gateLatitude ?? usersState[index].gateLatitude,
    gateLongitude: payload.gateLongitude ?? usersState[index].gateLongitude,
    isCepValidated: payload.isCepValidated ?? usersState[index].isCepValidated,
    isGatePinConfirmed:
      payload.isGatePinConfirmed ?? usersState[index].isGatePinConfirmed,
    locationValidatedAt:
      payload.locationValidatedAt ?? usersState[index].locationValidatedAt,
    avatarUri:
      payload.avatarUri !== undefined
        ? payload.avatarUri
        : usersState[index].avatarUri,
    address: payload.address
      ? {
          cep: payload.address.cep.trim(),
          street: payload.address.street.trim(),
          number: payload.address.number.trim(),
          neighborhood: payload.address.neighborhood.trim(),
          city: payload.address.city.trim(),
          state: payload.address.state.trim().toUpperCase(),
          complement: payload.address.complement?.trim(),
        }
      : usersState[index].address,
  };
  await persistUsers();
  try {
    const session = await getCurrentSession();
    if (session?.token && usersState[index].id) {
      const dto = {};
      if (payload.fullName !== undefined) dto.fullName = payload.fullName;
      if (payload.phone !== undefined) dto.phone = payload.phone;
      if (payload.gender !== undefined) dto.gender = payload.gender;
      if (payload.bio !== undefined) dto.bio = payload.bio;
      if (payload.farmName !== undefined) dto.farmName = payload.farmName;
      if (payload.recipientName !== undefined)
        dto.recipientName = payload.recipientName;
      if (payload.gateLatitude !== undefined)
        dto.gateLatitude = payload.gateLatitude;
      if (payload.gateLongitude !== undefined)
        dto.gateLongitude = payload.gateLongitude;
      if (payload.isCepValidated !== undefined)
        dto.isCepValidated = payload.isCepValidated;
      if (payload.isGatePinConfirmed !== undefined)
        dto.isGatePinConfirmed = payload.isGatePinConfirmed;
      if (payload.locationValidatedAt !== undefined)
        dto.locationValidatedAt = payload.locationValidatedAt;
      if (payload.avatarUri !== undefined) dto.avatarUri = payload.avatarUri;
      if (payload.address !== undefined) {
        dto.addressCep = payload.address.cep;
        dto.addressStreet = payload.address.street;
        dto.addressNumber = payload.address.number;
        dto.addressNeighborhood = payload.address.neighborhood;
        dto.addressCity = payload.address.city;
        dto.addressState = payload.address.state;
        dto.addressComplement = payload.address.complement;
      }
      await put(`/api/v1/usuarios/${usersState[index].id}`, dto);
    }
  } catch (e) {
    console.warn("Falha ao sincronizar perfil com backend", e);
  }
  await persistUpdatedSessionUserIfCurrent(usersState[index]);
  return { ...usersState[index] };
};

export const updateUserAddress = async (username, address) => {
  await initAuthStore();
  const normalized = username.trim().toLowerCase();
  const index = usersState.findIndex(
    (item) => item.username.trim().toLowerCase() === normalized
  );
  if (index === -1) return null;
  usersState[index] = {
    ...usersState[index],
    address: {
      cep: address.cep.trim(),
      street: address.street.trim(),
      number: address.number.trim(),
      neighborhood: address.neighborhood.trim(),
      city: address.city.trim(),
      state: address.state.trim().toUpperCase(),
      complement: address.complement?.trim() || undefined,
    },
  };
  await persistUsers();
  try {
    const session = await getCurrentSession();
    if (session?.token && usersState[index].id) {
      await put(`/api/v1/usuarios/${usersState[index].id}`, {
        addressCep: usersState[index].address.cep,
        addressStreet: usersState[index].address.street,
        addressNumber: usersState[index].address.number,
        addressNeighborhood: usersState[index].address.neighborhood,
        addressCity: usersState[index].address.city,
        addressState: usersState[index].address.state,
        addressComplement: usersState[index].address.complement,
      });
    }
  } catch (e) {
    console.warn("Falha ao sincronizar endereço com backend", e);
  }
  await persistUpdatedSessionUserIfCurrent(usersState[index]);
  return { ...usersState[index] };
};

export const toggleBlockMessages = async (username) => {
  await initAuthStore();
  const normalized = username.trim().toLowerCase();
  const index = usersState.findIndex(
    (item) => item.username.trim().toLowerCase() === normalized
  );
  if (index === -1) return null;
  usersState[index] = {
    ...usersState[index],
    blockMessages: !usersState[index].blockMessages,
  };
  await persistUsers();
  return { ...usersState[index] };
};

export const setBlockMessages = async (username, blocked) => {
  await initAuthStore();
  const normalized = username.trim().toLowerCase();
  const index = usersState.findIndex(
    (item) => item.username.trim().toLowerCase() === normalized
  );

  // Atualiza memória local se o usuário estiver no cache
  if (index !== -1) {
    usersState[index] = { ...usersState[index], blockMessages: blocked };
  }

  // Persiste na sessão corrente (current_session) e em current_user
  // IMPORTANTE: refreshUser lê @terra_nova/current_user, então ambas as chaves
  // precisam ser atualizadas para que o estado persista corretamente entre navegações.
  if (currentSession?.user?.username?.trim().toLowerCase() === normalized) {
    const updatedUser = { ...currentSession.user, blockMessages: blocked };
    await persistSession({
      token: currentSession.token,
      user: updatedUser,
    });
    // Também atualiza a chave lida pelo refreshUser do AuthContext
    try {
      await AsyncStorage.setItem(
        AUTH_USER_STORAGE_KEY,
        JSON.stringify(updatedUser)
      );
    } catch (e) {
      console.warn("Falha ao atualizar current_user com blockMessages", e);
    }
  }

  // Sincroniza com o backend
  try {
    const session = await getCurrentSession();
    const userId = index !== -1 ? usersState[index].id : session?.user?.id;
    if (session?.token && userId) {
      await put(`/api/v1/usuarios/${userId}`, { blockMessages: blocked });
    }
  } catch (e) {
    console.warn("Falha ao sincronizar blockMessages com backend", e);
  }

  return index !== -1
    ? { ...usersState[index] }
    : { username, blockMessages: blocked };
};

export const getUserBlockStatus = async (username) => {
  await initAuthStore();
  const normalized = username.trim().toLowerCase();

  // Tenta encontrar no cache local primeiro
  const cached = usersState.find(
    (item) => item.username.trim().toLowerCase() === normalized
  );
  if (cached !== undefined) {
    return cached?.blockMessages ?? false;
  }

  // Fallback: busca no backend (necessário para verificar status de outros usuários)
  try {
    const user = await getUserByUsername(username);
    if (user !== null) {
      return user?.blockMessages ?? false;
    }
  } catch (e) {
    console.warn("Falha ao buscar blockMessages do backend", e);
  }

  return false;
};

export const getDeletedUsers = async () => {
  if (isBackendTemporarilyUnavailable()) return [];
  try {
    const response = await get("/api/v1/usuarios/deletados");
    if (response.data) {
      return response.data.map(mapBackendUserToAppUser);
    }
  } catch (e) {
    console.error("Error fetching deleted users:", e);
  }
  return [];
};

export const recoverUserAccount = async (userId) => {
  if (isBackendTemporarilyUnavailable()) return false;
  try {
    const { http } = require("./api");
    const response = await http(`/api/v1/usuarios/${userId}/recuperar`, {
      method: "PATCH",
    });
    return (
      response.success || (response.status >= 200 && response.status < 300)
    );
  } catch (e) {
    console.error("Erro ao recuperar conta", e);
    return false;
  }
};

export const banUserAccount = async (username) => {
  if (isBackendTemporarilyUnavailable()) return false;
  try {
    const { http } = require("./api");
    const response = await http(
      `/api/v1/usuarios/username/${encodeURIComponent(username)}/banir`,
      { method: "PATCH" }
    );
    return (
      response.success || (response.status >= 200 && response.status < 300)
    );
  } catch (e) {
    console.error("Erro ao banir conta no backend", e);
    return false;
  }
};

export const changeUserPassword = async (currentPassword, newPassword) => {
  if (isBackendTemporarilyUnavailable()) {
    return {
      success: false,
      message:
        "Backend temporariamente indisponível. Tente novamente mais tarde.",
    };
  }

  try {
    const session = await getCurrentSession();
    if (!session || !session.token || !session.user) {
      return {
        success: false,
        message: "Sessão expirada. Faça login novamente.",
      };
    }

    const response = await put(
      `/api/v1/usuarios/${session.user.id}/alterar-senha`,
      {
        senhaAtual: currentPassword,
        novaSenha: newPassword,
      }
    );

    if (response.ok || (response.status >= 200 && response.status < 300)) {
      return {
        success: true,
        message: "Senha alterada com sucesso.",
      };
    } else if (response.status === 401) {
      return {
        success: false,
        message: "Senha atual incorreta.",
      };
    } else {
      return {
        success: false,
        message:
          response.data?.message || "Erro ao alterar senha. Tente novamente.",
      };
    }
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        "Erro ao alterar senha. Tente novamente.",
    };
  }
};
