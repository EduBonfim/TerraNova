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
  // Privacy settings
  blockMessages?: boolean; // Bloqueia recebimento de mensagens de outros usuários
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
    fullName: "Consumidor Terra Nova",
    email: "Consumidor@terranova.com",
    cpf: "09239945806",
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
  {
    username: "Sitio",
    password: "1234",
    role: "user",
    fullName: "Produtor Sitio",
    farmName: "Sitio Principal",
  },
  {
    username: "Sitio1",
    password: "1234",
    role: "user",
    fullName: "Joao do Sitio 1",
    farmName: "Sitio 1 - Rio Verde",
  },
  {
    username: "Sitio2",
    password: "1234",
    role: "user",
    fullName: "Maria do Sitio 2",
    farmName: "Sitio 2 - Maringa",
  },
  {
    username: "Sitio3",
    password: "1234",
    role: "user",
    fullName: "Jose do Sitio 3",
    farmName: "Sitio 3 - Jatai",
  },
  {
    username: "Sitio4",
    password: "1234",
    role: "user",
    fullName: "Ana do Sitio 4",
    farmName: "Sitio 4 - Uberlandia",
  },
  {
    username: "Sitio5",
    password: "1234",
    role: "user",
    fullName: "Carlos do Sitio 5",
    farmName: "Sitio 5 - Sorriso",
  },
];

let usersState: AppUser[] = [...DEFAULT_USERS];
let isInitialized = false;

const normalizeDocument = (value: string) => value.replace(/\D/g, "");

export const maskDocument = (value?: string, visibleDigits: number = 4) => {
  const digits = normalizeDocument(value || "");
  if (!digits) return "Não informado";

  const keep = Math.max(1, Math.min(visibleDigits, digits.length));
  const hidden = "*".repeat(Math.max(0, digits.length - keep));
  return `${hidden}${digits.slice(-keep)}`;
};

export const maskEmail = (email?: string) => {
  if (!email || !email.includes("@")) return "Não informado";
  const [user, domain] = email.split("@");
  if (user.length <= 2) return `**@${domain}`;
  return `${user.slice(0, 2)}${"*".repeat(user.length - 2)}@${domain}`;
};

export const maskPhone = (phone?: string) => {
  const digits = normalizeDocument(phone || "");
  if (!digits) return "Não informado";
  if (digits.length <= 4) return "****";
  return `(${digits.slice(0, 2)}) *****-${digits.slice(-4)}`;
};

const persistUsers = async () => {
  try {
    await AsyncStorage.setItem(
      AUTH_USERS_STORAGE_KEY,
      JSON.stringify(usersState),
    );
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
      const existingUsernames = new Set(
        parsed.map((u) => u.username.toLowerCase()),
      );
      const missingDefaults = DEFAULT_USERS.filter(
        (u) => !existingUsernames.has(u.username.toLowerCase()),
      );

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
    (item) =>
      !item.lgpdAcceptedAt || item.lgpdTermsVersion !== LGPD_TERMS_VERSION,
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

export const getUsers = (): AppUser[] =>
  usersState.map((item) => ({ ...item }));

export const getUserByUsername = async (
  username: string,
): Promise<AppUser | null> => {
  await initAuthStore();
  const normalized = username.trim().toLowerCase();
  const user = usersState.find(
    (item) => item.username.trim().toLowerCase() === normalized,
  );
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
    cpf: maskDocument(item.cpf, 4),
  }));
};

/**
 * Autentica um usuário procurando por username, e-mail ou documento.
 */

