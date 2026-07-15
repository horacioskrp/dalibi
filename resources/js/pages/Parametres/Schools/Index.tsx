import { Head, router } from '@inertiajs/react';
import { BookOpen, CheckCircle2, Eye, Pencil, Plus, Search, Trash2, XCircle, Power, School } from 'lucide-react';
import { useEffect, useState } from 'react';
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
import { useToast } from '@/components/ui/toast';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';
interface School {
    id: string;
    name: string;
    code: string;
    logo: string | null;
    logo_url: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    region: string | null;
    city: string | null;
    po_box: string | null;
    active: boolean;
}

interface PaginatedSchools {
    data: School[];
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

interface IndexProps {
    schools: PaginatedSchools;
    activeSchoolsCount: number;
    message?: string;
}

export default function Index({ schools, activeSchoolsCount, message }: Readonly<IndexProps>) {
    const { toast } = useToast();
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('');
    const [selectedSchoolIds, setSelectedSchoolIds] = useState<string[]>([]);
    const [bulkActivateConfirm, setBulkActivateConfirm] = useState(false);
    const [bulkDeactivateConfirm, setBulkDeactivateConfirm] = useState(false);
    const [quickActivateTarget, setQuickActivateTarget] = useState<School | null>(null);
    const [quickDeactivateTarget, setQuickDeactivateTarget] = useState<School | null>(null);

    const allVisibleSelected = schools.data.length > 0 && schools.data.every((school) => selectedSchoolIds.includes(school.id));

    useEffect(() => {
        if (message) {
            toast({ title: 'Validation', description: message, variant: 'success' });
        }
    }, [message, toast]);

    const handleDelete = (schoolId: string) => {
        setIsDeleting(true);
        router.delete(route('schools.destroy', schoolId), {
            onSuccess: () => {
                setDeleteConfirm(null);
                setIsDeleting(false);
                toast({ title: 'Suppression réussie', description: 'École supprimée avec succès.', variant: 'success' });
            },
            onError: () => {
                setIsDeleting(false);
                toast({ title: 'Échec de suppression', description: 'Impossible de supprimer cette école.', variant: 'error' });
            },
        });
    };

    const handleSearch = () => {
        router.get(route('schools.index'), { search: searchQuery, active: activeFilter }, {
            preserveState: true,
            onSuccess: () => setSelectedSchoolIds([]),
        });
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setActiveFilter('');
        router.get(route('schools.index'), { search: '', active: '' }, {
            preserveState: true,
            onSuccess: () => setSelectedSchoolIds([]),
        });
    };

    const toggleSelectSchool = (schoolId: string, checked: boolean) => {
        setSelectedSchoolIds((prev) => {
            if (checked) {
                return prev.includes(schoolId) ? prev : [...prev, schoolId];
            }

            return prev.filter((id) => id !== schoolId);
        });
    };

    const toggleSelectAllVisible = (checked: boolean) => {
        if (checked) {
            setSelectedSchoolIds(schools.data.map((school) => school.id));
            return;
        }

        setSelectedSchoolIds([]);
    };

    const handleBulkDeactivate = () => {
        if (selectedSchoolIds.length === 0) {
            return;
        }

        router.post(route('schools.bulk-deactivate'), { school_ids: selectedSchoolIds }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedSchoolIds([]);
                setBulkDeactivateConfirm(false);
                toast({
                    title: 'Désactivation effectuée',
                    description: 'Les écoles sélectionnées ont été désactivées.',
                    variant: 'success',
                });
            },
            onError: () => {
                setBulkDeactivateConfirm(false);
                toast({ title: 'Échec de désactivation', description: 'Action bulk non effectuée.', variant: 'error' });
            },
        });
    };

    const handleBulkActivate = () => {
        if (selectedSchoolIds.length === 0) {
            return;
        }

        router.post(route('schools.bulk-activate'), { school_ids: selectedSchoolIds }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedSchoolIds([]);
                setBulkActivateConfirm(false);
                toast({
                    title: 'Réactivation effectuée',
                    description: 'Les écoles sélectionnées ont été activées.',
                    variant: 'success',
                });
            },
            onError: () => {
                setBulkActivateConfirm(false);
                toast({ title: 'Échec de réactivation', description: 'Action bulk non effectuée.', variant: 'error' });
            },
        });
    };

    const handleQuickToggle = (schoolId: string, active: boolean) => {
        router.patch(route('schools.toggle-active', schoolId), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setQuickDeactivateTarget(null);
                toast({
                    title: active ? 'École désactivée' : 'École activée',
                    description: active ? 'Statut mis à jour avec succès.' : 'Statut activé avec succès.',
                    variant: 'success',
                });
            },
            onError: () => {
                setQuickDeactivateTarget(null);
                toast({ title: 'Échec de mise à jour', description: 'Impossible de changer le statut.', variant: 'error' });
            },
        });
    };

    const statsCards = [
        {
            title: 'Total des écoles',
            value: schools.total,
            icon: BookOpen,
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
        },
        {
            title: 'Écoles actives',
            value: activeSchoolsCount,
            icon: CheckCircle2,
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
        },
        {
            title: 'Page',
            value: `${schools.current_page}/${schools.last_page}`,
            icon: Plus,
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600',
        },
    ];

    return (
        <AppLayout>
            <Head title="Écoles" />

            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 flex items-center gap-3"><School className="h-7 w-7 text-blue-600 shrink-0" />Écoles</h1>
                        <p className="mt-2 text-lg text-gray-600">Gérez les écoles de votre institution</p>
                    </div>
                    <Button
                        onClick={() => router.visit(route('schools.create'))}
                        className="gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="w-5 h-5" />
                        Nouvelle école
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {statsCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.title} className={`${stat.bgColor} rounded-2xl p-6 transition-all hover:shadow-md shadow-sm ring-1 ring-gray-100`}>
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

                {selectedSchoolIds.length > 0 && (
                    <div className="bg-amber-50 text-amber-800 px-4 py-3 rounded-xl flex items-center justify-between gap-4 shadow-sm ring-1 ring-amber-100">
                        <span className="text-sm font-medium">
                            {selectedSchoolIds.length} école(s) sélectionnée(s)
                        </span>
                        <div className="flex items-center gap-2">
                            <Button onClick={() => setBulkActivateConfirm(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                                <Power className="w-4 h-4" />
                                Activer la sélection
                            </Button>
                            <Button onClick={() => setBulkDeactivateConfirm(true)} className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
                                <Power className="w-4 h-4" />
                                Désactiver la sélection
                            </Button>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-gray-100">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Rechercher une école..."
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                className="pl-10 bg-gray-50 border-gray-200 focus-visible:ring-blue-500"
                            />
                        </div>
                        <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                            <Search className="w-4 h-4" />
                            Rechercher
                        </Button>
                        <select
                            value={activeFilter}
                            onChange={(event) => setActiveFilter(event.target.value)}
                            className="h-10 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tous statuts</option>
                            <option value="1">Actives</option>
                            <option value="0">Inactives</option>
                        </select>
                        {searchQuery && (
                            <Button variant="outline" onClick={handleClearSearch} className="border-gray-200 text-gray-700 hover:bg-gray-50">
                                Réinitialiser
                            </Button>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow className="border-b border-gray-100">
                                    <TableHead className="w-10">
                                        <Checkbox
                                            checked={allVisibleSelected}
                                            onCheckedChange={(checked) => toggleSelectAllVisible(checked === true)}
                                            aria-label="Sélectionner toutes les écoles"
                                        />
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-900">Logo</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Nom</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Code</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Région</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Ville</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Boîte postale</TableHead>
                                    <TableHead className="font-semibold text-gray-900">Active</TableHead>
                                    <TableHead className="text-center font-semibold text-gray-900 w-44">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {schools.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <BookOpen className="w-12 h-12 text-gray-300" />
                                                <p className="text-lg">Aucune école trouvée</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    schools.data.map((school) => (
                                        <TableRow key={school.id} className="border-b border-gray-100/80 hover:bg-blue-50/40 transition-colors">
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedSchoolIds.includes(school.id)}
                                                    onCheckedChange={(checked) => toggleSelectSchool(school.id, checked === true)}
                                                    aria-label={`Sélectionner ${school.name}`}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {school.logo_url ? (
                                                    <img
                                                        src={school.logo_url}
                                                        alt={`Logo ${school.name}`}
                                                        className="h-10 w-10 rounded-xl object-cover ring-1 ring-gray-100"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-xl bg-gray-100 ring-1 ring-gray-100 flex items-center justify-center">
                                                        <BookOpen className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-semibold text-gray-900">{school.name}</TableCell>
                                            <TableCell className="text-gray-600">
                                                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-medium">{school.code}</span>
                                            </TableCell>
                                            <TableCell className="text-gray-600">{school.region || <span className="text-gray-400">-</span>}</TableCell>
                                            <TableCell className="text-gray-600">{school.city || <span className="text-gray-400">-</span>}</TableCell>
                                            <TableCell className="text-gray-600">{school.po_box || <span className="text-gray-400">-</span>}</TableCell>
                                            <TableCell>
                                                {school.active ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                                                        <XCircle className="w-3.5 h-3.5" />
                                                        Inactive
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex gap-2 justify-center">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                                        onClick={() => router.visit(route('schools.show', school.id))}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                                        onClick={() => router.visit(route('schools.edit', school.id))}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className={school.active
                                                            ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                                            : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}
                                                        onClick={() => {
                                                            if (school.active) {
                                                                setQuickDeactivateTarget(school);
                                                                return;
                                                            }

                                                            setQuickActivateTarget(school);
                                                        }}
                                                    >
                                                        <Power className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        onClick={() => setDeleteConfirm(school.id)}
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

                {schools.last_page > 1 && (
                    <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm ring-1 ring-gray-100">
                        <div className="text-sm text-gray-600">
                            Affichage de <span className="font-semibold">{schools.from}</span> à{' '}
                            <span className="font-semibold">{schools.to}</span> sur{' '}
                            <span className="font-semibold">{schools.total}</span> écoles
                        </div>
                        <div className="flex gap-2">
                            {schools.current_page > 1 && (
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        router.get(route('schools.index'), { page: schools.current_page - 1, search: searchQuery, active: activeFilter }, { preserveState: true })
                                    }
                                >
                                    ← Précédent
                                </Button>
                            )}
                            <span className="flex items-center px-4 text-sm font-medium text-gray-700">
                                Page {schools.current_page} sur {schools.last_page}
                            </span>
                            {schools.current_page < schools.last_page && (
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        router.get(route('schools.index'), { page: schools.current_page + 1, search: searchQuery, active: activeFilter }, { preserveState: true })
                                    }
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
                        <AlertDialogTitle>Supprimer l'école</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer cette école ? Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-3 justify-end">
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

            <AlertDialog open={bulkDeactivateConfirm} onOpenChange={setBulkDeactivateConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Désactivation en lot</AlertDialogTitle>
                        <AlertDialogDescription>
                            Confirmez-vous la désactivation de {selectedSchoolIds.length} école(s) sélectionnée(s) ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-3 justify-end">
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDeactivate}
                            className="bg-amber-600 hover:bg-amber-700"
                        >
                            Confirmer la désactivation
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={bulkActivateConfirm} onOpenChange={setBulkActivateConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Réactivation en lot</AlertDialogTitle>
                        <AlertDialogDescription>
                            Confirmez-vous la réactivation de {selectedSchoolIds.length} école(s) sélectionnée(s) ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-3 justify-end">
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkActivate}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            Confirmer la réactivation
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={quickDeactivateTarget !== null} onOpenChange={(open) => !open && setQuickDeactivateTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la désactivation</AlertDialogTitle>
                        <AlertDialogDescription>
                            Voulez-vous désactiver l'école {quickDeactivateTarget?.name} ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-3 justify-end">
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => quickDeactivateTarget && handleQuickToggle(quickDeactivateTarget.id, true)}
                            className="bg-amber-600 hover:bg-amber-700"
                        >
                            Désactiver
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={quickActivateTarget !== null} onOpenChange={(open) => !open && setQuickActivateTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la réactivation</AlertDialogTitle>
                        <AlertDialogDescription>
                            Voulez-vous activer l'école {quickActivateTarget?.name} ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-3 justify-end">
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => quickActivateTarget && handleQuickToggle(quickActivateTarget.id, false)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            Activer
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
