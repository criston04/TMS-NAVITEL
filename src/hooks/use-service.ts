/**
 * @fileoverview Hook genérico para consumir servicios
 * 
 * Principio DRY: Manejo de estados async centralizado.
 * Principio SRP: Solo maneja el ciclo de vida de operaciones async.
 * 
 * @module hooks/use-service
 * 
 * @example
 * const { data, loading, error, execute } = useService(
 *   () => customersService.getAll()
 * );
 */

"use client";

import { useState, useCallback, useEffect, useRef } from "react";

/**
 * Estado de la operación async
 */
export interface ServiceState<T> {
  /** Datos retornados por el servicio */
  data: T | null;
  /** Indica si está cargando */
  loading: boolean;
  /** Error si ocurrió alguno */
  error: Error | null;
  /** Indica si la operación fue exitosa */
  isSuccess: boolean;
}

/**
 * Opciones de configuración del hook
 */
export interface UseServiceOptions {
  /** Ejecutar automáticamente al montar */
  immediate?: boolean;
  /** Callback cuando la operación es exitosa */
  onSuccess?: <T>(data: T) => void;
  /** Callback cuando ocurre un error */
  onError?: (error: Error) => void;
}

/**
 * Retorno del hook useService
 */
export interface UseServiceReturn<T> extends ServiceState<T> {
  /** Ejecuta la operación */
  execute: () => Promise<T | null>;
  /** Resetea el estado */
  reset: () => void;
  /** Actualiza los datos manualmente */
  setData: (data: T | null) => void;
}

/**
 * Hook genérico para consumir servicios
 * 
 * @param serviceFn - Función que retorna una promesa
 * @param options - Opciones de configuración
 * @returns Estado y métodos para controlar la operación
 * 
 * @example
 * // Carga inmediata
 * const { data: customers, loading } = useService(
 *   () => customersService.getAll(),
 *   { immediate: true }
 * );
 * 
 * @example
 * // Carga manual
 * const { execute, loading } = useService(
 *   () => customersService.create(formData)
 * );
 * // Luego: await execute();
 */
export function useService<T>(
  serviceFn: () => Promise<T>,
  options: UseServiceOptions = {}
): UseServiceReturn<T> {
  const { immediate = false, onSuccess, onError } = options;
  
  const [state, setState] = useState<ServiceState<T>>({
    data: null,
    loading: immediate,
    error: null,
    isSuccess: false,
  });

  // Ref para evitar actualizaciones en componentes desmontados
  const mountedRef = useRef(true);
  // Ref para almacenar la última versión de serviceFn
  const serviceFnRef = useRef(serviceFn);
  
  // Actualizar ref en effect para cumplir reglas de React
  useEffect(() => {
    serviceFnRef.current = serviceFn;
  });

  /**
   * Ejecuta la operación del servicio
   */
  const execute = useCallback(async (): Promise<T | null> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const result = await serviceFnRef.current();
      
      if (mountedRef.current) {
        setState({
          data: result,
          loading: false,
          error: null,
          isSuccess: true,
        });
        onSuccess?.(result);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      
      if (mountedRef.current) {
        setState({
          data: null,
          loading: false,
          error,
          isSuccess: false,
        });
        onError?.(error);
      }
      
      return null;
    }
  }, [onSuccess, onError]);

  /**
   * Resetea el estado al inicial
   */
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      isSuccess: false,
    });
  }, []);

  /**
   * Actualiza los datos manualmente
   */
  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  // Ejecutar automáticamente si immediate es true
  // Usamos un flag para evitar múltiples ejecuciones
  const hasRun = useRef(false);
  useEffect(() => {
    if (immediate && !hasRun.current) {
      hasRun.current = true;
      // Usar setTimeout para evitar setState durante render
      const timeoutId = setTimeout(() => {
        execute();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [immediate, execute]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
  };
}

/**
 * Hook para operaciones de listado con paginación
 * 
 * @example
 * const { data, loading, page, setPage, totalPages } = useServiceList(
 *   (params) => customersService.getAll(params),
 *   { immediate: true, initialPageSize: 10 }
 * );
 */
export interface UseServiceListOptions extends UseServiceOptions {
  initialPage?: number;
  initialPageSize?: number;
}

export interface UseServiceListReturn<T> extends UseServiceReturn<T[]> {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  refresh: () => Promise<T[] | null>;
}

/**
 * Hook especializado para listas paginadas
 */
export function useServiceList<T>(
  serviceFn: (params: { page: number; pageSize: number }) => Promise<{
    data: T[];
    pagination: { total: number; totalPages: number };
  }>,
  options: UseServiceListOptions = {}
): UseServiceListReturn<T> {
  const { initialPage = 1, initialPageSize = 10, ...serviceOptions } = options;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const fetchData = useCallback(async () => {
    const result = await serviceFn({ page, pageSize });
    setTotalPages(result.pagination.totalPages);
    setTotalItems(result.pagination.total);
    return result.data;
  }, [serviceFn, page, pageSize]);

  const { data, loading, error, isSuccess, execute, reset, setData } = useService(
    fetchData,
    serviceOptions
  );

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage((p) => p + 1);
    }
  }, [page, totalPages]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage((p) => p - 1);
    }
  }, [page]);

  // Re-fetch cuando cambia la página
  useEffect(() => {
    if (serviceOptions.immediate !== false) {
      execute();
    }
  }, [page, pageSize, execute, serviceOptions.immediate]);

  return {
    data: data || [],
    loading,
    error,
    isSuccess,
    execute,
    reset,
    setData,
    page,
    pageSize,
    totalPages,
    totalItems,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    refresh: execute,
  };
}

/**
 * Hook para operaciones de mutación (create, update, delete)
 * 
 * @example
 * const { mutate, loading } = useMutation(
 *   (data) => customersService.create(data)
 * );
 * // Luego: await mutate(formData);
 */
export interface UseMutationReturn<TData, TResult> {
  mutate: (data: TData) => Promise<TResult | null>;
  loading: boolean;
  error: Error | null;
  isSuccess: boolean;
  reset: () => void;
}

export function useMutation<TData, TResult>(
  mutationFn: (data: TData) => Promise<TResult>,
  options: Omit<UseServiceOptions, "immediate"> = {}
): UseMutationReturn<TData, TResult> {
  const { onSuccess, onError } = options;
  
  const [state, setState] = useState({
    loading: false,
    error: null as Error | null,
    isSuccess: false,
  });

  const mountedRef = useRef(true);

  const mutate = useCallback(
    async (data: TData): Promise<TResult | null> => {
      setState({ loading: true, error: null, isSuccess: false });

      try {
        const result = await mutationFn(data);
        
        if (mountedRef.current) {
          setState({ loading: false, error: null, isSuccess: true });
          onSuccess?.(result);
        }
        
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        
        if (mountedRef.current) {
          setState({ loading: false, error, isSuccess: false });
          onError?.(error);
        }
        
        return null;
      }
    },
    [mutationFn, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setState({ loading: false, error: null, isSuccess: false });
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    mutate,
    ...state,
    reset,
  };
}
