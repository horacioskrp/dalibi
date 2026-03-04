import { Head, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search, Trash2, Wallet } from 'lucide-react';
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

interface Classroom {
    id: string;
    name: string;
    code: string;
}

interface Schooling {
    id: string;
    class_id: string;
    inscription_fee: number;
    school_fee: number;
    classroom: Classroom;
}

interface PaginatedSchoolings {
    data: Schooling[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
}

interface IndexProps {
    schoolings: PaginatedSchoolings;
    filters: {
        search?: string;
    };
    totals: {
        count: number;
        inscription_fee: number;
        school_fee: number;
    };
}

const formatMoney = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(value);

export default function Index({ schoolings, filters, totals }: Readonly<IndexProps>) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const statsCards = [
        {
            title: 'Classes tarifées',
            value: totals.count,
            icon: Wallet,
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
        },
        {
            title: "Total frais d'inscription",
            value: formatMoney(totals.inscription_fee),
            icon: Plus,
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
        },
        {
            title: 'Page',
            value: `${schoolings.current_page}/${schoolings.last_page}`,
            icon: Search,
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600',
        },
    ];

    const handleSearch = () => {
        router.get(route('schoolings.index'), { search }, { preserveState: true, replace: true });
    };

    const handleClearSearch = () => {
        setSearch('');
        router.get(route('schoolings.index'), { search: '' }, { preserveState: true, replace: true });
    };

    const handleDelete = (id: string) => {
        router.delete(route('schoolings.destroy', id), {
            onSuccess: () => setDeletingId(null),
        });
    };

    return (
        <AppLayout>
            <Head title="Ecolage" />

            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Ecolage</h1>
                        <p className="mt-2 text-lg text-gray-600">Gérez les frais d'inscription et de scolarité par classe</p>
                    </div>
                    <Button onClick={() => router.get(route('schoolings.create'))} className="bg-blue-600 hover:bg-blue-700 gap-2">
                        <Plus className="w-5 h-5" />
                        Nouvel écolage
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {statsCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.title} className={`${stat.bgColor} rounded-lg p-6 transition-all hover:shadow-md shadow-sm`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                        <p className={`text-3xl font-bold ${stat.textColor} mt-2`}>{stat.value}</p>
                                    </div>
                                    <Icon className={`w-12 h-12 ${stat.textColor} opacity-20`} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        handleSearch();
                                    }
                                }}
                                placeholder="Rechercher par nom/code de classe..."
                                className="pl-10 bg-gray-50 border-gray-300"
                            />
                        </div>
                        <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                            <Search className="w-4 h-4" />
                            Rechercher
                        </Button>
                        {search && (
                            <Button variant="outline" onClick={handleClearSearch} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                                Réinitialiser
                            </Button>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow className="border-b border-gray-200">
                                    <TableHead className="font-semibold text-gray-900">Classe</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Code</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Frais d'inscription</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Frais de scolarité</TableHead>
                                    <TableHead className="text-center font-semibold text-gray-900 w-28">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {schoolings.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Wallet className="w-12 h-12 text-gray-300" />
                                                <p className="text-lg">Aucun écolage trouvé</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    schoolings.data.map((schooling) => (
                                        <TableRow key={schooling.id} className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors">
                                            <TableCell className="font-semibold text-gray-900">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                                        <Wallet className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <span>{schooling.classroom?.name ?? '-'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-medium">
                                                    {schooling.classroom?.code ?? '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-blue-700 font-semibold">{formatMoney(schooling.inscription_fee)}</TableCell>
                                            <TableCell className="text-green-700 font-semibold">{formatMoney(schooling.school_fee)}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex gap-2 justify-center">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                                        onClick={() => router.get(route('schoolings.show', schooling.id))}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                                        onClick={() => router.get(route('schoolings.edit', schooling.id))}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        onClick={() => setDeletingId(schooling.id)}
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

                {schoolings.last_page > 1 && (
                    <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-600">
                            Affichage de <span className="font-semibold">{schoolings.from}</span> à{' '}
                            <span className="font-semibold">{schoolings.to}</span> sur{' '}
                            <span className="font-semibold">{schoolings.total}</span> écolages
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={schoolings.current_page === 1}
                                onClick={() => router.get(route('schoolings.index'), { ...filters, page: schoolings.current_page - 1 }, { preserveState: true })}
                            >
                                Précédent
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={schoolings.current_page === schoolings.last_page}
                                onClick={() => router.get(route('schoolings.index'), { ...filters, page: schoolings.current_page + 1 }, { preserveState: true })}
                            >
                                Suivant
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cet écolage ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-end gap-2">
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => deletingId && handleDelete(deletingId)}
                        >
                            Supprimer
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
