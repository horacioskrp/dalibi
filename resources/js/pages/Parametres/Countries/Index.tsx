import { Head, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Eye, Globe, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/icon-button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Country {
    id: string;
    name: string;
    code: string;
    created_at: string;
}

interface PaginatedCountries {
    data: Country[];
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

interface IndexProps {
    countries: PaginatedCountries;
    filters: { search?: string };
}

export default function Index({ countries, filters }: Readonly<IndexProps>) {
    const [search, setSearch] = useState(filters.search || '');
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const doSearch = () => router.get(route('countries.index'), { search }, { preserveScroll: true, replace: true });
    const clearSearch = () => { setSearch(''); router.get(route('countries.index'), {}, { preserveScroll: true, replace: true }); };

    return (
        <AppLayout>
            <Head title="Pays" />

            <div className="w-full space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                            <Globe className="h-7 w-7 text-blue-600 shrink-0" /> Pays
                        </h1>
                        <p className="mt-2 text-lg text-gray-600">Gérez la liste des pays (nationalités, origines).</p>
                    </div>
                    <Button onClick={() => router.get(route('countries.create'))} className="gap-2 bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-5 h-5" /> Nouveau pays
                    </Button>
                </div>

                <div className="rounded-2xl bg-linear-to-br from-slate-50 to-white p-4 shadow-sm ring-1 ring-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && doSearch()}
                                placeholder="Rechercher un pays (nom, code)…"
                                className="pl-10 pr-10"
                            />
                            {search && (
                                <button onClick={clearSearch} aria-label="Effacer" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        <Button onClick={doSearch} className="bg-blue-600 hover:bg-blue-700">Rechercher</Button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50 border-b border-slate-200">
                            <TableRow>
                                <TableHead className="text-gray-700 font-semibold">Nom</TableHead>
                                <TableHead className="text-gray-700 font-semibold">Code</TableHead>
                                <TableHead className="text-gray-700 font-semibold">Date de création</TableHead>
                                <TableHead className="text-gray-700 font-semibold text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {countries.data.length > 0 ? (
                                countries.data.map((country) => (
                                    <TableRow key={country.id} className="border-b border-slate-100 hover:bg-blue-50/30">
                                        <TableCell className="font-semibold text-gray-900">{country.name}</TableCell>
                                        <TableCell className="text-gray-600">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">{country.code}</span>
                                        </TableCell>
                                        <TableCell className="text-gray-600">{new Date(country.created_at).toLocaleDateString('fr-FR')}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <IconButton label="Voir" icon={<Eye className="w-4 h-4" />} className="border-slate-200 text-gray-700 hover:bg-gray-100" onClick={() => router.get(route('countries.show', country.id))} />
                                                <IconButton label="Modifier" icon={<Pencil className="w-4 h-4" />} className="border-slate-200 text-gray-700 hover:bg-gray-100" onClick={() => router.get(route('countries.edit', country.id))} />
                                                <IconButton label="Supprimer" icon={<Trash2 className="w-4 h-4" />} className="border-slate-200 text-gray-700 hover:bg-red-50 hover:text-red-600" onClick={() => setDeleteId(country.id)} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8">
                                        <p className="text-gray-600 font-medium">Aucun pays trouvé</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {countries.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">Affichage {countries.from} à {countries.to} sur {countries.total}</p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="border-slate-200" disabled={countries.current_page === 1} onClick={() => router.get(route('countries.index'), { search, page: countries.current_page - 1 }, { preserveScroll: true })}>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="border-slate-200" disabled={countries.current_page === countries.last_page} onClick={() => router.get(route('countries.index'), { search, page: countries.current_page + 1 }, { preserveScroll: true })}>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer ce pays ?</AlertDialogTitle>
                        <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-end gap-2">
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteId && router.delete(route('countries.destroy', deleteId), { preserveScroll: true, onSuccess: () => setDeleteId(null) })}>
                            Supprimer
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
