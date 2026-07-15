import { usePage } from '@inertiajs/react';

interface CurrencySetting {
    code: string;
    symbol: string;
}

/** Symbole de la monnaie de l'établissement, partagé via Inertia (repli « FCFA »). */
export function useCurrencySymbol(): string {
    const settings = (usePage().props as { settings?: { currency?: CurrencySetting } }).settings;
    return settings?.currency?.symbol ?? 'FCFA';
}

/**
 * Retourne un formateur de montant utilisant la monnaie de l'établissement.
 * Ex. `const fmt = useMoney(); fmt(12000) // "12 000 FCFA"`.
 */
export function useMoney(options?: Intl.NumberFormatOptions) {
    const symbol = useCurrencySymbol();

    return (value?: number | null): string =>
        new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0, ...options }).format(
            Number(value ?? 0),
        ) + ' ' + symbol;
}
