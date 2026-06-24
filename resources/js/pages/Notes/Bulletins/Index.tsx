import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Download, FileSpreadsheet, GraduationCap, Lock } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
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

    const reload = (next: { class_id?: string; academic_period_id?: string }) => {
        router.get(route('bulletins.index'), {
            class_id: next.class_id ?? classId,
            academic_period_id: next.academic_period_id ?? periodId,
        }, { preserveScroll: true, replace: true });
    };

    const onClass = (v: string) => { setClassId(v); setPeriodId(''); reload({ class_id: v, academic_period_id: '' }); };
    const onPeriod = (v: string) => { setPeriodId(v); reload({ academic_period_id: v }); };

    const validate = () => {
        router.post(route('bulletins.validate'), { class_id: classId, academic_period_id: periodId, observations }, { preserveScroll: true });
    };

    const download = (studentId: string) => {
        window.open(`${route('bulletins.download', studentId)}?academic_period_id=${periodId}`, '_blank');
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
                            <Button onClick={validate} className="bg-blue-600 hover:bg-blue-700 gap-2" disabled={rows.length === 0}>
                                <CheckCircle2 className="w-4 h-4" /> Valider les bulletins de la classe
                            </Button>
                        </div>

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
                                                <Button
                                                    variant="outline" size="sm" className="gap-1.5"
                                                    disabled={!r.validated}
                                                    onClick={() => download(r.student_id)}
                                                >
                                                    <Download className="w-3.5 h-3.5" /> PDF
                                                </Button>
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
