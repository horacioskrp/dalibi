import { router, useForm } from '@inertiajs/react';
import { Briefcase, Pencil, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { EmployeeForm, type EmployeeFormData, type ContractType } from '@/components/Employees/employee-form';
import { useMoney } from '@/helpers/money';
import { route } from '@/helpers/route';

export interface EmployeeProfile {
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
}

interface Props {
    userId: string;
    userName: string;
    profile: EmployeeProfile | null;
    contractTypes: ContractType[];
    canManage: boolean;
}

const CONTRACT_LABELS: Record<string, string> = { CDI: 'CDI', CDD: 'CDD', VACATAIRE: 'Vacataire', STAGIAIRE: 'Stagiaire' };
const STATUS_LABELS: Record<string, string> = { active: 'Actif', suspended: 'Suspendu', terminated: 'Sorti des effectifs' };
const METHOD_LABELS: Record<string, string> = { CASH: 'Espèces', MOBILE_MONEY: 'Mobile Money', BANK_TRANSFER: 'Virement', CHEQUE: 'Chèque' };

export default function PayrollSection({ userId, userName, profile, contractTypes, canManage }: Readonly<Props>) {
    const fmt = useMoney();
    const [editing, setEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm<EmployeeFormData>({
        user_id: userId,
        employee_number: profile?.employee_number ?? '',
        job_title: profile?.job_title ?? '',
        department: profile?.department ?? '',
        contract_type: profile?.contract_type ?? 'CDI',
        hire_date: profile?.hire_date ?? '',
        end_date: profile?.end_date ?? '',
        base_salary: profile ? String(profile.base_salary) : '',
        payment_method: profile?.payment_method ?? 'CASH',
        bank_name: profile?.bank_name ?? '',
        bank_account: profile?.bank_account ?? '',
        momo_number: profile?.momo_number ?? '',
        cnss_number: profile?.cnss_number ?? '',
        status: profile?.status ?? 'active',
        notes: profile?.notes ?? '',
    });

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(route('users.payroll.update', userId), { preserveScroll: true, onSuccess: () => setEditing(false) });
    };

    if (editing) {
        return (
            <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" /> Profil paie / RH
                </h2>
                <EmployeeForm
                    mode="edit"
                    data={data}
                    errors={errors}
                    processing={processing}
                    contractTypes={contractTypes}
                    employeeName={userName}
                    onSubmit={submit}
                    onCancel={() => { reset(); setEditing(false); }}
                    setData={setData}
                />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" /> Profil paie / RH
                </h2>
                {canManage && profile && (
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setEditing(true)}><Pencil className="w-3.5 h-3.5" /> Modifier</Button>
                        <Button size="sm" variant="outline" className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50" onClick={() => setConfirmDelete(true)}><Trash2 className="w-3.5 h-3.5" /> Retirer</Button>
                    </div>
                )}
            </div>

            {!profile ? (
                <div className="text-center py-6">
                    <p className="text-sm text-gray-500">Cet utilisateur n'a pas encore de profil paie.</p>
                    {canManage && (
                        <Button className="mt-3 gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setEditing(true)}>
                            <Plus className="w-4 h-4" /> Ajouter à la paie
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-sm text-gray-600">Matricule employé</p><p className="font-medium text-gray-900 mt-1">{profile.employee_number ?? '—'}</p></div>
                    <div><p className="text-sm text-gray-600">Poste</p><p className="font-medium text-gray-900 mt-1">{profile.job_title}{profile.department ? ` — ${profile.department}` : ''}</p></div>
                    <div><p className="text-sm text-gray-600">Contrat</p><p className="font-medium text-gray-900 mt-1">{CONTRACT_LABELS[profile.contract_type] ?? profile.contract_type}</p></div>
                    <div><p className="text-sm text-gray-600">Statut</p><p className="font-medium text-gray-900 mt-1">{STATUS_LABELS[profile.status] ?? profile.status}</p></div>
                    <div><p className="text-sm text-gray-600">Salaire de base</p><p className="font-semibold text-gray-900 mt-1">{fmt(profile.base_salary)}</p></div>
                    <div><p className="text-sm text-gray-600">Paiement</p><p className="font-medium text-gray-900 mt-1">{METHOD_LABELS[profile.payment_method] ?? profile.payment_method}</p></div>
                    {profile.cnss_number && <div><p className="text-sm text-gray-600">N° CNSS</p><p className="font-medium text-gray-900 mt-1">{profile.cnss_number}</p></div>}
                </div>
            )}

            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Retirer de la paie ?</AlertDialogTitle>
                        <AlertDialogDescription>Le profil paie sera supprimé. Impossible si l'employé a déjà des bulletins.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-end gap-2">
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => {
                            router.delete(route('users.payroll.destroy', userId), { preserveScroll: true, onFinish: () => setConfirmDelete(false) });
                        }}>Retirer</AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
