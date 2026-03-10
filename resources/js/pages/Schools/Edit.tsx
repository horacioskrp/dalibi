import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { SchoolForm, type SchoolFormData } from '@/components/Schools/school-form';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface School {
    id: string;
    name: string;
    code: string;
    logo: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    region: string | null;
    city: string | null;
    po_box: string | null;
    active: boolean;
}

interface EditProps {
    school: School;
}

export default function Edit({ school }: Readonly<EditProps>) {
    const { data, setData, put, processing, errors } = useForm<SchoolFormData>({
        name: school.name,
        code: school.code,
        logo: school.logo || '',
        email: school.email || '',
        phone: school.phone || '',
        address: school.address || '',
        region: school.region || '',
        city: school.city || '',
        po_box: school.po_box || '',
        active: school.active,
    });

    const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        put(route('schools.update', school.id));
    };

    return (
        <AppLayout>
            <Head title={`Éditer ${school.name}`} />

            <div className="max-w-4xl space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => router.get(route('schools.index'))}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Éditer une école</h1>
                        <p className="mt-2 text-gray-600">Mettez à jour les informations de {school.name}.</p>
                    </div>
                </div>

                <SchoolForm
                    mode="edit"
                    data={data}
                    errors={errors}
                    processing={processing}
                    onCancel={() => router.get(route('schools.index'))}
                    onSubmit={handleSubmit}
                    setData={setData}
                />
            </div>
        </AppLayout>
    );
}
