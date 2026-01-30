import { useState, useCallback, useRef } from 'react';

interface UseOptimisticOptions {
  onError?: (error: Error) => void;
}

type ApplyOptimistic<T> = (newValue: T, operation: () => Promise<void>) => void;

export function useOptimistic<T>(
  currentValue: T,
  options?: UseOptimisticOptions
): [T, ApplyOptimistic<T>] {
  const [optimisticOverride, setOptimisticOverride] = useState<T | null>(null);
  const rollbackValueRef = useRef<T>(currentValue);
  const pendingOperationRef = useRef<number>(0);

  const applyOptimistic = useCallback<ApplyOptimistic<T>>(
    (newValue, operation) => {
      const operationId = ++pendingOperationRef.current;
      rollbackValueRef.current = currentValue;

      setOptimisticOverride(newValue);

      operation()
        .then(() => {
          if (operationId === pendingOperationRef.current) {
            pendingOperationRef.current = 0;
            setOptimisticOverride(null);
          }
        })
        .catch((error: Error) => {
          if (operationId === pendingOperationRef.current) {
            setOptimisticOverride(rollbackValueRef.current);
            pendingOperationRef.current = 0;
            // Clear override after rollback is applied
            setTimeout(() => setOptimisticOverride(null), 0);
            options?.onError?.(error);
          }
        });
    },
    [currentValue, options]
  );

  // Return optimistic override if active, otherwise the current value
  const value = optimisticOverride !== null ? optimisticOverride : currentValue;

  return [value, applyOptimistic];
}
