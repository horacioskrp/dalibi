import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface AcademicYear {
    id: string;
    year: string;
    start_date: string;
    end_date: string;
    active: boolean;
}

interface EditProps {
    academicYear: AcademicYear;
}

export default function Edit({ academicYear }: Readonly<EditProps>) {
    const [formData, setFormData] = useState({
        year: academicYear.year,
        start_date: academicYear.start_date,
        end_date: academicYear.end_date,
        active: academicYear.active,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        router.put(route('academic-years.update', academicYear.id), formData, {
            onError: (errors) => {
                setErrors(errors as Record<string, string>);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AppLayout>
            <Head title={`Modifier ${academicYear.year}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.get(route('academic-years.index'))}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Modifier {academicYear.year}
                        </h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-lg border p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations de l'année académique</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label htmlFor="year" className="block text-sm font-medium text-gray-900 mb-2">
                                    Année *
                                </label>
                                <Input
                                    id="year"
                                    type="text"
                                    value={formData.year}
                                    onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                                    placeholder="Ex: 2025-2026"
                                    className={errors.year ? 'border-red-500' : ''}
                                />
                                {errors.year && (
                                    <p className="text-red-600 text-sm mt-1">{errors.year}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="start_date" className="block text-sm font-medium text-gray-900 mb-2">
                                    Date de début *
                                </label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                                    className={errors.start_date ? 'border-red-500' : ''}
                                />
                                {errors.start_date && (
                                    <p className="text-red-600 text-sm mt-1">{errors.start_date}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="end_date" className="block text-sm font-medium text-gray-900 mb-2">
                                    Date de fin *
                                </label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                                    className={errors.end_date ? 'border-red-500' : ''}
                                />
                                {errors.end_date && (
                                    <p className="text-red-600 text-sm mt-1">{errors.end_date}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.active}
                                        onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-900">
                                        Année active
                                    </span>
                                </label>
                                <p className="text-sm text-gray-500 mt-1 ml-6">
                                    Cochez cette case si c'est l'année académique en cours
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Boutons */}
                    <div className="flex gap-3">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.get(route('academic-years.index'))}
                        >
                            Annuler
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
