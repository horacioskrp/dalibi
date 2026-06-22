import { Head, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Search, Users, UserCheck, Eye, Mars, Venus, CircleHelp, Phone, History, Upload } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
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
    gender?: 'male' | 'female' | '' | null;
    nationality?: string | null;
    phone?: string | null;
    email?: string | null;
    profile_photo?: string | null;
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

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

interface IndexProps {
    students: PaginatedStudents;
    perPage: number;
    stats: {
        total: number;
        active: number;
        inactive: number;
        male: number;
        female: number;
        other: number;
    };
    filters?: {
        search?: string;
        gender?: string;
        nationality?: string;
        status?: string;
        per_page?: string;
    };
}

function renderGenderBadge(gender?: 'male' | 'female' | '' | null) {
    if (gender === 'male') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                <Mars className="w-3.5 h-3.5" />
                Masculin
            </span>
        );
    }

    if (gender === 'female') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-100 text-pink-700">
                <Venus className="w-3.5 h-3.5" />
                Féminin
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
            <CircleHelp className="w-3.5 h-3.5" />
            Non renseigné
        </span>
    );
}

export default function Index({ students, perPage, stats, filters }: Readonly<IndexProps>) {
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters?.search ?? '');
    const [genderFilter, setGenderFilter] = useState(filters?.gender ?? '');
    const [nationalityFilter, setNationalityFilter] = useState(filters?.nationality ?? '');
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? '');
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [bulkAction, setBulkAction] = useState('');

    const getFilters = () => ({
        search: searchQuery,
        gender: genderFilter,
        nationality: nationalityFilter,
        status: statusFilter,
        per_page: perPage !== 25 ? String(perPage) : undefined,
    });

    const goToPage = (page: number) => {
        router.get(route('students.index'), { ...getFilters(), page }, { preserveState: true, replace: true });
    };

    const changePerPage = (value: number) => {
        router.get(route('students.index'), { ...getFilters(), per_page: String(value), page: 1 }, { preserveState: true, replace: true });
    };

    const windowedPages = () => {
        const total = students.last_page;
        const cur = students.current_page;
        const window = 5;
        const start = Math.max(1, Math.min(cur - Math.floor(window / 2), total - window + 1));
        const end = Math.min(total, start + window - 1);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const allVisibleSelected = students.data.length > 0 && students.data.every((student) => selectedStudentIds.includes(student.id));

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
        router.get(route('students.index'), { ...getFilters(), page: 1 }, {
            preserveState: true,
            replace: true,
            onSuccess: () => setSelectedStudentIds([]),
        });
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setGenderFilter('');
        setNationalityFilter('');
        setStatusFilter('');
        router.get(route('students.index'), { per_page: perPage !== 25 ? String(perPage) : undefined }, {
            preserveState: true,
            replace: true,
            onSuccess: () => setSelectedStudentIds([]),
        });
    };

    const toggleSelectStudent = (studentId: string, checked: boolean) => {
        setSelectedStudentIds((prev) => {
            if (checked) {
                return prev.includes(studentId) ? prev : [...prev, studentId];
            }

            return prev.filter((id) => id !== studentId);
        });
    };

    const toggleSelectAllVisible = (checked: boolean) => {
        if (checked) {
            setSelectedStudentIds(students.data.map((student) => student.id));
            return;
        }

        setSelectedStudentIds([]);
    };

    const handleBulkAction = () => {
        if (selectedStudentIds.length === 0 || !bulkAction) {
            return;
        }

        router.post(route('students.bulk-status'), {
            student_ids: selectedStudentIds,
            action: bulkAction,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedStudentIds([]);
                setBulkAction('');
            },
        });
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
            title: 'Élèves hommes',
            value: stats.male,
            icon: Mars,
            bgColor: 'bg-sky-50',
            textColor: 'text-sky-600',
        },
        {
            title: 'Élèves femmes',
            value: stats.female,
            icon: Venus,
            bgColor: 'bg-pink-50',
            textColor: 'text-pink-600',
        },
    ];

    return (
        <AppLayout>
            <Head title="Élèves" />

            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 flex items-center gap-3"><Users className="h-7 w-7 text-blue-600 shrink-0" />Élèves</h1>
                        <p className="mt-2 text-lg text-gray-600">Gérez les profils élèves de votre établissement</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.get(route('students.import'))}
                            className="gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            Importer
                        </Button>
                        <Button
                            onClick={() => router.get(route('students.create'))}
                            className="gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="w-5 h-5" />
                            Nouvel élève
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                {selectedStudentIds.length > 0 && (
                    <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-xl flex items-center justify-between gap-4 shadow-sm ring-1 ring-blue-100">
                        <span className="text-sm font-medium">{selectedStudentIds.length} élève(s) sélectionné(s)</span>
                        <div className="flex items-center gap-2">
                            <select
                                value={bulkAction}
                                onChange={(event) => setBulkAction(event.target.value)}
                                className="h-10 rounded-md border border-blue-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Choisir une action</option>
                                <option value="activate">Activer</option>
                                <option value="deactivate">Désactiver</option>
                            </select>
                            <Button onClick={handleBulkAction} disabled={!bulkAction} className="bg-blue-600 hover:bg-blue-700 text-white">
                                Appliquer
                            </Button>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex gap-4 flex-wrap">
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
                        <Input
                            type="text"
                            placeholder="Nationalité"
                            value={nationalityFilter}
                            onChange={(event) => setNationalityFilter(event.target.value)}
                            className="w-44 bg-gray-50 border-gray-300"
                        />
                        <select
                            value={genderFilter}
                            onChange={(event) => setGenderFilter(event.target.value)}
                            className="h-10 rounded-md border border-gray-300 bg-gray-50 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Sexe</option>
                            <option value="male">Masculin</option>
                            <option value="female">Féminin</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            className="h-10 rounded-md border border-gray-300 bg-gray-50 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Statut</option>
                            <option value="active">Actif</option>
                            <option value="inactive">Inactif</option>
                        </select>
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
                    {/* Table header: count + per-page selector */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">{students.total}</span> élève(s)
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Lignes par page :</span>
                            <select
                                value={perPage}
                                onChange={(e) => changePerPage(Number(e.target.value))}
                                className="h-8 px-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {PER_PAGE_OPTIONS.map((n) => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow className="border-b border-gray-200">
                                    <TableHead className="w-10">
                                        <Checkbox
                                            checked={allVisibleSelected}
                                            onCheckedChange={(checked) => toggleSelectAllVisible(checked === true)}
                                            aria-label="Sélectionner tous les élèves"
                                        />
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-900">Élève</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Matricule</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Sexe / Gender</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Nationalité</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Contact</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Statut</TableHead>
                                    <TableHead className="text-center font-semibold text-gray-900 w-28">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Users className="w-12 h-12 text-gray-300" />
                                                <p className="text-lg">Aucun élève trouvé</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    students.data.map((student) => (
                                        <TableRow key={student.id} className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors">
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedStudentIds.includes(student.id)}
                                                    onCheckedChange={(checked) => toggleSelectStudent(student.id, checked === true)}
                                                    aria-label={`Sélectionner ${student.firstname} ${student.lastname}`}
                                                />
                                            </TableCell>
                                            <TableCell className="font-semibold text-gray-900">
                                                <div className="flex items-center gap-3">
                                                    {student.profile_photo ? (
                                                        <img
                                                            src={route('students.photo.view', student.id)}
                                                            alt={`${student.firstname} ${student.lastname}`}
                                                            className="h-10 w-10 rounded-full object-cover ring-1 ring-gray-200"
                                                        />
                                                    ) : (
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                                            <Users className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                    )}
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
                                            <TableCell>{renderGenderBadge(student.gender)}</TableCell>
                                            <TableCell className="text-gray-600">
                                                {student.nationality || <span className="text-gray-400">—</span>}
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Phone className="w-3.5 h-3.5 text-violet-500" />
                                                    {student.phone ?? student.parent_info?.father_phone ?? student.parent_info?.mother_phone ?? '—'}
                                                </span>
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
                                                        className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                                                        onClick={() => router.visit(route('students.history', student.id))}
                                                    >
                                                        <History className="w-4 h-4" />
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
                        <p className="text-sm text-gray-600">
                            {students.from}–{students.to} sur <span className="font-semibold">{students.total}</span> élèves
                        </p>
                        <div className="flex items-center gap-1">
                            {/* First + Prev */}
                            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 px-2"
                                disabled={students.current_page === 1}
                                onClick={() => goToPage(1)}>⟪</Button>
                            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 px-2"
                                disabled={students.current_page === 1}
                                onClick={() => goToPage(students.current_page - 1)}>‹</Button>

                            {/* Windowed pages */}
                            {windowedPages().map((page) => (
                                <Button
                                    key={page}
                                    variant={page === students.current_page ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => goToPage(page)}
                                    className={page === students.current_page
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'border-gray-300 text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
                                >
                                    {page}
                                </Button>
                            ))}

                            {/* Next + Last */}
                            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 px-2"
                                disabled={students.current_page === students.last_page}
                                onClick={() => goToPage(students.current_page + 1)}>›</Button>
                            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 px-2"
                                disabled={students.current_page === students.last_page}
                                onClick={() => goToPage(students.last_page)}>⟫</Button>
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
