import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Banknote, School } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Classroom {
    id: string;
    name: string;
    code: string;
}

interface CreateProps {
    classrooms: Classroom[];
}

export default function Create({ classrooms }: Readonly<CreateProps>) {
    const [formData, setFormData] = useState({
        class_id: '',
        inscription_fee: '',
        school_fee: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        router.post(route('schoolings.store'), formData, {
            onError: (validationErrors) => {
                setErrors(validationErrors);
                setIsSubmitting(false);
            },
            onSuccess: () => setIsSubmitting(false),
        });
    };

    return (
        <AppLayout>
            <Head title="Nouvel écolage" />

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
                        <h1 className="text-3xl font-bold text-gray-900">Créer un écolage</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
                    <div className="rounded-2xl bg-linear-to-br from-sky-50 to-white ring-1 ring-sky-100 p-6 space-y-4">
                        <div className="flex items-center gap-2 text-sky-700">
                            <School className="h-4 w-4" />
                            <p className="text-sm font-semibold">Informations de classe</p>
                        </div>
                        <div>
                            <label htmlFor="class_id" className="block text-sm font-medium text-gray-900 mb-2">Classe *</label>
                            <select
                                id="class_id"
                                value={formData.class_id}
                                onChange={(event) => setFormData((prev) => ({ ...prev, class_id: event.target.value }))}
                                className={`w-full px-3 py-2 rounded-lg bg-white/90 focus:outline-none focus:ring-2 focus:ring-sky-500 ${errors.class_id ? 'border border-red-500' : 'border border-slate-200'}`}
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
                    </div>

                    <div className="rounded-2xl bg-linear-to-br from-emerald-50 to-white ring-1 ring-emerald-100 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 flex items-center gap-2 text-emerald-700">
                            <Banknote className="h-4 w-4" />
                            <p className="text-sm font-semibold">Montants d'écolage</p>
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
                                className={errors.inscription_fee ? 'border-red-500 bg-white/90' : 'border-slate-200 bg-white/90'}
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
                                className={errors.school_fee ? 'border-red-500 bg-white/90' : 'border-slate-200 bg-white/90'}
                            />
                            {errors.school_fee && <p className="text-red-600 text-sm mt-1">{errors.school_fee}</p>}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                            {isSubmitting ? 'Création...' : 'Créer'}
                        </Button>
                        <Button type="button" variant="outline" className="border-slate-200" onClick={() => router.get(route('schoolings.index'))}>
                            Annuler
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
