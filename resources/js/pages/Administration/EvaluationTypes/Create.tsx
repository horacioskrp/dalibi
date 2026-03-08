import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

export default function Create() {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        router.post(route('evaluation-types.store'), formData, {
            onError: (validationErrors) => {
                setErrors(validationErrors as Record<string, string>);
                setIsSubmitting(false);
            },
            onSuccess: () => setIsSubmitting(false),
        });
    };

    return (
        <AppLayout>
            <Head title="Créer un type d'évaluation" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.get(route('evaluation-types.index'))} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Créer un type d'évaluation</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="bg-white rounded-lg border border-gray-100 p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">Nom *</label>
                            <input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                rows={4}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                            {isSubmitting ? 'Création...' : 'Créer'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.get(route('evaluation-types.index'))}>Annuler</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
