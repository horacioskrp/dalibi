import { Head, router } from '@inertiajs/react';
import { useCurrencySymbol } from '@/helpers/money';
import { ArrowLeft, Pencil, Trash2, Calendar, User, Award, FileText, Clock } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Student {
    id: string;
    matricule: string;
    firstname: string;
    lastname: string;
    gender: string;
    birth_date: string;
    email?: string;
    phone?: string;
}

interface Scholarship {
    id: string;
    name: string;
    description?: string;
    type: string;
    value: number;
}

interface AcademicYear {
    id: string;
    year: string;
    start_date: string;
    end_date: string;
}

interface StudentScholarship {
    id: string;
    notes?: string;
    number_of_year?: number;
    start_date?: string;
    end_date?: string;
    created_at: string;
    updated_at: string;
    student: Student;
    scholarship: Scholarship;
    academic_year: AcademicYear;
}

interface ShowProps {
    studentScholarship: StudentScholarship;
}

export default function Show({ studentScholarship }: Readonly<ShowProps>) {
    const currency = useCurrencySymbol();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleDelete = () => {
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        router.delete(route('student-scholarships.destroy', studentScholarship.id));
        setDeleteDialogOpen(false);
    };

    return (
        <AppLayout>
            <Head title={`Bourse - ${studentScholarship.student.firstname} ${studentScholarship.student.lastname}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.visit(route('student-scholarships.index'))}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Attribution de Bourse
                            </h1>
                            <p className="text-sm text-gray-600">
                                Détails de l'attribution de bourse à {studentScholarship.student.firstname} {studentScholarship.student.lastname}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.visit(route('student-scholarships.edit', studentScholarship.id))}
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifier
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleDelete}
                            className="text-red-600 hover:text-red-700"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Information */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Student Information */}
                        <Card className="border-0">
                            <CardHeader className="bg-blue-50">
                                <CardTitle className="flex items-center gap-2 text-blue-900">
                                    <User className="h-5 w-5" />
                                    Informations de l'Élève
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Nom complet</label>
                                        <p className="text-lg font-semibold">
                                            {studentScholarship.student.firstname} {studentScholarship.student.lastname}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Matricule</label>
                                        <p className="text-lg font-semibold text-blue-600">
                                            {studentScholarship.student.matricule}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Genre</label>
                                        <p className="capitalize">
                                            {studentScholarship.student.gender === 'male' ? 'Masculin' :
                                             studentScholarship.student.gender === 'female' ? 'Féminin' : 'Autre'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Date de naissance</label>
                                        <p>{new Date(studentScholarship.student.birth_date).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                    {studentScholarship.student.email && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Email</label>
                                            <p>{studentScholarship.student.email}</p>
                                        </div>
                                    )}
                                    {studentScholarship.student.phone && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Téléphone</label>
                                            <p>{studentScholarship.student.phone}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Scholarship Information */}
                        <Card className="border-0">
                            <CardHeader className="bg-green-50">
                                <CardTitle className="flex items-center gap-2 text-green-900">
                                    <Award className="h-5 w-5" />
                                    Informations de la Bourse
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Nom de la bourse</label>
                                        <p className="text-lg font-semibold">{studentScholarship.scholarship.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Type</label>
                                        <p className="capitalize">{studentScholarship.scholarship.type}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Valeur maximale</label>
                                        <p className="text-lg font-semibold text-green-600">
                                            {studentScholarship.scholarship.value.toLocaleString()} {currency}
                                        </p>
                                    </div>
                                    {studentScholarship.scholarship.description && (
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-medium text-gray-500">Description</label>
                                            <p className="mt-1">{studentScholarship.scholarship.description}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        {studentScholarship.notes && (
                            <Card className="border-0">
                                <CardHeader className="bg-gray-50">
                                    <CardTitle className="flex items-center gap-2 text-gray-900">
                                        <FileText className="h-5 w-5" />
                                        Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <p className="whitespace-pre-wrap">{studentScholarship.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Academic Year */}
                        <Card className="border-0">
                            <CardHeader className="bg-purple-50">
                                <CardTitle className="flex items-center gap-2 text-purple-900">
                                    <Calendar className="h-5 w-5" />
                                    Année Académique
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Année</label>
                                        <p className="text-lg font-semibold">{studentScholarship.academic_year.year}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Période</label>
                                        <p>
                                            {new Date(studentScholarship.academic_year.start_date).toLocaleDateString('fr-FR')} - {' '}
                                            {new Date(studentScholarship.academic_year.end_date).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Attribution Details */}
                        <Card className="border-0">
                            <CardHeader className="bg-orange-50">
                                <CardTitle className="flex items-center gap-2 text-orange-900">
                                    <Clock className="h-5 w-5" />
                                    Détails de l'Attribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Date d'attribution</label>
                                        <p>{new Date(studentScholarship.created_at).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Dernière modification</label>
                                        <p>{new Date(studentScholarship.updated_at).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                    {studentScholarship.number_of_year && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Nombre d'années</label>
                                            <p className="text-lg font-semibold">{studentScholarship.number_of_year}</p>
                                        </div>
                                    )}
                                    {studentScholarship.start_date && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Date de début</label>
                                            <p>{new Date(studentScholarship.start_date).toLocaleDateString('fr-FR')}</p>
                                        </div>
                                    )}
                                    {studentScholarship.end_date && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Date de fin</label>
                                            <p>{new Date(studentScholarship.end_date).toLocaleDateString('fr-FR')}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer cette attribution de bourse ?
                            Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-end gap-3">
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Supprimer
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}