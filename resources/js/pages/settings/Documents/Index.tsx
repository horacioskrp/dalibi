import { Head, router } from '@inertiajs/react';
import { Award, Eye, FileBadge, FileText, GraduationCap, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Template {
    id: string;
    name: string;
    type: string;
    type_label: string;
    is_default: boolean;
    is_active: boolean;
}

interface Props {
    templatesByCategory: Record<string, Template[]>;
    categories: Record<string, string>;
}

const CATEGORY_META: Record<string, { icon: typeof FileText; color: string; bg: string }> = {
    certificat:  { icon: GraduationCap, color: 'text-blue-600',   bg: 'bg-blue-50 ring-blue-100' },
    attestation: { icon: Award,         color: 'text-emerald-600', bg: 'bg-emerald-50 ring-emerald-100' },
    bulletin:    { icon: FileText,      color: 'text-violet-600',  bg: 'bg-violet-50 ring-violet-100' },
};

export default function Index({ templatesByCategory, categories }: Readonly<Props>) {
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const onDelete = (id: string) => {
        router.delete(route('document-templates.destroy', id), {
            preserveScroll: true,
            onSuccess: () => setDeleteId(null),
        });
    };

    return (
        <AppLayout>
            <Head title="Modèles de documents" />
            <div className="w-full space-y-6">

                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Modèles de documents</h1>
                        <p className="mt-2 text-gray-500">Gérez les modèles de certificats, attestations et bulletins exportables en PDF.</p>
                    </div>
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => router.get(route('document-templates.create'))}>
                        <Plus className="w-4 h-4" /> Nouveau modèle
                    </Button>
                </div>

                {Object.entries(categories).map(([key, label]) => {
                    const meta = CATEGORY_META[key] ?? CATEGORY_META.certificat;
                    const Icon = meta.icon;
                    const templates = templatesByCategory[key] ?? [];

                    return (
                        <div key={key} className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ring-1 ${meta.bg}`}>
                                    <Icon className={`w-4 h-4 ${meta.color}`} />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">{label}</h2>
                                <span className="text-sm text-gray-400">({templates.length})</span>
                            </div>

                            {templates.length === 0 ? (
                                <div className="rounded-2xl ring-1 ring-dashed ring-gray-200 p-8 text-center text-gray-400 text-sm">
                                    <FileBadge className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    Aucun modèle dans cette catégorie.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {templates.map(t => (
                                        <div key={t.id} className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm p-5 flex flex-col">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{t.name}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{t.type_label}</p>
                                                </div>
                                                {t.is_default && (
                                                    <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 shrink-0">
                                                        <Star className="w-3 h-3" /> Défaut
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-2">
                                                {t.is_active
                                                    ? <span className="text-xs text-emerald-600 font-medium">● Actif</span>
                                                    : <span className="text-xs text-gray-400 font-medium">● Inactif</span>}
                                            </div>

                                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                                                <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => router.get(route('document-templates.show', t.id))}>
                                                    <Eye className="w-3.5 h-3.5" /> Voir
                                                </Button>
                                                <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => router.get(route('document-templates.edit', t.id))}>
                                                    <Pencil className="w-3.5 h-3.5" /> Modifier
                                                </Button>
                                                <Button variant="outline" size="sm" className="border-red-200 text-red-500 hover:bg-red-50" onClick={() => setDeleteId(t.id)}>
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer ce modèle ?</AlertDialogTitle>
                        <AlertDialogDescription>Cette action est irréversible. Les documents déjà émis ne sont pas affectés.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-end gap-2">
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteId && onDelete(deleteId)}>Supprimer</AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
