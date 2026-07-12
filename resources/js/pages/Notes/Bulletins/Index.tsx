import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Download, FileSpreadsheet, GraduationCap, Lock, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Classroom { id: string; name: string }
interface Period { id: string; name: string; is_current: boolean }
interface Row {
    student_id: string;
    name: string;
    matricule: string;
    average: number | null;
    rank: number | null;
    mention: string | null;
    validated: boolean;
    report_card_id: string | null;
}

interface Props {
    classrooms: Classroom[];
    periods: Period[];
    rows: Row[];
    activeYear: { id: string; year: string } | null;
    filters: { class_id: string; academic_period_id: string };
}

const ordinal = (r: number | null) => (r === null ? '—' : r === 1 ? '1er' : `${r}e`);

export default function Index({ classrooms, periods, rows, activeYear, filters }: Readonly<Props>) {
    const [classId, setClassId] = useState(filters.class_id || '');
    const [periodId, setPeriodId] = useState(filters.academic_period_id || '');
    const [observations, setObservations] = useState('');
    const [regenerate, setRegenerate] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);

    const reload = (next: { class_id?: string; academic_period_id?: string }) => {
        router.get(route('bulletins.index'), {
            class_id: next.class_id ?? classId,
            academic_period_id: next.academic_period_id ?? periodId,
        }, { preserveScroll: true, replace: true });
    };

    const onClass = (v: string) => { setClassId(v); setPeriodId(''); reload({ class_id: v, academic_period_id: '' }); };
    const onPeriod = (v: string) => { setPeriodId(v); reload({ academic_period_id: v }); };

    const submit = (regen: boolean) => {
        router.post(
            route('bulletins.validate'),
            { class_id: classId, academic_period_id: periodId, observations, regenerate: regen },
            { preserveScroll: true, onFinish: () => { setConfirmOpen(false); setRegenerate(false); } },
        );
    };

    // Re-valider une classe déjà figée : on confirme (les éditions manuelles sont conservées
    // par défaut, sauf « tout régénérer »).
    const onValidateClick = () => {
        if (validatedCount > 0) setConfirmOpen(true);
        else submit(false);
    };

    const download = (studentId: string) => {
        window.open(`${route('bulletins.download', studentId)}?academic_period_id=${periodId}`, '_blank');
    };

    const downloadClass = () => {
        window.open(`${route('bulletins.download-class')}?class_id=${classId}&academic_period_id=${periodId}`, '_blank');
    };

    const confirmDelete = () => {
        if (!deleteTarget?.report_card_id) return;
        router.delete(route('bulletins.destroy', deleteTarget.report_card_id), {
            preserveScroll: true,
            onFinish: () => setDeleteTarget(null),
        });
    };

    const ready = classId !== '' && periodId !== '';
    const validatedCount = rows.filter((r) => r.validated).length;

    return (
        <AppLayout>
            <Head title="Bulletins" />
            <div className="w-full space-y-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                            <FileSpreadsheet className="h-7 w-7 text-blue-600 shrink-0" /> Bulletins
                        </h1>
                        <p className="mt-2 text-gray-500">
                            Générez et figez les bulletins par classe et période{activeYear ? ` — ${activeYear.year}` : ''}.
                        </p>
                    </div>
                    {ready && validatedCount > 0 && (
                        <Button onClick={downloadClass} variant="outline" className="gap-2">
                            <Download className="h-4 w-4" /> Télécharger toute la classe ({validatedCount})
                        </Button>
                    )}
                </div>

                {/* Filtres */}
                <div className="rounded-2xl bg-linear-to-br from-slate-50 to-white p-4 shadow-sm ring-1 ring-slate-100 flex flex-wrap items-center gap-3">
                    <Select value={classId} onValueChange={onClass}>
                        <SelectTrigger className="w-56"><SelectValue placeholder="Choisir une classe" /></SelectTrigger>
                        <SelectContent>
                            {classrooms.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={periodId} onValueChange={onPeriod} disabled={classId === ''}>
                        <SelectTrigger className="w-56"><SelectValue placeholder="Choisir une période" /></SelectTrigger>
                        <SelectContent>
                            {periods.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}{p.is_current ? ' (en cours)' : ''}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                {ready && (
                    <>
                        {/* Validation */}
                        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Lock className="w-4 h-4 text-amber-500" />
                                Valider fige les bulletins (notes, rangs, mentions) et permet le téléchargement PDF.
                                <span className="ml-auto text-xs text-gray-400">{validatedCount}/{rows.length} validé(s)</span>
                            </div>
                            <Input
                                value={observations}
                                onChange={(e) => setObservations(e.target.value)}
                                placeholder="Observations du Chef d'Établissement (appliquées à toute la classe, optionnel)"
                            />
                            <Button onClick={onValidateClick} className="bg-blue-600 hover:bg-blue-700 gap-2" disabled={rows.length === 0}>
                                <CheckCircle2 className="w-4 h-4" />
                                {validatedCount > 0 ? 'Re-valider les bulletins de la classe' : 'Valider les bulletins de la classe'}
                            </Button>
                            {validatedCount > 0 && (
                                <p className="text-xs text-gray-400">
                                    Une re-validation recalcule notes et rangs mais <strong>conserve</strong> vos éditions manuelles (appréciations, observations, décision, discipline).
                                </p>
                            )}
                        </div>

                        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Re-valider {validatedCount} bulletin(s) déjà figé(s) ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Les notes, moyennes et rangs seront recalculés. Par défaut, vos éditions manuelles
                                        (appréciations, observations, décision, discipline) sont <strong>conservées</strong>.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <label className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
                                    <Checkbox checked={regenerate} onCheckedChange={(v) => setRegenerate(v === true)} className="mt-0.5" />
                                    <span className="text-amber-800">
                                        <span className="font-medium">Tout régénérer</span> — repartir de zéro et <strong>effacer</strong> les éditions manuelles.
                                    </span>
                                </label>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => submit(regenerate)}
                                        className={regenerate ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
                                    >
                                        {regenerate ? 'Régénérer (efface les éditions)' : 'Re-valider (conserve les éditions)'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Dévalider le bulletin de {deleteTarget?.name} ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Le bulletin figé sera supprimé, y compris ses éditions manuelles. L'élève repassera
                                        en « brouillon » et pourra être re-validé. Cette action est irréversible.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                                        Dévalider
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        {/* Liste */}
                        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead>Élève</TableHead>
                                        <TableHead className="text-center">Moyenne</TableHead>
                                        <TableHead className="text-center">Rang</TableHead>
                                        <TableHead>Mention</TableHead>
                                        <TableHead className="text-center">Statut</TableHead>
                                        <TableHead className="text-right">Bulletin</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="py-12 text-center text-gray-400">
                                                <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                                Aucun élève actif dans cette classe.
                                            </TableCell>
                                        </TableRow>
                                    ) : rows.map((r) => (
                                        <TableRow key={r.student_id} className="border-b border-slate-100 hover:bg-blue-50/30">
                                            <TableCell>
                                                <div className="font-medium text-gray-900">{r.name}</div>
                                                <div className="text-xs text-gray-400 font-mono">{r.matricule}</div>
                                            </TableCell>
                                            <TableCell className="text-center font-semibold text-gray-800">
                                                {r.average !== null ? `${r.average}/20` : '—'}
                                            </TableCell>
                                            <TableCell className="text-center text-gray-700">{ordinal(r.rank)}</TableCell>
                                            <TableCell className="text-sm text-gray-600">{r.mention ?? '—'}</TableCell>
                                            <TableCell className="text-center">
                                                {r.validated ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                        <CheckCircle2 className="w-3 h-3" /> Validé
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Brouillon</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline" size="sm" className="gap-1.5"
                                                        disabled={!r.validated || !r.report_card_id}
                                                        onClick={() => r.report_card_id && router.get(route('bulletins.edit', r.report_card_id))}
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" /> Éditer
                                                    </Button>
                                                    <Button
                                                        variant="outline" size="sm" className="gap-1.5"
                                                        disabled={!r.validated}
                                                        onClick={() => download(r.student_id)}
                                                    >
                                                        <Download className="w-3.5 h-3.5" /> PDF
                                                    </Button>
                                                    <Button
                                                        variant="outline" size="sm"
                                                        className="gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        disabled={!r.validated || !r.report_card_id}
                                                        onClick={() => setDeleteTarget(r)}
                                                        title="Dévalider ce bulletin"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
