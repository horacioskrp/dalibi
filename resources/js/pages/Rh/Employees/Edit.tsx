import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { EmployeeForm, type EmployeeFormData, type ContractType } from '@/components/Employees/employee-form';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Employee {
    id: string;
    employee_number: string | null;
    job_title: string;
    department: string | null;
    contract_type: string;
    hire_date: string | null;
    end_date: string | null;
    base_salary: number;
    payment_method: string;
    bank_name: string | null;
    bank_account: string | null;
    momo_number: string | null;
    cnss_number: string | null;
    status: string;
    notes: string | null;
    user?: { id: string; firstname: string; lastname: string } | null;
}

interface Props {
    employee: Employee;
    contractTypes: ContractType[];
}

export default function Edit({ employee, contractTypes }: Readonly<Props>) {
    const { data, setData, put, processing, errors } = useForm<EmployeeFormData>({
        user_id: employee.user?.id ?? '',
        employee_number: employee.employee_number ?? '',
        job_title: employee.job_title,
        department: employee.department ?? '',
        contract_type: employee.contract_type,
        hire_date: employee.hire_date ?? '',
        end_date: employee.end_date ?? '',
        base_salary: String(employee.base_salary ?? ''),
        payment_method: employee.payment_method,
        bank_name: employee.bank_name ?? '',
        bank_account: employee.bank_account ?? '',
        momo_number: employee.momo_number ?? '',
        cnss_number: employee.cnss_number ?? '',
        status: employee.status,
        notes: employee.notes ?? '',
    });

    const name = `${employee.user?.firstname ?? ''} ${employee.user?.lastname ?? ''}`.trim();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(route('employees.update', employee.id));
    };

    return (
        <AppLayout>
            <Head title={`Éditer ${name}`} />
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={() => router.get(route('employees.index'))} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Éditer l'employé</h1>
                </div>

                <EmployeeForm
                    mode="edit"
                    data={data}
                    errors={errors}
                    processing={processing}
                    contractTypes={contractTypes}
                    employeeName={name}
                    onSubmit={handleSubmit}
                    onCancel={() => router.get(route('employees.index'))}
                    setData={setData}
                />
            </div>
        </AppLayout>
    );
}
