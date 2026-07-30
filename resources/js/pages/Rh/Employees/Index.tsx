import { Head, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Search, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMoney } from '@/helpers/money';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Employee {
    id: string;
    employee_number: string | null;
    job_title: string;
    department: string | null;
    contract_type: string;
    base_salary: number;
    status: string;
    user?: { id: string; firstname: string; lastname: string; email: string | null } | null;
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
    employees: Paginated<Employee>;
    filters: { status?: string; search?: string };
}

const CONTRACT_LABELS: Record<string, string> = {
    CDI: 'CDI', CDD: 'CDD', VACATAIRE: 'Vacataire', STAGIAIRE: 'Stagiaire',
};

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
    active:     { label: 'Actif',     cls: 'bg-green-100 text-green-700' },
    suspended:  { label: 'Suspendu',  cls: 'bg-amber-100 text-amber-700' },
    terminated: { label: 'Sorti',     cls: 'bg-gray-200 text-gray-600' },
};

export default function Index({ employees, filters }: Readonly<Props>) {
    const fmt = useMoney();
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const push = (over: Record<string, string | undefined> = {}) => {
        router.get(route('employees.index'), {
            search: (over.search !== undefined ? over.search : search) || undefined,
            status: (over.status !== undefined ? over.status : status) || undefined,
        }, { preserveState: true, replace: true });
    };

    const goToPage = (page: number) => {
        router.get(route('employees.index'), { ...filters, page: String(page) }, { preserveState: true, replace: true });
    };

    const sel = "h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <AppLayout>
            <Head title="Employés" />
            <div className="space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <Users className="w-7 h-7 text-blue-600" /> Employés
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">Personnel de l'établissement et données de paie.</p>
                    </div>
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => router.get(route('employees.create'))}>
                        <Plus className="w-4 h-4" /> Nouvel employé
                    </Button>
                </div>

                {/* Filtres */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-56">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && push()} placeholder="Nom, poste, matricule…" className="pl-9" />
                    </div>
                    <select value={status} onChange={e => { setStatus(e.target.value); push({ status: e.target.value }); }} className={sel}>
                        <option value="">Tous les statuts</option>
                        <option value="active">Actifs</option>
                        <option value="suspended">Suspendus</option>
                        <option value="terminated">Sortis</option>
                    </select>
                </div>

                {/* Tableau */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    {employees.data.length === 0 ? (
                        <div className="px-5 py-16 text-center text-gray-400">
                            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Aucun employé</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50">
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Employé</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Poste</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contrat</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Salaire de base</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                                        <th className="px-4 py-3 w-24"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {employees.data.map(emp => {
                                        const badge = STATUS_BADGE[emp.status] ?? STATUS_BADGE.active;
                                        const name = `${emp.user?.firstname ?? ''} ${emp.user?.lastname ?? ''}`.trim() || '—';
                                        return (
                                            <tr key={emp.id} className="hover:bg-gray-50/50">
                                                <td className="px-5 py-3">
                                                    <p className="font-medium text-gray-900">{name}</p>
                                                    <p className="text-xs text-gray-400">{emp.employee_number ?? '—'}</p>
                                                </td>
                                                <td className="px-4 py-3 text-gray-700">
                                                    {emp.job_title}
                                                    {emp.department && <span className="block text-xs text-gray-400">{emp.department}</span>}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">{CONTRACT_LABELS[emp.contract_type] ?? emp.contract_type}</td>
                                                <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(emp.base_salary)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button onClick={() => router.get(route('employees.edit', emp.id))} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50" aria-label="Modifier">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => setDeletingId(emp.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50" aria-label="Supprimer">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                        {employees.total > 0 && <p className="text-xs text-gray-400">{employees.from}–{employees.to} sur {employees.total}</p>}
                        {employees.last_page > 1 && (
                            <div className="flex items-center gap-1.5">
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0" disabled={employees.current_page === 1} onClick={() => goToPage(employees.current_page - 1)}>
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <span className="text-xs text-gray-500 px-2">{employees.current_page} / {employees.last_page}</span>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0" disabled={employees.current_page === employees.last_page} onClick={() => goToPage(employees.current_page + 1)}>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cet employé ?</AlertDialogTitle>
                        <AlertDialogDescription>Cette action est irréversible. Un employé ayant des bulletins de paie ne peut pas être supprimé.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-end gap-2">
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => {
                            if (deletingId) router.delete(route('employees.destroy', deletingId), { preserveScroll: true, onFinish: () => setDeletingId(null) });
                        }}>Supprimer</AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
