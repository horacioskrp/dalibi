import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { SchoolForm, type SchoolFormData, type CurrencyOption } from '@/components/Schools/school-form';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface School {
    id: string;
    name: string;
    code: string;
    logo: string | null;
    devise: string | null;
    currency: string | null;
    terme: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    region: string | null;
    city: string | null;
    po_box: string | null;
    active: boolean;
}

interface ClassroomTypeOption { id: string; name: string; period_system: string; }

interface EditProps {
    school: School;
    classroomTypes?: ClassroomTypeOption[];
    selectedClassTypes?: string[];
    currencies?: CurrencyOption[];
}

export default function Edit({ school, classroomTypes = [], selectedClassTypes = [], currencies = [] }: Readonly<EditProps>) {
    const currentLogoUrl = school.logo ? `/storage/${school.logo}` : null;

    const { data, setData, post, transform, processing, errors } = useForm<SchoolFormData>({
        name: school.name,
        code: school.code,
        logo: null,
        devise: school.devise || '',
        currency: school.currency || 'XOF',
        terme: school.terme || 'République Togolaise',
        email: school.email || '',
        phone: school.phone || '',
        address: school.address || '',
        region: school.region || '',
        city: school.city || '',
        po_box: school.po_box || '',
        active: school.active,
        class_type_ids: selectedClassTypes,
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // POST + _method=put : un PUT multipart n'est pas parsé par PHP, on passe par le spoofing.
        transform((d) => ({ ...d, _method: 'put' }));
        post(route('schools.update', school.id), { forceFormData: true });
    };

    return (
        <AppLayout>
            <Head title={`Éditer ${school.name}`} />

            <div className="w-full space-y-6">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={() => router.get(route('schools.index'))} className="p-2 hover:bg-gray-100 rounded-lg transition">
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
                    currentLogoUrl={currentLogoUrl}
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
