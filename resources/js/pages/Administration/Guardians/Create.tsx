import { Head, router, useForm } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { GuardianForm, type GuardianFormData } from '@/components/Guardians/guardian-form';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm<GuardianFormData>({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        student_matricules: [],
        send_invitation: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('guardians.store'));
    };

    return (
        <AppLayout>
            <Head title="Nouveau tuteur" />
            <div className="w-full space-y-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                        <Users className="h-7 w-7 text-blue-600 shrink-0" /> Nouveau tuteur
                    </h1>
                    <p className="mt-2 text-gray-500">Créez le compte et liez-le à un ou plusieurs élèves (par matricule).</p>
                </div>

                <GuardianForm
                    mode="create"
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onSubmit={submit}
                    onCancel={() => router.get(route('guardians.index'))}
                />
            </div>
        </AppLayout>
    );
}
