import { Head, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search, Tag, Trash2, X } from 'lucide-react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface EvaluationType {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
}

interface PaginatedEvaluationTypes {
    data: EvaluationType[];
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

interface IndexProps {
    evaluationTypes: PaginatedEvaluationTypes;
    filters: {
        search?: string;
    };
}

export default function Index({ evaluationTypes, filters }: Readonly<IndexProps>) {
    const [search, setSearch] = useState(filters.search || '');
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const onSearch = () => {
        router.get(route('evaluation-types.index'), { search }, { preserveScroll: true, replace: true });
    };

    const clearSearch = () => {
        setSearch('');
        router.get(route('evaluation-types.index'), {}, { preserveScroll: true, replace: true });
    };

    const onDelete = (id: string) => {
        router.delete(route('evaluation-types.destroy', id), {
            preserveScroll: true,
            onSuccess: () => setDeleteId(null),
        });
    };

    return (
        <AppLayout>
            <Head title="Types d'évaluation" />

            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Types d'évaluation</h1>
                        <p className="mt-2 text-lg text-gray-600">Gérez les types d'évaluation</p>
                    </div>
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => router.get(route('evaluation-types.create'))}>
                        <Plus className="w-5 h-5" />
                        Nouveau type
                    </Button>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                                placeholder="Rechercher un type..."
                                className="pl-10 pr-10"
                            />
                            {search && (
                                <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        <Button onClick={onSearch} className="bg-blue-600 hover:bg-blue-700">Rechercher</Button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow className="border-b border-gray-200">
                                <TableHead>Nom</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Créé le</TableHead>
                                <TableHead className="text-center w-28">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {evaluationTypes.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Tag className="w-12 h-12 text-gray-300" />
                                            <p className="text-lg">Aucun type trouvé</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                evaluationTypes.data.map((item) => (
                                    <TableRow key={item.id} className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors">
                                        <TableCell className="font-medium text-gray-900">{item.name}</TableCell>
                                        <TableCell className="text-gray-600">{item.description || '—'}</TableCell>
                                        <TableCell className="text-gray-600">
                                            {new Date(item.created_at).toLocaleDateString('fr-FR')}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-center gap-2">
                                                <Button variant="outline" size="sm" className="border-gray-300" onClick={() => router.get(route('evaluation-types.show', item.id))}>
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button variant="outline" size="sm" className="border-gray-300" onClick={() => router.get(route('evaluation-types.edit', item.id))}>
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => setDeleteId(item.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer ce type ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible.
                        </AlertDialogDescription>
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
