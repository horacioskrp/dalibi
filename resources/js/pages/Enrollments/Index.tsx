import { Head, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search, Trash2, ClipboardList } from 'lucide-react';
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
    firstname: string;
    lastname: string;
    matricule?: string | null;
}

interface Classroom {
    id: string;
    name: string;
    code: string;
}

interface AcademicYear {
    id: string;
    year: string;
}

interface Enrollment {
    id: string;
    enrollment_code: string;
    enrollment_date: string;
    status: 'PENDING' | 'ACTIVE' | 'CANCELLED';
    student: Student;
    classroom: Classroom;
    academic_year: AcademicYear;
}

interface PaginatedEnrollments {
    data: Enrollment[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
}

interface IndexProps {
    enrollments: PaginatedEnrollments;
    filters: {
        search?: string;
        status?: string;
        academic_year_id?: string;
        class_id?: string;
    };
    stats: {
        total: number;
        pending: number;
        active: number;
        cancelled: number;
    };
    academicYears: AcademicYear[];
    classrooms: Classroom[];
}

const statusMap: Record<Enrollment['status'], string> = {
    PENDING:   'En attente',
    ACTIVE:    'Actif',
    CANCELLED: 'Annulé',
};

const statusBadgeClass: Record<Enrollment['status'], string> = {
    PENDING:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    ACTIVE:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function Index({ enrollments, filters, stats, academicYears, classrooms }: Readonly<IndexProps>) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [academicYearId, setAcademicYearId] = useState(filters.academic_year_id ?? '');
    const [classId, setClassId] = useState(filters.class_id ?? '');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleSearch = () => {
        router.get(route('enrollments.index'), { search, status, academic_year_id: academicYearId, class_id: classId }, { preserveState: true, replace: true });
    };

    const handleClearSearch = () => {
        setSearch('');
        setStatus('');
        setAcademicYearId('');
        setClassId('');
        router.get(route('enrollments.index'), { search: '', status: '', academic_year_id: '', class_id: '' }, { preserveState: true, replace: true });
    };

    const handleDelete = (id: string) => {
        router.delete(route('enrollments.destroy', id), {
            onSuccess: () => setDeletingId(null),
        });
    };

    return (
        <AppLayout>
            <Head title="Inscriptions" />

            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Inscriptions</h1>
                        <p className="mt-2 text-lg text-gray-600">Gérez les inscriptions des élèves par année académique</p>
                    </div>
                    <Button onClick={() => router.get(route('enrollments.create'))} className="bg-blue-600 hover:bg-blue-700 gap-2">
                        <Plus className="w-5 h-5" />
                        Nouvelle inscription
                    </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 shadow-sm">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{stats.total}</p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 shadow-sm">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En attente</p>
                        <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{stats.pending}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 shadow-sm">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Actifs</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.active}</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 shadow-sm">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Annulés</p>
                        <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{stats.cancelled}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        handleSearch();
                                    }
                                }}
                                placeholder="Code, élève, classe, année..."
                                className="pl-10 border-gray-300"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tous les statuts</option>
                            <option value="PENDING">En attente</option>
                            <option value="ACTIVE">Actif</option>
                            <option value="CANCELLED">Annulé</option>
                        </select>

                        <select
                            value={academicYearId}
                            onChange={(event) => setAcademicYearId(event.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Toutes les années</option>
                            {academicYears.map((year) => (
                                <option key={year.id} value={year.id}>
                                    {year.year}
                                </option>
                            ))}
                        </select>

                        <select
                            value={classId}
                            onChange={(event) => setClassId(event.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Toutes les classes</option>
                            {classrooms.map((classroom) => (
                                <option key={classroom.id} value={classroom.id}>
                                    {classroom.name} ({classroom.code})
                                </option>
                            ))}
                        </select>

                        <div className="flex gap-2">
                            <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 w-full md:w-auto">
                                <Search className="w-4 h-4" />
                                Rechercher
                            </Button>
                            {(search || status || academicYearId || classId) && (
                                <Button variant="outline" onClick={handleClearSearch} className="border-gray-300 text-gray-700 w-full md:w-auto">
                                    Réinit.
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow className="border-b border-gray-200">
                                    <TableHead className="font-semibold text-gray-900">Code</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Élève</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Classe</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Année</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Date</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Statut</TableHead>
                                    <TableHead className="text-center font-semibold text-gray-900 w-28">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {enrollments.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <ClipboardList className="w-12 h-12 text-gray-300" />
                                                <p className="text-lg">Aucune inscription trouvée</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    enrollments.data.map((enrollment) => (
                                        <TableRow key={enrollment.id} className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors">
                                            <TableCell className="font-semibold text-gray-900">{enrollment.enrollment_code}</TableCell>
                                            <TableCell className="text-gray-700">
                                                {enrollment.student ? `${enrollment.student.firstname} ${enrollment.student.lastname}` : '-'}
                                            </TableCell>
                                            <TableCell className="text-gray-700">
                                                {enrollment.classroom ? `${enrollment.classroom.name} (${enrollment.classroom.code})` : '-'}
                                            </TableCell>
                                            <TableCell className="text-gray-700">{enrollment.academic_year?.year ?? '-'}</TableCell>
                                            <TableCell className="text-gray-700">{new Date(enrollment.enrollment_date).toLocaleDateString('fr-FR')}</TableCell>
                                            <TableCell>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadgeClass[enrollment.status]}`}>
                                                    {statusMap[enrollment.status]}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex gap-2 justify-center">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                                        onClick={() => router.get(route('enrollments.show', enrollment.id))}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                                        onClick={() => router.get(route('enrollments.edit', enrollment.id))}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-red-300 text-red-600 hover:bg-red-50"
                                                        onClick={() => setDeletingId(enrollment.id)}
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

                {enrollments.last_page > 1 && (
                    <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-600">
                            Affichage de <span className="font-semibold">{enrollments.from}</span> à{' '}
                            <span className="font-semibold">{enrollments.to}</span> sur{' '}
                            <span className="font-semibold">{enrollments.total}</span> inscriptions
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-300 text-gray-700"
                                disabled={enrollments.current_page === 1}
                                onClick={() => router.get(route('enrollments.index'), { ...filters, page: enrollments.current_page - 1 }, { preserveState: true })}
                            >
                                Précédent
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-300 text-gray-700"
                                disabled={enrollments.current_page === enrollments.last_page}
                                onClick={() => router.get(route('enrollments.index'), { ...filters, page: enrollments.current_page + 1 }, { preserveState: true })}
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
                        <AlertDialogTitle>Supprimer cette inscription ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-end gap-2">
                        <AlertDialogCancel className="border-gray-300 text-gray-700">Annuler</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deletingId && handleDelete(deletingId)}>
                            Supprimer
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