export const authenticateUser = (
  usernameOrEmail: string,
  password: string,
): AppUser | null => {
  const identifier = usernameOrEmail.trim().toLowerCase();
  const secret = password.trim();

  const match = usersState.find((user) => {
    if (user.password !== secret) return false;

    // Tentativa 1: Compatibilidade total com username
    const usernameMatch = user.username.toLowerCase() === identifier;

    // Tentativa 2: Compatibilidade com o campo e-mail (se existir)
    const emailMatch = user.email && user.email.toLowerCase() === identifier;

    // Tentativa 3: Compatibilidade com CPF/Documento (caso o usuário digite o documento)
    const digits = normalizeDocument(usernameOrEmail);
    const docMatch =
      (user.cpf && normalizeDocument(user.cpf) === digits) ||
      (user.farmDocument && normalizeDocument(user.farmDocument) === digits);

    return usernameMatch || emailMatch || docMatch;
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
}): Promise<{
  ok: boolean;
  reason?: "exists" | "invalid" | "document_exists";
}> => {
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
    (item) =>
      normalizeDocument(item.farmDocument || "") === normalizedFarmDocument,
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

  if (
    !username ||
    !password ||
    !payload.acceptLgpd ||
    normalizedCpf.length !== 11
  ) {
    return { ok: false, reason: "invalid" };
  }

  const usernameExists = usersState.some(
    (item) => item.username.toLowerCase() === username.toLowerCase(),
  );
  if (usernameExists) {
    return { ok: false, reason: "exists" };
  }

  const cpfExists = usersState.some(
    (item) =>
      normalizeDocument(item.cpf || "") === normalizedCpf ||
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
  const user = usersState.find(
    (item) => item.username.trim().toLowerCase() === normalized,
  );
  if (!user) return null;

  return {
    username: user.username,
    role: user.role || "user",
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

export const deleteUserAccount = async (username: string): Promise<boolean> => {
  await initAuthStore();
  const normalized = username.trim().toLowerCase();

  const before = usersState.length;
  usersState = usersState.filter(
    (item) => item.username.trim().toLowerCase() !== normalized,
  );
  if (usersState.length === before) return false;

  await persistUsers();
  return true;
};

export const acceptLgpdForUser = async (
  username: string,
): Promise<AppUser | null> => {
  await initAuthStore();
  const normalized = username.trim().toLowerCase();
  const index = usersState.findIndex(
    (item) => item.username.trim().toLowerCase() === normalized,
  );
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
  const index = usersState.findIndex(
    (item) => item.username.trim().toLowerCase() === normalized,
  );
  if (index === -1) return null;

  usersState[index] = {
    ...usersState[index],
    avatarUri: avatarUri || undefined,
  };

  await persistUsers();
  return { ...usersState[index] };
};

// ─── UPDATE USER BUYER PROFILE ────────────────────────────────────────────────

export const updateUserBuyerProfile = async (
  username: string,
  payload: {
    fullName?: string;
    phone?: string;
    gender?: "male" | "female" | "other" | "prefer_not";
  },
): Promise<AppUser | null> => {
  await initAuthStore();
  const normalized = username.trim().toLowerCase();
  const index = usersState.findIndex(
    (item) => item.username.trim().toLowerCase() === normalized,
  );
  if (index === -1) return null;

  usersState[index] = {
    ...usersState[index],
    fullName: payload.fullName ?? usersState[index].fullName,
    phone: payload.phone ?? usersState[index].phone,
    gender: (payload.gender as any) ?? usersState[index].gender,
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
  const index = usersState.findIndex(
    (item) => item.username.trim().toLowerCase() === normalized,
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
  return { ...usersState[index] };
};

// ─── PRIVACY SETTINGS (BLOCK MESSAGES) ─────────────────────────────────────────

export const toggleBlockMessages = async (
  username: string,
): Promise<AppUser | null> => {
  await initAuthStore();
  const normalized = username.trim().toLowerCase();
  const index = usersState.findIndex(
    (item) => item.username.trim().toLowerCase() === normalized,
  );
  if (index === -1) return null;

  usersState[index] = {
    ...usersState[index],
    blockMessages: !usersState[index].blockMessages,
  };

  await persistUsers();
  return { ...usersState[index] };
};

export const setBlockMessages = async (
  username: string,
  blocked: boolean,
): Promise<AppUser | null> => {
  await initAuthStore();
  const normalized = username.trim().toLowerCase();
  const index = usersState.findIndex(
    (item) => item.username.trim().toLowerCase() === normalized,
  );
  if (index === -1) return null;

  usersState[index] = {
    ...usersState[index],
    blockMessages: blocked,
  };

  await persistUsers();
  return { ...usersState[index] };
};

export const getUserBlockStatus = async (
  username: string,
): Promise<boolean> => {
  await initAuthStore();
  const normalized = username.trim().toLowerCase();
  const user = usersState.find(
    (item) => item.username.trim().toLowerCase() === normalized,
  );
  return user?.blockMessages ?? false;
};
