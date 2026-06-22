import { Head, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Search, CheckCircle2, Eye, ChevronLeft, ChevronRight, X, Percent, Wallet } from 'lucide-react';
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

interface Scholarship {
    id: string;
    name: string;
    description: string | null;
    type: 'percentage' | 'fixed';
    value: string;
    created_at: string;
}

interface PaginatedScholarships {
    data: Scholarship[];
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

interface IndexProps {
    scholarships: PaginatedScholarships;
    message?: string;
    filters: {
        search?: string;
    };
}

export default function Index({ scholarships, message, filters }: Readonly<IndexProps>) {
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const handleDelete = (scholarshipId: string) => {
        setIsDeleting(true);
        router.delete(route('scholarships.destroy', scholarshipId), {
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
        router.get(route('scholarships.index'), { search: searchQuery }, {
            preserveScroll: true,
            replace: true,
        });
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        router.get(route('scholarships.index'), {}, {
            preserveScroll: true,
            replace: true,
        });
    };

    const percentageCount = scholarships.data.filter((item) => item.type === 'percentage').length;
    const fixedCount = scholarships.data.filter((item) => item.type === 'fixed').length;

    const statsCards = [
        {
            title: 'Bourses totales',
            value: scholarships.total,
            icon: Percent,
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
        },
        {
            title: 'Bourses en %',
            value: percentageCount,
            icon: Percent,
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
        },
        {
            title: 'Montants fixes',
            value: fixedCount,
            icon: Wallet,
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600',
        },
    ];

    const formatValue = (type: Scholarship['type'], value: string) => {
        const numericValue = Number(value);
        if (type === 'percentage') {
            return `${numericValue}%`;
        }

        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(numericValue);
    };

    const formatDate = (date: string) => {
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(new Date(date));
    };

    return (
        <AppLayout>
            <Head title="Bourses" />

            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                            Bourses
                        </h1>
                        <p className="mt-2 text-lg text-gray-600">
                            Gérez les réductions de frais de scolarité
                        </p>
                    </div>
                    <Button
                        onClick={() => router.get(route('scholarships.create'))}
                        className="gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="w-5 h-5" />
                        Nouvelle bourse
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {statsCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.title}
                                className={`${stat.bgColor} rounded-lg p-6 transition-all hover:shadow-md shadow-sm`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            {stat.title}
                                        </p>
                                        <p className={`text-3xl font-bold ${stat.textColor} mt-2`}>
                                            {stat.value}
                                        </p>
                                    </div>
                                    <Icon className={`w-12 h-12 ${stat.textColor} opacity-20`} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {message && (
                    <div className="bg-green-50 text-green-800 px-4 py-3 rounded-lg flex items-center gap-3 shadow-sm">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span>{message}</span>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 group-focus-within:text-blue-600 transition" />
                                <Input
                                    type="text"
                                    placeholder="Rechercher une bourse..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-10 pr-10 bg-gray-50 border-gray-200 focus:border-blue-300 focus:bg-white transition"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={handleClearSearch}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <Button
                                onClick={handleSearch}
                                className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shrink-0 transition"
                            >
                                <Search className="w-4 h-4" />
                                Rechercher
                            </Button>
                        </div>
                        {searchQuery && (
                            <p className="text-sm text-gray-500 mt-3">
                                Résultats pour : <span className="font-semibold text-gray-700">« {searchQuery} »</span>
                            </p>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow className="border-b border-gray-200">
                                    <TableHead className="font-semibold text-gray-900">Nom</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Type</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Valeur</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Date de création</TableHead>
                                    <TableHead className="text-center font-semibold text-gray-900 w-24">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {scholarships.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center py-12 text-gray-500"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <Percent className="w-12 h-12 text-gray-300" />
                                                <p className="text-lg">Aucune bourse trouvée</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    scholarships.data.map((scholarship) => (
                                        <TableRow key={scholarship.id} className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors">
                                            <TableCell className="font-semibold text-gray-900">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                                        <Percent className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <span>{scholarship.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                                    {scholarship.type === 'percentage' ? 'Pourcentage' : 'Montant fixe'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-medium text-gray-900">
                                                {formatValue(scholarship.type, scholarship.value)}
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                {formatDate(scholarship.created_at)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex gap-2 justify-center">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                                        onClick={() => router.visit(route('scholarships.show', scholarship.id))}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                                        onClick={() => router.get(route('scholarships.edit', scholarship.id))}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        onClick={() => setDeleteConfirm(scholarship.id)}
                                                    >
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

                {scholarships.last_page > 1 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Affichage <span className="font-semibold">{scholarships.from}</span> à <span className="font-semibold">{scholarships.to}</span> sur <span className="font-semibold">{scholarships.total}</span> bourses
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={scholarships.current_page === 1}
                                    onClick={() => router.get(route('scholarships.index'), {
                                        page: scholarships.current_page - 1,
                                        search: filters.search,
                                    }, { preserveScroll: true })}
                                    className="border-gray-300 text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    Précédent
                                </Button>
                                <div className="flex gap-1">
                                    {Array.from({ length: Math.min(5, scholarships.last_page) }, (_, i) => {
                                        let page = i + 1;
                                        if (scholarships.last_page > 5 && scholarships.current_page > 3) {
                                            page = scholarships.current_page - 2 + i;
                                        }
                                        if (page > scholarships.last_page) return null;
                                        return (
                                            <Button
                                                key={page}
                                                variant={page === scholarships.current_page ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => router.get(route('scholarships.index'), {
                                                    page,
                                                    search: filters.search,
                                                }, { preserveScroll: true })}
                                                className={page === scholarships.current_page
                                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                    : 'border-gray-300 text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
                                                }
                                            >
                                                {page}
                                            </Button>
                                        );
                                    })}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={scholarships.current_page === scholarships.last_page}
                                    onClick={() => router.get(route('scholarships.index'), {
                                        page: scholarships.current_page + 1,
                                        search: filters.search,
                                    }, { preserveScroll: true })}
                                    className="border-gray-300 text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Suivant
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                            <p className="text-sm text-gray-600">
                                Page <span className="font-semibold">{scholarships.current_page}</span> sur <span className="font-semibold">{scholarships.last_page}</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer la bourse</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer cette bourse ? Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-3 justify-end">
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
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
