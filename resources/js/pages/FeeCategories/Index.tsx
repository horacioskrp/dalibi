import { Head, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Search, Tag, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';
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

interface FeeCategorie {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
}

interface PaginatedFeeCategories {
    data: FeeCategorie[];
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

interface IndexProps {
    feeCategories: PaginatedFeeCategories;
    message?: string;
    filters: {
        search?: string;
    };
}

export default function Index({ feeCategories, message, filters }: Readonly<IndexProps>) {
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const handleDelete = (categoryId: string) => {
        setIsDeleting(true);
        router.delete(route('fee-categories.destroy', categoryId), {
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
        router.get(route('fee-categories.index'), { search: searchQuery }, { 
            preserveScroll: true,
            replace: true 
        });
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        router.get(route('fee-categories.index'), {}, { 
            preserveScroll: true,
            replace: true 
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <AppLayout>
            <Head title="Catégories de frais" />

            <div className="space-y-6">
                {/* Header avec titre et bouton */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                            Catégories de frais
                        </h1>
                        <p className="mt-2 text-lg text-gray-600">
                            Gérez les catégories de frais scolaires
                        </p>
                    </div>
                    <Button 
                        onClick={() => router.get(route('fee-categories.create'))}
                        className="gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="w-5 h-5" />
                        Nouvelle catégorie
                    </Button>
                </div>

                {/* Stats Card */}
                <div className="bg-linear-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-gray-300 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Catégories totales</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{feeCategories.total}</p>
                        </div>
                        <Tag className="w-12 h-12 text-blue-600 opacity-20" />
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-300">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Rechercher par nom ou description..."
                                className="pl-10 border-gray-300 focus:border-blue-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                        </div>
                        <Button 
                            onClick={handleSearch}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Search className="w-4 h-4" />
                        </Button>
                        {searchQuery && (
                            <Button 
                                onClick={handleClearSearch}
                                variant="outline"
                                className="border-gray-300"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Message de succès */}
                {message && (
                    <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                        <p className="text-green-700 font-medium">{message}</p>
                    </div>
                )}

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50 border-b border-gray-300">
                            <TableRow>
                                <TableHead className="text-gray-700 font-semibold">Nom</TableHead>
                                <TableHead className="text-gray-700 font-semibold">Description</TableHead>
                                <TableHead className="text-gray-700 font-semibold">Date de création</TableHead>
                                <TableHead className="text-gray-700 font-semibold text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {feeCategories.data.length > 0 ? (
                                feeCategories.data.map((category) => (
                                    <TableRow key={category.id} className="border-b border-gray-300 hover:bg-gray-50">
                                        <TableCell className="font-semibold text-gray-900">{category.name}</TableCell>
                                        <TableCell className="text-gray-600 max-w-md truncate">
                                            {category.description || '-'}
                                        </TableCell>
                                        <TableCell className="text-gray-600">
                                            {new Date(category.created_at).toLocaleDateString('fr-FR')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                                                    onClick={() => router.get(route('fee-categories.show', category.id))}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                                                    onClick={() => router.get(route('fee-categories.edit', category.id))}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600"
                                                    onClick={() => setDeleteConfirm(category.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8">
                                        <p className="text-gray-600 font-medium">Aucune catégorie trouvée</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {feeCategories.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Affichage {feeCategories.from} à {feeCategories.to} sur {feeCategories.total}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-300"
                                disabled={feeCategories.current_page === 1}
                                onClick={() => router.get(route('fee-categories.index'), 
                                    { search: searchQuery, page: feeCategories.current_page - 1 }, 
                                    { preserveScroll: true }
                                )}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-300"
                                disabled={feeCategories.current_page === feeCategories.last_page}
                                onClick={() => router.get(route('fee-categories.index'), 
                                    { search: searchQuery, page: feeCategories.current_page + 1 }, 
                                    { preserveScroll: true }
                                )}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer la catégorie</AlertDialogTitle>
                            <AlertDialogDescription>
                                Cette action ne peut pas être annulée. Êtes-vous sûr de vouloir supprimer cette catégorie?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex justify-end gap-3">
                            <AlertDialogCancel className="border-gray-300">Annuler</AlertDialogCancel>
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
            </div>
        </AppLayout>
    );
}
