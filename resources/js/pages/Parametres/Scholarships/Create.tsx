import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

type ScholarshipType = 'percentage' | 'fixed';

export default function Create() {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'fixed' as ScholarshipType,
        value: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        router.post(route('scholarships.store'), formData, {
            onError: (formErrors) => {
                setErrors(formErrors as Record<string, string>);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Créer une bourse" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.get(route('scholarships.index'))}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Créer une nouvelle bourse
                        </h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations de la bourse</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                                    Nom *
                                </label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                    placeholder="Ex: Bourse d'excellence"
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && (
                                    <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-gray-900 mb-2">
                                    Type *
                                </label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value: ScholarshipType) => setFormData((prev) => ({ ...prev, type: value }))}
                                >
                                    <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Sélectionner un type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fixed">Montant fixe</SelectItem>
                                        <SelectItem value="percentage">Pourcentage</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && (
                                    <p className="text-red-600 text-sm mt-1">{errors.type}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="value" className="block text-sm font-medium text-gray-900 mb-2">
                                    Valeur {formData.type === 'percentage' ? '(%)' : '(montant)'} *
                                </label>
                                <Input
                                    id="value"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.value}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
                                    placeholder={formData.type === 'percentage' ? 'Ex: 15' : 'Ex: 100.00'}
                                    className={errors.value ? 'border-red-500' : ''}
                                />
                                {errors.value && (
                                    <p className="text-red-600 text-sm mt-1">{errors.value}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                    placeholder="Décrivez la bourse..."
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.description && (
                                    <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isSubmitting ? 'Création...' : 'Créer la bourse'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.get(route('scholarships.index'))}
                        >
                            Annuler
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
