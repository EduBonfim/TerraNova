import {
  authenticateUser,
  clearCurrentSession,
  getCurrentSession,
  getUserByUsername,
  initAuthStore,
} from "@/services/authStore";
import { clearCart } from "@/services/cartStore";
import { clearProducerCart } from "@/services/producerCartStore";
import { clearAllListingsCache } from "@/services/listingService";
import {
  initReportsStore,
  isUserBlocked,
  getUserActiveBanDetails,
  formatRemainingTime,
} from "@/services/reportsStore";
import {
  initCommunityStore,
  syncProfileFromUser,
} from "@/services/communityStore";
import { processQueue } from "@/services/uploadQueue";
import { resetResolvedBaseUrl } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const AUTH_STORAGE_KEY = "@terra_nova/current_user";

const AuthContext = createContext({
  user: null,
  isLoading: true,
  login: async () => null,
  logout: async () => {},
  refreshUser: async () => {},
  patchUser: async () => {},
  isLoggedIn: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaurar sessão ao abrir o app
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Limpar cache de URL resolvida para pegar a nova do .env
        resetResolvedBaseUrl();

        await initAuthStore();
        await initReportsStore();
        await initCommunityStore();

        const session = await getCurrentSession();
        if (session?.user) {
          const blocked = await isUserBlocked(session.user.username);
          if (blocked && session.user.role !== "admin") {
            const banDetails = await getUserActiveBanDetails(
              session.user.username
            );
            await logout();

            let msg = `Sua conta foi suspensa por violação das diretrizes.\n\nMotivo: ${
              banDetails?.reason || "Comportamento Inadequado"
            }`;
            if (banDetails?.details) {
              msg += `\nDetalhes: ${banDetails.details}`;
            }
            if (
              banDetails?.type === "bloqueio_temporario" &&
              banDetails.expiresAt
            ) {
              msg += `\n\nTempo restante: ${formatRemainingTime(
                banDetails.expiresAt
              )}`;
            }

            Alert.alert("Sessão Encerrada", msg);
            return;
          }
          await syncProfileFromUser(session.user);
          setUser(session.user);
          // Tentar enviar uploads pendentes agora que a sessão foi restaurada
          processQueue().catch((e) =>
            console.debug("[AuthContext] Erro ao processar fila de upload:", e)
          );
        } else {
          // Limpa chaves antigas por seguranca
          await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (username, password) => {
    // Limpar cache de URL para pegar a nova do .env
    resetResolvedBaseUrl();

    const authUser = await authenticateUser(username, password);
    if (authUser) {
      const blocked = await isUserBlocked(authUser.username);
      if (blocked && authUser.role !== "admin") {
        const banDetails = await getUserActiveBanDetails(authUser.username);
        throw new Error(
          JSON.stringify({
            isBan: true,
            type: banDetails?.type || "bloqueio",
            reason: banDetails?.reason || "Violação dos termos de uso",
            details:
              banDetails?.details || "Sua conta foi suspensa pela moderação.",
            expiresAt: banDetails?.expiresAt || null,
          })
        );
      }

      await syncProfileFromUser(authUser);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      setUser(authUser);
      // Tentar enviar uploads pendentes agora que fez login
      processQueue().catch((e) =>
        console.debug("[AuthContext] Erro ao processar fila de upload:", e)
      );
      return authUser;
    }
    return null;
  }, []);

  const logout = useCallback(async () => {
    await clearCart();
    await clearProducerCart();
    await clearAllListingsCache();
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    await AsyncStorage.removeItem("@terra_nova/current_session");
    await clearCurrentSession();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    // Busca do storage diretamente evita manter o usuário "vivo" se a função for
    // executada assincronamente logo após o logout
    const savedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (!savedUser) return;

    const parsed = JSON.parse(savedUser);
    if (!parsed?.username) return;

    const latest = await getUserByUsername(parsed.username);
    if (!latest) return;

    // Apenas salva e atualiza se o usuário não efetuou logout no meio do processo
    const verifyStorage = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (!verifyStorage) return;

    // Preserva campos locais que o backend pode não retornar.
    // Usa o valor local como fallback APENAS se o backend retornar undefined/null.
    const merged = {
      ...latest,
      blockMessages: latest.blockMessages ?? parsed.blockMessages,
    };

    await syncProfileFromUser(merged);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(merged));
    setUser(merged);
  }, []);

  /**
   * Atualiza campos específicos do usuário localmente, sem chamada ao backend.
   */
  const patchUser = useCallback(async (patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...patch };
      // Persiste de forma síncrona no storage
      AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated)).catch(
        (e) => console.warn("[AuthContext] patchUser: falha ao persistir", e)
      );
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        refreshUser,
        patchUser,
        isLoggedIn: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
