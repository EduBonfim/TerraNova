import AsyncStorage from "@react-native-async-storage/async-storage";

export type AppUser = {
  username: string;
  password: string;
  role?: "user" | "admin" | "buyer";
  lgpdAcceptedAt?: string;
  lgpdTermsVersion?: string;
  pendingLgpdReacceptance?: boolean;
  fullName?: string;
  // Producer fields
  farmName?: string;
  farmDocument?: string;
  farmDocumentType?: "cpf" | "cnpj";
  // Buyer fields
  cpf?: string;
  email?: string;
  phone?: string;
  bio?: string;
  gender?: "male" | "female" | "other" | "prefer_not";
  address?: {
    cep: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    complement?: string;
  };
  avatarUri?: string;
};

export type AdminUserSummary = {
  username: string;
  role: "user" | "admin" | "buyer";
  fullName?: string;
  farmName?: string;
  farmDocumentMasked: string;
  farmDocumentType?: "cpf" | "cnpj";
  cpf?: string;
};

export type UserPersonalDataExport = {
  username: string;
  role: "user" | "admin" | "buyer";
  fullName?: string;
  farmName?: string;
  farmDocument?: string;
  farmDocumentType?: "cpf" | "cnpj";
  cpf?: string;
  address?: AppUser["address"];
  lgpdAcceptedAt?: string;
  lgpdTermsVersion?: string;
};

const AUTH_USERS_STORAGE_KEY = "@terra_nova/auth_users";
const ADMIN_USERNAME = "Admin";
const ADMIN_PASSWORD = "1234";
export const LGPD_TERMS_VERSION = "2026.04";

const DEFAULT_USERS: AppUser[] = [
  {
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD,
    role: "admin",
    fullName: "Administrador Terra Nova",
    lgpdAcceptedAt: new Date().toISOString(),
    lgpdTermsVersion: LGPD_TERMS_VERSION,
    pendingLgpdReacceptance: true,
  },
  // ─── Conta de teste: Comprador ───────────────────────────────────────────────
  {
    username: "Consumidor",
    password: "1234",
    role: "buyer",
    fullName: "Consumidor Teste",
    email: "consumidor@terranowa.com",
    cpf: "00000000000",
    lgpdAcceptedAt: new Date().toISOString(),
    lgpdTermsVersion: LGPD_TERMS_VERSION,
    pendingLgpdReacceptance: false,
    address: {
      cep: "01310-100",
      street: "Av. Paulista",
      number: "1000",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
    },
  },
  // ─── Contas de teste: Produtores ─────────────────────────────────────────────
  { username: "Duzinhow", password: "1234", role: "user" },
  { username: "Sitio", password: "1234", role: "user", fullName: "Produtor Sitio", farmName: "Sitio Principal" },
  { username: "Sitio1", password: "1234", role: "user", fullName: "Joao do Sitio 1", farmName: "Sitio 1 - Rio Verde" },
  { username: "Sitio2", password: "1234", role: "user", fullName: "Maria do Sitio 2", farmName: "Sitio 2 - Maringa" },
  { username: "Sitio3", password: "1234", role: "user", fullName: "Jose do Sitio 3", farmName: "Sitio 3 - Jatai" },
  { username: "Sitio4", password: "1234", role: "user", fullName: "Ana do Sitio 4", farmName: "Sitio 4 - Uberlandia" },
  { username: "Sitio5", password: "1234", role: "user", fullName: "Carlos do Sitio 5", farmName: "Sitio 5 - Sorriso" },
];

let usersState: AppUser[] = [...DEFAULT_USERS];
let isInitialized = false;

const normalizeDocument = (value: string) => value.replace(/\D/g, "");

export const maskDocument = (value?: string, visibleDigits: number = 4) => {
  const digits = normalizeDocument(value || "");
  if (!digits) return "Nao informado";

  const keep = Math.max(1, Math.min(visibleDigits, digits.length));
  const hidden = "*".repeat(Math.max(0, digits.length - keep));
  return `${hidden}${digits.slice(-keep)}`;
};

