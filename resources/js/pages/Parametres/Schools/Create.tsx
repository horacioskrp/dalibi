import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { SchoolForm, type SchoolFormData, type CurrencyOption } from '@/components/Schools/school-form';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

const initialValues: SchoolFormData = {
    name: '',
    code: '',
    logo: null,
    devise: '',
    currency: 'XOF',
    terme: 'République Togolaise',
    ministry: 'Ministère des Enseignements Primaire, Secondaire et Technique',
    email: '',
    phone: '',
    address: '',
    region: '',
    city: '',
    po_box: '',
    active: true,
    class_type_ids: [],
};

interface ClassroomTypeOption { id: string; name: string; period_system: string; }

export default function Create({ classroomTypes = [], currencies = [] }: Readonly<{ classroomTypes?: ClassroomTypeOption[]; currencies?: CurrencyOption[] }>) {
    const { data, setData, post, processing, errors } = useForm<SchoolFormData>(initialValues);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post(route('schools.store'), { forceFormData: true });
    };

    return (
        <AppLayout>
            <Head title="Nouvelle école" />

            <div className="w-full space-y-6">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={() => router.get(route('schools.index'))} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Créer une école</h1>
                        <p className="mt-2 text-gray-600">Renseignez les informations de l'établissement.</p>
                    </div>
                </div>

                <SchoolForm
                    mode="create"
                    data={data}
                    errors={errors}
                    processing={processing}
                    classroomTypes={classroomTypes}
                    currencies={currencies}
                    onCancel={() => router.get(route('schools.index'))}
                    onSubmit={handleSubmit}
                    setData={setData}
                />
            </div>
        </AppLayout>
    );
}
