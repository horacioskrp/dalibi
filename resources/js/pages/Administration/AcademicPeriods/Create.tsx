import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface AcademicYear {
    id: string;
    year: string;
}

interface CreateProps {
    academicYears: AcademicYear[];
}

export default function Create({ academicYears }: Readonly<CreateProps>) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        type: 'trimestre' as 'trimestre' | 'semestre',
        order: '',
        is_current: false,
        academic_year_id: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        router.post(route('academic-periods.store'), formData, {
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
            <Head title="Créer une période académique" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.get(route('academic-periods.index'))}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Créer une nouvelle période académique
                        </h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-lg border p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations de la période</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                                    Nom *
                                </label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                    placeholder="Ex: Trimestre 1, Semestre 1..."
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                            </div>

                            <div className="md:col-span-2">
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

                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-gray-900 mb-2">
                                    Type *
                                </label>
                                <select
                                    id="type"
                                    value={formData.type}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as 'trimestre' | 'semestre' }))}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.type ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <option value="trimestre">Trimestre</option>
                                    <option value="semestre">Semestre</option>
                                </select>
                                {errors.type && <p className="text-red-600 text-sm mt-1">{errors.type}</p>}
                            </div>

                            <div>
                                <label htmlFor="order" className="block text-sm font-medium text-gray-900 mb-2">
                                    Ordre
                                </label>
                                <Input
                                    id="order"
                                    type="number"
                                    min="1"
                                    value={formData.order}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, order: e.target.value }))}
                                    placeholder="1, 2, 3..."
                                    className={errors.order ? 'border-red-500' : ''}
                                />
                                {errors.order && <p className="text-red-600 text-sm mt-1">{errors.order}</p>}
                            </div>

                            <div>
                                <label htmlFor="start_date" className="block text-sm font-medium text-gray-900 mb-2">
                                    Date de début *
                                </label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                                    className={errors.start_date ? 'border-red-500' : ''}
                                />
                                {errors.start_date && <p className="text-red-600 text-sm mt-1">{errors.start_date}</p>}
                            </div>

                            <div>
                                <label htmlFor="end_date" className="block text-sm font-medium text-gray-900 mb-2">
                                    Date de fin *
                                </label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                                    className={errors.end_date ? 'border-red-500' : ''}
                                />
                                {errors.end_date && <p className="text-red-600 text-sm mt-1">{errors.end_date}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                    placeholder="Description de la période..."
                                    rows={3}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                            </div>

                            <div className="md:col-span-2 flex items-center gap-2">
                                <Checkbox
                                    id="is_current"
                                    checked={formData.is_current}
                                    onCheckedChange={(checked) =>
                                        setFormData((prev) => ({ ...prev, is_current: checked === true }))
                                    }
                                />
                                <label htmlFor="is_current" className="text-sm font-medium text-gray-900 cursor-pointer">
                                    Période active
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
                            {isSubmitting ? 'Création...' : 'Créer la période'}
                        </Button>
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => router.get(route('academic-periods.index'))}
                        >
                            Annuler
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
