import { useRef, useCallback } from 'react';

export function useLatestAsync() {
    const sequenceRef = useRef(0);
    const currentKeyRef = useRef<string | number | null>(null);

    const runLatest = useCallback(
        async <T>(
            key: string | number,
            asyncFn: () => Promise<T>,
            options?: {
                onSuccess?: (result: T) => void;
                onError?: (error: unknown) => void;
                onFinally?: () => void;
            }
        ) => {
            sequenceRef.current += 1;
            const currentSequence = sequenceRef.current;
            currentKeyRef.current = key;

            const isLatest = () => currentSequence === sequenceRef.current && currentKeyRef.current === key;

            try {
                const result = await asyncFn();
                if (isLatest()) {
                    options?.onSuccess?.(result);
                }
            } catch (error) {
                if (isLatest()) {
                    options?.onError?.(error);
                }
            } finally {
                if (isLatest()) {
                    options?.onFinally?.();
                }
            }
        },
        []
    );

    const isLatest = useCallback((key: string | number) => {
        return currentKeyRef.current === key;
    }, []);

    return { runLatest, isLatest };
}
