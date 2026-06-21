import { Head, router, useForm } from '@inertiajs/react';
import { Award, CalendarDays, Eye, GraduationCap, MapPin, Plus, Search, Trash2, Users, X } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Exam {
    id: string; type: string; type_label: string; name: string; year: number;
    session: string; exam_date: string | null; center: string | null; status: string;
    total: number; admis: number;
}
interface Year { id: string; year: string; active: boolean; }

interface Props {
    exams: Exam[];
    years: Year[];
    activeYear: { id: string; year: string } | null;
    types: Record<string, string>;
    sessions: Record<string, string>;
    statuses: Record<string, string>;
    filters: { academic_year_id: string; type: string; session: string; status: string; search: string };
}

const ALL = 'all';
const STATUS_STYLE: Record<string, string> = {
    ouvert: 'bg-emerald-100 text-emerald-700', clos: 'bg-amber-100 text-amber-700', termine: 'bg-gray-100 text-gray-600',
};

export default function Index({ exams, years, activeYear, types, sessions, statuses, filters }: Readonly<Props>) {
    const [createOpen, setCreateOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [yearId, setYearId]   = useState(filters.academic_year_id || (activeYear?.id ?? ''));
    const [type, setType]       = useState(filters.type || ALL);
    const [session, setSession] = useState(filters.session || ALL);
    const [status, setStatus]   = useState(filters.status || ALL);
    const [search, setSearch]   = useState(filters.search || '');

    const apply = (ov: Record<string, string> = {}) => {
        const clean = (v: string) => (v === ALL ? '' : v);
        router.get(route('official-exams.index'), {
            academic_year_id: ov.academic_year_id ?? yearId,
            type:    clean(ov.type ?? type),
            session: clean(ov.session ?? session),
            status:  clean(ov.status ?? status),
            search:  ov.search ?? search,
        }, { preserveScroll: true, replace: true });
    };

    const resetFilters = () => {
        setType(ALL); setSession(ALL); setStatus(ALL); setSearch('');
        router.get(route('official-exams.index'), { academic_year_id: yearId }, { preserveScroll: true, replace: true });
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'bepc', name: '', year: new Date().getFullYear(), session: 'normale', exam_date: '', center: '', status: 'ouvert',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('official-exams.store'), { onSuccess: () => { setCreateOpen(false); reset(); } });
    };

    const activeFilters = [type, session, status].filter(v => v !== ALL).length + (search ? 1 : 0);

    return (
        <AppLayout>
            <Head title="Examens officiels" />
            <div className="w-full space-y-6">

                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Examens officiels</h1>
                        <p className="mt-2 text-gray-500">CEPD, BEPC, Baccalauréat — année {activeYear?.year ?? '—'}.</p>
                    </div>
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setCreateOpen(true)}>
                        <Plus className="w-4 h-4" /> Nouvel examen
                    </Button>
                </div>

                {/* Filtres */}
                <div className="rounded-2xl bg-slate-50/70 ring-1 ring-slate-200 shadow-sm p-4 space-y-3">
                    <div className="flex flex-wrap gap-3 items-end">
                        <div className="min-w-44">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Année académique</label>
                            <Select value={yearId} onValueChange={v => { setYearId(v); apply({ academic_year_id: v }); }}>
                                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {years.map(y => <SelectItem key={y.id} value={y.id}>{y.year}{y.active ? ' (active)' : ''}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="relative flex-1 min-w-48">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Recherche</label>
                            <Search className="absolute left-3 top-9 w-4 h-4 text-gray-400" />
                            <Input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && apply()} placeholder="Nom de l'examen..." className="pl-9 bg-white" />
                        </div>
                        <div className="min-w-36">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Type</label>
                            <Select value={type} onValueChange={v => { setType(v); apply({ type: v }); }}>
                                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL}>Tous</SelectItem>
                                    {Object.keys(types).map(k => <SelectItem key={k} value={k}>{k.toUpperCase()}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="min-w-36">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Session</label>
                            <Select value={session} onValueChange={v => { setSession(v); apply({ session: v }); }}>
                                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL}>Toutes</SelectItem>
                                    {Object.entries(sessions).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="min-w-36">
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Statut</label>
                            <Select value={status} onValueChange={v => { setStatus(v); apply({ status: v }); }}>
                                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL}>Tous</SelectItem>
                                    {Object.entries(statuses).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {activeFilters > 0 && (
                        <button onClick={resetFilters} className="text-xs text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                            <X className="w-3 h-3" /> Réinitialiser les filtres ({activeFilters})
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Examen</TableHead>
                                <TableHead>Session</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Centre</TableHead>
                                <TableHead className="text-center">Inscrits</TableHead>
                                <TableHead className="text-center">Admis</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-center w-28">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {exams.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="py-16 text-center text-gray-400">
                                        <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                        Aucun examen pour ces critères.
                                    </TableCell>
                                </TableRow>
                            ) : exams.map(exam => (
                                <TableRow key={exam.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.get(route('official-exams.show', exam.id))}>
                                    <TableCell><span className="text-xs font-bold uppercase text-blue-600">{exam.type}</span></TableCell>
                                    <TableCell className="font-medium text-gray-900">{exam.name}</TableCell>
                                    <TableCell className="text-sm text-gray-600">{sessions[exam.session]}</TableCell>
                                    <TableCell className="text-sm text-gray-600">
                                        {exam.exam_date ? <span className="inline-flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5 text-gray-400" />{new Date(exam.exam_date).toLocaleDateString('fr-FR')}</span> : '—'}
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-600">
                                        {exam.center ? <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-400" />{exam.center}</span> : '—'}
                                    </TableCell>
                                    <TableCell className="text-center text-sm"><span className="inline-flex items-center gap-1 text-gray-600"><Users className="w-3.5 h-3.5 text-gray-400" />{exam.total}</span></TableCell>
                                    <TableCell className="text-center text-sm"><span className="inline-flex items-center gap-1 text-emerald-600"><Award className="w-3.5 h-3.5" />{exam.admis}</span></TableCell>
                                    <TableCell><span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLE[exam.status]}`}>{statuses[exam.status]}</span></TableCell>
                                    <TableCell onClick={e => e.stopPropagation()}>
                                        <div className="flex justify-center gap-1.5">
                                            <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => router.get(route('official-exams.show', exam.id))}>
                                                <Eye className="w-3.5 h-3.5" /> Gérer
                                            </Button>
                                            <Button variant="outline" size="sm" className="border-red-200 text-red-500 hover:bg-red-50" onClick={() => setDeleteId(exam.id)}>
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <p className="text-sm text-gray-400 text-right">{exams.length} examen(s)</p>
            </div>

            {/* Dialog création */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Nouvel examen officiel</DialogTitle></DialogHeader>
                    <form onSubmit={submit} className="space-y-4 py-2">
                        <p className="text-xs text-gray-400">Rattaché à l'année académique active{activeYear ? ` (${activeYear.year})` : ''}.</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Type *</label>
                                <Select value={data.type} onValueChange={v => setData('type', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{Object.keys(types).map(k => <SelectItem key={k} value={k}>{k.toUpperCase()}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Année (calendaire) *</label>
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
                                    <SelectContent>{Object.entries(sessions).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
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
