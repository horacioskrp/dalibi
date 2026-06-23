import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Tag as TagIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Tag { id: string; name: string; color: string; documents_count: number; }
interface Props { tags: Tag[]; }

const COLORS = ['#64748b', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function Tags({ tags }: Readonly<Props>) {
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [createOpen, setCreateOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({ name: '', color: COLORS[0] });

    const create = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('archives.tags.store'), {
            preserveScroll: true,
            onSuccess: () => { reset(); setCreateOpen(false); },
        });
    };

    const openCreate = () => { reset(); setCreateOpen(true); };

    const updateColor = (tag: Tag, color: string) => {
        router.put(route('archives.tags.update', tag.id), { name: tag.name, color }, { preserveScroll: true });
    };

    return (
        <AppLayout>
            <Head title="Tags d'archivage" />
            <div className="w-full max-w-3xl mx-auto space-y-6">

                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                            <TagIcon className="w-7 h-7 text-blue-600" /> Tags d'archivage
                        </h1>
                        <p className="mt-2 text-gray-500">{tags.length} tag(s) — organisez les documents par mots-clés réutilisables.</p>
                    </div>
                    <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 gap-2">
                        <Plus className="w-4 h-4" /> Nouveau tag
                    </Button>
                </div>

                {/* Liste */}
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
                    {tags.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <TagIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Aucun tag pour le moment.</p>
                            <Button onClick={openCreate} variant="outline" size="sm" className="mt-4 gap-1">
                                <Plus className="w-3.5 h-3.5" /> Créer le premier tag
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {tags.map(t => (
                                <div key={t.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="text-xs font-medium px-2.5 py-1 rounded-full text-white shrink-0" style={{ backgroundColor: t.color }}>{t.name}</span>
                                        <span className="text-xs text-gray-400">{t.documents_count} document(s)</span>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="hidden sm:flex gap-1" title="Changer la couleur">
                                            {COLORS.map(c => (
                                                <button key={c} onClick={() => updateColor(t, c)}
                                                    className={`w-4 h-4 rounded-full transition ${t.color === c ? 'ring-2 ring-offset-1 ring-gray-300' : 'opacity-60 hover:opacity-100'}`}
                                                    style={{ backgroundColor: c }} aria-label={`Couleur ${c}`} />
                                            ))}
                                        </div>
                                        <Button variant="outline" size="sm" className="border-red-200 text-red-500 hover:bg-red-50" onClick={() => setDeleteId(t.id)}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de création */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nouveau tag</DialogTitle>
                        <DialogDescription>Un mot-clé réutilisable pour classer les documents archivés.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={create} className="space-y-4 py-1">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Nom du tag *</label>
                            <Input autoFocus value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Ex: Contrat, Inspection…" className={errors.name ? 'border-red-400' : ''} />
                            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Couleur</label>
                            <div className="flex flex-wrap gap-2">
                                {COLORS.map(c => (
                                    <button type="button" key={c} onClick={() => setData('color', c)}
                                        className={`w-7 h-7 rounded-full transition ${data.color === c ? 'ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'}`}
                                        style={{ backgroundColor: c }} aria-label={`Couleur ${c}`} />
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                            <span className="text-xs text-gray-400">Aperçu :</span>
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: data.color }}>
                                {data.name || 'Nom du tag'}
                            </span>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
                            <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 gap-2">
                                <Plus className="w-4 h-4" /> Créer
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

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
