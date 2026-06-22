import { Head, router } from '@inertiajs/react';
import { BookPlus, ChevronLeft, ChevronRight, Eye, Layers, Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
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

interface ClassroomType {
    id: string;
    name: string;
}

interface Classroom {
    id: string;
    name: string;
    code: string;
    capacity: number;
    classroom_type_id?: string | null;
    type?: ClassroomType | null;
}

interface PaginatedClassrooms {
    data: Classroom[];
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

interface IndexProps {
    classrooms: PaginatedClassrooms;
    activeCount: number;
    filters: { search: string };
    message?: string;
}

function getPages(current: number, last: number): (number | '...')[] {
    if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, '...', last];
    if (current >= last - 3) return [1, '...', last - 4, last - 3, last - 2, last - 1, last];
    return [1, '...', current - 1, current, current + 1, '...', last];
}

export default function Index({ classrooms, activeCount, filters, message }: Readonly<IndexProps>) {
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search ?? '');

    const handleDelete = (classroomId: string) => {
        setIsDeleting(true);
        router.delete(route('classrooms.destroy', classroomId), {
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
        router.get(route('classrooms.index'), { search: searchQuery }, { preserveState: true });
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        router.get(route('classrooms.index'), { search: '' }, { preserveState: true });
    };

    const goToPage = (page: number) => {
        router.get(route('classrooms.index'), { page, search: searchQuery }, { preserveState: true });
    };

    const statsCards = [
        {
            title: 'Total des classes',
            value: classrooms.total,
            icon: Layers,
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
            borderColor: 'border-blue-200',
        },
        {
            title: 'Classes actives',
            value: activeCount,
            icon: Users,
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
            borderColor: 'border-green-200',
        },
        {
            title: 'Page',
            value: `${classrooms.current_page}/${classrooms.last_page}`,
            icon: Plus,
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600',
            borderColor: 'border-purple-200',
        },
    ];

    return (
        <AppLayout>
            <Head title="Classes" />

                    <div className="space-y-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                                    Classes
                                </h1>
                                <p className="mt-2 text-lg text-gray-600">
                                    Gérez les classes de votre établissement
                                </p>
                            </div>
                            <Button
                                onClick={() => router.visit(route('classrooms.create'))}
                                className="gap-2 bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="w-5 h-5" />
                                Nouvelle classe
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
                                <Users className="w-5 h-5 shrink-0" />
                                <span>{message}</span>
                            </div>
                        )}

                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Rechercher une classe..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 bg-gray-50 border-gray-300"
                                    />
                                </div>
                                <Button
                                    onClick={handleSearch}
                                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                                >
                                    <Search className="w-4 h-4" />
                                    Rechercher
                                </Button>
                                {searchQuery && (
                                    <Button
                                        variant="outline"
                                        onClick={handleClearSearch}
                                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
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
                                            <TableHead className="font-semibold text-gray-900">Nom</TableHead>
                                            <TableHead className="font-semibold text-gray-900">Code</TableHead>
                                            <TableHead className="font-semibold text-gray-900">Type</TableHead>
                                            <TableHead className="font-semibold text-gray-900">Capacité</TableHead>
                                            <TableHead className="text-center font-semibold text-gray-900 w-36">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {classrooms.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={5}
                                                    className="text-center py-12 text-gray-500"
                                                >
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Layers className="w-12 h-12 text-gray-300" />
                                                        <p className="text-lg">Aucune classe trouvée</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            classrooms.data.map((classroom) => (
                                                <TableRow
                                                    key={classroom.id}
                                                    className="border-b border-gray-100"
                                                >
                                                    <TableCell className="font-semibold text-gray-900">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                                                <Layers className="h-5 w-5 text-blue-600" />
                                                            </div>
                                                            <span>{classroom.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">
                                                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-medium">
                                                            {classroom.code}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">
                                                        {classroom.type?.name ? (
                                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                                                                {classroom.type.name}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">
                                                        {classroom.capacity}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex gap-2 justify-center">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-blue-300 text-blue-600 transition-colors duration-200 ease-out hover:bg-blue-50 hover:text-blue-700"
                                                                onClick={() => router.get(route('classrooms.subject-assignments.create', classroom.id))}
                                                                title="Attribuer des matières"
                                                            >
                                                                <BookPlus className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-gray-300 text-gray-700 transition-colors duration-200 ease-out hover:bg-blue-50/60 hover:text-blue-800"
                                                                onClick={() => router.visit(route('classrooms.show', classroom.id))}
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-gray-300 text-gray-700 transition-colors duration-200 ease-out hover:bg-blue-50/60 hover:text-blue-800"
                                                                onClick={() => router.visit(route('classrooms.edit', classroom.id))}
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-red-300 text-red-600 transition-colors duration-200 ease-out hover:bg-red-50 hover:text-red-700"
                                                                onClick={() => setDeleteConfirm(classroom.id)}
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

                        {classrooms.last_page > 1 && (
                            <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow-sm">
                                <p className="text-sm text-gray-500">
                                    <span className="font-semibold text-gray-700">{classrooms.from}</span>–<span className="font-semibold text-gray-700">{classrooms.to}</span> sur <span className="font-semibold text-gray-700">{classrooms.total}</span> classes
                                </p>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline" size="sm"
                                        disabled={classrooms.current_page === 1}
                                        onClick={() => goToPage(classrooms.current_page - 1)}
                                        className="h-8 w-8 p-0"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    {getPages(classrooms.current_page, classrooms.last_page).map((p, i) =>
                                        p === '...' ? (
                                            <span key={`e${i}`} className="px-1 text-gray-400 select-none text-sm">…</span>
                                        ) : (
                                            <Button
                                                key={p}
                                                variant="outline" size="sm"
                                                onClick={() => goToPage(p as number)}
                                                className={`h-8 w-8 p-0 text-sm ${p === classrooms.current_page ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' : ''}`}
                                            >
                                                {p}
                                            </Button>
                                        )
                                    )}
                                    <Button
                                        variant="outline" size="sm"
                                        disabled={classrooms.current_page === classrooms.last_page}
                                        onClick={() => goToPage(classrooms.current_page + 1)}
                                        className="h-8 w-8 p-0"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

            <AlertDialog
                open={deleteConfirm !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleteConfirm(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer la classe</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer cette classe ?
                            Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-3 justify-end">
                        <AlertDialogCancel disabled={isDeleting}>
                            Annuler
                        </AlertDialogCancel>
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
