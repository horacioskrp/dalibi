import { Head, router } from '@inertiajs/react';
import { useMoney } from '@/helpers/money';
import {
    ArrowLeftRight, TrendingUp, TrendingDown,
    ChevronLeft, ChevronRight, XCircle,
    Banknote, Smartphone, Building2, ArrowUpRight, ArrowDownRight,
    CalendarDays, SlidersHorizontal, Plus, Trash2, X, AlertCircle,
} from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
type TxType        = 'INCOME' | 'EXPENSE';
type ReferenceType = 'PAYMENT' | 'SCHOLARSHIP' | 'EXPENSE' | 'CANCELLATION';
type CashType      = 'CASH' | 'MOBILE_MONEY' | 'BANK';

interface CashAccount { id: string; name: string; type: CashType; balance: number; }

interface Transaction {
    id: string;
    type: TxType;
    amount: number;
    description: string;
    reference_type: ReferenceType;
    transaction_date: string;
    cash_account?: { id: string; name: string; type: CashType } | null;
    created_by?: { id: string; name: string } | null;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
}

interface Totals { total_income: number; total_expense: number; total_count: number; }

interface Props {
    transactions: Paginated<Transaction>;
    cashAccounts: { id: string; name: string; type: CashType }[];
    cashSummary:  CashAccount[];
    totals:       Totals | null;
    perPage:      number;
    filters:      { type?: string; reference_type?: string; cash_account_id?: string; date_from?: string; date_to?: string; per_page?: string };
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const todayStr      = () => new Date().toISOString().slice(0, 10);
const firstOfMonth  = () => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10); };
const firstOfYear   = () => { const d = new Date(); d.setMonth(0, 1); return d.toISOString().slice(0, 10); };

const txConfig: Record<TxType, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
    INCOME:  { label: 'Entrée', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: <ArrowUpRight className="w-3.5 h-3.5" /> },
    EXPENSE: { label: 'Sortie', bg: 'bg-red-100 dark:bg-red-900/30',    text: 'text-red-700 dark:text-red-400',    icon: <ArrowDownRight className="w-3.5 h-3.5" /> },
};

