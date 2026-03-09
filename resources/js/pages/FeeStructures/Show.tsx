import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2, DollarSign } from 'lucide-react';
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
    updated_at: string;
    academic_year: AcademicYear;
    fee_category: FeeCategory;
    classroom: Classroom;
}

interface ShowProps {
    feeStructure: FeeStructure;
}

export default function Show({ feeStructure }: Readonly<ShowProps>) {
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('fee-structures.destroy', feeStructure.id), {
            onSuccess: () => {
                setDeleteConfirm(false);
            },
            onError: () => {
                setIsDeleting(false);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Détails de la structure de frais" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.visit(route('fee-structures.index'))}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => router.visit(route('fee-structures.edit', feeStructure.id))}
                            className="border-gray-300"
                        >
                            <Pencil className="h-4 w-4 mr-2" />
                            Modifier
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirm(true)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                        </Button>
                    </div>
                </div>

                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                        Détails de la structure de frais
                    </h1>
                    <p className="mt-3 text-base text-gray-600">
                        Informations complètes sur cette structure de frais
                    </p>
                </div>

                {/* Contenu principal */}
                <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-6 space-y-6">
                    {/* Informations principales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="block text-sm font-medium text-gray-600 mb-2">Année académique</div>
                            <p className="text-lg font-semibold text-gray-900">{feeStructure.academic_year.year}</p>
                        </div>
                        <div>
                            <div className="block text-sm font-medium text-gray-600 mb-2">Catégorie de frais</div>
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getCategoryColor(feeStructure.fee_category.name)}`}>
                                <DollarSign className="h-3.5 w-3.5" />
                                {feeStructure.fee_category.name}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="block text-sm font-medium text-gray-600 mb-2">Classe</div>
                            <p className="text-lg font-semibold text-gray-900">{feeStructure.classroom.name}</p>
                            <p className="text-sm text-gray-500 mt-1">Code: {feeStructure.classroom.code}</p>
                        </div>
                        <div>
                            <div className="block text-sm font-medium text-gray-600 mb-2">Montant</div>
                            <p className="text-2xl font-bold text-green-600">{formatMoney(feeStructure.amount)}</p>
                        </div>
                    </div>

                    {/* Métadonnées */}
                    <div className="pt-4 border-t border-gray-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="block text-sm font-medium text-gray-600 mb-2">Créée le</div>
                                <p className="text-sm text-gray-900">
                                    {new Date(feeStructure.created_at).toLocaleDateString('fr-FR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                            <div>
                                <div className="block text-sm font-medium text-gray-600 mb-2">Dernière modification</div>
                                <p className="text-sm text-gray-900">
                                    {new Date(feeStructure.updated_at).toLocaleDateString('fr-FR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-300">
                        <div className="block text-sm font-medium text-gray-600 mb-2">ID</div>
                        <p className="text-sm text-gray-600 font-mono">{feeStructure.id}</p>
                    </div>
                </div>
            </div>

            {/* Dialog de confirmation de suppression */}
            <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
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
                            onClick={handleDelete}
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
