import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import {
    EvaluationTypeForm,
    type EvaluationTypeFormData,
} from '@/components/EvaluationTypes/evaluation-type-form';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface EvaluationType {
    id: string;
    name: string;
    description: string | null;
}

interface EditProps {
    evaluationType: EvaluationType;
}

export default function Edit({ evaluationType }: Readonly<EditProps>) {
    const { data, setData, put, processing, errors } = useForm<EvaluationTypeFormData>({
        name: evaluationType.name,
        description: evaluationType.description || '',
    });

    const submit = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        put(route('evaluation-types.update', evaluationType.id));
    };

    return (
        <AppLayout>
            <Head title="Modifier type d'évaluation" />

            <div className="max-w-4xl space-y-6">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={() => router.get(route('evaluation-types.index'))} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Éditer un type d'évaluation</h1>
                        <p className="mt-2 text-gray-600">Mettez à jour les informations de {evaluationType.name}.</p>
                    </div>
                </div>

                <EvaluationTypeForm
                    mode="edit"
                    data={data}
                    errors={errors}
                    processing={processing}
                    onCancel={() => router.get(route('evaluation-types.index'))}
                    onSubmit={submit}
                    setData={setData}
                />
            </div>
        </AppLayout>
    );
}
