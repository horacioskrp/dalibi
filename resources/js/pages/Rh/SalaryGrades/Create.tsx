import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { SalaryGradeForm, type SalaryGradeFormData } from '@/components/SalaryGrades/salary-grade-form';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

const initial: SalaryGradeFormData = {
    name: '', category: '', echelon: '', base_amount: '', sort_order: '0', active: true,
};

export default function Create() {
    const { data, setData, post, processing, errors } = useForm<SalaryGradeFormData>(initial);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('salary-grades.store'));
    };

    return (
        <AppLayout>
            <Head title="Nouvelle grille salariale" />
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={() => router.get(route('salary-grades.index'))} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Nouvelle grille salariale</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Une catégorie/échelon avec son salaire de base.</p>
                    </div>
                </div>

                <SalaryGradeForm
                    mode="create"
                    data={data}
                    errors={errors}
                    processing={processing}
                    onSubmit={handleSubmit}
                    onCancel={() => router.get(route('salary-grades.index'))}
                    setData={setData}
                />
            </div>
        </AppLayout>
    );
}
