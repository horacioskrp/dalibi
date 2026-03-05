import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

export default function Create() {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        router.post(route('fee-categories.store'), formData as never, {
            onError: (validationErrors) => {
                setErrors(validationErrors as Record<string, string>);
                setIsSubmitting(false);
            },
            onSuccess: () => setIsSubmitting(false),
        });
    };

    return (
        <AppLayout>
            <Head title="Nouvelle catégorie de frais" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => router.get(route('fee-categories.index'))}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Créer une catégorie de frais</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-300 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                                Nom *
                            </label>
                            <Input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                                className={`border-gray-300 ${errors.name ? 'border-red-500' : ''}`}
                                placeholder="Ex: Frais de scolarité, Frais de cantine..."
                            />
                            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.description ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Décrivez cette catégorie de frais..."
                                rows={4}
                            />
                            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                            {isSubmitting ? 'Création...' : 'Créer'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="border-gray-300 text-gray-700"
                            onClick={() => router.get(route('fee-categories.index'))}
                        >
                            Annuler
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
