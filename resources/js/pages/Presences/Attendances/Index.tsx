import { Head, router } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, ChevronRight, Clock, Save, UserCheck, UserX, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Classroom { id: string; name: string; code: string; }
interface Period    { id: string; name: string; }
interface Student  { id: string; firstname: string; lastname: string; matricule: string; }

interface StudentStatus {
    student_id: string;
    student: Student;
    record_id: string | null;
    status: 'present' | 'absent' | 'late' | 'excused';
    minutes_late: number | null;
    comment: string | null;
    has_permission: boolean;
    permission_dates: string | null;
}

interface ExistingAttendance { id: string; session: string; notes: string | null; }

interface Props {
    classrooms: Classroom[];
    periods: Period[];
    studentsWithStatus: StudentStatus[];
    existingAttendance: ExistingAttendance | null;
    filters: { classroomId: string; periodId: string; date: string; session: string };
    activeYear: { year: string } | null;
}

const STATUS_CONFIG = {
    present: { label: 'Présent',  color: 'bg-emerald-100 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
    absent:  { label: 'Absent',   color: 'bg-red-100 text-red-700 ring-red-200',             dot: 'bg-red-500' },
    late:    { label: 'Retard',   color: 'bg-amber-100 text-amber-700 ring-amber-200',       dot: 'bg-amber-500' },
    excused: { label: 'Excusé',   color: 'bg-blue-100 text-blue-700 ring-blue-200',          dot: 'bg-blue-500' },
} as const;

type StatusKey = keyof typeof STATUS_CONFIG;

export default function Index({ classrooms, periods, studentsWithStatus, existingAttendance, filters, activeYear }: Readonly<Props>) {
    const [classroomId, setClassroomId] = useState(filters.classroomId ?? '');
    const [periodId, setPeriodId]       = useState(filters.periodId ?? '');
    const [date, setDate]               = useState(filters.date ?? new Date().toISOString().substring(0, 10));
    const [session, setSession]         = useState(filters.session ?? 'journee');
    const [records, setRecords]         = useState<Record<string, { status: StatusKey; minutes_late: string; comment: string }>>({});
    const [notes, setNotes]             = useState('');
    const [saving, setSaving]           = useState(false);
    const [saved, setSaved]             = useState(false);

    useEffect(() => {
        const init: typeof records = {};
        for (const s of studentsWithStatus) {
            init[s.student_id] = {
                status:      s.status,
                minutes_late: s.minutes_late !== null ? String(s.minutes_late) : '',
                comment:     s.comment ?? '',
            };
        }
        setRecords(init);
        setNotes(existingAttendance?.notes ?? '');
        setSaved(false);
    }, [studentsWithStatus, existingAttendance]);

    const applyFilters = (overrides: Record<string, string> = {}) => {
        router.get(route('attendances.index'), {
            classroom_id: overrides.classroomId ?? classroomId,
            period_id:    overrides.periodId    ?? periodId,
            date:         overrides.date        ?? date,
            session:      overrides.session     ?? session,
        }, { preserveScroll: true, replace: true });
    };

    const setStatus = (studentId: string, status: StatusKey) => {
        setRecords(r => ({ ...r, [studentId]: { ...r[studentId], status } }));
        setSaved(false);
    };

    const setAll = (status: StatusKey) => {
        setRecords(r => {
            const next = { ...r };
            for (const id of Object.keys(next)) next[id] = { ...next[id], status };
            return next;
        });
        setSaved(false);
    };

    const onSave = () => {
        if (!classroomId || !periodId) return;
        setSaving(true);
        const payload = studentsWithStatus.map(s => ({
            student_id:   s.student_id,
            status:       records[s.student_id]?.status ?? 'present',
            minutes_late: records[s.student_id]?.status === 'late' ? (records[s.student_id]?.minutes_late || null) : null,
            comment:      records[s.student_id]?.comment || null,
        }));
        router.post(route('attendances.store'), {
            class_id: classroomId, academic_period_id: periodId,
            date, session, notes: notes || null, records: payload,
        }, {
            preserveScroll: true,
            onSuccess: () => { setSaved(true); setSaving(false); },
            onError:   () => setSaving(false),
        });
    };

    const presentCount = Object.values(records).filter(r => r.status === 'present').length;
    const absentCount  = Object.values(records).filter(r => r.status === 'absent').length;
    const lateCount    = Object.values(records).filter(r => r.status === 'late').length;
    const excusedCount = Object.values(records).filter(r => r.status === 'excused').length;
    const total        = studentsWithStatus.length;

    return (
        <AppLayout>
            <Head title="Saisie des présences" />
            <div className="w-full space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Saisie des présences</h1>
                        <p className="mt-2 text-lg text-gray-600">Enregistrez l'appel quotidien par classe</p>
                    </div>
                    <Button variant="outline" className="gap-2" onClick={() => router.get(route('attendances.stats'))}>
                        <ChevronRight className="w-4 h-4" /> Statistiques
                    </Button>
                </div>

                {/* Filtres */}
                <div className="rounded-2xl bg-slate-50/70 ring-1 ring-slate-200 shadow-sm p-4 flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-44">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Classe</label>
                        <Select value={classroomId || 'none'} onValueChange={v => {
                            const val = v === 'none' ? '' : v;
                            setClassroomId(val);
                            applyFilters({ classroomId: val });
                        }}>
                            <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">— Classe —</SelectItem>
                                {classrooms.map(c => <SelectItem key={c.id} value={c.id}>{c.name} ({c.code})</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="min-w-44">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Période</label>
                        <Select value={periodId || 'none'} onValueChange={v => {
                            const val = v === 'none' ? '' : v;
                            setPeriodId(val);
                            applyFilters({ periodId: val });
                        }}>
                            <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">— Période —</SelectItem>
                                {periods.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="min-w-36">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Date</label>
                        <Input type="date" value={date} onChange={e => { setDate(e.target.value); applyFilters({ date: e.target.value }); }} />
                    </div>
                    <div className="min-w-36">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Session</label>
                        <Select value={session} onValueChange={v => { setSession(v); applyFilters({ session: v }); }}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="journee">Journée entière</SelectItem>
                                <SelectItem value="matin">Matin</SelectItem>
                                <SelectItem value="apres-midi">Après-midi</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Alerte si pas de classe/période */}
                {(!classroomId || !periodId) && (
                    <div className="flex items-center gap-3 bg-amber-50 ring-1 ring-amber-200 rounded-2xl px-5 py-4">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                        <p className="text-sm text-amber-800">Sélectionnez une classe et une période pour commencer l'appel.</p>
                    </div>
                )}

                {/* Bandeau appel existant */}
                {existingAttendance && (
                    <div className="flex items-center gap-3 bg-emerald-50 ring-1 ring-emerald-200 rounded-2xl px-5 py-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <p className="text-sm text-emerald-800 font-medium">Appel déjà enregistré pour ce créneau — vous pouvez le modifier.</p>
                    </div>
                )}

                {/* Stats rapides + actions groupées */}
                {studentsWithStatus.length > 0 && (
                    <div className="flex flex-wrap gap-3 items-center justify-between">
                        <div className="flex gap-3 flex-wrap">
                            {(['present', 'absent', 'late', 'excused'] as StatusKey[]).map(s => (
                                <div key={s} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ring-1 text-sm font-medium ${STATUS_CONFIG[s].color}`}>
                                    <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s].dot}`} />
                                    {STATUS_CONFIG[s].label} :&nbsp;
                                    <strong>{s === 'present' ? presentCount : s === 'absent' ? absentCount : s === 'late' ? lateCount : excusedCount}</strong>
                                    /{total}
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-1 text-xs text-emerald-700 border-emerald-200" onClick={() => setAll('present')}>
                                <UserCheck className="w-3.5 h-3.5" /> Tous présents
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1 text-xs text-red-600 border-red-200" onClick={() => setAll('absent')}>
                                <UserX className="w-3.5 h-3.5" /> Tous absents
                            </Button>
                        </div>
                    </div>
                )}

                {/* Table */}
                {classroomId && periodId && (
                    studentsWithStatus.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 py-20 text-center text-gray-400">
                            <UserX className="w-10 h-10 mx-auto mb-2 opacity-20" />
                            <p>Aucun élève inscrit dans cette classe pour l'année active.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead className="w-8">#</TableHead>
                                        <TableHead>Matricule</TableHead>
                                        <TableHead>Élève</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="w-32">Retard (min)</TableHead>
                                        <TableHead>Observation</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {studentsWithStatus.map((s, i) => {
                                        const rec = records[s.student_id];
                                        const status = rec?.status ?? 'present';
                                        return (
                                            <TableRow key={s.student_id} className={`transition-colors ${
                                                status === 'absent'  ? 'bg-red-50/30' :
                                                status === 'late'    ? 'bg-amber-50/30' :
                                                status === 'excused' ? 'bg-blue-50/20' : ''
                                            }`}>
                                                <TableCell className="text-gray-400 text-xs">{i + 1}</TableCell>
                                                <TableCell className="font-mono text-xs text-gray-500">{s.student.matricule}</TableCell>
                                                <TableCell className="font-medium text-gray-900">
                                                    {s.student.lastname} {s.student.firstname}
                                                    {s.has_permission && (
                                                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                                                            Permission {s.permission_dates}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1 flex-wrap">
                                                        {(['present', 'absent', 'late', 'excused'] as StatusKey[]).map(st => (
                                                            <button
                                                                key={st}
                                                                onClick={() => setStatus(s.student_id, st)}
                                                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ring-1 transition-all ${
                                                                    status === st
                                                                        ? STATUS_CONFIG[st].color + ' ring-1'
                                                                        : 'bg-gray-50 text-gray-500 ring-gray-200 hover:ring-gray-300'
                                                                }`}
                                                            >
                                                                {STATUS_CONFIG[st].label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {status === 'late' ? (
                                                        <Input
                                                            type="number" min={1} max={240}
                                                            value={rec?.minutes_late ?? ''}
                                                            onChange={e => setRecords(r => ({ ...r, [s.student_id]: { ...r[s.student_id], minutes_late: e.target.value } }))}
                                                            className="h-7 text-xs w-24"
                                                            placeholder="min"
                                                        />
                                                    ) : <span className="text-gray-300 text-xs">—</span>}
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        value={rec?.comment ?? ''}
                                                        onChange={e => { setRecords(r => ({ ...r, [s.student_id]: { ...r[s.student_id], comment: e.target.value } })); setSaved(false); }}
                                                        placeholder="Observation..."
                                                        className="text-sm h-7 max-w-xs"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>

                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                                <Input
                                    value={notes}
                                    onChange={e => { setNotes(e.target.value); setSaved(false); }}
                                    placeholder="Remarques générales sur l'appel..."
                                    className="max-w-sm text-sm"
                                />
                                <Button
                                    className={`gap-2 ${saved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                    onClick={onSave}
                                    disabled={saving}
                                >
                                    {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                    {saving ? 'Enregistrement...' : saved ? 'Enregistré !' : 'Enregistrer l\'appel'}
                                </Button>
                            </div>
                        </div>
                    )
                )}
            </div>
        </AppLayout>
    );
}
