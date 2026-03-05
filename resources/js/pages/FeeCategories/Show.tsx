import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
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

interface FeeCategorie {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

interface ShowProps {
    feeCategorie: FeeCategorie;
}

export default function Show({ feeCategorie }: Readonly<ShowProps>) {
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('fee-categories.destroy', feeCategorie.id), {
            onSuccess: () => {
                setDeleteConfirm(false);
                setIsDeleting(false);
            },
            onError: () => {
                setIsDeleting(false);
            },
        });
    };

    return (
        <AppLayout>
            <Head title={`Catégorie: ${feeCategorie.name}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => router.get(route('fee-categories.index'))}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Détail de la catégorie</h1>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={() => router.get(route('fee-categories.edit', feeCategorie.id))}
                            className="gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                            <Pencil className="w-4 h-4" />
                            Modifier
                        </Button>
                        <Button
                            onClick={() => setDeleteConfirm(true)}
                            variant="outline"
                            className="gap-2 border-red-300 text-red-600 hover:bg-red-50"
                        >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6 space-y-6">
                    {/* Informations principales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="block text-sm font-medium text-gray-600 mb-2">Nom</div>
                            <p className="text-lg font-semibold text-gray-900">{feeCategorie.name}</p>
                        </div>
                        <div>
                            <div className="block text-sm font-medium text-gray-600 mb-2">Créée le</div>
                            <p className="text-lg font-semibold text-gray-900">
                                {new Date(feeCategorie.created_at).toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <div className="block text-sm font-medium text-gray-600 mb-2">Description</div>
                        <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 rounded p-4 border border-gray-300">
                            {feeCategorie.description || 'Aucune description fournie'}
                        </p>
                    </div>

                    {/* Métadonnées */}
                    <div className="pt-4 border-t border-gray-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="block text-sm font-medium text-gray-600 mb-2">Dernière modification</div>
                                <p className="text-sm text-gray-900">
                                    {new Date(feeCategorie.updated_at).toLocaleDateString('fr-FR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                            <div>
                                <div className="block text-sm font-medium text-gray-600 mb-2">ID</div>
                                <p className="text-sm text-gray-600 font-mono">{feeCategorie.id}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer la catégorie</AlertDialogTitle>
                            <AlertDialogDescription>
                                Cette action ne peut pas être annulée. Êtes-vous sûr de vouloir supprimer cette catégorie de frais?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex justify-end gap-3">
                            <AlertDialogCancel className="border-gray-300">Annuler</AlertDialogCancel>
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
            </div>
        </AppLayout>
    );
}
