import { Head, router, useForm } from '@inertiajs/react';
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
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">Configurer l'école</h1>
                    <p className="mt-2 text-gray-600">Renseignez les informations de l'établissement.</p>
                </div>

                <SchoolForm
                    mode="create"
                    data={data}
                    errors={errors}
                    processing={processing}
                    classroomTypes={classroomTypes}
                    currencies={currencies}
                    onCancel={() => router.get(route('dashboard'))}
                    onSubmit={handleSubmit}
                    setData={setData}
                />
            </div>
        </AppLayout>
    );
}
