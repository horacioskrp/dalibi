import { Head, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, History, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Change { field: string; old: string; new: string }
interface Log {
    id: string;
    event: string;
    entity: string;
    label: string | null;
    user: string | null;
    changes: Change[];
    ip_address: string | null;
    created_at: string | null;
}
interface Paginated {
    data: Log[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
}
interface Props {
    logs: Paginated;
    types: Record<string, string>;
    filters: { search: string; event: string; type: string };
}

const EVENT_META: Record<string, { label: string; cls: string }> = {
    created: { label: 'Création', cls: 'bg-emerald-100 text-emerald-700' },
    updated: { label: 'Modification', cls: 'bg-blue-100 text-blue-700' },
    deleted: { label: 'Suppression', cls: 'bg-red-100 text-red-700' },
    restored: { label: 'Restauration', cls: 'bg-amber-100 text-amber-700' },
};

const ALL = '__all__';

export default function Index({ logs, types, filters }: Readonly<Props>) {
    const [search, setSearch] = useState(filters.search || '');

    const apply = (next: Partial<{ search: string; event: string; type: string }>) => {
        router.get(route('audit-logs.index'), {
            search: next.search ?? search,
            event: next.event ?? filters.event,
            type: next.type ?? filters.type,
        }, { preserveScroll: true, replace: true });
    };

    const goToPage = (page: number) => {
        router.get(route('audit-logs.index'), { ...filters, search, page }, { preserveScroll: true });
    };

    return (
        <AppLayout>
            <Head title="Journal d'audit" />
            <div className="w-full space-y-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                        <History className="h-7 w-7 text-blue-600 shrink-0" /> Journal d'audit
                    </h1>
                    <p className="mt-2 text-gray-500">Historique des créations, modifications et suppressions sur les données sensibles.</p>
                </div>

                {/* Filtres */}
                <div className="rounded-2xl bg-linear-to-br from-slate-50 to-white p-4 shadow-sm ring-1 ring-slate-100 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 relative min-w-48">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <Input placeholder="Rechercher (libellé de l'entité)…" className="pl-10 border-slate-200"
                            value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && apply({ search })} />
                    </div>
                    <Select value={filters.event || ALL} onValueChange={(v) => apply({ event: v === ALL ? '' : v })}>
                        <SelectTrigger className="w-44"><SelectValue placeholder="Action" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>Toutes les actions</SelectItem>
                            {Object.entries(EVENT_META).map(([v, m]) => <SelectItem key={v} value={v}>{m.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={filters.type || ALL} onValueChange={(v) => apply({ type: v === ALL ? '' : v })}>
                        <SelectTrigger className="w-44"><SelectValue placeholder="Entité" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>Toutes les entités</SelectItem>
                            {Object.entries(types).map(([v, label]) => <SelectItem key={v} value={v}>{label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button onClick={() => apply({ search })} className="bg-blue-600 hover:bg-blue-700"><Search className="w-4 h-4" /></Button>
                    {(search || filters.event || filters.type) && (
                        <Button variant="outline" className="border-slate-200" onClick={() => { setSearch(''); router.get(route('audit-logs.index'), {}, { replace: true }); }}>
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50 border-b border-slate-200">
                            <TableRow>
                                <TableHead className="text-gray-700 font-semibold">Date</TableHead>
                                <TableHead className="text-gray-700 font-semibold">Auteur</TableHead>
                                <TableHead className="text-gray-700 font-semibold">Action</TableHead>
                                <TableHead className="text-gray-700 font-semibold">Entité</TableHead>
                                <TableHead className="text-gray-700 font-semibold">Modifications</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.data.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="py-12 text-center text-gray-400">
                                    <History className="w-10 h-10 mx-auto mb-2 opacity-30" /> Aucune entrée.
                                </TableCell></TableRow>
                            ) : logs.data.map((log) => {
                                const meta = EVENT_META[log.event] ?? { label: log.event, cls: 'bg-gray-100 text-gray-600' };
                                return (
                                    <TableRow key={log.id} className="border-b border-slate-100 hover:bg-blue-50/30 align-top">
                                        <TableCell className="text-gray-600 whitespace-nowrap">{log.created_at}</TableCell>
                                        <TableCell className="text-gray-700">{log.user ?? <span className="text-gray-400 italic">Système</span>}</TableCell>
                                        <TableCell><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${meta.cls}`}>{meta.label}</span></TableCell>
                                        <TableCell>
                                            <div className="font-medium text-gray-900">{log.entity}</div>
                                            {log.label && <div className="text-xs text-gray-400">{log.label}</div>}
                                        </TableCell>
                                        <TableCell className="text-xs text-gray-600 max-w-md">
                                            {log.changes.length === 0 ? '—' : (
                                                <ul className="space-y-0.5">
                                                    {log.changes.slice(0, 6).map((c) => (
                                                        <li key={c.field}>
                                                            <span className="font-mono text-gray-500">{c.field}</span>
                                                            {log.event === 'updated'
                                                                ? <> : <span className="text-red-500 line-through">{c.old}</span> → <span className="text-emerald-600">{c.new}</span></>
                                                                : <> : {log.event === 'deleted' ? c.old : c.new}</>}
                                                        </li>
                                                    ))}
                                                    {log.changes.length > 6 && <li className="text-gray-400">+{log.changes.length - 6} champ(s)…</li>}
                                                </ul>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                {logs.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">Affichage {logs.from} à {logs.to} sur {logs.total}</p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="border-slate-200" disabled={logs.current_page === 1} onClick={() => goToPage(logs.current_page - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                            <Button variant="outline" size="sm" className="border-slate-200" disabled={logs.current_page === logs.last_page} onClick={() => goToPage(logs.current_page + 1)}><ChevronRight className="w-4 h-4" /></Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
