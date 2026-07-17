import { Head, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Search, GraduationCap, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';
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
import { IconButton } from '@/components/icon-button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Level {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
}

interface PaginatedLevels {
    data: Level[];
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

interface IndexProps {
    levels: PaginatedLevels;
    filters: {
        search?: string;
    };
}

export default function Index({ levels, filters }: Readonly<IndexProps>) {
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const handleDelete = (levelId: string) => {
        setIsDeleting(true);
        router.delete(route('levels.destroy', levelId), {
            onSuccess: () => {
                setDeleteConfirm(null);
                setIsDeleting(false);
            },
            onError: () => {
                setIsDeleting(false);
            },
        });
    };

    const handleSearch = () => {
        router.get(route('levels.index'), { search: searchQuery }, {
            preserveScroll: true,
            replace: true,
        });
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        router.get(route('levels.index'), {}, {
            preserveScroll: true,
            replace: true,
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    return (
        <AppLayout>
            <Head title="Niveaux" />

            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 flex items-center gap-3"><GraduationCap className="h-7 w-7 text-blue-600 shrink-0" />Niveaux</h1>
                        <p className="mt-2 text-lg text-gray-600">Gérez les niveaux d'enseignement</p>
                    </div>
                    <Button
                        onClick={() => router.get(route('levels.create'))}
                        className="gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="w-5 h-5" />
                        Nouveau niveau
                    </Button>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex gap-3 items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Rechercher un niveau..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch();
                                    }
                                }}
                                className="pl-10 pr-10"
                            />
                            {searchQuery && (
                                <button
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                            Rechercher
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow className="border-b border-gray-200">
                                    <TableHead className="font-semibold text-gray-900">Niveau</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Description</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Créé le</TableHead>
                                    <TableHead className="text-center font-semibold text-gray-900 w-24">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {levels.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-12 text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <GraduationCap className="w-12 h-12 text-gray-300" />
                                                <p className="text-lg">Aucun niveau trouvé</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    levels.data.map((level) => (
                                        <TableRow key={level.id} className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors">
                                            <TableCell className="font-semibold text-gray-900">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                                        <GraduationCap className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <span className="capitalize">{level.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-600 max-w-lg truncate">
                                                {level.description || <span className="text-gray-400">-</span>}
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                {formatDate(level.created_at)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex gap-2 justify-center">
                                                    <IconButton
                                                        label="Voir"
                                                        icon={<Eye className="w-4 h-4" />}
                                                        className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                                        onClick={() => router.get(route('levels.show', level.id))}
                                                    />
                                                    <IconButton
                                                        label="Modifier"
                                                        icon={<Pencil className="w-4 h-4" />}
                                                        className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                                        onClick={() => router.get(route('levels.edit', level.id))}
                                                    />
                                                    <IconButton
                                                        label="Supprimer"
                                                        icon={<Trash2 className="w-4 h-4" />}
                                                        className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        onClick={() => setDeleteConfirm(level.id)}
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {levels.last_page > 1 && (
                    <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                        <div className="text-sm text-gray-600">
                            Affichage de {levels.from} à {levels.to} sur {levels.total} résultats
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    router.get(route('levels.index'), {
                                        ...filters,
                                        page: levels.current_page - 1,
                                    });
                                }}
                                disabled={levels.current_page === 1}
                                className="gap-1"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Précédent
                            </Button>

                            <div className="flex gap-1">
                                {Array.from({ length: Math.min(5, levels.last_page) }, (_, i) => {
                                    let pageNum;
                                    if (levels.last_page <= 5) {
                                        pageNum = i + 1;
                                    } else if (levels.current_page <= 3) {
                                        pageNum = i + 1;
                                    } else if (levels.current_page >= levels.last_page - 2) {
                                        pageNum = levels.last_page - 4 + i;
                                    } else {
                                        pageNum = levels.current_page - 2 + i;
                                    }

                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={levels.current_page === pageNum ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => {
                                                router.get(route('levels.index'), {
                                                    ...filters,
                                                    page: pageNum,
                                                });
                                            }}
                                            className={levels.current_page === pageNum ? 'bg-blue-600 hover:bg-blue-700' : ''}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    router.get(route('levels.index'), {
                                        ...filters,
                                        page: levels.current_page + 1,
                                    });
                                }}
                                disabled={levels.current_page === levels.last_page}
                                className="gap-1"
                            >
                                Suivant
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer ce niveau ? Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-end gap-3">
                        <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? 'Suppression...' : 'Supprimer'}
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
