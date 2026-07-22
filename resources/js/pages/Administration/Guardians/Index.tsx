import { Head, router } from '@inertiajs/react';
import { CheckCircle2, ChevronLeft, ChevronRight, Mail, Pencil, Plus, Search, Trash2, Users, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/icon-button';
import { Input } from '@/components/ui/input';
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

export default function Index({ guardians, filters }: Readonly<Props>) {
    const [search, setSearch] = useState(filters.search || '');
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const firstRender = useRef(true);

    // Recherche instantanée (debounce) via paramètre d'URL.
    useEffect(() => {
        if (firstRender.current) { firstRender.current = false; return; }
        const timer = setTimeout(() => {
            router.get(route('guardians.index'), search ? { search } : {}, {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            });
        }, 350);
        return () => clearTimeout(timer);
    }, [search]);

    return (
        <AppLayout>
            <Head title="Accès portail" />
            <div className="w-full space-y-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 flex items-center gap-3"><Users className="h-7 w-7 text-blue-600 shrink-0" /> Accès portail</h1>
                        <p className="mt-2 text-gray-500">Comptes tuteurs et liaison aux élèves pour le portail parents.</p>
                    </div>
                    <Button onClick={() => router.get(route('guardians.create'))} className="gap-2 bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4" /> Nouveau tuteur</Button>
                </div>

                <div className="rounded-2xl bg-linear-to-br from-slate-50 to-white p-4 shadow-sm ring-1 ring-slate-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            placeholder="Rechercher un tuteur (nom, e-mail, téléphone) ou un enfant (matricule, nom)…"
                            className="pl-10 pr-10 border-slate-200"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} aria-label="Effacer la recherche" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
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
                                            <IconButton label="Modifier" icon={<Pencil className="w-3.5 h-3.5" />} onClick={() => router.get(route('guardians.edit', g.id))} />
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
