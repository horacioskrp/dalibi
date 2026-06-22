import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Reclamation {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    reason: string;
    original_score: number | null;
    requested_score: number | null;
    corrected_score: number | null;
    correction_note: string | null;
    created_at: string;
    reviewed_at: string | null;
    student: { id: string; firstname: string; lastname: string; matricule: string };
    requested_by: { id: string; firstname: string; lastname: string };
    reviewed_by: { id: string; firstname: string; lastname: string } | null;
    evaluation: {
        id: string;
        locked_at: string | null;
        template: { name: string; coefficient: number; max_score: number; academic_period: { name: string } };
        class_subject: { class: { name: string; code: string }; subject: { name: string } };
    };
}

interface Props {
    reclamation: Reclamation;
    canReview: boolean;
}

const STATUS = {
    pending:  { label: 'En attente', icon: Clock, cls: 'bg-amber-100 text-amber-700 ring-amber-200' },
    approved: { label: 'Approuvée',  icon: CheckCircle2, cls: 'bg-emerald-100 text-emerald-700 ring-emerald-200' },
    rejected: { label: 'Rejetée',   icon: XCircle, cls: 'bg-red-100 text-red-700 ring-red-200' },
};

export default function Show({ reclamation, canReview }: Readonly<Props>) {
    const [action, setAction] = useState<'approve' | 'reject' | null>(null);

    const { data, setData, patch, processing, errors, reset } = useForm({
        status:          action === 'reject' ? 'rejected' : 'approved',
        corrected_score: reclamation.requested_score !== null ? String(reclamation.requested_score) : '',
        correction_note: '',
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('note-reclamations.review', reclamation.id), {
            onSuccess: () => reset(),
        });
    };

    const sc    = STATUS[reclamation.status];
    const Icon  = sc.icon;
    const maxScore = reclamation.evaluation.template.max_score;

    return (
        <AppLayout>
            <Head title={`Réclamation — ${reclamation.student.lastname} ${reclamation.student.firstname}`} />

            <div className="w-full space-y-6">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.get(route('note-reclamations.index'))}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Détail de la réclamation</h1>
                        <p className="text-gray-500 mt-0.5">Déposée le {new Date(reclamation.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <span className={`ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ring-1 ${sc.cls}`}>
                        <Icon className="w-4 h-4" />
                        {sc.label}
                    </span>
                </div>

                {/* Info cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Élève</p>
                        <p className="font-bold text-gray-900 text-lg">{reclamation.student.lastname} {reclamation.student.firstname}</p>
                        <p className="text-sm text-gray-500 font-mono">{reclamation.student.matricule}</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Évaluation</p>
                        <p className="font-bold text-gray-900">{reclamation.evaluation.template.name}</p>
                        <p className="text-sm text-gray-500">
                            {reclamation.evaluation.class_subject.class.name} · {reclamation.evaluation.class_subject.subject.name}
                        </p>
                        <p className="text-xs text-gray-400">{reclamation.evaluation.template.academic_period.name} · /{maxScore}</p>
                    </div>
                </div>

                {/* Score summary */}
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Note enregistrée</p>
                            <p className="text-3xl font-bold text-gray-700">{reclamation.original_score ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Note souhaitée</p>
                            <p className="text-3xl font-bold text-blue-600">{reclamation.requested_score ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Note corrigée</p>
                            <p className={`text-3xl font-bold ${reclamation.corrected_score !== null ? 'text-emerald-600' : 'text-gray-300'}`}>
                                {reclamation.corrected_score ?? '—'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Reason */}
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Motif de la réclamation</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{reclamation.reason}</p>
                    <p className="text-xs text-gray-400 mt-3">
                        Demandé par {reclamation.requested_by.firstname} {reclamation.requested_by.lastname}
                    </p>
                </div>

                {/* Decision (if processed) */}
                {reclamation.status !== 'pending' && (
                    <div className={`rounded-2xl p-5 ring-1 ${reclamation.status === 'approved' ? 'bg-emerald-50 ring-emerald-200' : 'bg-red-50 ring-red-200'}`}>
                        <p className="text-xs font-medium uppercase tracking-wide mb-2 ${reclamation.status === 'approved' ? 'text-emerald-600' : 'text-red-600'}">
                            Décision — {reclamation.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                        </p>
                        {reclamation.correction_note && (
                            <p className="text-gray-700 whitespace-pre-wrap">{reclamation.correction_note}</p>
                        )}
                        {reclamation.reviewed_by && (
                            <p className="text-xs text-gray-400 mt-2">
                                Par {reclamation.reviewed_by.firstname} {reclamation.reviewed_by.lastname}
                                {reclamation.reviewed_at && (
                                    <> · {new Date(reclamation.reviewed_at).toLocaleDateString('fr-FR')}</>
                                )}
                            </p>
                        )}
                    </div>
                )}

                {/* Review form (admin only, pending only) */}
                {canReview && reclamation.status === 'pending' && (
                    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5 space-y-4">
                        <p className="font-semibold text-gray-900">Traiter la réclamation</p>

                        {action === null && (
                            <div className="flex gap-3">
                                <Button
                                    className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                                    onClick={() => { setAction('approve'); setData('status', 'approved'); }}
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Approuver
                                </Button>
                                <Button
                                    variant="outline"
                                    className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                                    onClick={() => { setAction('reject'); setData('status', 'rejected'); }}
                                >
                                    <XCircle className="w-4 h-4" /> Rejeter
                                </Button>
                            </div>
                        )}

                        {action !== null && (
                            <form onSubmit={onSubmit} className="space-y-4">
                                <div className={`text-sm font-medium px-3 py-2 rounded-lg ${action === 'approve' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                    {action === 'approve' ? 'Approbation de la réclamation' : 'Rejet de la réclamation'}
                                </div>

                                {action === 'approve' && (
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700">Note corrigée *</label>
                                        <div className="relative w-40">
                                            <Input
                                                type="number" min={0} max={maxScore} step={0.25}
                                                value={data.corrected_score}
                                                onChange={e => setData('corrected_score', e.target.value)}
                                                className={`pr-12 ${errors.corrected_score ? 'border-red-400' : ''}`}
                                                placeholder="0"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">/{maxScore}</span>
                                        </div>
                                        {errors.corrected_score && <p className="text-xs text-red-500">{errors.corrected_score}</p>}
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">
                                        {action === 'approve' ? 'Note interne (optionnel)' : 'Motif du rejet'}
                                    </label>
                                    <textarea
                                        value={data.correction_note}
                                        onChange={e => setData('correction_note', e.target.value)}
                                        rows={3}
                                        placeholder={action === 'approve' ? 'Remarques éventuelles...' : 'Expliquez pourquoi la réclamation est rejetée...'}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button type="submit" className={action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'} disabled={processing}>
                                        {processing ? 'Enregistrement...' : action === 'approve' ? 'Confirmer l\'approbation' : 'Confirmer le rejet'}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setAction(null)}>
                                        Annuler
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
