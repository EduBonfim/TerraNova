import { useState } from "react";
import { Alert } from "react-native";

interface UseAsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook para gerenciar estado de requisições
 * Mantém data, loading e error states sincronizados
 * 
 * Uso:
 * const { data, isLoading, error, execute } = useAsync(fetchData)
 * 
 * useEffect(() => {
 *   execute()
 * }, [])
 */
export function useAsync<T = any>(
  asyncFunction: () => Promise<T>,
  onError?: (error: string) => void,
) {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = async () => {
    setState({ data: null, isLoading: true, error: null });

    try {
      const response = await asyncFunction();
      setState({ data: response, isLoading: false, error: null });
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setState({ data: null, isLoading: false, error: errorMessage });

      // Callback opcional para tratar erro
      if (onError) {
        onError(errorMessage);
      } else {
        // Default: mostrar alert
        Alert.alert("Erro", errorMessage);
      }

      return null;
    }
  };

  return {
    ...state,
    execute,
  };
}

/**
 * Hook para requisições que requerem retry
 */
export function useAsyncWithRetry<T = any>(
  asyncFunction: () => Promise<T>,
  maxRetries: number = 3,
) {
  const [state, setState] = useState<UseAsyncState<T> & { retryCount: number }>({
    data: null,
    isLoading: false,
    error: null,
    retryCount: 0,
  });

  const execute = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    for (let i = 0; i <= maxRetries; i++) {
      try {
        const response = await asyncFunction();
        setState({
          data: response,
          isLoading: false,
          error: null,
          retryCount: 0,
        });
        return response;
      } catch (err) {
        if (i === maxRetries) {
          const errorMessage = err instanceof Error ? err.message : "Erro após múltiplas tentativas";
          setState({
            data: null,
            isLoading: false,
            error: errorMessage,
            retryCount: i + 1,
          });
          Alert.alert("Erro", errorMessage);
          return null;
        }
        // Retry
        setState((prev) => ({ ...prev, retryCount: i + 1 }));
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  };

  return {
    ...state,
    execute,
  };
}
