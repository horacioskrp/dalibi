import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { CountryForm, type CountryFormData } from '@/components/Countries/country-form';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Country {
    id: string;
    name: string;
    code: string;
}

export default function Edit({ country }: Readonly<{ country: Country }>) {
    const { data, setData, put, processing, errors } = useForm<CountryFormData>({
        name: country.name,
        code: country.code,
    });

    const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        put(route('countries.update', country.id));
    };

    return (
        <AppLayout>
            <Head title={`Éditer ${country.name}`} />

            <div className="w-full space-y-6">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={() => router.get(route('countries.index'))} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Éditer un pays</h1>
                        <p className="mt-2 text-gray-600">Mettez à jour les informations de {country.name}.</p>
                    </div>
                </div>

                <CountryForm
                    mode="edit"
                    data={data}
                    errors={errors}
                    processing={processing}
                    onCancel={() => router.get(route('countries.index'))}
                    onSubmit={handleSubmit}
                    setData={setData}
                />
            </div>
        </AppLayout>
    );
}
