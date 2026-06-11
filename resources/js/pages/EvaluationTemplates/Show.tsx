import { Head, router } from '@inertiajs/react';
import { ArrowLeft, BookOpen, CheckCircle2, ClipboardList, Layers, Pencil, Play, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface ClassSubject {
    id: string;
    coefficient: number;
    class: { id: string; name: string; code: string };
    subject: { id: string; name: string };
}

interface EvalRow {
    id: string;
    status: 'scheduled' | 'completed';
    date: string | null;
    marks_count: number;
    graded_count: number;
    class_subject: ClassSubject;
}

interface Template {
    id: string;
    name: string;
    coefficient: number;
    max_score: number;
    date: string | null;
    description: string | null;
    academic_period: { name: string };
    evaluation_type: { name: string };
}

interface Props {
    template: Template;
    evaluations: EvalRow[];
    availableClassSubjects: ClassSubject[];
}

export default function Show({ template, evaluations, availableClassSubjects }: Readonly<Props>) {
    const [selected, setSelected]       = useState<string[]>([]);
    const [generating, setGenerating]   = useState(false);
    const [deleteId, setDeleteId]       = useState<string | null>(null);
    const [showSelector, setShowSelector] = useState(false);

    const toggleSelect = (id: string) =>
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const selectAll = () =>
        setSelected(prev => prev.length === availableClassSubjects.length ? [] : availableClassSubjects.map(cs => cs.id));

    const handleGenerate = () => {
        if (selected.length === 0) return;
        setGenerating(true);
        router.post(
            route('evaluation-templates.generate', template.id),
            { class_subject_ids: selected },
            {
                preserveScroll: true,
                onSuccess: () => { setGenerating(false); setSelected([]); setShowSelector(false); },
                onError:   () => setGenerating(false),
            },
        );
    };

    const onDeleteEval = (id: string) => {
        router.delete(route('evaluations.destroy', id), {
            preserveScroll: true,
            onSuccess: () => setDeleteId(null),
        });
    };

    const statusLabel = (s: string) => s === 'completed' ? 'Terminée' : 'Planifiée';

    return (
        <AppLayout>
            <Head title={`Modèle : ${template.name}`} />

            <div className="max-w-7xl space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => router.get(route('evaluation-templates.index'))}>
                            <ArrowLeft className="w-4 h-4" /> Retour
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{template.name}</h1>
                            <p className="text-gray-500 mt-1">
                                {template.academic_period.name} · {template.evaluation_type.name}
                                · Coeff. {Number(template.coefficient).toFixed(2)}
                                · /{Number(template.max_score).toFixed(0)}
                                {template.date && ` · ${new Date(template.date).toLocaleDateString('fr-FR')}`}
                            </p>
                            {template.description && <p className="text-sm text-gray-400 mt-1 italic">{template.description}</p>}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="gap-2" onClick={() => router.get(route('evaluation-templates.edit', template.id))}>
                            <Pencil className="w-4 h-4" /> Modifier
                        </Button>
                        <Button
                            className="gap-2 bg-blue-600 hover:bg-blue-700"
                            onClick={() => setShowSelector(v => !v)}
                            disabled={availableClassSubjects.length === 0}
                        >
                            <Plus className="w-4 h-4" />
                            Déployer vers des classes
                            {availableClassSubjects.length > 0 && (
                                <span className="ml-1 bg-white/20 rounded px-1.5 text-xs">{availableClassSubjects.length}</span>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Sélecteur de déploiement */}
                {showSelector && availableClassSubjects.length > 0 && (
                    <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                                <Layers className="w-4 h-4" />
                                Sélectionner les classes/matières à déployer
                            </h3>
                            <button onClick={selectAll} className="text-xs text-blue-600 hover:underline">
                                {selected.length === availableClassSubjects.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                            {availableClassSubjects.map(cs => (
                                <label key={cs.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                                    selected.includes(cs.id)
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white border-gray-200 hover:border-blue-400'
                                }`}>
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(cs.id)}
                                        onChange={() => toggleSelect(cs.id)}
                                        className="sr-only"
                                    />
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm truncate">{cs.class.name} ({cs.class.code})</p>
                                        <p className={`text-xs truncate ${selected.includes(cs.id) ? 'text-blue-100' : 'text-gray-500'}`}>
                                            {cs.subject.name} · coeff. matière {cs.coefficient}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 gap-2"
                                disabled={selected.length === 0 || generating}
                                onClick={handleGenerate}
                            >
                                <Play className="w-4 h-4" />
                                {generating ? 'Génération...' : `Générer ${selected.length} évaluation${selected.length > 1 ? 's' : ''}`}
                            </Button>
                            <Button variant="outline" onClick={() => { setShowSelector(false); setSelected([]); }}>Annuler</Button>
                        </div>
                    </div>
                )}

                {/* Liste des évaluations générées */}
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                            <ClipboardList className="w-5 h-5 text-blue-500" />
                            Évaluations générées
                            <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">{evaluations.length}</span>
                        </h2>
                    </div>
                    {evaluations.length === 0 ? (
                        <div className="py-16 text-center text-gray-400">
                            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p>Aucune évaluation déployée. Utilisez le bouton ci-dessus pour déployer ce modèle.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead>Classe</TableHead>
                                    <TableHead>Matière</TableHead>
                                    <TableHead className="text-center">Coeff. matière</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead className="text-center">Progression</TableHead>
                                    <TableHead className="text-center w-32">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {evaluations.map(ev => {
                                    const pct = ev.marks_count > 0 ? Math.round((ev.graded_count / ev.marks_count) * 100) : 0;
                                    return (
                                        <TableRow key={ev.id} className="hover:bg-blue-50/20 transition-colors">
                                            <TableCell className="font-medium text-gray-900">
                                                {ev.class_subject.class.name}
                                                <span className="ml-1 text-xs text-gray-400">({ev.class_subject.class.code})</span>
                                            </TableCell>
                                            <TableCell className="text-gray-600">{ev.class_subject.subject.name}</TableCell>
                                            <TableCell className="text-center font-mono text-gray-600">{ev.class_subject.coefficient}</TableCell>
                                            <TableCell className="text-gray-500 text-sm">
                                                {ev.date ? new Date(ev.date).toLocaleDateString('fr-FR') : '—'}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    ev.status === 'completed'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {ev.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : null}
                                                    {statusLabel(ev.status)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 min-w-16">
                                                        <div
                                                            className={`h-1.5 rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-500 whitespace-nowrap">{ev.graded_count}/{ev.marks_count}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-center gap-1.5">
                                                    <Button
                                                        variant="outline" size="sm" className="gap-1 text-xs"
                                                        onClick={() => router.get(route('marks.index', ev.id))}
                                                    >
                                                        <ClipboardList className="w-3.5 h-3.5" /> Notes
                                                    </Button>
                                                    <Button
                                                        variant="outline" size="sm"
                                                        className="border-red-200 text-red-500 hover:bg-red-50"
                                                        onClick={() => setDeleteId(ev.id)}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette évaluation ?</AlertDialogTitle>
                        <AlertDialogDescription>Toutes les notes saisies pour cette évaluation seront perdues.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-end gap-2">
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteId && onDeleteEval(deleteId)}>
                            Supprimer
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
