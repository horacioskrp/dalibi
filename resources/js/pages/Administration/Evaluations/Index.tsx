import { Head, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Evaluation {
    id: string;
    name: string;
    date: string | null;
    coefficient: number;
    status: 'scheduled' | 'completed';
    evaluation_type: { name: string };
    classroom: { name: string; code: string };
    academic_period: { name: string };
}

interface PaginatedEvaluations {
    data: Evaluation[];
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

interface IndexProps {
    evaluations: PaginatedEvaluations;
    filters: {
        search?: string;
        status?: string;
    };
}

export default function Index({ evaluations, filters }: Readonly<IndexProps>) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const onSearch = () => {
        router.get(route('evaluations.index'), {
            search,
            status: status === 'all' ? '' : status,
        }, { preserveScroll: true, replace: true });
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('all');
        router.get(route('evaluations.index'), {}, { preserveScroll: true, replace: true });
    };

    const onDelete = (id: string) => {
        router.delete(route('evaluations.destroy', id), {
            preserveScroll: true,
            onSuccess: () => setDeleteId(null),
        });
    };

    const statusLabel = (value: string) => value === 'completed' ? 'Terminée' : 'Planifiée';

    return (
        <AppLayout>
            <Head title="Évaluations" />

            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Évaluations</h1>
                        <p className="mt-2 text-lg text-gray-600">Gérez les évaluations par classe et période</p>
                    </div>
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => router.get(route('evaluations.create'))}>
                        <Plus className="w-5 h-5" />
                        Nouvelles évaluations
                    </Button>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="relative md:col-span-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                                placeholder="Rechercher par nom, classe, type..."
                                className="pl-10 pr-10"
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les statuts</SelectItem>
                                <SelectItem value="scheduled">Planifiée</SelectItem>
                                <SelectItem value="completed">Terminée</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={onSearch} className="bg-blue-600 hover:bg-blue-700">Filtrer</Button>
                        <Button variant="outline" onClick={clearFilters}>Réinitialiser</Button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow className="border-b border-gray-200">
                                <TableHead>Évaluation</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Classe / Période</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Coef.</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-center w-28">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {evaluations.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-12 text-center text-gray-500">
                                        Aucune évaluation trouvée.
                                    </TableCell>
                                </TableRow>
                            ) : evaluations.data.map((item) => (
                                <TableRow key={item.id} className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors">
                                    <TableCell className="font-medium text-gray-900">{item.name}</TableCell>
                                    <TableCell>{item.evaluation_type?.name || '—'}</TableCell>
                                    <TableCell className="text-gray-600">
                                        <div>{item.classroom?.name || '—'} ({item.classroom?.code || '—'})</div>
                                        <div className="text-xs text-gray-500">{item.academic_period?.name || '—'}</div>
                                    </TableCell>
                                    <TableCell>{item.date ? new Date(item.date).toLocaleDateString('fr-FR') : '—'}</TableCell>
                                    <TableCell>{Number(item.coefficient).toFixed(2)}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            item.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {statusLabel(item.status)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-center gap-2">
                                            <Button variant="outline" size="sm" className="border-gray-300" onClick={() => router.get(route('evaluations.show', item.id))}>
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="outline" size="sm" className="border-gray-300" onClick={() => router.get(route('evaluations.edit', item.id))}>
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => setDeleteId(item.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette évaluation ?</AlertDialogTitle>
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
