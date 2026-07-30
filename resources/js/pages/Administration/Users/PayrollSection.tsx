import { router, useForm } from '@inertiajs/react';
import { Briefcase, Pencil, Trash2, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { EmployeeForm, type EmployeeFormData, type ContractType, type SalaryGradeOption } from '@/components/Employees/employee-form';
import { useMoney } from '@/helpers/money';
import { route } from '@/helpers/route';

export interface Allowance {
    id: string;
    type: 'earning' | 'deduction';
    label: string;
    mode: 'fixed' | 'percent_base';
    amount: number;
    reason: string | null;
    active: boolean;
    created_by?: { firstname: string; lastname: string } | null;
}

export interface EmployeeProfile {
    id: string;
    employee_number: string | null;
    job_title: string;
    department: string | null;
    contract_type: string;
    salary_grade_id: string | null;
    salary_grade?: { id: string; name: string; base_amount: number } | null;
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
    allowances?: Allowance[];
}

interface Props {
    userId: string;
    userName: string;
    profile: EmployeeProfile | null;
    contractTypes: ContractType[];
    salaryGrades: SalaryGradeOption[];
    canManage: boolean;
}

const CONTRACT_LABELS: Record<string, string> = { CDI: 'CDI', CDD: 'CDD', VACATAIRE: 'Vacataire', STAGIAIRE: 'Stagiaire' };
const STATUS_LABELS: Record<string, string> = { active: 'Actif', suspended: 'Suspendu', terminated: 'Sorti des effectifs' };
const METHOD_LABELS: Record<string, string> = { CASH: 'Espèces', MOBILE_MONEY: 'Mobile Money', BANK_TRANSFER: 'Virement', CHEQUE: 'Chèque' };

export default function PayrollSection({ userId, userName, profile, contractTypes, salaryGrades, canManage }: Readonly<Props>) {
    const fmt = useMoney();
    const [editing, setEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deletingAllowance, setDeletingAllowance] = useState<string | null>(null);

    const { data, setData, put, processing, errors, reset } = useForm<EmployeeFormData>({
        user_id: userId,
        employee_number: profile?.employee_number ?? '',
        job_title: profile?.job_title ?? '',
        department: profile?.department ?? '',
        contract_type: profile?.contract_type ?? 'CDI',
        salary_grade_id: profile?.salary_grade_id ?? '',
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

    const allowanceForm = useForm({ type: 'earning', label: '', mode: 'fixed', amount: '', reason: '' });

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(route('users.payroll.update', userId), { preserveScroll: true, onSuccess: () => setEditing(false) });
    };

    const addAllowance = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        allowanceForm.post(route('users.allowances.store', userId), { preserveScroll: true, onSuccess: () => allowanceForm.reset() });
    };

    const effectiveBase = profile?.salary_grade?.base_amount ?? profile?.base_salary ?? 0;

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
                    salaryGrades={salaryGrades}
                    employeeName={userName}
                    onSubmit={submit}
                    onCancel={() => { reset(); setEditing(false); }}
                    setData={setData}
                />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border p-6 space-y-6">
            <div>
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
                        <div>
                            <p className="text-sm text-gray-600">Grille / salaire de base</p>
                            <p className="font-semibold text-gray-900 mt-1">{fmt(effectiveBase)}</p>
                            <p className="text-xs text-gray-400">{profile.salary_grade ? profile.salary_grade.name : 'Hors grille (saisi manuellement)'}</p>
                        </div>
                        <div><p className="text-sm text-gray-600">Paiement</p><p className="font-medium text-gray-900 mt-1">{METHOD_LABELS[profile.payment_method] ?? profile.payment_method}</p></div>
                        {profile.cnss_number && <div><p className="text-sm text-gray-600">N° CNSS</p><p className="font-medium text-gray-900 mt-1">{profile.cnss_number}</p></div>}
                    </div>
                )}
            </div>

            {/* Primes & retenues tracées */}
            {profile && (
                <div className="border-t pt-5">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Primes &amp; retenues de l'employé</h3>

                    {(profile.allowances?.length ?? 0) === 0 ? (
                        <p className="text-sm text-gray-400">Aucune prime ou retenue récurrente.</p>
                    ) : (
                        <div className="divide-y divide-slate-100 mb-3">
                            {profile.allowances!.map(a => (
                                <div key={a.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                                    <span className="flex items-center gap-2 min-w-0">
                                        {a.type === 'deduction'
                                            ? <TrendingDown className="w-4 h-4 text-red-500 shrink-0" />
                                            : <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />}
                                        <span className="min-w-0">
                                            <span className="font-medium text-gray-900">{a.label}</span>
                                            {a.reason && <span className="text-gray-400"> — {a.reason}</span>}
                                            {a.created_by && <span className="block text-xs text-gray-400">ajouté par {a.created_by.firstname} {a.created_by.lastname}</span>}
                                        </span>
                                    </span>
                                    <span className="flex items-center gap-3 shrink-0">
                                        <span className={`font-semibold ${a.type === 'deduction' ? 'text-red-600' : 'text-emerald-600'}`}>
                                            {a.type === 'deduction' ? '− ' : '+ '}{a.mode === 'percent_base' ? `${a.amount}% du base` : fmt(a.amount)}
                                        </span>
                                        {canManage && (
                                            <button onClick={() => setDeletingAllowance(a.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50" aria-label="Supprimer"><Trash2 className="w-4 h-4" /></button>
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {canManage && (
                        <form onSubmit={addAllowance} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end bg-slate-50 rounded-lg p-3">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Libellé</label>
                                <Input value={allowanceForm.data.label} onChange={e => allowanceForm.setData('label', e.target.value)} placeholder="Ex: Prime de responsabilité" className={allowanceForm.errors.label ? 'border-red-500' : ''} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                                <Select value={allowanceForm.data.type} onValueChange={v => allowanceForm.setData('type', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="earning">Gain</SelectItem>
                                        <SelectItem value="deduction">Retenue</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Mode</label>
                                <Select value={allowanceForm.data.mode} onValueChange={v => allowanceForm.setData('mode', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fixed">Montant fixe</SelectItem>
                                        <SelectItem value="percent_base">% du base</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">{allowanceForm.data.mode === 'percent_base' ? 'Pourcentage' : 'Montant'}</label>
                                <Input type="number" min={0} value={allowanceForm.data.amount} onChange={e => allowanceForm.setData('amount', e.target.value)} className={allowanceForm.errors.amount ? 'border-red-500' : ''} />
                            </div>
                            <div className="md:col-span-5">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Motif (traçabilité)</label>
                                <Input value={allowanceForm.data.reason} onChange={e => allowanceForm.setData('reason', e.target.value)} placeholder="Ex: Chef de département depuis septembre" />
                            </div>
                            <div>
                                <Button type="submit" disabled={allowanceForm.processing} className="gap-1.5 bg-blue-600 hover:bg-blue-700 w-full"><Plus className="w-4 h-4" /> Ajouter</Button>
                            </div>
                        </form>
                    )}
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

            <AlertDialog open={!!deletingAllowance} onOpenChange={() => setDeletingAllowance(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette prime / retenue ?</AlertDialogTitle>
                        <AlertDialogDescription>Elle ne s'appliquera plus aux prochains bulletins. Les bulletins déjà générés ne sont pas affectés.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-end gap-2">
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => {
                            if (deletingAllowance) router.delete(route('employee-allowances.destroy', deletingAllowance), { preserveScroll: true, onFinish: () => setDeletingAllowance(null) });
                        }}>Supprimer</AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
