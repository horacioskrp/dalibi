import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Student { id: string; firstname: string; lastname: string; matricule: string; }
interface Props { students: Student[]; preStudentId: string; }

export default function Create({ students, preStudentId }: Readonly<Props>) {
    const { data, setData, post, processing, errors } = useForm({
        student_id:  preStudentId ?? '',
        start_date:  '',
        end_date:    '',
        reason:      'medical' as 'medical' | 'familial' | 'autre',
        description: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('absence-permissions.store'));
    };

    return (
        <AppLayout>
            <Head title="Nouvelle demande de permission" />
            <div className="w-full space-y-6">

                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.get(route('absence-permissions.index'))}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Nouvelle demande de permission</h1>
                        <p className="text-gray-500 mt-1">Demande d'absence justifiée pour un élève</p>
                    </div>
                </div>

                <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 space-y-5 w-full">

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">Élève *</label>
                        <Select value={data.student_id} onValueChange={v => setData('student_id', v)}>
                            <SelectTrigger className={errors.student_id ? 'ring-red-400' : ''}>
                                <SelectValue placeholder="Sélectionner un élève" />
                            </SelectTrigger>
                            <SelectContent>
                                {students.map(s => (
                                    <SelectItem key={s.id} value={s.id}>
                                        {s.lastname} {s.firstname} — <span className="text-gray-400 font-mono text-xs">{s.matricule}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.student_id && <p className="text-xs text-red-500">{errors.student_id}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Date de début *</label>
                            <Input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} className={errors.start_date ? 'ring-red-400' : ''} />
                            {errors.start_date && <p className="text-xs text-red-500">{errors.start_date}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Date de fin *</label>
                            <Input type="date" value={data.end_date} min={data.start_date} onChange={e => setData('end_date', e.target.value)} className={errors.end_date ? 'ring-red-400' : ''} />
                            {errors.end_date && <p className="text-xs text-red-500">{errors.end_date}</p>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">Motif *</label>
                        <Select value={data.reason} onValueChange={v => setData('reason', v as typeof data.reason)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="medical">Médical</SelectItem>
                                <SelectItem value="familial">Familial</SelectItem>
                                <SelectItem value="autre">Autre</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">Description / Justification *</label>
                        <textarea
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            rows={4}
                            placeholder="Expliquez la raison de l'absence..."
                            className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-400' : 'border-gray-300'}`}
                        />
                        {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => router.get(route('absence-permissions.index'))}>Annuler</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={processing}>
                            {processing ? 'Envoi...' : 'Soumettre la demande'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