const persistUsers = async () => {
  try {
    await AsyncStorage.setItem(AUTH_USERS_STORAGE_KEY, JSON.stringify(usersState));
  } catch {
    // Keep app usable in environments where native storage is unavailable.
  }
};

export const initAuthStore = async () => {
  if (isInitialized) return;

  try {
    const raw = await AsyncStorage.getItem(AUTH_USERS_STORAGE_KEY);
    if (!raw) {
      usersState = [...DEFAULT_USERS];
      await persistUsers();
      isInitialized = true;
      return;
    }

    const parsed = JSON.parse(raw) as AppUser[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Mesclar usuários salvos com os novos DEFAULT_USERS para garantir sincronia
      const existingUsernames = new Set(parsed.map(u => u.username.toLowerCase()));
      const missingDefaults = DEFAULT_USERS.filter(u => !existingUsernames.has(u.username.toLowerCase()));
      
      usersState = [...parsed, ...missingDefaults];
      if (missingDefaults.length > 0) await persistUsers();
    } else {
      usersState = [...DEFAULT_USERS];
      await persistUsers();
    }
  } catch {
    usersState = [...DEFAULT_USERS];
  }

  const adminIndex = usersState.findIndex(
    (item) => item.username.toLowerCase() === ADMIN_USERNAME.toLowerCase(),
  );

  if (adminIndex === -1) {
    usersState = [
      {
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD,
        role: "admin",
        fullName: "Administrador Terra Nova",
        lgpdAcceptedAt: new Date().toISOString(),
        lgpdTermsVersion: LGPD_TERMS_VERSION,
        pendingLgpdReacceptance: true,
      },
      ...usersState,
    ];
    await persistUsers();
  } else {
    const currentAdmin = usersState[adminIndex];
    const requiresPatch =
      currentAdmin.password !== ADMIN_PASSWORD ||
      currentAdmin.role !== "admin" ||
      currentAdmin.username !== ADMIN_USERNAME;

    if (requiresPatch) {
      usersState[adminIndex] = {
        ...currentAdmin,
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD,
        role: "admin",
        lgpdAcceptedAt: currentAdmin.lgpdAcceptedAt || new Date().toISOString(),
        lgpdTermsVersion: LGPD_TERMS_VERSION,
        pendingLgpdReacceptance: currentAdmin.pendingLgpdReacceptance ?? true,
      };
      await persistUsers();
    }
  }

  const needsConsentPatch = usersState.some(
    (item) => !item.lgpdAcceptedAt || item.lgpdTermsVersion !== LGPD_TERMS_VERSION,
  );

  if (needsConsentPatch) {
    const now = new Date().toISOString();
    usersState = usersState.map((item) => ({
      ...item,
      lgpdAcceptedAt: item.lgpdAcceptedAt || now,
      lgpdTermsVersion: LGPD_TERMS_VERSION,
    }));
    await persistUsers();
  }

  isInitialized = true;
};

export const getUsers = (): AppUser[] => usersState.map((item) => ({ ...item }));

export const getUserByUsername = async (username: string): Promise<AppUser | null> => {
  await initAuthStore();
  const normalized = username.trim().toLowerCase();
  const user = usersState.find((item) => item.username.trim().toLowerCase() === normalized);
  return user ? { ...user } : null;
};

export const getAdminUserSummaries = async (): Promise<AdminUserSummary[]> => {
  await initAuthStore();

  return usersState.map((item) => ({
    username: item.username,
    role: item.role || "user",
    fullName: item.fullName,
    farmName: item.farmName,
    farmDocumentMasked: maskDocument(item.farmDocument, 4),
    farmDocumentType: item.farmDocumentType,
    cpf: item.cpf,
  }));
};

/**
 * Detecta o tipo do identificador digitado pelo usuário.
 *
 * Sistemas como Gov.br, iFood e bancos brasileiros usam esta estratégia:
 * detectar o FORMATO do input antes de buscar, para nunca comparar campos
 * de tipos diferentes (evita falsos positivos como "" === "").
 */
type IdentifierType = "email" | "cpf" | "username";

