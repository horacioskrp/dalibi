import { Head, router, usePage } from '@inertiajs/react';
import { CalendarDays, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Event {
    id: string;
    title: string;
    description: string | null;
    type: string;
    start_date: string;
    end_date: string | null;
    all_day: boolean;
    start_time: string | null;
    end_time: string | null;
    color: string | null;
}
interface Year { id: string; year: string }
interface Props {
    events: Event[];
    types: Record<string, string>;
    academicYears: Year[];
    activeYear: { id: string; year: string } | null;
    filters: { academic_year_id: string; type: string };
}

const TYPE_META: Record<string, string> = {
    holiday: 'bg-emerald-100 text-emerald-700',
    exam: 'bg-red-100 text-red-700',
    meeting: 'bg-violet-100 text-violet-700',
    event: 'bg-blue-100 text-blue-700',
    other: 'bg-gray-100 text-gray-600',
};
const ALL = '__all__';

const emptyForm = (): Omit<Event, 'id' | 'color'> => ({
    title: '', description: '', type: 'event',
    start_date: new Date().toISOString().slice(0, 10), end_date: '',
    all_day: true, start_time: '', end_time: '',
});

const monthLabel = (ym: string) => {
    const [y, m] = ym.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
};
const dayLabel = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' });

export default function Index({ events, types, academicYears, activeYear, filters }: Readonly<Props>) {
    const perms = (usePage().props.auth?.permissions ?? []) as string[];
    const canCreate = perms.includes('create_calendar');
    const canEdit = perms.includes('edit_calendar');
    const canDelete = perms.includes('delete_calendar');

    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm());
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const reload = (next: Partial<{ academic_year_id: string; type: string }>) => {
        router.get(route('calendar.index'), {
            academic_year_id: next.academic_year_id ?? filters.academic_year_id,
            type: next.type ?? filters.type,
        }, { preserveScroll: true, replace: true });
    };

    const openCreate = () => { setEditingId(null); setForm(emptyForm()); setErrors({}); setOpen(true); };
    const openEdit = (e: Event) => {
        setEditingId(e.id);
        setForm({ title: e.title, description: e.description ?? '', type: e.type, start_date: e.start_date, end_date: e.end_date ?? '', all_day: e.all_day, start_time: e.start_time ?? '', end_time: e.end_time ?? '' });
        setErrors({});
        setOpen(true);
    };

    const submit = (ev: React.FormEvent) => {
        ev.preventDefault();
        const payload = { ...form, end_date: form.end_date || null, start_time: form.start_time || null, end_time: form.end_time || null };
        const opts = {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
            onError: (e: Record<string, string>) => setErrors(e),
        };
        if (editingId) router.put(route('calendar.update', editingId), payload, opts);
        else router.post(route('calendar.store'), payload, opts);
    };

    // Regroupement par mois
    const byMonth = events.reduce<Record<string, Event[]>>((acc, e) => {
        const key = e.start_date.slice(0, 7);
        (acc[key] ??= []).push(e);
        return acc;
    }, {});
    const months = Object.keys(byMonth).sort();

    return (
        <AppLayout>
            <Head title="Calendrier" />
            <div className="w-full space-y-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                            <CalendarDays className="h-7 w-7 text-blue-600 shrink-0" /> Calendrier académique
                        </h1>
                        <p className="mt-2 text-gray-500">Congés, examens, réunions et événements{activeYear ? ` — ${activeYear.year}` : ''}.</p>
                    </div>
                    {canCreate && (
                        <Button onClick={openCreate} className="gap-2 bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4" /> Nouvel événement</Button>
                    )}
                </div>

                {/* Filtres */}
                <div className="rounded-2xl bg-linear-to-br from-slate-50 to-white p-4 shadow-sm ring-1 ring-slate-100 flex flex-wrap gap-2 items-center">
                    <Select value={filters.academic_year_id || ''} onValueChange={(v) => reload({ academic_year_id: v })}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="Année" /></SelectTrigger>
                        <SelectContent>{academicYears.map((y) => <SelectItem key={y.id} value={y.id}>{y.year}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={filters.type || ALL} onValueChange={(v) => reload({ type: v === ALL ? '' : v })}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="Type" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>Tous les types</SelectItem>
                            {Object.entries(types).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                {/* Agenda */}
                {months.length === 0 ? (
                    <div className="rounded-2xl bg-white p-12 text-center text-gray-400 ring-1 ring-slate-100 shadow-sm">
                        <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" /> Aucun événement.
                    </div>
                ) : months.map((m) => (
                    <div key={m} className="space-y-2">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 capitalize">{monthLabel(m)}</h2>
                        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 divide-y divide-slate-50">
                            {byMonth[m].map((e) => (
                                <div key={e.id} className="flex items-start gap-4 px-5 py-3.5 hover:bg-slate-50/50">
                                    <div className="w-28 shrink-0 text-sm text-gray-600">
                                        <div className="font-medium capitalize">{dayLabel(e.start_date)}</div>
                                        {e.end_date && e.end_date !== e.start_date && <div className="text-xs text-gray-400">→ {dayLabel(e.end_date)}</div>}
                                        {!e.all_day && e.start_time && <div className="text-xs text-gray-400">{e.start_time}{e.end_time ? `–${e.end_time}` : ''}</div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_META[e.type] ?? TYPE_META.other}`}>{types[e.type] ?? e.type}</span>
                                            <span className="font-medium text-gray-900 truncate">{e.title}</span>
                                        </div>
                                        {e.description && <p className="text-sm text-gray-500 mt-0.5">{e.description}</p>}
                                    </div>
                                    {(canEdit || canDelete) && (
                                        <div className="flex items-center gap-1 shrink-0">
                                            {canEdit && <Button variant="outline" size="sm" onClick={() => openEdit(e)}><Pencil className="w-3.5 h-3.5" /></Button>}
                                            {canDelete && <Button variant="outline" size="sm" className="border-red-200 text-red-500 hover:bg-red-50" onClick={() => setDeleteId(e.id)}><Trash2 className="w-3.5 h-3.5" /></Button>}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Dialog création/édition */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Modifier l\'événement' : 'Nouvel événement'}</DialogTitle>
                        <DialogDescription>Renseignez les informations de l'événement.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4 py-1">
                        <div className="space-y-1.5">
                            <Label className="text-sm">Titre *</Label>
                            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={errors.title ? 'border-red-400' : ''} />
                            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm">Type</Label>
                            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{Object.entries(types).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-sm">Début *</Label>
                                <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className={errors.start_date ? 'border-red-400' : ''} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm">Fin</Label>
                                <Input type="date" value={form.end_date ?? ''} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className={errors.end_date ? 'border-red-400' : ''} />
                                {errors.end_date && <p className="text-xs text-red-500">{errors.end_date}</p>}
                            </div>
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                            <Checkbox checked={form.all_day} onCheckedChange={(v) => setForm({ ...form, all_day: Boolean(v) })} /> Toute la journée
                        </label>
                        {!form.all_day && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5"><Label className="text-sm">Heure début</Label><Input type="time" value={form.start_time ?? ''} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></div>
                                <div className="space-y-1.5"><Label className="text-sm">Heure fin</Label><Input type="time" value={form.end_time ?? ''} onChange={(e) => setForm({ ...form, end_time: e.target.value })} /></div>
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <Label className="text-sm">Description</Label>
                            <Textarea rows={2} value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">{editingId ? 'Enregistrer' : 'Ajouter'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cet événement ?</AlertDialogTitle>
                        <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-end gap-2">
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteId && router.delete(route('calendar.destroy', deleteId), { preserveScroll: true, onSuccess: () => setDeleteId(null) })}>Supprimer</AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
