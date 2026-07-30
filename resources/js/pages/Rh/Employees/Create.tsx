import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { EmployeeForm, type EmployeeFormData, type UserOption, type ContractType } from '@/components/Employees/employee-form';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Props {
    users: UserOption[];
    contractTypes: ContractType[];
}

const initial: EmployeeFormData = {
    user_id: '', employee_number: '', job_title: '', department: '',
    contract_type: 'CDI', hire_date: '', end_date: '', base_salary: '',
    payment_method: 'CASH', bank_name: '', bank_account: '', momo_number: '',
    cnss_number: '', status: 'active', notes: '',
};

export default function Create({ users, contractTypes }: Readonly<Props>) {
    const { data, setData, post, processing, errors } = useForm<EmployeeFormData>(initial);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('employees.store'));
    };

    return (
        <AppLayout>
            <Head title="Nouvel employé" />
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={() => router.get(route('employees.index'))} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Nouvel employé</h1>
                </div>

                <EmployeeForm
                    mode="create"
                    data={data}
                    errors={errors}
                    processing={processing}
                    users={users}
                    contractTypes={contractTypes}
                    onSubmit={handleSubmit}
                    onCancel={() => router.get(route('employees.index'))}
                    setData={setData}
                />
            </div>
        </AppLayout>
    );
}