function detectIdentifierType(identifier: string): IdentifierType {
  const trimmed = identifier.trim();

  // E-mail: contém "@" e pelo menos um "." após o @
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "email";

  // CPF: exatamente 11 dígitos após remover formatação
  if (normalizeDocument(trimmed).length === 11) return "cpf";

  // Fallback: username livre
  return "username";
}

export const authenticateUser = (
  usernameOrEmail: string,
  password: string,
): AppUser | null => {
  const identifier = usernameOrEmail.trim();
  const secret = password.trim();
  const type = detectIdentifierType(identifier);

  const match = usersState.find((user) => {
    if (user.password !== secret) return false;

    switch (type) {
      case "email":
        // Compara com e-mail armazenado OU com username que seja e-mail
        return (
          (user.email?.toLowerCase() === identifier.toLowerCase()) ||
          (user.username.toLowerCase() === identifier.toLowerCase())
        );

      case "cpf": {
        // Compara com CPF do comprador OU com documento da propriedade do produtor
        const digits = normalizeDocument(identifier);
        const cpfMatch = user.cpf && normalizeDocument(user.cpf) === digits;
        const farmMatch = user.farmDocument && normalizeDocument(user.farmDocument) === digits;
        return Boolean(cpfMatch || farmMatch);
      }

      case "username":
        // Somente username — sem ambiguidade com documentos
        return user.username === identifier;
    }
  });

  return match ?? null;
};

export const registerUser = async (payload: {
  username: string;
  password: string;
  acceptLgpd: boolean;
  fullName?: string;
  farmName?: string;
  farmDocument?: string;
  address?: {
    cep: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    complement?: string;
  };
  avatarUri?: string;
}): Promise<{ ok: boolean; reason?: "exists" | "invalid" | "document_exists" }> => {
  await initAuthStore();

  const username = payload.username.trim();
  const password = payload.password.trim();

  if (!username || !password || !payload.acceptLgpd) {
    return { ok: false, reason: "invalid" };
  }

  const exists = usersState.some(
    (item) => item.username.toLowerCase() === username.toLowerCase(),
  );

  if (exists) {
    return { ok: false, reason: "exists" };
  }

  const normalizedFarmDocument = normalizeDocument(payload.farmDocument || "");
  const documentType =
    normalizedFarmDocument.length === 11
      ? "cpf"
      : normalizedFarmDocument.length === 14
        ? "cnpj"
        : undefined;

  if (!documentType) {
    return { ok: false, reason: "invalid" };
  }

  const documentExists = usersState.some(
    (item) => normalizeDocument(item.farmDocument || "") === normalizedFarmDocument,
  );

  if (documentExists) {
    return { ok: false, reason: "document_exists" };
  }

  usersState = [
    ...usersState,
    {
      username,
      password,
      role: "user",
      lgpdAcceptedAt: new Date().toISOString(),
      lgpdTermsVersion: LGPD_TERMS_VERSION,
      pendingLgpdReacceptance: false,
      fullName: payload.fullName?.trim() || undefined,
      farmName: payload.farmName?.trim() || undefined,
      farmDocument: normalizedFarmDocument,
      farmDocumentType: documentType,
      avatarUri: payload.avatarUri,
      address: payload.address
        ? {
            cep: payload.address.cep.trim(),
            street: payload.address.street.trim(),
            number: payload.address.number.trim(),
            neighborhood: payload.address.neighborhood.trim(),
            city: payload.address.city.trim(),
            state: payload.address.state.trim().toUpperCase(),
            complement: payload.address.complement?.trim() || undefined,
          }
        : undefined,
    },
  ];

  await persistUsers();

  return { ok: true };
};

// ─── BUYER REGISTRATION ────────────────────────────────────────────────────────

