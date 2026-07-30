import { Head, router } from '@inertiajs/react';
import { Plus, Receipt, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface Props { payRuns: Paginated<PayRun>; }

const MONTHS = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const STATUS: Record<string, { label: string; cls: string }> = {
    draft:     { label: 'Brouillon', cls: 'bg-gray-100 text-gray-600' },
    validated: { label: 'Validé',    cls: 'bg-blue-100 text-blue-700' },
    paid:      { label: 'Payé',      cls: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Annulé',    cls: 'bg-red-100 text-red-600' },
};

export default function Index({ payRuns }: Readonly<Props>) {
    const fmt = useMoney();
    const goToPage = (page: number) => router.get(route('pay-runs.index'), { page: String(page) }, { preserveState: true, replace: true });

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

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    {payRuns.data.length === 0 ? (
                        <div className="px-5 py-16 text-center text-gray-400">
                            <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Aucun cycle de paie</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50">
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Période</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Référence</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Bulletins</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total net</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                                        <th className="px-4 py-3 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {payRuns.data.map(run => {
                                        const badge = STATUS[run.status] ?? STATUS.draft;
                                        return (
                                            <tr key={run.id} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => router.get(route('pay-runs.show', run.id))}>
                                                <td className="px-5 py-3 font-medium text-gray-900">
                                                    {MONTHS[run.period_month]} {run.period_year}
                                                    {run.label && <span className="block text-xs text-gray-400">{run.label}</span>}
                                                </td>
                                                <td className="px-4 py-3 text-gray-500">{run.reference}</td>
                                                <td className="px-4 py-3 text-center text-gray-600">{run.payslips_count}</td>
                                                <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(run.total_net)}</td>
                                                <td className="px-4 py-3"><span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span></td>
                                                <td className="px-4 py-3 text-right">
                                                    <Eye className="w-4 h-4 text-gray-400 inline" />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
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
        </AppLayout>
    );
}
