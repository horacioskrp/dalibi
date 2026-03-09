import { Head, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Search, Users, UserCheck, UserX, Eye } from 'lucide-react';
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

interface Student {
    id: string;
    matricule?: string | null;
    firstname: string;
    lastname: string;
    phone?: string | null;
    email?: string | null;
    active: boolean;
    user?: {
        id: string;
        firstname?: string | null;
        lastname?: string | null;
        name?: string | null;
        email?: string | null;
    } | null;
    parent_info?: {
        father_phone?: string | null;
        mother_phone?: string | null;
    } | null;
}

interface PaginatedStudents {
    data: Student[];
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

interface IndexProps {
    students: PaginatedStudents;
    stats: {
        total: number;
        active: number;
        inactive: number;
    };
    filters?: {
        search?: string;
    };
}

function getUserLabel(student: Student): string {
    const fullname = `${student.user?.firstname ?? ''} ${student.user?.lastname ?? ''}`.trim();

    if (fullname) {
        return fullname;
    }

    return student.user?.name ?? student.user?.email ?? '—';
}

export default function Index({ students, stats, filters }: Readonly<IndexProps>) {
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters?.search ?? '');

    const handleDelete = (studentId: string) => {
        setIsDeleting(true);
        router.delete(route('students.destroy', studentId), {
            onSuccess: () => {
                setDeleteConfirm(null);
                setIsDeleting(false);
            },
            onError: () => setIsDeleting(false),
        });
    };

    const handleSearch = () => {
        router.get(route('students.index'), { search: searchQuery }, { preserveState: true });
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        router.get(route('students.index'), { search: '' }, { preserveState: true });
    };

    const statsCards = [
        {
            title: 'Total élèves',
            value: stats.total,
            icon: Users,
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
        },
        {
            title: 'Élèves actifs',
            value: stats.active,
            icon: UserCheck,
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
        },
        {
            title: 'Élèves inactifs',
            value: stats.inactive,
            icon: UserX,
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-600',
        },
    ];

    return (
        <AppLayout>
            <Head title="Élèves" />

            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Élèves</h1>
                        <p className="mt-2 text-lg text-gray-600">Gérez les profils élèves de votre établissement</p>
                    </div>
                    <Button
                        onClick={() => router.get(route('students.create'))}
                        className="gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="w-5 h-5" />
                        Nouvel élève
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
                                type="text"
                                placeholder="Rechercher un élève..."
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                className="pl-10 bg-gray-50 border-gray-300"
                            />
                        </div>
                        <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
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
                                    <TableHead className="font-semibold text-gray-900">Élève</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Matricule</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Compte lié</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Contact</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Statut</TableHead>
                                    <TableHead className="text-center font-semibold text-gray-900 w-28">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Users className="w-12 h-12 text-gray-300" />
                                                <p className="text-lg">Aucun élève trouvé</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    students.data.map((student) => (
                                        <TableRow key={student.id} className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors">
                                            <TableCell className="font-semibold text-gray-900">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                                        <Users className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <span>{student.firstname} {student.lastname}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                {student.matricule ? (
                                                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-medium">
                                                        {student.matricule}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-gray-600">{getUserLabel(student)}</TableCell>
                                            <TableCell className="text-gray-600">
                                                {student.phone ?? student.parent_info?.father_phone ?? student.parent_info?.mother_phone ?? '—'}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded text-sm font-medium ${student.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {student.active ? 'Actif' : 'Inactif'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex gap-2 justify-center">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                                        onClick={() => router.visit(route('students.show', student.id))}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                                        onClick={() => router.visit(route('students.edit', student.id))}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        onClick={() => setDeleteConfirm(student.id)}
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

                {students.last_page > 1 && (
                    <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-600">
                            Affichage de <span className="font-semibold">{students.from}</span> à <span className="font-semibold">{students.to}</span> sur <span className="font-semibold">{students.total}</span> élèves
                        </div>
                        <div className="flex gap-2">
                            {students.current_page > 1 && (
                                <Button
                                    variant="outline"
                                    onClick={() => router.get(route('students.index'), { page: students.current_page - 1 }, { preserveState: true })}
                                >
                                    ← Précédent
                                </Button>
                            )}
                            <span className="flex items-center px-4 text-sm font-medium text-gray-700">
                                Page {students.current_page} sur {students.last_page}
                            </span>
                            {students.current_page < students.last_page && (
                                <Button
                                    variant="outline"
                                    onClick={() => router.get(route('students.index'), { page: students.current_page + 1 }, { preserveState: true })}
                                >
                                    Suivant →
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <AlertDialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer l'élève</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer cet élève ? Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-3 justify-end">
                        <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isDeleting || !deleteConfirm}
                            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
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
