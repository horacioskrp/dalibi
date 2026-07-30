import { Head, router, useForm } from '@inertiajs/react';
import {
    TrendingDown, ArrowLeft, AlertCircle, AlertTriangle,
    Banknote, Smartphone, Building2, CalendarDays, Wallet,
} from 'lucide-react';
import { useMoney } from '@/helpers/money';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
type CashType = 'CASH' | 'MOBILE_MONEY' | 'BANK';

interface CashAccount { id: string; name: string; type: CashType; balance: number; }
interface Category { value: string; label: string; emoji: string; }
interface RecentExpense {
    id: string;
    amount: number;
    description: string;
    category: string | null;
    transaction_date: string;
    cash_account?: { id: string; name: string; type: CashType } | null;
}

interface Props {
    cashAccounts: CashAccount[];
    categories:   Category[];
    recent:       RecentExpense[];
}

interface ExpenseFormData {
    description: string;
    category: string;
    amount: string;
    cash_account_id: string;
    transaction_date: string;
}

const todayStr = () => new Date().toISOString().slice(0, 10);

const cashTypeIcon: Record<CashType, React.ReactNode> = {
    CASH:         <Banknote className="w-3.5 h-3.5" />,
    MOBILE_MONEY: <Smartphone className="w-3.5 h-3.5" />,
    BANK:         <Building2 className="w-3.5 h-3.5" />,
};

export default function ExpenseCreate({ cashAccounts, categories, recent }: Readonly<Props>) {
    const fmt = useMoney();

    const { data, setData, post, processing, errors } = useForm<ExpenseFormData>({
        description: '',
        category: '',
        amount: '',
        cash_account_id: cashAccounts[0]?.id ?? '',
        transaction_date: todayStr(),
    });

    const selectedAccount = cashAccounts.find(c => c.id === data.cash_account_id) ?? null;
    const amountNum       = Number(data.amount) || 0;
    const projected       = selectedAccount ? selectedAccount.balance - amountNum : null;
    const willGoNegative  = projected !== null && amountNum > 0 && projected < 0;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('expenses.store'), { preserveScroll: true });
    };

    const sel = "w-full h-10 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-card dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400";

    const categoryLabel = (key: string | null) =>
        categories.find(c => c.value === key)?.label ?? key ?? '—';
    const categoryEmoji = (key: string | null) =>
        categories.find(c => c.value === key)?.emoji ?? '📌';

    return (
        <AppLayout>
            <Head title="Nouvelle dépense" />

            <div className="w-full max-w-5xl mx-auto space-y-6">

                {/* En-tête */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </span>
                            Nouvelle dépense
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            Enregistrer une sortie de caisse (loyer, salaires, fournitures…).
                        </p>
                    </div>
                    <Button variant="outline" className="gap-2" onClick={() => router.get(route('accounting.transactions'))}>
                        <ArrowLeft className="w-4 h-4" />
                        Retour au journal
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── Formulaire ── */}
                    <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 space-y-5">

                        {/* Catégorie */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Catégorie *</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {categories.map(cat => {
                                    const active = data.category === cat.value;
                                    return (
                                        <button
                                            key={cat.value}
                                            type="button"
                                            onClick={() => setData('category', cat.value)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                                                active
                                                    ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 ring-1 ring-orange-400'
                                                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-orange-300'
                                            }`}
                                        >
                                            <span>{cat.emoji}</span>
                                            <span className="truncate">{cat.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.category && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />{errors.category}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description *</label>
                            <Input
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                placeholder="Ex: Facture d'électricité — octobre 2026"
                                className={errors.description ? 'border-red-400' : ''}
                            />
                            {errors.description && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />{errors.description}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Montant */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Montant (F) *</label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={data.amount}
                                    onChange={e => setData('amount', e.target.value)}
                                    placeholder="Ex: 25000"
                                    className={errors.amount ? 'border-red-400' : ''}
                                />
                                {errors.amount && (
                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />{errors.amount}
                                    </p>
                                )}
                            </div>

                            {/* Date */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                    <CalendarDays className="w-3.5 h-3.5" /> Date *
                                </label>
                                <input
                                    type="date"
                                    max={todayStr()}
                                    value={data.transaction_date}
                                    onChange={e => setData('transaction_date', e.target.value)}
                                    className={`${sel} ${errors.transaction_date ? 'border-red-400' : ''}`}
                                />
                                {errors.transaction_date && (
                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />{errors.transaction_date}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Caisse */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                <Wallet className="w-3.5 h-3.5" /> Caisse *
                            </label>
                            <select
                                value={data.cash_account_id}
                                onChange={e => setData('cash_account_id', e.target.value)}
                                className={`${sel} ${errors.cash_account_id ? 'border-red-400' : ''}`}
                            >
                                <option value="">— Sélectionner —</option>
                                {cashAccounts.map(ca => (
                                    <option key={ca.id} value={ca.id}>{ca.name} — solde {fmt(ca.balance)}</option>
                                ))}
                            </select>
                            {errors.cash_account_id && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />{errors.cash_account_id}
                                </p>
                            )}

                            {/* Aperçu du solde après dépense */}
                            {selectedAccount && amountNum > 0 && (
                                <div className={`mt-2 flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                                    willGoNegative
                                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                                }`}>
                                    <span className="flex items-center gap-1.5">
                                        {willGoNegative && <AlertTriangle className="w-4 h-4" />}
                                        Solde après dépense
                                    </span>
                                    <span className="font-bold">{fmt(projected ?? 0)}</span>
                                </div>
                            )}
                            {willGoNegative && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Attention : cette dépense rend le solde de la caisse négatif.
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => router.get(route('accounting.transactions'))} disabled={processing}>
                                Annuler
                            </Button>
                            <Button type="submit" className="flex-1 gap-2 bg-orange-600 hover:bg-orange-700 text-white" disabled={processing}>
                                <TrendingDown className="w-4 h-4" />
                                {processing ? 'Enregistrement...' : 'Enregistrer la dépense'}
                            </Button>
                        </div>
                    </form>

                    {/* ── Colonne latérale ── */}
                    <div className="space-y-4">

                        {/* Soldes des caisses */}
                        <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Soldes des caisses</p>
                            <div className="space-y-2">
                                {cashAccounts.length === 0 && (
                                    <p className="text-sm text-gray-400">Aucune caisse active.</p>
                                )}
                                {cashAccounts.map(ca => (
                                    <div key={ca.id} className="flex items-center justify-between gap-2 text-sm">
                                        <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                                            <span className="text-gray-400">{cashTypeIcon[ca.type]}</span>
                                            {ca.name}
                                        </span>
                                        <span className={`font-bold ${ca.balance < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{fmt(ca.balance)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Dernières dépenses */}
                        <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Dernières dépenses</p>
                            {recent.length === 0 ? (
                                <p className="text-sm text-gray-400">Aucune dépense enregistrée.</p>
                            ) : (
                                <ul className="space-y-2.5">
                                    {recent.map(r => (
                                        <li key={r.id} className="flex items-center justify-between gap-2 text-sm">
                                            <span className="flex items-center gap-1.5 min-w-0 text-gray-600 dark:text-gray-300">
                                                <span className="shrink-0">{categoryEmoji(r.category)}</span>
                                                <span className="truncate" title={`${categoryLabel(r.category)} — ${r.description}`}>{r.description}</span>
                                            </span>
                                            <span className="shrink-0 font-semibold text-red-600 dark:text-red-400">− {fmt(r.amount)}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
