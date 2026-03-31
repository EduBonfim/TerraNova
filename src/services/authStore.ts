import AsyncStorage from "@react-native-async-storage/async-storage";

export type AppUser = {
  username: string;
  password: string;
  fullName?: string;
  farmName?: string;
};

const AUTH_USERS_STORAGE_KEY = "@terra_nova/auth_users";

const DEFAULT_USERS: AppUser[] = [
  { username: "Duzinhow", password: "1234" },
  { username: "Kaki", password: "1234" },
  { username: "Antonio", password: "1234" },
];

let usersState: AppUser[] = [...DEFAULT_USERS];
let isInitialized = false;

const persistUsers = async () => {
  await AsyncStorage.setItem(AUTH_USERS_STORAGE_KEY, JSON.stringify(usersState));
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

  isInitialized = true;
};

export const getUsers = (): AppUser[] => usersState.map((item) => ({ ...item }));

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
  fullName?: string;
  farmName?: string;
}): Promise<{ ok: boolean; reason?: "exists" | "invalid" }> => {
  await initAuthStore();

  const username = payload.username.trim();
  const password = payload.password.trim();

  if (!username || !password) {
    return { ok: false, reason: "invalid" };
  }

  const exists = usersState.some(
    (item) => item.username.toLowerCase() === username.toLowerCase(),
  );

  if (exists) {
    return { ok: false, reason: "exists" };
  }

  usersState = [
    ...usersState,
    {
      username,
      password,
      fullName: payload.fullName?.trim() || undefined,
      farmName: payload.farmName?.trim() || undefined,
    },
  ];

  await persistUsers();

  return { ok: true };
};
