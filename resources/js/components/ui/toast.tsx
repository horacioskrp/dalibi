import { CheckCircle2, CircleAlert, X } from 'lucide-react';
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

type ToastVariant = 'success' | 'error';

interface ToastItem {
    id: number;
    title: string;
    description?: string;
    variant: ToastVariant;
}

interface ToastInput {
    title: string;
    description?: string;
    variant?: ToastVariant;
}

interface ToastContextType {
    toast: (input: ToastInput) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((toastItem) => toastItem.id !== id));
    }, []);

    const toast = useCallback((input: ToastInput) => {
        const id = Date.now() + Math.floor(Math.random() * 1000);
        const nextToast: ToastItem = {
            id,
            title: input.title,
            description: input.description,
            variant: input.variant ?? 'success',
        };

        setToasts((prev) => [...prev, nextToast]);

        globalThis.setTimeout(() => removeToast(id), 3500);
    }, [removeToast]);

    const contextValue = useMemo(() => ({ toast }), [toast]);

    return (
        <ToastContext.Provider value={contextValue}>
            {children}

            <div className="pointer-events-none fixed right-4 top-4 z-100 flex w-full max-w-sm flex-col gap-3">
                {toasts.map((toastItem) => {
                    const isSuccess = toastItem.variant === 'success';

                    return (
                        <div
                            key={toastItem.id}
                            className={isSuccess
                                ? 'pointer-events-auto rounded-xl bg-white p-4 shadow-md ring-1 ring-green-100'
                                : 'pointer-events-auto rounded-xl bg-white p-4 shadow-md ring-1 ring-red-100'}
                        >
                            <div className="flex items-start gap-3">
                                <div className={isSuccess ? 'mt-0.5 text-green-600' : 'mt-0.5 text-red-600'}>
                                    {isSuccess ? <CheckCircle2 className="h-5 w-5" /> : <CircleAlert className="h-5 w-5" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900">{toastItem.title}</p>
                                    {toastItem.description && (
                                        <p className="mt-1 text-sm text-gray-600">{toastItem.description}</p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeToast(toastItem.id)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }

    return context;
}
