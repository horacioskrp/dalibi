import { Head, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Search, DollarSign, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';
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

interface AcademicYear {
    id: string;
    year: string;
}

interface FeeCategory {
    id: string;
    name: string;
}

interface Classroom {
    id: string;
    name: string;
    code: string;
}

interface FeeStructure {
    id: string;
    amount: number;
    created_at: string;
    academic_year: AcademicYear;
    fee_category: FeeCategory;
    classroom: Classroom;
}

interface PaginatedFeeStructures {
    data: FeeStructure[];
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

interface IndexProps {
    feeStructures: PaginatedFeeStructures;
    message?: string;
    filters: {
        search?: string;
    };
}

export default function Index({ feeStructures, message, filters }: Readonly<IndexProps>) {
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getCategoryColor = (categoryName: string): string => {
        const colorMap: Record<string, string> = {
            'Inscription': 'bg-red-50 text-red-700',
            'Écolage': 'bg-blue-50 text-blue-700',
            'Tenue scolaire': 'bg-purple-50 text-purple-700',
            'Transport': 'bg-amber-50 text-amber-700',
            'Cantine': 'bg-green-50 text-green-700',
            'Activité': 'bg-pink-50 text-pink-700',
        };
        return colorMap[categoryName] || 'bg-gray-50 text-gray-700';
    };

    const handleDelete = (feeStructureId: string) => {
        setIsDeleting(true);
        router.delete(route('fee-structures.destroy', feeStructureId), {
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
        router.get(route('fee-structures.index'), { search: searchQuery }, { 
            preserveScroll: true,
            replace: true 
        });
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        router.get(route('fee-structures.index'), {}, { 
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
            <Head title="Structures de frais" />

            <div className="space-y-6">
                {/* Header avec titre et bouton */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                            Structures de frais
                        </h1>
                        <p className="mt-3 text-base text-gray-600">
                            Gérez les montants des frais par catégorie, classe et année académique
                        </p>
                    </div>
                    <Button 
                        onClick={() => router.visit(route('fee-structures.create'))}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Nouvelle structure
                    </Button>
                </div>

                {/* Message de succès */}
                {message && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                        {message}
                    </div>
                )}

                {/* Statistiques */}
                <div className="bg-linear-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-gray-300 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                            <DollarSign className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total des structures</p>
                            <p className="text-2xl font-bold text-gray-900">{feeStructures.total}</p>
                        </div>
                    </div>
                </div>

                {/* Barre de recherche */}
                <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Rechercher par catégorie, classe ou année..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyPress}
                                className="pl-10 border-gray-300"
                            />
                        </div>
                        {searchQuery && (
                            <Button
                                variant="outline"
                                onClick={handleClearSearch}
                                className="border-gray-300"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Effacer
                            </Button>
                        )}
                        <Button 
                            onClick={handleSearch}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Search className="h-4 w-4 mr-2" />
                            Rechercher
                        </Button>
                    </div>
                </div>

                {/* Tableau */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow className="border-b border-gray-200">
                                <TableHead className="font-semibold text-gray-900">Année académique</TableHead>
                                <TableHead className="font-semibold text-gray-900">Catégorie</TableHead>
                                <TableHead className="font-semibold text-gray-900">Classe</TableHead>
                                <TableHead className="font-semibold text-gray-900">Montant</TableHead>
                                <TableHead className="font-semibold text-gray-900 text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {feeStructures.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <DollarSign className="w-12 h-12 text-gray-300" />
                                            <p className="text-lg">Aucune structure de frais trouvée</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                feeStructures.data.map((feeStructure) => (
                                    <TableRow key={feeStructure.id} className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors">
                                        <TableCell className="font-semibold text-gray-900">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                                    <DollarSign className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <span>{feeStructure.academic_year.year}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(feeStructure.fee_category.name)}`}>
                                                <DollarSign className="h-3 w-3" />
                                                {feeStructure.fee_category.name}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-gray-600">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{feeStructure.classroom.name}</span>
                                                <span className="text-xs text-gray-500">{feeStructure.classroom.code}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-semibold text-green-600">
                                            {formatMoney(feeStructure.amount)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex gap-2 justify-center">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.visit(route('fee-structures.show', feeStructure.id))}
                                                    className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.visit(route('fee-structures.edit', feeStructure.id))}
                                                    className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setDeleteConfirm(feeStructure.id)}
                                                    className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    </div>

                    {/* Pagination */}
                    {feeStructures.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-100 bg-white px-6 py-4">
                            <div className="text-sm text-gray-600">
                                Affichage de {feeStructures.from} à {feeStructures.to} sur {feeStructures.total} résultats
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={feeStructures.current_page === 1}
                                    onClick={() => router.get(route('fee-structures.index', { 
                                        page: feeStructures.current_page - 1,
                                        search: searchQuery 
                                    }))}
                                    className="border-gray-300 text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={feeStructures.current_page === feeStructures.last_page}
                                    onClick={() => router.get(route('fee-structures.index', { 
                                        page: feeStructures.current_page + 1,
                                        search: searchQuery 
                                    }))}
                                    className="border-gray-300 text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Dialog de confirmation de suppression */}
            <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer cette structure de frais ? Cette action est irréversible.
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