const refConfig: Record<ReferenceType, { label: string; color: string }> = {
    PAYMENT:      { label: 'Paiement',   color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
    SCHOLARSHIP:  { label: 'Bourse',     color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' },
    EXPENSE:      { label: 'Dépense',    color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' },
    CANCELLATION: { label: 'Annulation', color: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' },
};

const cashTypeIcon: Record<CashType, React.ReactNode> = {
    CASH:         <Banknote className="w-3.5 h-3.5" />,
    MOBILE_MONEY: <Smartphone className="w-3.5 h-3.5" />,
    BANK:         <Building2 className="w-3.5 h-3.5" />,
};

const EXPENSE_CATEGORIES = [
    { label: 'Loyer', emoji: '🏠' },
    { label: 'Électricité', emoji: '⚡' },
    { label: 'Eau', emoji: '💧' },
    { label: 'Fournitures', emoji: '📦' },
    { label: 'Personnel', emoji: '👤' },
    { label: 'Entretien', emoji: '🔧' },
    { label: 'Transport', emoji: '🚗' },
    { label: 'Communication', emoji: '📞' },
    { label: 'Santé', emoji: '💊' },
    { label: 'Alimentation', emoji: '🍽️' },
];

/* ------------------------------------------------------------------ */
/* StatCard                                                             */
/* ------------------------------------------------------------------ */
function StatCard({ title, value, sub, icon: Icon, color }: {
    title: string; value: string; sub?: string;
    icon: React.ElementType; color: 'blue' | 'green' | 'red' | 'gray';
}) {
    const styles = {
        blue:  { bg: 'bg-blue-50 dark:bg-blue-900/20',   text: 'text-blue-600 dark:text-blue-400' },
        green: { bg: 'bg-green-50 dark:bg-green-900/20',  text: 'text-green-600 dark:text-green-400' },
        red:   { bg: 'bg-red-50 dark:bg-red-900/20',      text: 'text-red-600 dark:text-red-400' },
        gray:  { bg: 'bg-gray-100 dark:bg-gray-700',      text: 'text-gray-500 dark:text-gray-400' },
    };
    const { bg, text } = styles[color];
    return (
        <div className={`${bg} rounded-lg p-6 transition-all hover:shadow-md shadow-sm`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                    <p className={`text-3xl font-bold ${text} mt-2`}>{value}</p>
                    {sub && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sub}</p>}
                </div>
                <Icon className={`w-12 h-12 ${text} opacity-20`} />
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Formulaire de dépense                                               */
/* ------------------------------------------------------------------ */
function ExpenseForm({
    cashAccounts,
    onClose,
}: {
    cashAccounts: { id: string; name: string; type: CashType }[];
    onClose: () => void;
}) {
    const [description, setDescription]   = useState('');
    const [amount, setAmount]             = useState('');
    const [cashAccountId, setCashAccountId] = useState(cashAccounts[0]?.id ?? '');
    const [date, setDate]                 = useState(todayStr());
    const [submitting, setSubmitting]     = useState(false);
    const [errors, setErrors]             = useState<Record<string, string>>({});

    const applyCategory = (cat: { label: string; emoji: string }) => {
        setDescription(prev => {
            const base = prev.trim();
            if (!base) return cat.label + ' - ';
            // Replace existing category prefix or prepend
            const alreadyHas = EXPENSE_CATEGORIES.some(c => base.startsWith(c.label));
            if (alreadyHas) return cat.label + base.slice(base.indexOf(' - '));
            return cat.label + ' - ' + base;
        });
    };

    const handleSubmit = () => {
        const errs: Record<string, string> = {};
        if (!description.trim()) errs.description = 'La description est obligatoire.';
        if (!amount || Number(amount) <= 0) errs.amount = 'Le montant doit être supérieur à 0.';
        if (!cashAccountId) errs.cash_account_id = 'Sélectionnez une caisse.';
        if (!date) errs.transaction_date = 'La date est obligatoire.';

        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setErrors({});
        setSubmitting(true);

        router.post(
            route('expenses.store'),
            { description: description.trim(), amount: Number(amount), cash_account_id: cashAccountId, transaction_date: date },
            {
                preserveScroll: true,
                onSuccess: () => { setSubmitting(false); onClose(); },
                onError:   (e) => { setSubmitting(false); setErrors(e as Record<string, string>); },
            },
        );
    };

    const sel = "w-full h-9 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-card dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400";

    return (
        <div className="bg-orange-50/60 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/40 rounded-xl p-5 space-y-4">

            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-300 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Enregistrer une dépense
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Catégories rapides */}
            <div className="space-y-1.5">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Catégorie rapide</p>
                <div className="flex flex-wrap gap-1.5">
                    {EXPENSE_CATEGORIES.map(cat => (
                        <button
                            key={cat.label}
                            type="button"
                            onClick={() => applyCategory(cat)}
                            className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                        >
                            {cat.emoji} {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Champs principaux */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

                {/* Description */}
                <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Description *</label>
                    <Input
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Ex: Électricité - Facture octobre"
                        className={errors.description ? 'border-red-400' : ''}
                    />
                    {errors.description && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />{errors.description}
                        </p>
                    )}
                </div>

                {/* Montant */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Montant (F) *</label>
                    <Input
                        type="number"
                        min={1}
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
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
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Date *</label>
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className={`${sel} ${errors.transaction_date ? 'border-red-400' : ''}`}
                    />
                    {errors.transaction_date && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />{errors.transaction_date}
                        </p>
                    )}
                </div>

                {/* Caisse */}
                <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Caisse *</label>
                    <select
                        value={cashAccountId}
                        onChange={e => setCashAccountId(e.target.value)}
                        className={`${sel} ${errors.cash_account_id ? 'border-red-400' : ''}`}
                    >
                        <option value="">— Sélectionner —</option>
                        {cashAccounts.map(ca => (
                            <option key={ca.id} value={ca.id}>{ca.name}</option>
                        ))}
                    </select>
                    {errors.cash_account_id && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />{errors.cash_account_id}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="sm:col-span-2 flex items-end gap-2">
                    <Button
                        className="bg-orange-600 hover:bg-orange-700 text-white gap-2"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        <TrendingDown className="w-4 h-4" />
                        {submitting ? 'Enregistrement...' : 'Enregistrer la dépense'}
                    </Button>
                    <Button variant="outline" onClick={onClose} disabled={submitting}>
                        Annuler
                    </Button>
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Composant principal                                                  */
/* ------------------------------------------------------------------ */
const PER_PAGE_OPTIONS = [10, 25, 50, 100];

export default function Transactions({ transactions, cashAccounts, cashSummary, totals, perPage, filters }: Readonly<Props>) {
    const fmt = useMoney();

    const [type,          setType]          = useState(filters.type ?? '');
    const [refType,       setRefType]       = useState(filters.reference_type ?? '');
    const [cashAccountId, setCashAccountId] = useState(filters.cash_account_id ?? '');
    const [dateFrom,      setDateFrom]      = useState(filters.date_from ?? '');
    const [dateTo,        setDateTo]        = useState(filters.date_to ?? '');
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [deletingId, setDeletingId]       = useState<string | null>(null);

    const push = (overrides: Record<string, string | undefined> = {}) => {
        const params = {
            type:             (overrides.type            !== undefined ? overrides.type            : type)            || undefined,
            reference_type:   (overrides.refType         !== undefined ? overrides.refType         : refType)         || undefined,
            cash_account_id:  (overrides.cashAccountId   !== undefined ? overrides.cashAccountId   : cashAccountId)   || undefined,
            date_from:        (overrides.dateFrom        !== undefined ? overrides.dateFrom        : dateFrom)        || undefined,
            date_to:          (overrides.dateTo          !== undefined ? overrides.dateTo          : dateTo)          || undefined,
            per_page:         String(perPage),
        };
        router.get(route('accounting.transactions'), params, { preserveState: true, replace: true });
    };

    const changePerPage = (value: number) => {
        router.get(route('accounting.transactions'), {
            ...filters,
            per_page: String(value),
            page:     '1',
        }, { preserveState: true, replace: true });
    };

    const goToPage = (page: number) => {
        router.get(route('accounting.transactions'), {
            ...filters,
            per_page: String(perPage),
            page:     String(page),
        }, { preserveState: true, replace: true });
    };

    const clearAll = () => {
        setType(''); setRefType(''); setCashAccountId(''); setDateFrom(''); setDateTo('');
        router.get(route('accounting.transactions'), {}, { preserveState: true, replace: true });
    };

    const setQuickDate = (from: string, to: string) => {
        setDateFrom(from); setDateTo(to);
        push({ dateFrom: from, dateTo: to });
    };

    const onDeleteExpense = (id: string) => {
        router.delete(route('expenses.destroy', id), {
            preserveScroll: true,
            onSuccess: () => setDeletingId(null),
            onError:   () => setDeletingId(null),
        });
    };

    const activeFilters = [
        type          && { key: 'type',          label: type === 'INCOME' ? 'Entrées' : 'Sorties',                       clear: () => { setType('');          push({ type: '' }); } },
        refType       && { key: 'refType',        label: refConfig[refType as ReferenceType]?.label ?? refType,            clear: () => { setRefType('');       push({ refType: '' }); } },
        cashAccountId && { key: 'cashAccountId',  label: cashAccounts.find(c => c.id === cashAccountId)?.name ?? 'Caisse', clear: () => { setCashAccountId(''); push({ cashAccountId: '' }); } },
        (dateFrom || dateTo) && { key: 'dates', label: [dateFrom, dateTo].filter(Boolean).join(' → '), clear: () => { setDateFrom(''); setDateTo(''); push({ dateFrom: '', dateTo: '' }); } },
    ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

    const balance = (totals?.total_income ?? 0) - (totals?.total_expense ?? 0);

    const sel = "h-9 px-3 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-card dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <AppLayout>
            <Head title="Journal des transactions" />

            <div className="space-y-5">

                {/* ── En-tête ── */}
                <div className="flex flex-col gap-4">

                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <ArrowLeftRight className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                Journal des transactions
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                Historique de tous les mouvements financiers
                            </p>
                        </div>
                        <Button
                            className={`gap-2 transition-colors ${showExpenseForm ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200' : 'bg-orange-600 hover:bg-orange-700 text-white'}`}
                            onClick={() => setShowExpenseForm(v => !v)}
                        >
                            {showExpenseForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {showExpenseForm ? 'Fermer' : 'Nouvelle dépense'}
                        </Button>
                    </div>

                    {/* ── Formulaire dépense (collapsible) ── */}
                    {showExpenseForm && (
                        <ExpenseForm
                            cashAccounts={cashAccounts}
                            onClose={() => setShowExpenseForm(false)}
                        />
                    )}

                    {/* ── Cards stats ── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Total encaissé"
                            value={fmt(totals?.total_income ?? 0)}
                            sub={`${totals?.total_count ?? 0} transaction(s)`}
                            icon={TrendingUp}
                            color="green"
                        />
                        <StatCard
                            title="Total sorties"
                            value={fmt(totals?.total_expense ?? 0)}
                            icon={TrendingDown}
                            color="red"
                        />
                        <StatCard
                            title="Solde net"
                            value={fmt(balance)}
                            sub={balance >= 0 ? 'Positif' : 'Négatif'}
                            icon={ArrowLeftRight}
                            color={balance >= 0 ? 'blue' : 'red'}
                        />
                        <StatCard
                            title="Transactions"
                            value={String(totals?.total_count ?? transactions.total)}
                            sub="au total"
                            icon={ArrowLeftRight}
                            color="gray"
                        />
                    </div>

                    {/* ── Soldes caisses ── */}
                    {cashSummary.length > 0 && (
                        <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-gray-700 px-5 py-4 shadow-sm flex items-center gap-3 flex-wrap">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide shrink-0">Caisses :</p>
                            {cashSummary.map(ca => (
                                <div key={ca.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <span className="text-gray-400">{cashTypeIcon[ca.type]}</span>
                                    <span className="text-sm text-gray-600 dark:text-gray-300">{ca.name}</span>
                                    <span className={`text-sm font-bold ${ca.balance < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{fmt(ca.balance)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Filtres ── */}
                <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                            <SlidersHorizontal className="w-4 h-4 text-blue-500" />
                            Filtres
                        </div>
                        {activeFilters.length > 0 && (
                            <button onClick={clearAll} className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1 transition-colors">
                                <XCircle className="w-3.5 h-3.5" /> Tout effacer
                            </button>
                        )}
                    </div>

                    <div className="p-4 space-y-3">

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Type</label>
                                <select value={type} onChange={e => { setType(e.target.value); push({ type: e.target.value }); }} className={sel}>
                                    <option value="">Tous les types</option>
                                    <option value="INCOME">↑ Entrées</option>
                                    <option value="EXPENSE">↓ Sorties</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Référence</label>
                                <select value={refType} onChange={e => { setRefType(e.target.value); push({ refType: e.target.value }); }} className={sel}>
                                    <option value="">Toutes les références</option>
                                    <option value="PAYMENT">Paiement écolage</option>
                                    <option value="SCHOLARSHIP">Bourse accordée</option>
                                    <option value="CANCELLATION">Annulation</option>
                                    <option value="EXPENSE">Dépense manuelle</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Caisse</label>
                                <select value={cashAccountId} onChange={e => { setCashAccountId(e.target.value); push({ cashAccountId: e.target.value }); }} className={sel}>
                                    <option value="">Toutes les caisses</option>
                                    {cashAccounts.map(ca => (
                                        <option key={ca.id} value={ca.id}>{ca.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <CalendarDays className="w-3 h-3" /> Période
                                </label>
                                <div className="flex items-center gap-1.5">
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={e => setDateFrom(e.target.value)}
                                        onBlur={() => push()}
                                        className={`${sel} flex-1 min-w-0`}
                                    />
                                    <span className="text-gray-400 text-xs shrink-0">→</span>
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={e => setDateTo(e.target.value)}
                                        onBlur={() => push()}
                                        className={`${sel} flex-1 min-w-0`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">Rapide :</span>
                            {[
                                { label: "Aujourd'hui",  from: todayStr(),       to: todayStr() },
                                { label: 'Ce mois',      from: firstOfMonth(),   to: todayStr() },
                                { label: 'Cette année',  from: firstOfYear(),    to: todayStr() },
                            ].map(q => (
                                <button
                                    key={q.label}
                                    onClick={() => setQuickDate(q.from, q.to)}
                                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                                        dateFrom === q.from && dateTo === q.to
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'
                                    }`}
                                >
                                    {q.label}
                                </button>
                            ))}
                        </div>

                        {activeFilters.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-gray-100 dark:border-gray-700">
                                <span className="text-xs text-gray-400 shrink-0">Actifs :</span>
                                {activeFilters.map(f => (
                                    <span key={f.key} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                        {f.label}
                                        <button onClick={f.clear} className="hover:text-red-500 transition-colors ml-0.5">
                                            <XCircle className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Tableau ── */}
                <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">

                    <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4 flex-wrap">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {transactions.total} transaction(s)
                            {activeFilters.length > 0 && <span className="text-xs text-blue-500 ml-2">— filtrées</span>}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Lignes par page :</span>
                            <select
                                value={perPage}
                                onChange={e => changePerPage(Number(e.target.value))}
                                className="h-8 px-2 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-card dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {PER_PAGE_OPTIONS.map(n => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {transactions.data.length === 0 ? (
                        <div className="px-5 py-16 text-center text-gray-400">
                            <ArrowLeftRight className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Aucune transaction trouvée</p>
                            {activeFilters.length > 0 && (
                                <button onClick={clearAll} className="mt-2 text-xs text-blue-500 hover:underline">
                                    Effacer les filtres
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-28">Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Description</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-32">Référence</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-36">Caisse</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-36">Montant</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-28">Date</th>
                                        <th className="px-4 py-3 w-12"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                    {transactions.data.map(tx => {
                                        const tc  = txConfig[tx.type];
                                        const ref = refConfig[tx.reference_type];
                                        const isManualExpense = tx.reference_type === 'EXPENSE';
                                        return (
                                            <tr key={tx.id} className={`hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors ${isManualExpense ? 'bg-orange-50/20 dark:bg-orange-900/5' : ''}`}>
                                                <td className="px-5 py-3">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${tc.bg} ${tc.text}`}>
                                                        {tc.icon}{tc.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-xs">
                                                    <p className="truncate text-sm">{tx.description}</p>
                                                    {tx.created_by && (
                                                        <p className="text-xs text-gray-400 mt-0.5">par {tx.created_by.name}</p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${ref.color}`}>
                                                        {ref.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {tx.cash_account ? (
                                                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                                                            <span className="text-gray-400">{cashTypeIcon[tx.cash_account.type]}</span>
                                                            {tx.cash_account.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className={`font-bold text-sm ${tc.text}`}>
                                                        {tx.type === 'EXPENSE' ? '− ' : '+ '}{fmt(tx.amount)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                    {new Date(tx.transaction_date).toLocaleDateString('fr-FR')}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {isManualExpense && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <button
                                                                    onClick={() => setDeletingId(tx.id)}
                                                                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                                    aria-label="Supprimer cette dépense"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Supprimer cette dépense</TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pied de tableau : pagination */}
                    <div className="px-5 py-3.5 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4 flex-wrap">

                        {transactions.total > 0 && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                {transactions.from}–{transactions.to} sur {transactions.total}
                            </p>
                        )}

                        {transactions.last_page > 1 && (
                            <div className="flex items-center gap-1.5">
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0"
                                    disabled={transactions.current_page === 1}
                                    onClick={() => goToPage(1)} title="Première page">
                                    <ChevronLeft className="w-3.5 h-3.5 -mr-1" />
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0"
                                    disabled={transactions.current_page === 1}
                                    onClick={() => goToPage(transactions.current_page - 1)}>
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                {(() => {
                                    const total  = transactions.last_page;
                                    const cur    = transactions.current_page;
                                    const win    = 5;
                                    const start  = Math.max(1, Math.min(cur - Math.floor(win / 2), total - win + 1));
                                    const end    = Math.min(total, start + win - 1);
                                    return Array.from({ length: end - start + 1 }, (_, i) => start + i).map(p => (
                                        <Button key={p} size="sm"
                                            variant={p === cur ? 'default' : 'outline'}
                                            className={`h-8 w-8 p-0 text-xs ${p === cur ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                                            onClick={() => goToPage(p)}>
                                            {p}
                                        </Button>
                                    ));
                                })()}
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0"
                                    disabled={transactions.current_page === transactions.last_page}
                                    onClick={() => goToPage(transactions.current_page + 1)}>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0"
                                    disabled={transactions.current_page === transactions.last_page}
                                    onClick={() => goToPage(transactions.last_page)} title="Dernière page">
                                    <ChevronRight className="w-3.5 h-3.5 -mr-1" />
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Confirmation suppression */}
            <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette dépense ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Le montant sera recrédité sur la caisse concernée. Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-end gap-2">
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => deletingId && onDeleteExpense(deletingId)}
                        >
                            Supprimer
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
