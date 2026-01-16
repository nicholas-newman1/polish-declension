import { useState, useCallback, useRef, useEffect } from 'react';

interface UseOptimisticOptions {
  onError?: (error: Error) => void;
}

type ApplyOptimistic<T> = (newValue: T, operation: () => Promise<void>) => void;

export function useOptimistic<T>(
  currentValue: T,
  options?: UseOptimisticOptions
): [T, ApplyOptimistic<T>] {
  const [optimisticValue, setOptimisticValue] = useState<T>(currentValue);
  const previousValueRef = useRef<T>(currentValue);
  const pendingOperationRef = useRef<number>(0);

  useEffect(() => {
    if (pendingOperationRef.current === 0) {
      setOptimisticValue(currentValue);
    }
    previousValueRef.current = currentValue;
  }, [currentValue]);

  const applyOptimistic = useCallback<ApplyOptimistic<T>>(
    (newValue, operation) => {
      const operationId = ++pendingOperationRef.current;
      const rollbackValue = previousValueRef.current;

      setOptimisticValue(newValue);
      previousValueRef.current = newValue;

      operation()
        .then(() => {
          if (operationId === pendingOperationRef.current) {
            pendingOperationRef.current = 0;
          }
        })
        .catch((error: Error) => {
          if (operationId === pendingOperationRef.current) {
            setOptimisticValue(rollbackValue);
            previousValueRef.current = rollbackValue;
            pendingOperationRef.current = 0;
            options?.onError?.(error);
          }
        });
    },
    [options]
  );

  return [optimisticValue, applyOptimistic];
}
