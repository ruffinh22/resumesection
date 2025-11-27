/**
 * Hooks personnalisés pour les requêtes API
 */

import { useState, useCallback } from 'react';
import type { ApiError } from './client';

export interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

export interface UseAsyncActions<T> {
  execute: () => Promise<T | undefined>;
  reset: () => void;
}

/**
 * Hook générique pour les requêtes asynchrones
 */
export const useAsync = <T,>(
  asyncFunction: () => Promise<T>,
  immediate = false
): UseAsyncState<T> & UseAsyncActions<T> => {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (): Promise<T | undefined> => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await asyncFunction();
      setState({ data: response, loading: false, error: null });
      return response;
    } catch (error: any) {
      const apiError: ApiError = {
        msg: error.msg || 'Une erreur est survenue',
        error: error.error,
        errors: error.errors,
        status: error.status || 500,
      };
      setState({ data: null, loading: false, error: apiError });
      return undefined;
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, execute, reset };
};

import { useEffect } from 'react';

/**
 * Hook pour les requêtes GET avec cache
 */
export const useQuery = <T,>(
  key: string,
  queryFn: () => Promise<T>,
  options?: {
    enabled?: boolean;
    cacheTime?: number;
    staleTime?: number;
  }
) => {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    // Vérifier le cache
    const cacheKey = `query_${key}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        const staleTime = options?.staleTime || 60000; // 1 min par défaut
        
        if (Date.now() - timestamp < staleTime) {
          setState({ data, loading: false, error: null });
          return;
        }
      } catch (e) {
        // Cache invalide, continuer
      }
    }

    setState((prev) => ({ ...prev, loading: true }));
    
    try {
      const data = await queryFn();
      const cacheTime = options?.cacheTime || 300000; // 5 min par défaut
      localStorage.setItem(
        cacheKey,
        JSON.stringify({ data, timestamp: Date.now(), expiry: cacheTime })
      );
      setState({ data, loading: false, error: null });
    } catch (error: any) {
      const apiError: ApiError = {
        msg: error.msg || 'Une erreur est survenue',
        error: error.error,
        errors: error.errors,
        status: error.status || 500,
      };
      setState({ data: null, loading: false, error: apiError });
    }
  }, [key, queryFn, options]);

  useEffect(() => {
    if (options?.enabled !== false) {
      execute();
    }
  }, [execute, options?.enabled]);

  const refetch = useCallback(() => {
    localStorage.removeItem(`query_${key}`);
    execute();
  }, [key, execute]);

  return { ...state, refetch };
};

/**
 * Hook pour les mutations (POST, PUT, DELETE)
 */
export const useMutation = <TData, TError = any>(
  mutationFn: (data: TData) => Promise<any>
) => {
  const [state, setState] = useState<UseAsyncState<any>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(
    async (data: TData) => {
      setState({ data: null, loading: true, error: null });
      try {
        const response = await mutationFn(data);
        setState({ data: response, loading: false, error: null });
        return response;
      } catch (error: any) {
        const apiError: ApiError = {
          msg: error.msg || 'Une erreur est survenue',
          error: error.error,
          errors: error.errors,
          status: error.status || 500,
        };
        setState({ data: null, loading: false, error: apiError });
        throw apiError;
      }
    },
    [mutationFn]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    mutate,
    reset,
    isLoading: state.loading,
    isError: state.error !== null,
    isSuccess: state.data !== null && state.error === null,
  };
};
