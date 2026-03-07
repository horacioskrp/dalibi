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

interface Classroom {
    id: string;
    name: string;
    code: string;
}

interface Subject {
    id: string;
    name: string;
    code: string;
}

interface AcademicYear {
    id: string;
    year: string;
    start_date: string;
    end_date: string;
}

interface ClassSubject {
    id: string;
    class: Classroom;
    subject: Subject;
    academicYear: AcademicYear;
    created_at: string;
    updated_at: string;
}

interface ShowProps {
    classSubject: ClassSubject;
}

export default function Show({ classSubject }: Readonly<ShowProps>) {
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('class-subjects.destroy', classSubject.id), {
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
            <Head title="Détails de l'attribution" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.get(route('class-subjects.index'))}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Détails de l'attribution
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Informations sur l'attribution de matière à la classe
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() =>
                                router.get(
                                    route('class-subjects.edit', classSubject.id)
                                )
                            }
                            className="bg-blue-600 hover:bg-blue-700 gap-2"
                        >
                            <Pencil className="w-4 h-4" />
                            Modifier
                        </Button>
                        <Button
                            onClick={() => setDeleteConfirm(true)}
                            variant="destructive"
                            className="gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Classe */}
                    <div className="bg-white rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Classe
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">Nom</p>
                                <p className="text-lg font-medium text-gray-900">
                                    {classSubject.class.name}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Code</p>
                                <p className="text-lg font-medium text-gray-900">
                                    {classSubject.class.code}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Matière */}
                    <div className="bg-white rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Matière
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">Nom</p>
                                <p className="text-lg font-medium text-gray-900">
                                    {classSubject.subject.name}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Code</p>
                                <p className="text-lg font-medium text-gray-900">
                                    {classSubject.subject.code}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Année Académique */}
                    <div className="bg-white rounded-lg p-6 md:col-span-2">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Année académique
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">Année</p>
                                <p className="text-lg font-medium text-gray-900">
                                    {classSubject.academicYear.year}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Date de début</p>
                                    <p className="text-lg font-medium text-gray-900">
                                        {new Date(classSubject.academicYear.start_date).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Date de fin</p>
                                    <p className="text-lg font-medium text-gray-900">
                                        {new Date(classSubject.academicYear.end_date).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dates */}
                <div className="bg-white rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Informations de suivi
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-600">Créé le</p>
                            <p className="text-lg font-medium text-gray-900">
                                {new Date(classSubject.created_at).toLocaleDateString(
                                    'fr-FR',
                                    {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    }
                                )}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Modifié le</p>
                            <p className="text-lg font-medium text-gray-900">
                                {new Date(classSubject.updated_at).toLocaleDateString(
                                    'fr-FR',
                                    {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    }
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer cette attribution ?
                            Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-3 justify-end">
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
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
