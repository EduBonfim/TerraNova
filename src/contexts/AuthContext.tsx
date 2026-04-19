import { authenticateUser, getUserByUsername, initAuthStore, type AppUser } from "@/services/authStore";
import { clearCart } from "@/services/cartStore";
import { clearProducerCart } from "@/services/producerCartStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const AUTH_STORAGE_KEY = "@terra_nova/current_user";

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<AppUser | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => null,
  logout: async () => {},
  refreshUser: async () => {},
  isLoggedIn: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaurar sessão ao abrir o app
  useEffect(() => {
    const restoreSession = async () => {
      try {
        await initAuthStore();

        const savedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (savedUser) {
          const parsed = JSON.parse(savedUser) as AppUser;
          setUser(parsed);
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<AppUser | null> => {
    const authUser = authenticateUser(username, password);
    if (authUser) {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      setUser(authUser);
      return authUser;
    }
    return null;
  }, []);

  const logout = useCallback(async () => {
    await clearCart();
    await clearProducerCart();
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    // Busca do storage diretamente evita manter o usuário "vivo" se a função for
    // executada assincronamente logo após o logout
    const savedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (!savedUser) return;
    
    const parsed = JSON.parse(savedUser) as AppUser;
    if (!parsed?.username) return;

    const latest = await getUserByUsername(parsed.username);
    if (!latest) return;

    // Apenas salva e atualiza se o usuário não efetuou logout no meio do processo
    const verifyStorage = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (!verifyStorage) return;

    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(latest));
    setUser(latest);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        refreshUser,
        isLoggedIn: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
