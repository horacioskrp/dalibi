import { Head, router, useForm } from '@inertiajs/react';
import { Award, GraduationCap, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Exam {
    id: string;
    type: string;
    type_label: string;
    name: string;
    year: number;
    session: string;
    exam_date: string | null;
    center: string | null;
    status: string;
    total: number;
    admis: number;
}

interface Props {
    exams: Exam[];
    types: Record<string, string>;
    sessions: Record<string, string>;
    statuses: Record<string, string>;
}

const STATUS_STYLE: Record<string, string> = {
    ouvert:  'bg-emerald-100 text-emerald-700',
    clos:    'bg-amber-100 text-amber-700',
    termine: 'bg-gray-100 text-gray-600',
};

export default function Index({ exams, types, sessions, statuses }: Readonly<Props>) {
    const [createOpen, setCreateOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'bepc',
        name: '',
        year: new Date().getFullYear(),
        session: 'normale',
        exam_date: '',
        center: '',
        status: 'ouvert',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('official-exams.store'), {
            onSuccess: () => { setCreateOpen(false); reset(); },
        });
    };

    return (
        <AppLayout>
            <Head title="Examens officiels" />
            <div className="w-full space-y-6">

                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Examens officiels</h1>
                        <p className="mt-2 text-gray-500">Gérez les inscriptions et résultats au CEPD, BEPC et Baccalauréat.</p>
                    </div>
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setCreateOpen(true)}>
                        <Plus className="w-4 h-4" /> Nouvel examen
                    </Button>
                </div>

                {exams.length === 0 ? (
                    <div className="rounded-2xl ring-1 ring-dashed ring-gray-200 p-12 text-center text-gray-400">
                        <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        Aucun examen officiel. Créez-en un pour commencer.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {exams.map(exam => (
                            <div key={exam.id} className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm p-5 flex flex-col cursor-pointer hover:ring-blue-200 transition"
                                onClick={() => router.get(route('official-exams.show', exam.id))}>
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <span className="inline-block text-xs font-bold uppercase tracking-wide text-blue-600">{exam.type}</span>
                                        <p className="font-semibold text-gray-900 mt-0.5">{exam.name}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{sessions[exam.session]} · {exam.year}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLE[exam.status]}`}>{statuses[exam.status]}</span>
                                </div>

                                {exam.center && <p className="text-xs text-gray-500 mt-2">Centre : {exam.center}</p>}

                                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50 text-sm">
                                    <span className="inline-flex items-center gap-1.5 text-gray-600"><Users className="w-4 h-4 text-gray-400" />{exam.total} inscrit(s)</span>
                                    <span className="inline-flex items-center gap-1.5 text-emerald-600"><Award className="w-4 h-4" />{exam.admis} admis</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setDeleteId(exam.id); }}
                                        className="ml-auto text-red-400 hover:text-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Dialog création */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Nouvel examen officiel</DialogTitle></DialogHeader>
                    <form onSubmit={submit} className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Type *</label>
                                <Select value={data.type} onValueChange={v => setData('type', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(types).map(([k, label]) => <SelectItem key={k} value={k}>{k.toUpperCase()}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Année *</label>
                                <Input type="number" value={data.year} onChange={e => setData('year', Number(e.target.value))} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Nom / Libellé *</label>
                            <Input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Ex: BEPC 2026 - Session normale" className={errors.name ? 'border-red-400' : ''} />
                            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Session</label>
                                <Select value={data.session} onValueChange={v => setData('session', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(sessions).map(([k, label]) => <SelectItem key={k} value={k}>{label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Date d'examen</label>
                                <Input type="date" value={data.exam_date} onChange={e => setData('exam_date', e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Centre d'examen</label>
                            <Input value={data.center} onChange={e => setData('center', e.target.value)} placeholder="Ex: Lycée de Tokoin" />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
                            <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">Créer</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cet examen ?</AlertDialogTitle>
                        <AlertDialogDescription>Toutes les inscriptions et résultats associés seront supprimés.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-end gap-2">
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteId && router.delete(route('official-exams.destroy', deleteId), { onSuccess: () => setDeleteId(null) })}>
                            Supprimer
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
