import { useRef, useEffect, DependencyList, EffectCallback } from 'react';

/**
 * Como useEffect, pero se salta el primer render.
 * Versión personalizada de useUpdateEffect de la biblioteca react-use
 * que no depende de APIs del navegador.
 */
export function useUpdateEffect(effect: EffectCallback, deps?: DependencyList) {
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    return effect();
  }, deps);
}