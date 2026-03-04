import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Classroom {
    id: string;
    name: string;
    code: string;
}

interface Schooling {
    id: string;
    class_id: string;
    inscription_fee: number;
    school_fee: number;
}

interface EditProps {
    schooling: Schooling;
    classrooms: Classroom[];
}

export default function Edit({ schooling, classrooms }: Readonly<EditProps>) {
    const [formData, setFormData] = useState({
        class_id: schooling.class_id,
        inscription_fee: String(schooling.inscription_fee),
        school_fee: String(schooling.school_fee),
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        router.put(route('schoolings.update', schooling.id), formData, {
            onError: (validationErrors) => {
                setErrors(validationErrors as Record<string, string>);
                setIsSubmitting(false);
            },
            onSuccess: () => setIsSubmitting(false),
        });
    };

    return (
        <AppLayout>
            <Head title="Modifier écolage" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => router.get(route('schoolings.index'))}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Modifier l'écolage</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
                    <div className="bg-white border rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label htmlFor="class_id" className="block text-sm font-medium text-gray-900 mb-2">Classe *</label>
                            <select
                                id="class_id"
                                value={formData.class_id}
                                onChange={(event) => setFormData((prev) => ({ ...prev, class_id: event.target.value }))}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.class_id ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="">Sélectionner une classe</option>
                                {classrooms.map((classroom) => (
                                    <option key={classroom.id} value={classroom.id}>
                                        {classroom.name} ({classroom.code})
                                    </option>
                                ))}
                            </select>
                            {errors.class_id && <p className="text-red-600 text-sm mt-1">{errors.class_id}</p>}
                        </div>

                        <div>
                            <label htmlFor="inscription_fee" className="block text-sm font-medium text-gray-900 mb-2">Frais d'inscription *</label>
                            <Input
                                id="inscription_fee"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.inscription_fee}
                                onChange={(event) => setFormData((prev) => ({ ...prev, inscription_fee: event.target.value }))}
                                className={errors.inscription_fee ? 'border-red-500' : ''}
                            />
                            {errors.inscription_fee && <p className="text-red-600 text-sm mt-1">{errors.inscription_fee}</p>}
                        </div>

                        <div>
                            <label htmlFor="school_fee" className="block text-sm font-medium text-gray-900 mb-2">Frais de scolarité *</label>
                            <Input
                                id="school_fee"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.school_fee}
                                onChange={(event) => setFormData((prev) => ({ ...prev, school_fee: event.target.value }))}
                                className={errors.school_fee ? 'border-red-500' : ''}
                            />
                            {errors.school_fee && <p className="text-red-600 text-sm mt-1">{errors.school_fee}</p>}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.get(route('schoolings.index'))}>
                            Annuler
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
