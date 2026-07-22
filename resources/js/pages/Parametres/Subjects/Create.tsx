import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import {
    SubjectForm,
    type SubjectFormData,
} from '@/components/Subjects/subject-form';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

const initialValues: SubjectFormData = {
    name: '',
    code: '',
    description: '',
    parent_id: '',
};

interface ParentSubject { id: string; name: string }

export default function Create({ parents = [] }: Readonly<{ parents?: ParentSubject[] }>) {
    const { data, setData, post, processing, errors } = useForm<SubjectFormData>(initialValues);

    const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route('subjects.store'));
    };

    return (
        <AppLayout>
            <Head title="Créer une matière" />

            <div className="w-full space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => router.get(route('subjects.index'))}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Créer une matière</h1>
                        <p className="mt-2 text-gray-600">Renseignez les informations de la matière.</p>
                    </div>
                </div>

                <SubjectForm
                    mode="create"
                    data={data}
                    errors={errors}
                    processing={processing}
                    parents={parents}
                    onCancel={() => router.get(route('subjects.index'))}
                    onSubmit={handleSubmit}
                    setData={setData}
                />
            </div>
        </AppLayout>
    );
}
