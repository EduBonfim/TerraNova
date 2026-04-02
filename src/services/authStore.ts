import AsyncStorage from "@react-native-async-storage/async-storage";

export type AppUser = {
  username: string;
  password: string;
  role?: "user" | "admin";
  lgpdAcceptedAt?: string;
  lgpdTermsVersion?: string;
  pendingLgpdReacceptance?: boolean;
  fullName?: string;
  farmName?: string;
  farmDocument?: string;
  farmDocumentType?: "cpf" | "cnpj";
  address?: {
    cep: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    complement?: string;
  };
};

export type AdminUserSummary = {
  username: string;
  role: "user" | "admin";
  fullName?: string;
  farmName?: string;
  farmDocumentMasked: string;
  farmDocumentType?: "cpf" | "cnpj";
};

export type UserPersonalDataExport = {
  username: string;
  role: "user" | "admin";
  fullName?: string;
  farmName?: string;
  farmDocument?: string;
  farmDocumentType?: "cpf" | "cnpj";
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
  { username: "Duzinhow", password: "1234" },
  { username: "Kaki", password: "1234" },
  { username: "Antonio", password: "1234" },
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
      usersState = parsed;
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
  }));
};

export const authenticateUser = (
  usernameOrEmail: string,
  password: string,
): AppUser | null => {
  const identifier = usernameOrEmail.trim().toLowerCase();
  const secret = password.trim();

  const match = usersState.find(
    (user) => user.username.toLowerCase() === identifier && user.password === secret,
  );

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
