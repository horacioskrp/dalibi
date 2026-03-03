import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Subject {
    id: string;
    name: string;
}

interface Teacher {
    id: string;
    name?: string;
    firstname?: string;
    lastname?: string;
}

interface AcademicYear {
    id: string;
    year: string;
}

interface Classroom {
    id: string;
    name: string;
}

interface SubjectAssignment {
    id: string;
    subject_id: string;
    teacher_id: string;
    academic_year_id: string;
    class_id: string;
    active: boolean;
    notes: string | null;
    subject: Subject;
    teacher: Teacher;
    academic_year: AcademicYear;
    classroom: Classroom;
}

interface EditProps {
    assignment: SubjectAssignment;
    subjects: Subject[];
    teachers: Teacher[];
    academicYears: AcademicYear[];
    classrooms: Classroom[];
}

export default function Edit({ assignment, subjects, teachers, academicYears, classrooms }: Readonly<EditProps>) {
    const getTeacherLabel = (teacher: Teacher) =>
        teacher.name ?? `${teacher.firstname ?? ''} ${teacher.lastname ?? ''}`.trim();

    const initialTeacherLabel = assignment.teacher
        ? getTeacherLabel(assignment.teacher)
        : '';

    const [formData, setFormData] = useState({
        subject_id: assignment.subject_id,
        teacher_id: assignment.teacher_id,
        academic_year_id: assignment.academic_year_id,
        class_id: assignment.class_id,
        active: assignment.active,
        notes: assignment.notes || '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [teacherSearch, setTeacherSearch] = useState(initialTeacherLabel);
    const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
    const [selectedTeacherLabel, setSelectedTeacherLabel] = useState(initialTeacherLabel);

    const filteredTeachers = teachers.filter((teacher) =>
        getTeacherLabel(teacher).toLowerCase().includes(teacherSearch.toLowerCase()),
    );

    const selectedTeacher = teachers.find((teacher) => teacher.id === formData.teacher_id);
    const displayedSelectedTeacher = selectedTeacher ? getTeacherLabel(selectedTeacher) : selectedTeacherLabel;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        router.put(route('subject-assignments.update', assignment.id), formData, {
            onError: (validationErrors) => {
                setErrors(validationErrors as Record<string, string>);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AppLayout>
            <Head title={`Modifier affectation - ${assignment.subject.name}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.get(route('subject-assignments.index'))}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Modifier l'affectation
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            {assignment.subject.name} - {assignment.teacher.name}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-lg border p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations de l'affectation</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="subject_id" className="block text-sm font-medium text-gray-900 mb-2">
                                    Matière *
                                </label>
                                <select
                                    id="subject_id"
                                    value={formData.subject_id}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, subject_id: e.target.value }))}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.subject_id ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <option value="">Sélectionner une matière</option>
                                    {subjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.subject_id && <p className="text-red-600 text-sm mt-1">{errors.subject_id}</p>}
                            </div>

                            <div>
                                <label htmlFor="teacher_id" className="block text-sm font-medium text-gray-900 mb-2">
                                    Enseignant *
                                </label>
                                <div className="relative">
                                    <input
                                        id="teacher_id"
                                        type="text"
                                        value={teacherSearch}
                                        onChange={(e) => {
                                            setTeacherSearch(e.target.value);
                                            setShowTeacherDropdown(true);
                                            if (!e.target.value.trim()) {
                                                setFormData((prev) => ({ ...prev, teacher_id: '' }));
                                                setSelectedTeacherLabel('');
                                            }
                                        }}
                                        onFocus={() => setShowTeacherDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowTeacherDropdown(false), 250)}
                                        placeholder="Rechercher et sélectionner un utilisateur..."
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.teacher_id ? 'border-red-500' : 'border-gray-300'}`}
                                    />

                                    {showTeacherDropdown && filteredTeachers.length > 0 && (
                                        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-auto">
                                            {filteredTeachers.map((teacher) => (
                                                <button
                                                    type="button"
                                                    key={teacher.id}
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        setFormData((prev) => ({ ...prev, teacher_id: teacher.id }));
                                                        const label = getTeacherLabel(teacher);
                                                        setTeacherSearch(label);
                                                        setSelectedTeacherLabel(label);
                                                        setShowTeacherDropdown(false);
                                                    }}
                                                    className="w-full text-left px-3 py-2 hover:bg-blue-50 transition"
                                                >
                                                    <span className="text-sm text-gray-900">{getTeacherLabel(teacher)}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {showTeacherDropdown && filteredTeachers.length === 0 && teacherSearch.trim() && (
                                        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm text-gray-500">
                                            Aucun utilisateur trouvé.
                                        </div>
                                    )}
                                </div>

                                {formData.teacher_id && displayedSelectedTeacher && (
                                    <div className="mt-2 inline-flex items-center rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-medium text-blue-700">
                                        Utilisateur sélectionné : {displayedSelectedTeacher}
                                    </div>
                                )}
                                {errors.teacher_id && <p className="text-red-600 text-sm mt-1">{errors.teacher_id}</p>}
                            </div>

                            <div>
                                <label htmlFor="class_id" className="block text-sm font-medium text-gray-900 mb-2">
                                    Classe *
                                </label>
                                <select
                                    id="class_id"
                                    value={formData.class_id}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, class_id: e.target.value }))}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.class_id ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <option value="">Sélectionner une classe</option>
                                    {classrooms.map((classroom) => (
                                        <option key={classroom.id} value={classroom.id}>
                                            {classroom.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.class_id && <p className="text-red-600 text-sm mt-1">{errors.class_id}</p>}
                            </div>

                            <div>
                                <label htmlFor="academic_year_id" className="block text-sm font-medium text-gray-900 mb-2">
                                    Année académique *
                                </label>
                                <select
                                    id="academic_year_id"
                                    value={formData.academic_year_id}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, academic_year_id: e.target.value }))}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.academic_year_id ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <option value="">Sélectionner une année</option>
                                    {academicYears.map((year) => (
                                        <option key={year.id} value={year.id}>
                                            {year.year}
                                        </option>
                                    ))}
                                </select>
                                {errors.academic_year_id && <p className="text-red-600 text-sm mt-1">{errors.academic_year_id}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-900 mb-2">
                                    Notes
                                </label>
                                <textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Notes ou commentaires..."
                                    rows={3}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.notes ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.notes && <p className="text-red-600 text-sm mt-1">{errors.notes}</p>}
                            </div>

                            <div className="md:col-span-2 flex items-center gap-2">
                                <Checkbox
                                    id="active"
                                    checked={formData.active}
                                    onCheckedChange={(checked) =>
                                        setFormData((prev) => ({ ...prev, active: checked === true }))
                                    }
                                />
                                <label htmlFor="active" className="text-sm font-medium text-gray-900 cursor-pointer">
                                    Affectation active
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </Button>
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => router.get(route('subject-assignments.index'))}
                        >
                            Annuler
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
