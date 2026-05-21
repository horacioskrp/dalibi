import { Head, router } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, ToggleLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

export default function Create() {
    const [formData, setFormData] = useState({
        year: '',
        start_date: '',
        end_date: '',
        active: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        router.post(route('academic-years.store'), formData, {
            onError: (errors) => {
                setErrors(errors);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Créer une année académique" />

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
                            Créer une nouvelle année académique
                        </h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-2xl bg-linear-to-br from-indigo-50 to-white ring-1 ring-indigo-100 p-6 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 text-indigo-700">
                                <CalendarDays className="h-4 w-4" />
                                <p className="text-sm font-semibold">Période académique</p>
                            </div>
                            <div>
                                <label htmlFor="year" className="block text-sm font-medium text-gray-900 mb-2">
                                    Année *
                                </label>
                                <Input
                                    id="year"
                                    type="text"
                                    value={formData.year}
                                    onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                                    placeholder="Ex: 2025-2026"
                                    className={errors.year ? 'border-red-500 bg-white/90' : 'border-slate-200 bg-white/90'}
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
                                    className={errors.start_date ? 'border-red-500 bg-white/90' : 'border-slate-200 bg-white/90'}
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
                                    className={errors.end_date ? 'border-red-500 bg-white/90' : 'border-slate-200 bg-white/90'}
                                />
                                {errors.end_date && (
                                    <p className="text-red-600 text-sm mt-1">{errors.end_date}</p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl bg-linear-to-br from-emerald-50 to-white ring-1 ring-emerald-100 p-6 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 text-emerald-700">
                                <ToggleLeft className="h-4 w-4" />
                                <p className="text-sm font-semibold">Activation</p>
                            </div>
                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.active}
                                        onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-900">
                                        Année active
                                    </span>
                                </label>
                                <p className="text-sm text-gray-500 mt-3">
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
                            {isSubmitting ? 'Création...' : 'Créer l\'année académique'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="border-slate-200"
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
