import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Pencil, Plus, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface School { id: string; name: string; }

interface Config {
    id: string;
    name: string;
    is_active: boolean;
    passing_score: number;
    default_max_score: number;
    term1_weight: number;
    term2_weight: number;
    term3_weight: number;
    round_precision: number;
    school: School;
}

interface Props {
    configs: Config[];
    schools: School[];
    filters: { school_id: string };
}

function weightLabel(t1: number, t2: number, t3: number): string {
    const total = t1 + t2 + t3;
    if (total === 0) return '—';
    const pct = (w: number) => Math.round((w / total) * 100);
    return `T1 ${pct(t1)}% · T2 ${pct(t2)}% · T3 ${pct(t3)}%`;
}

export default function Index({ configs, schools, filters }: Readonly<Props>) {
    const [schoolId, setSchoolId] = useState(filters.school_id || 'all');
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const onSchoolChange = (v: string) => {
        setSchoolId(v);
        router.get(route('grading-configs.index'), { school_id: v === 'all' ? '' : v }, { replace: true });
    };

    const onActivate = (id: string) => {
        router.patch(route('grading-configs.activate', id), {}, { preserveScroll: true });
    };

    const onDelete = (id: string) => {
        router.delete(route('grading-configs.destroy', id), {
            preserveScroll: true,
            onSuccess: () => setDeleteId(null),
        });
    };

    return (
        <AppLayout>
            <Head title="Configurations de calcul des moyennes" />

            <div className="w-full space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Calcul des moyennes</h1>
                        <p className="mt-2 text-lg text-gray-600">
                            Personnalisez la formule de calcul par établissement
                        </p>
                    </div>
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => router.get(route('grading-configs.create'))}>
                        <Plus className="w-4 h-4" /> Nouvelle configuration
                    </Button>
                </div>

                {/* Filter */}
                <div className="rounded-2xl bg-slate-50/70 ring-1 ring-slate-200 shadow-sm p-4 flex gap-3 items-center">
                    <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />
                    <Select value={schoolId} onValueChange={onSchoolChange}>
                        <SelectTrigger className="w-56">
                            <SelectValue placeholder="Tous les établissements" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les établissements</SelectItem>
                            {schools.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {schoolId !== 'all' && (
                        <button onClick={() => onSchoolChange('all')} className="text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead>Nom</TableHead>
                                <TableHead>Établissement</TableHead>
                                <TableHead className="text-center">Seuil</TableHead>
                                <TableHead className="text-center">Note max</TableHead>
                                <TableHead>Poids T1/T2/T3</TableHead>
                                <TableHead className="text-center">Arrondi</TableHead>
                                <TableHead className="text-center">Statut</TableHead>
                                <TableHead className="text-center w-36">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {configs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-16 text-center text-gray-400">
                                        <SlidersHorizontal className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                        Aucune configuration. Créez-en une pour personnaliser le calcul des moyennes.
                                    </TableCell>
                                </TableRow>
                            ) : configs.map(c => (
                                <TableRow key={c.id} className={`transition-colors ${c.is_active ? 'bg-emerald-50/30' : 'hover:bg-gray-50/60'}`}>
                                    <TableCell className="font-semibold text-gray-900">{c.name}</TableCell>
                                    <TableCell className="text-gray-600">{c.school.name}</TableCell>
                                    <TableCell className="text-center font-mono text-gray-700">{c.passing_score}/20</TableCell>
                                    <TableCell className="text-center font-mono text-gray-700">{c.default_max_score}</TableCell>
                                    <TableCell className="text-sm text-gray-500">
                                        {weightLabel(c.term1_weight, c.term2_weight, c.term3_weight)}
                                        <span className="block text-xs text-gray-400 mt-0.5">
                                            ({c.term1_weight} / {c.term2_weight} / {c.term3_weight})
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center text-gray-600">{c.round_precision} déc.</TableCell>
                                    <TableCell className="text-center">
                                        {c.is_active ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                <CheckCircle2 className="w-3 h-3" /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                                Inactive
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-center gap-1.5">
                                            {!c.is_active && (
                                                <Button
                                                    variant="outline" size="sm"
                                                    className="text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                                    onClick={() => onActivate(c.id)}
                                                >
                                                    Activer
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline" size="sm"
                                                onClick={() => router.get(route('grading-configs.edit', c.id))}
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Button>
                                            {!c.is_active && (
                                                <Button
                                                    variant="outline" size="sm"
                                                    className="border-red-200 text-red-500 hover:bg-red-50"
                                                    onClick={() => setDeleteId(c.id)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <p className="text-sm text-gray-400 text-right">{configs.length} configuration(s)</p>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette configuration ?</AlertDialogTitle>
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