export const registerBuyer = async (payload: {
  username: string;
  password: string;
  fullName?: string;
  email?: string;
  cpf: string;
  acceptLgpd: boolean;
  address?: {
    cep: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    complement?: string;
  };
  avatarUri?: string;
}): Promise<{ ok: boolean; reason?: "exists" | "cpf_exists" | "invalid" }> => {
  await initAuthStore();

  const username = payload.username.trim();
  const password = payload.password.trim();
  const normalizedCpf = normalizeDocument(payload.cpf);

  if (!username || !password || !payload.acceptLgpd || normalizedCpf.length !== 11) {
    return { ok: false, reason: "invalid" };
  }

  const usernameExists = usersState.some(
    (item) => item.username.toLowerCase() === username.toLowerCase(),
  );
  if (usernameExists) {
    return { ok: false, reason: "exists" };
  }

  const cpfExists = usersState.some(
    (item) => normalizeDocument(item.cpf || "") === normalizedCpf ||
              normalizeDocument(item.farmDocument || "") === normalizedCpf,
  );
  if (cpfExists) {
    return { ok: false, reason: "cpf_exists" };
  }

  usersState = [
    ...usersState,
    {
      username,
      password,
      role: "buyer",
      fullName: payload.fullName?.trim() || undefined,
      email: payload.email?.trim() || undefined,
      cpf: normalizedCpf,
      lgpdAcceptedAt: new Date().toISOString(),
      lgpdTermsVersion: LGPD_TERMS_VERSION,
      pendingLgpdReacceptance: false,
      avatarUri: payload.avatarUri,
      address: payload.address
        ? {
            cep: payload.address.cep.trim(),
            street: payload.address.street.trim(),
            number: payload.address.number.trim(),
            neighborhood: payload.address.neighborhood.trim(),
            city: payload.address.city.trim(),
            state: payload.address.state.trim().toUpperCase(),
            complement: payload.address.complement?.trim() || undefined,
          }
        : undefined,
    },
  ];

  await persistUsers();
  return { ok: true };
};

export const exportUserPersonalData = async (
  username: string,
): Promise<UserPersonalDataExport | null> => {
  await initAuthStore();
  const normalized = username.trim().toLowerCase();
  const user = usersState.find((item) => item.username.trim().toLowerCase() === normalized);
  if (!user) return null;

  return {
    username: user.username,
    role: user.role || "user",
    fullName: user.fullName,
    farmName: user.farmName,
    farmDocument: user.farmDocument,
    farmDocumentType: user.farmDocumentType,
    address: user.address,
    lgpdAcceptedAt: user.lgpdAcceptedAt,
    lgpdTermsVersion: user.lgpdTermsVersion,
  };
};

export const deleteUserAccount = async (username: string): Promise<boolean> => {
  await initAuthStore();
  const normalized = username.trim().toLowerCase();

  const before = usersState.length;
  usersState = usersState.filter((item) => item.username.trim().toLowerCase() !== normalized);
  if (usersState.length === before) return false;

  await persistUsers();
  return true;
};

export const acceptLgpdForUser = async (username: string): Promise<AppUser | null> => {
  await initAuthStore();
  const normalized = username.trim().toLowerCase();
  const index = usersState.findIndex((item) => item.username.trim().toLowerCase() === normalized);
  if (index === -1) return null;

  usersState[index] = {
    ...usersState[index],
    lgpdAcceptedAt: new Date().toISOString(),
    lgpdTermsVersion: LGPD_TERMS_VERSION,
    pendingLgpdReacceptance: false,
  };

  await persistUsers();
  return { ...usersState[index] };
};

export const updateUserAvatarUri = async (
  username: string,
  avatarUri: string | null,
): Promise<AppUser | null> => {
  await initAuthStore();
  const normalized = username.trim().toLowerCase();
  const index = usersState.findIndex((item) => item.username.trim().toLowerCase() === normalized);
  if (index === -1) return null;

  usersState[index] = {
    ...usersState[index],
    avatarUri: avatarUri || undefined,
  };

  await persistUsers();
  return { ...usersState[index] };
};

// ─── UPDATE USER ADDRESS ───────────────────────────────────────────────────────

export const updateUserAddress = async (
  username: string,
  address: {
    cep: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    complement?: string;
  },
): Promise<AppUser | null> => {
  await initAuthStore();
  const normalized = username.trim().toLowerCase();
  const index = usersState.findIndex((item) => item.username.trim().toLowerCase() === normalized);
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
  return { ...usersState[index] };
};
