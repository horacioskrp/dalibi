import { Head, router } from '@inertiajs/react';
import { CheckCircle2, ChevronLeft, ChevronRight, Mail, Pencil, Plus, Search, Trash2, Users, X } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/icon-button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Guardian {
    id: string; first_name: string; last_name: string; name: string;
    email: string; phone: string | null; children_count: number;
    matricules: string[]; is_active: boolean; activated: boolean;
}
interface Paginated { data: Guardian[]; current_page: number; last_page: number; from: number; to: number; total: number }
interface Props { guardians: Paginated; filters: { search: string } }

const emptyForm = () => ({ first_name: '', last_name: '', email: '', phone: '', send_invitation: true });

export default function Index({ guardians, filters }: Readonly<Props>) {
    const [search, setSearch] = useState(filters.search || '');
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm());
    const [matInput, setMatInput] = useState('');
    const [matricules, setMatricules] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const doSearch = () => router.get(route('guardians.index'), { search }, { preserveScroll: true, replace: true });

    const openCreate = () => { setEditId(null); setForm(emptyForm()); setMatricules([]); setMatInput(''); setErrors({}); setOpen(true); };
    const openEdit = (g: Guardian) => {
        setEditId(g.id);
        setForm({ first_name: g.first_name, last_name: g.last_name, email: g.email, phone: g.phone ?? '', send_invitation: false });
        setMatricules(g.matricules); setMatInput(''); setErrors({}); setOpen(true);
    };

    const addMat = () => {
        const m = matInput.trim();
        if (m && !matricules.includes(m)) setMatricules([...matricules, m]);
        setMatInput('');
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...form, student_matricules: matricules };
        const opts = { preserveScroll: true, onSuccess: () => setOpen(false), onError: (er: Record<string, string>) => setErrors(er) };
        if (editId) router.put(route('guardians.update', editId), payload, opts);
        else router.post(route('guardians.store'), payload, opts);
    };

    return (
        <AppLayout>
            <Head title="Accès portail" />
            <div className="w-full space-y-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 flex items-center gap-3"><Users className="h-7 w-7 text-blue-600 shrink-0" /> Accès portail</h1>
                        <p className="mt-2 text-gray-500">Comptes tuteurs et liaison aux élèves pour le portail parents.</p>
                    </div>
                    <Button onClick={openCreate} className="gap-2 bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4" /> Nouveau tuteur</Button>
                </div>

                <div className="rounded-2xl bg-linear-to-br from-slate-50 to-white p-4 shadow-sm ring-1 ring-slate-100 flex gap-2 items-center">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <Input placeholder="Rechercher (nom, e-mail)…" className="pl-10 border-slate-200" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doSearch()} />
                    </div>
                    <Button onClick={doSearch} className="bg-blue-600 hover:bg-blue-700"><Search className="w-4 h-4" /></Button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50 border-b border-slate-200">
                            <TableRow>
                                <TableHead>Tuteur</TableHead>
                                <TableHead>E-mail</TableHead>
                                <TableHead className="text-center">Enfants</TableHead>
                                <TableHead className="text-center">Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {guardians.data.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="py-12 text-center text-gray-400"><Users className="w-10 h-10 mx-auto mb-2 opacity-30" /> Aucun compte tuteur.</TableCell></TableRow>
                            ) : guardians.data.map((g) => (
                                <TableRow key={g.id} className="border-b border-slate-100 hover:bg-blue-50/30">
                                    <TableCell><div className="font-medium text-gray-900">{g.name}</div>{g.phone && <div className="text-xs text-gray-400">{g.phone}</div>}</TableCell>
                                    <TableCell className="text-gray-600">{g.email}</TableCell>
                                    <TableCell className="text-center text-gray-700">{g.children_count}</TableCell>
                                    <TableCell className="text-center">
                                        {g.activated
                                            ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3 h-3" /> Activé</span>
                                            : <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">En attente</span>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1.5">
                                            <IconButton label="Renvoyer l'invitation" icon={<Mail className="w-3.5 h-3.5" />} onClick={() => router.post(route('guardians.invite', g.id), {}, { preserveScroll: true })} />
                                            <IconButton label="Modifier" icon={<Pencil className="w-3.5 h-3.5" />} onClick={() => openEdit(g)} />
                                            <IconButton label="Supprimer" icon={<Trash2 className="w-3.5 h-3.5" />} className="border-red-200 text-red-500 hover:bg-red-50" onClick={() => setDeleteId(g.id)} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {guardians.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">Affichage {guardians.from} à {guardians.to} sur {guardians.total}</p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled={guardians.current_page === 1} onClick={() => router.get(route('guardians.index'), { search, page: guardians.current_page - 1 }, { preserveScroll: true })}><ChevronLeft className="w-4 h-4" /></Button>
                            <Button variant="outline" size="sm" disabled={guardians.current_page === guardians.last_page} onClick={() => router.get(route('guardians.index'), { search, page: guardians.current_page + 1 }, { preserveScroll: true })}><ChevronRight className="w-4 h-4" /></Button>
                        </div>
                    </div>
                )}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editId ? 'Modifier le tuteur' : 'Nouveau tuteur'}</DialogTitle>
                        <DialogDescription>Créez le compte et liez-le à un ou plusieurs élèves (par matricule).</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4 py-1">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5"><Label className="text-sm">Prénom *</Label><Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className={errors.first_name ? 'border-red-400' : ''} /></div>
                            <div className="space-y-1.5"><Label className="text-sm">Nom *</Label><Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className={errors.last_name ? 'border-red-400' : ''} /></div>
                        </div>
                        <div className="space-y-1.5"><Label className="text-sm">E-mail *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={errors.email ? 'border-red-400' : ''} />{errors.email && <p className="text-xs text-red-500">{errors.email}</p>}</div>
                        <div className="space-y-1.5"><Label className="text-sm">Téléphone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                        <div className="space-y-1.5">
                            <Label className="text-sm">Élèves liés (matricule)</Label>
                            <div className="flex gap-2">
                                <Input value={matInput} onChange={(e) => setMatInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMat(); } }} placeholder="Saisir un matricule + Entrée" />
                                <Button type="button" variant="outline" onClick={addMat}>Ajouter</Button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                                {matricules.map((m) => (
                                    <span key={m} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">{m}<button type="button" onClick={() => setMatricules(matricules.filter((x) => x !== m))}><X className="w-3 h-3" /></button></span>
                                ))}
                            </div>
                            {errors['student_matricules.0'] && <p className="text-xs text-red-500">Un matricule est introuvable.</p>}
                        </div>
                        {!editId && (
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox checked={form.send_invitation} onCheckedChange={(v) => setForm({ ...form, send_invitation: Boolean(v) })} /> Envoyer l'invitation par e-mail
                            </label>
                        )}
                        <div className="flex justify-end gap-2 pt-1">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">{editId ? 'Enregistrer' : 'Créer'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Supprimer ce compte tuteur ?</AlertDialogTitle><AlertDialogDescription>L'accès au portail sera révoqué. Les élèves ne sont pas affectés.</AlertDialogDescription></AlertDialogHeader>
                    <div className="flex justify-end gap-2">
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteId && router.delete(route('guardians.destroy', deleteId), { preserveScroll: true, onSuccess: () => setDeleteId(null) })}>Supprimer</AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
