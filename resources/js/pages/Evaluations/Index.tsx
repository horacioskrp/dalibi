import { Head, router } from '@inertiajs/react';
import { CheckCircle2, ClipboardList, ListChecks, Lock, LockOpen, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface EvalRow {
    id: string;
    status: 'scheduled' | 'completed';
    locked_at: string | null;
    date: string | null;
    marks_count: number;
    graded_count: number;
    template: {
        name: string;
        coefficient: number;
        max_score: number;
        academic_period: { name: string };
        evaluation_type: { name: string };
    };
    class_subject: {
        coefficient: number;
        class: { name: string; code: string };
        subject: { name: string };
    };
}

interface Option { id: string; name: string; code?: string }

interface Props {
    evaluations: { data: EvalRow[]; total: number; current_page: number; last_page: number };
    filters: {
        search: string; status: string; period_id: string; template_id: string;
        class_id: string; subject_id: string; evaluation_type_id: string; scheduling: string;
    };
    options: { classrooms: Option[]; subjects: Option[]; evaluationTypes: Option[]; periods: Option[] };
    canLock: boolean;
}

const ALL = 'all';

export default function Index({ evaluations, filters, options, canLock }: Readonly<Props>) {
    const [search, setSearch]   = useState(filters.search ?? '');
    const [status, setStatus]   = useState(filters.status || ALL);
    const [classId, setClassId] = useState(filters.class_id || ALL);
    const [subjectId, setSubjectId] = useState(filters.subject_id || ALL);
    const [evalTypeId, setEvalTypeId] = useState(filters.evaluation_type_id || ALL);
    const [periodId, setPeriodId] = useState(filters.period_id || ALL);
    const [scheduling, setScheduling] = useState(filters.scheduling || ALL);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const apply = (overrides: Record<string, string> = {}) => {
        const v = (key: string, fallback: string) => overrides[key] ?? fallback;
        const clean = (val: string) => (val === ALL ? '' : val);
        router.get(route('evaluations.index'), {
            search:             v('search', search),
            status:             clean(v('status', status)),
            class_id:           clean(v('class_id', classId)),
            subject_id:         clean(v('subject_id', subjectId)),
            evaluation_type_id: clean(v('evaluation_type_id', evalTypeId)),
            period_id:          clean(v('period_id', periodId)),
            scheduling:         clean(v('scheduling', scheduling)),
        }, { preserveScroll: true, replace: true });
    };

    const resetFilters = () => {
        setSearch(''); setStatus(ALL); setClassId(ALL); setSubjectId(ALL);
        setEvalTypeId(ALL); setPeriodId(ALL); setScheduling(ALL);
        router.get(route('evaluations.index'), {}, { preserveScroll: true, replace: true });
    };

    const activeFilterCount = [
        status, classId, subjectId, evalTypeId, periodId, scheduling,
    ].filter(v => v && v !== ALL).length + (search ? 1 : 0);

    const onDelete = (id: string) => {
        router.delete(route('evaluations.destroy', id), {
            preserveScroll: true,
            onSuccess: () => setDeleteId(null),
        });
    };

    const onToggleLock = (id: string) => {
        router.patch(route('evaluations.toggle-lock', id), {}, { preserveScroll: true });
    };

    const statusLabel = (s: string) => s === 'completed' ? 'Terminée' : 'Planifiée';

    return (
        <AppLayout>
            <Head title="Évaluations par classe" />

            <div className="w-full space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Évaluations par classe</h1>
                        <p className="mt-2 text-lg text-gray-600">
                            Évaluations générées depuis les modèles, par classe et matière
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => router.get(route('evaluation-templates.index'))}
                    >
                        <ListChecks className="w-4 h-4" />
                        Gérer les modèles
                    </Button>
                </div>

                {/* Filtres */}
                <div className="rounded-2xl bg-slate-50/70 ring-1 ring-slate-200 shadow-sm p-4 space-y-3">
                    <div className="flex flex-wrap gap-3 items-end">
                        <div className="relative flex-1 min-w-56">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && apply()}
                                placeholder="Classe, matière, modèle..."
                                className="pl-9"
                            />
                            {search && (
                                <button onClick={() => { setSearch(''); apply({ search: '' }); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <Select value={classId} onValueChange={v => { setClassId(v); apply({ class_id: v }); }}>
                            <SelectTrigger className="w-44"><SelectValue placeholder="Classe" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Toutes les classes</SelectItem>
                                {options.classrooms.map(c => <SelectItem key={c.id} value={c.id}>{c.name}{c.code ? ` (${c.code})` : ''}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={subjectId} onValueChange={v => { setSubjectId(v); apply({ subject_id: v }); }}>
                            <SelectTrigger className="w-44"><SelectValue placeholder="Matière" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Toutes les matières</SelectItem>
                                {options.subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={evalTypeId} onValueChange={v => { setEvalTypeId(v); apply({ evaluation_type_id: v }); }}>
                            <SelectTrigger className="w-44"><SelectValue placeholder="Type" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Tous les types</SelectItem>
                                {options.evaluationTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        {options.periods.length > 0 && (
                            <Select value={periodId} onValueChange={v => { setPeriodId(v); apply({ period_id: v }); }}>
                                <SelectTrigger className="w-40"><SelectValue placeholder="Période" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL}>Toutes les périodes</SelectItem>
                                    {options.periods.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}

                        <Select value={status} onValueChange={v => { setStatus(v); apply({ status: v }); }}>
                            <SelectTrigger className="w-40"><SelectValue placeholder="Statut" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Tous les statuts</SelectItem>
                                <SelectItem value="scheduled">Planifiée</SelectItem>
                                <SelectItem value="completed">Terminée</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={scheduling} onValueChange={v => { setScheduling(v); apply({ scheduling: v }); }}>
                            <SelectTrigger className="w-40"><SelectValue placeholder="Planification" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Toutes</SelectItem>
                                <SelectItem value="with">Avec date</SelectItem>
                                <SelectItem value="without">Sans date</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button onClick={() => apply()} className="bg-blue-600 hover:bg-blue-700">Filtrer</Button>
                    </div>

                    {activeFilterCount > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{activeFilterCount} filtre(s) actif(s)</span>
                            <button onClick={resetFilters} className="text-xs text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                                <X className="w-3 h-3" /> Réinitialiser
                            </button>
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead>Modèle</TableHead>
                                <TableHead>Classe</TableHead>
                                <TableHead>Matière</TableHead>
                                <TableHead>Période</TableHead>
                                <TableHead className="text-center">Coeff.</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-center">Progression</TableHead>
                                <TableHead className="text-center w-36">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {evaluations.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="py-16 text-center text-gray-400">
                                        <ListChecks className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                        Aucune évaluation. Créez des modèles et déployez-les par classe.
                                    </TableCell>
                                </TableRow>
                            ) : evaluations.data.map(ev => {
                                const pct      = ev.marks_count > 0 ? Math.round((ev.graded_count / ev.marks_count) * 100) : 0;
                                const isLocked = !!ev.locked_at;
                                return (
                                    <TableRow key={ev.id} className={`transition-colors ${isLocked ? 'bg-red-50/30' : 'hover:bg-blue-50/20'}`}>
                                        <TableCell className="font-semibold text-gray-900">
                                            {ev.template?.name}
                                            {isLocked && (
                                                <span className="ml-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs bg-red-100 text-red-600">
                                                    <Lock className="w-3 h-3" /> Clôturée
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-gray-700">
                                            {ev.class_subject?.class?.name}
                                            <span className="ml-1 text-xs text-gray-400">({ev.class_subject?.class?.code})</span>
                                        </TableCell>
                                        <TableCell className="text-gray-600">{ev.class_subject?.subject?.name}</TableCell>
                                        <TableCell className="text-gray-500 text-sm">{ev.template?.academic_period?.name}</TableCell>
                                        <TableCell className="text-center font-mono text-gray-600">
                                            {Number(ev.template?.coefficient).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-gray-500 text-sm">
                                            {ev.date ? new Date(ev.date).toLocaleDateString('fr-FR') : '—'}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                                ev.status === 'completed'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {ev.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
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
                                                <span className="text-xs text-gray-400 whitespace-nowrap">{ev.graded_count}/{ev.marks_count}</span>
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
                                                {canLock && (
                                                    <Button
                                                        variant="outline" size="sm"
                                                        title={isLocked ? 'Déclôturer' : 'Clôturer'}
                                                        className={isLocked
                                                            ? 'border-red-200 text-red-500 hover:bg-red-50'
                                                            : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                                                        }
                                                        onClick={() => onToggleLock(ev.id)}
                                                    >
                                                        {isLocked ? <Lock className="w-3.5 h-3.5" /> : <LockOpen className="w-3.5 h-3.5" />}
                                                    </Button>
                                                )}
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
                </div>

                <p className="text-sm text-gray-400 text-right">{evaluations.total} évaluation(s) au total</p>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette évaluation ?</AlertDialogTitle>
                        <AlertDialogDescription>Toutes les notes associées seront perdues.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-end gap-2">
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteId && onDelete(deleteId)}>
                            Supprimer
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
