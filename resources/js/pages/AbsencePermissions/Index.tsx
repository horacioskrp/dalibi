import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Clock, Plus, Search, Trash2, X, XCircle } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Student { id: string; firstname: string; lastname: string; matricule: string; }
interface User    { id: string; name: string; }

interface Permission {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    start_date: string;
    end_date: string;
    reason: string;
    description: string;
    review_comment: string | null;
    reviewed_at: string | null;
    student: Student;
    requested_by: User | null;
    reviewed_by: User | null;
}

interface Stats { total: number; pending: number; approved: number; rejected: number; }

interface Props {
    permissions: { data: Permission[]; total: number; current_page: number; last_page: number };
    stats:       Stats;
    filters:     { status: string; search: string };
}

const STATUS = {
    pending:  { label: 'En attente', color: 'bg-amber-100 text-amber-700',   icon: Clock },
    approved: { label: 'Approuvée',  color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
    rejected: { label: 'Rejetée',    color: 'bg-red-100 text-red-700',       icon: XCircle },
} as const;

const REASON: Record<string, string> = { medical: 'Médical', familial: 'Familial', autre: 'Autre' };

export default function Index({ permissions, stats, filters }: Readonly<Props>) {
    const [search, setSearch]     = useState(filters.search ?? '');
    const [status, setStatus]     = useState(filters.status ?? 'all');
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const apply = (overrides: Record<string, string> = {}) => {
        const s = overrides.status ?? status;
        router.get(route('absence-permissions.index'), {
            search: overrides.search ?? search,
            status: s === 'all' ? '' : s,
        }, { preserveScroll: true, replace: true });
    };

    const onDelete = (id: string) => {
        router.delete(route('absence-permissions.destroy', id), {
            preserveScroll: true,
            onSuccess: () => setDeleteId(null),
        });
    };

    return (
        <AppLayout>
            <Head title="Demandes de permission" />
            <div className="w-full space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Demandes de permission</h1>
                        <p className="mt-2 text-lg text-gray-600">Gérez les demandes d'absence justifiée</p>
                    </div>
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => router.get(route('absence-permissions.create'))}>
                        <Plus className="w-4 h-4" /> Nouvelle demande
                    </Button>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total',      value: stats.total,    icon: Clock,        color: 'text-gray-600',    bg: 'bg-gray-50 ring-gray-100',       filter: 'all' },
                        { label: 'En attente', value: stats.pending,  icon: Clock,        color: 'text-amber-600',   bg: 'bg-amber-50 ring-amber-100',     filter: 'pending' },
                        { label: 'Approuvées', value: stats.approved, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 ring-emerald-100', filter: 'approved' },
                        { label: 'Rejetées',   value: stats.rejected, icon: XCircle,      color: 'text-red-600',     bg: 'bg-red-50 ring-red-100',         filter: 'rejected' },
                    ].map(card => {
                        const Icon = card.icon;
                        return (
                            <div key={card.label} className={`${card.bg} ring-1 rounded-2xl p-5 shadow-sm`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">{card.label}</p>
                                        <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
                                    </div>
                                    <Icon className={`w-8 h-8 ${card.color} opacity-25`} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Filtres */}
                <div className="rounded-2xl bg-slate-50/70 ring-1 ring-slate-200 shadow-sm p-4 flex flex-wrap gap-3 items-end">
                    <div className="relative flex-1 min-w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && apply()}
                            placeholder="Nom ou matricule de l'élève..."
                            className="pl-9"
                        />
                        {search && (
                            <button onClick={() => { setSearch(''); apply({ search: '' }); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <Select value={status} onValueChange={v => { setStatus(v); apply({ status: v }); }}>
                        <SelectTrigger className="w-44"><SelectValue placeholder="Statut" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les statuts</SelectItem>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="approved">Approuvées</SelectItem>
                            <SelectItem value="rejected">Rejetées</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={() => apply()} className="bg-blue-600 hover:bg-blue-700">Filtrer</Button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead>Élève</TableHead>
                                <TableHead>Motif</TableHead>
                                <TableHead>Période</TableHead>
                                <TableHead>Durée</TableHead>
                                <TableHead>Demandé par</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-center w-28">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {permissions.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-16 text-center text-gray-400">
                                        <Clock className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                        Aucune demande de permission.
                                    </TableCell>
                                </TableRow>
                            ) : permissions.data.map(p => {
                                const cfg = STATUS[p.status];
                                const Icon = cfg.icon;
                                const days = Math.ceil((new Date(p.end_date).getTime() - new Date(p.start_date).getTime()) / 86400000) + 1;
                                return (
                                    <TableRow key={p.id} className="hover:bg-gray-50 transition-colors">
                                        <TableCell>
                                            <div className="font-medium text-gray-900 text-sm">{p.student.lastname} {p.student.firstname}</div>
                                            <div className="text-xs text-gray-400 font-mono">{p.student.matricule}</div>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600">{REASON[p.reason] ?? p.reason}</TableCell>
                                        <TableCell className="text-sm text-gray-600">
                                            {new Date(p.start_date).toLocaleDateString('fr-FR')} → {new Date(p.end_date).toLocaleDateString('fr-FR')}
                                        </TableCell>
                                        <TableCell className="text-sm font-medium text-gray-700">{days} jour{days > 1 ? 's' : ''}</TableCell>
                                        <TableCell className="text-sm text-gray-500">{p.requested_by?.name ?? '—'}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                                                <Icon className="w-3 h-3" />
                                                {cfg.label}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-center gap-1.5">
                                                <Button
                                                    variant="outline" size="sm" className="text-xs gap-1"
                                                    onClick={() => router.get(route('absence-permissions.show', p.id))}
                                                >
                                                    {p.status === 'pending' ? 'Réviser' : 'Voir'}
                                                </Button>
                                                {p.status !== 'approved' && (
                                                    <Button
                                                        variant="outline" size="sm"
                                                        className="border-red-200 text-red-500 hover:bg-red-50"
                                                        onClick={() => setDeleteId(p.id)}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                <p className="text-sm text-gray-400 text-right">{permissions.total} demande(s) au total</p>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette demande ?</AlertDialogTitle>
                        <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-end gap-2">
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteId && onDelete(deleteId)}>
                            Supprimer
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
