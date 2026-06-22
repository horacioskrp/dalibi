import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Tag as TagIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Tag { id: string; name: string; color: string; documents_count: number; }
interface Props { tags: Tag[]; }

const COLORS = ['#64748b', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function Tags({ tags }: Readonly<Props>) {
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({ name: '', color: COLORS[0] });

    const create = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('archives.tags.store'), { preserveScroll: true, onSuccess: () => reset() });
    };

    const updateColor = (tag: Tag, color: string) => {
        router.put(route('archives.tags.update', tag.id), { name: tag.name, color }, { preserveScroll: true });
    };

    return (
        <AppLayout>
            <Head title="Tags d'archivage" />
            <div className="w-full max-w-3xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <TagIcon className="w-7 h-7 text-blue-600" /> Tags d'archivage
                    </h1>
                    <p className="mt-2 text-gray-500">Organisez les documents archivés par mots-clés réutilisables.</p>
                </div>

                {/* Création */}
                <form onSubmit={create} className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5 flex flex-wrap items-end gap-3">
                    <div className="flex-1 min-w-48 space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Nouveau tag</label>
                        <Input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Ex: Contrat, Inspection…" className={errors.name ? 'border-red-400' : ''} />
                        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Couleur</label>
                        <div className="flex gap-1.5">
                            {COLORS.map(c => (
                                <button type="button" key={c} onClick={() => setData('color', c)}
                                    className={`w-6 h-6 rounded-full ${data.color === c ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                                    style={{ backgroundColor: c }} aria-label={c} />
                            ))}
                        </div>
                    </div>
                    <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 gap-2"><Plus className="w-4 h-4" /> Ajouter</Button>
                </form>

                {/* Liste */}
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 divide-y divide-gray-50">
                    {tags.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-10">Aucun tag pour le moment.</p>
                    ) : tags.map(t => (
                        <div key={t.id} className="flex items-center justify-between px-5 py-3">
                            <div className="flex items-center gap-3">
                                <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: t.color }}>{t.name}</span>
                                <span className="text-xs text-gray-400">{t.documents_count} document(s)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    {COLORS.map(c => (
                                        <button key={c} onClick={() => updateColor(t, c)}
                                            className={`w-4 h-4 rounded-full ${t.color === c ? 'ring-2 ring-offset-1 ring-gray-300' : ''}`}
                                            style={{ backgroundColor: c }} aria-label={c} />
                                    ))}
                                </div>
                                <Button variant="outline" size="sm" className="border-red-200 text-red-500 hover:bg-red-50" onClick={() => setDeleteId(t.id)}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer ce tag ?</AlertDialogTitle>
                        <AlertDialogDescription>Le tag sera retiré de tous les documents associés. Les documents ne sont pas supprimés.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-end gap-2">
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteId && router.delete(route('archives.tags.destroy', deleteId), { preserveScroll: true, onSuccess: () => setDeleteId(null) })}>
                            Supprimer
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
