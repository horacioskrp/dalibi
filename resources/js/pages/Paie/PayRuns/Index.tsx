import { Head, router } from '@inertiajs/react';
import { Plus, Receipt, ChevronLeft, ChevronRight, Eye, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/icon-button';
import { Input } from '@/components/ui/input';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useMoney } from '@/helpers/money';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface PayRun {
    id: string;
    reference: string;
    period_month: number;
    period_year: number;
    label: string | null;
    status: string;
    total_net: number;
    payslips_count: number;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
}

interface Props {
    payRuns: Paginated<PayRun>;
    years: number[];
    perPage: number;
    canDelete: boolean;
    filters: { status?: string; period_year?: string; period_month?: string; search?: string };
}

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

const MONTHS = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const STATUS: Record<string, { label: string; cls: string }> = {
    draft:     { label: 'Brouillon', cls: 'bg-gray-100 text-gray-600' },
    validated: { label: 'Validé',    cls: 'bg-blue-100 text-blue-700' },
    paid:      { label: 'Payé',      cls: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Annulé',    cls: 'bg-red-100 text-red-600' },
};

export default function Index({ payRuns, years, perPage, canDelete, filters }: Readonly<Props>) {
    const fmt = useMoney();
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [year, setYear] = useState(filters.period_year ?? '');
    const [month, setMonth] = useState(filters.period_month ?? '');
    const [deleting, setDeleting] = useState<PayRun | null>(null);

    const apply = (over: Record<string, string | undefined> = {}) => {
        router.get(route('pay-runs.index'), {
            search: (over.search !== undefined ? over.search : search) || undefined,
            status: (over.status !== undefined ? over.status : status) || undefined,
            period_year: (over.period_year !== undefined ? over.period_year : year) || undefined,
            period_month: (over.period_month !== undefined ? over.period_month : month) || undefined,
            per_page: String(perPage),
        }, { preserveState: true, replace: true });
    };

    const clear = () => {
        setSearch(''); setStatus(''); setYear(''); setMonth('');
        router.get(route('pay-runs.index'), {}, { preserveState: true, replace: true });
    };

    const goToPage = (page: number) => router.get(route('pay-runs.index'), { ...filters, per_page: String(perPage), page: String(page) }, { preserveState: true, replace: true });
    const changePerPage = (value: number) => router.get(route('pay-runs.index'), { ...filters, per_page: String(value), page: '1' }, { preserveState: true, replace: true });

    const hasFilters = !!(search || status || year || month);
    const selectCls = "px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <AppLayout>
            <Head title="Cycles de paie" />
            <div className="space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <Receipt className="w-7 h-7 text-blue-600" /> Cycles de paie
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">Générez, validez et décaissez la paie mensuelle.</p>
                    </div>
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => router.get(route('pay-runs.create'))}>
                        <Plus className="w-4 h-4" /> Nouveau cycle
                    </Button>
                </div>

                {/* Filtres */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[220px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && apply()}
                                placeholder="Référence, libellé..."
                                className="pl-10 border-gray-300"
                            />
                        </div>

                        <select value={status} onChange={e => setStatus(e.target.value)} className={selectCls}>
                            <option value="">Tous les statuts</option>
                            <option value="draft">Brouillon</option>
                            <option value="validated">Validé</option>
                            <option value="paid">Payé</option>
                            <option value="cancelled">Annulé</option>
                        </select>

                        <select value={year} onChange={e => setYear(e.target.value)} className={selectCls}>
                            <option value="">Toutes les années</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>

                        <select value={month} onChange={e => setMonth(e.target.value)} className={selectCls}>
                            <option value="">Tous les mois</option>
                            {MONTHS.slice(1).map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                        </select>

                        <Button onClick={() => apply()} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                            <Search className="w-4 h-4" /> Rechercher
                        </Button>
                        {hasFilters && (
                            <Button variant="outline" onClick={clear} className="border-gray-300 text-gray-700">Réinit.</Button>
                        )}
                    </div>
                </div>

                {/* Tableau */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 gap-4 flex-wrap">
                        <p className="text-sm text-gray-600"><span className="font-semibold">{payRuns.total}</span> cycle(s){hasFilters && <span className="text-blue-500 ml-2">— filtrés</span>}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Lignes par page :</span>
                            <select value={perPage} onChange={e => changePerPage(Number(e.target.value))} className="h-8 px-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow className="border-b border-gray-200">
                                    <TableHead className="font-semibold text-gray-900">Période</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Référence</TableHead>
                                    <TableHead className="text-center font-semibold text-gray-900">Bulletins</TableHead>
                                    <TableHead className="text-right font-semibold text-gray-900">Total net</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Statut</TableHead>
                                    <TableHead className="text-center font-semibold text-gray-900 w-20">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payRuns.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Receipt className="w-12 h-12 text-gray-300" />
                                                <p className="text-lg">Aucun cycle de paie</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    payRuns.data.map(run => {
                                        const badge = STATUS[run.status] ?? STATUS.draft;
                                        return (
                                            <TableRow key={run.id} className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors cursor-pointer" onClick={() => router.get(route('pay-runs.show', run.id))}>
                                                <TableCell className="font-semibold text-gray-900">
                                                    {MONTHS[run.period_month]} {run.period_year}
                                                    {run.label && <span className="block text-xs font-normal text-gray-400">{run.label}</span>}
                                                </TableCell>
                                                <TableCell className="text-gray-500">{run.reference}</TableCell>
                                                <TableCell className="text-center text-gray-700">{run.payslips_count}</TableCell>
                                                <TableCell className="text-right font-semibold text-gray-900">{fmt(run.total_net)}</TableCell>
                                                <TableCell>
                                                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                                                </TableCell>
                                                <TableCell className="text-center" onClick={e => e.stopPropagation()}>
                                                    <div className="flex items-center justify-center gap-1">
                                                        <IconButton label="Voir le détail" icon={<Eye className="w-4 h-4" />} onClick={() => router.get(route('pay-runs.show', run.id))} />
                                                        {canDelete && (
                                                            <IconButton label="Supprimer le cycle" icon={<Trash2 className="w-4 h-4" />} className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setDeleting(run)} />
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                        {payRuns.total > 0 && <p className="text-xs text-gray-400">{payRuns.from}–{payRuns.to} sur {payRuns.total}</p>}
                        {payRuns.last_page > 1 && (
                            <div className="flex items-center gap-1.5">
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0" disabled={payRuns.current_page === 1} onClick={() => goToPage(payRuns.current_page - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                                <span className="text-xs text-gray-500 px-2">{payRuns.current_page} / {payRuns.last_page}</span>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0" disabled={payRuns.current_page === payRuns.last_page} onClick={() => goToPage(payRuns.current_page + 1)}><ChevronRight className="w-4 h-4" /></Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer ce cycle de paie ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleting ? `« ${MONTHS[deleting.period_month]} ${deleting.period_year} » et ses ${deleting.payslips_count} bulletin(s) seront supprimés définitivement. ` : ''}
                            {deleting?.status === 'paid' ? 'Le cycle étant payé, les caisses seront recréditées et les écritures comptables supprimées.' : 'Cette action est irréversible.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-end gap-2">
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => {
                            if (deleting) router.delete(route('pay-runs.destroy', deleting.id), { preserveScroll: true, onFinish: () => setDeleting(null) });
                        }}>Supprimer</AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
