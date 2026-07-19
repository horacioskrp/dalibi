import axios from 'axios';
import { Head, router, useForm } from '@inertiajs/react';
import type { Editor } from '@tiptap/react';
import { ArrowLeft, Eye, Loader2, Plus, Save } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { RichTextEditor } from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Template {
    id: string;
    category: string;
    type: string;
    name: string;
    description: string | null;
    source: 'wysiwyg' | 'blade';
    layout: string | null;
    content: string | null;
    header_enabled: boolean;
    footer_enabled: boolean;
    show_signature: boolean;
    signatory_title: string | null;
    orientation: 'portrait' | 'landscape';
    is_default: boolean;
    is_active: boolean;
}

interface VariableGroup { label: string; variables: Record<string, string>; }

interface Props {
    template:   Template | null;
    categories: Record<string, string>;
    types:      Record<string, Record<string, string>>;
    sources:    Record<string, string>;
    layouts:    Record<string, string>;
    variables:  Record<string, VariableGroup>;
}

export default function Edit({ template, categories, types, sources, layouts, variables }: Readonly<Props>) {
    const isEdit = !!template;
    const { toast } = useToast();
    const editorRef = useRef<Editor | null>(null);
    const [previewHtml, setPreviewHtml] = useState('');
    const [previewing, setPreviewing] = useState(false);

    const { data, setData, post, put, processing, errors } = useForm({
        category:        template?.category ?? 'certificat',
        type:            template?.type ?? '',
        name:            template?.name ?? '',
        description:     template?.description ?? '',
        source:          template?.source ?? 'wysiwyg',
        layout:          template?.layout ?? '',
        content:         template?.content ?? '',
        header_enabled:  template?.header_enabled ?? true,
        footer_enabled:  template?.footer_enabled ?? true,
        show_signature:  template?.show_signature ?? true,
        signatory_title: template?.signatory_title ?? 'Le Directeur',
        orientation:     template?.orientation ?? 'portrait',
        is_default:      template?.is_default ?? false,
        is_active:       template?.is_active ?? true,
    });

    const handleEditorReady = useCallback((editor: Editor) => { editorRef.current = editor; }, []);

    const insertVariable = (key: string) => {
        editorRef.current?.chain().focus().insertContent(`{{ ${key} }}`).run();
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = {
            onSuccess: () => toast({ title: 'Enregistré', description: 'Modèle sauvegardé.', variant: 'success' as const }),
            onError:   () => toast({ title: 'Erreur', description: 'Vérifiez les champs.', variant: 'error' as const }),
        };
        if (isEdit) put(route('document-templates.update', template!.id), opts);
        else post(route('document-templates.store'), opts);
    };

    const handlePreview = async () => {
        setPreviewing(true);
        try {
            const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await axios.post(route('document-templates.preview'), {
                source: data.source,
                layout: data.layout || null,
                content: data.content,
                header_enabled: data.header_enabled,
                show_signature: data.show_signature,
                signatory_title: data.signatory_title,
            }, { headers: { 'X-CSRF-TOKEN': csrf, 'X-Requested-With': 'XMLHttpRequest' } });
            setPreviewHtml(res.data.html);
        } catch {
            toast({ title: 'Erreur', description: 'Prévisualisation impossible.', variant: 'error' });
        } finally {
            setPreviewing(false);
        }
    };

    const typeOptions = types[data.category] ?? {};

    return (
        <AppLayout>
            <Head title={isEdit ? 'Modifier le modèle' : 'Nouveau modèle'} />
            <div className="w-full space-y-6">

                <div className="flex items-center gap-4">
                    <button type="button" onClick={() => router.get(route('document-templates.index'))} className="p-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{isEdit ? 'Modifier le modèle' : 'Nouveau modèle de document'}</h1>
                        <p className="text-gray-500 mt-1">Configurez le document et son contenu avec variables dynamiques.</p>
                    </div>
                </div>

                <form onSubmit={submit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* Colonne config + éditeur */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Catégorie *</label>
                                    <Select value={data.category} onValueChange={v => { setData('category', v); setData('type', ''); }}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(categories).map(([k, label]) => <SelectItem key={k} value={k}>{label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Type *</label>
                                    <Select value={data.type} onValueChange={v => setData('type', v)}>
                                        <SelectTrigger className={errors.type ? 'border-red-400' : ''}><SelectValue placeholder="Choisir un type" /></SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(typeOptions).map(([k, label]) => <SelectItem key={k} value={k}>{label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Nom du modèle *</label>
                                    <Input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Ex: Certificat de scolarité standard" className={errors.name ? 'border-red-400' : ''} />
                                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Description</label>
                                    <Input value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Usage du modèle (optionnel)" />
                                </div>
                            </div>
                        </div>

                        {/* Source du corps : mise en page prédéfinie (Blade) ou éditeur libre */}
                        <div className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Source du corps *</label>
                                <Select value={data.source} onValueChange={v => setData('source', v as 'wysiwyg' | 'blade')}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(sources).map(([k, label]) => <SelectItem key={k} value={k}>{label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            {data.source === 'blade' ? (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Mise en page prédéfinie *</label>
                                    <Select value={data.layout} onValueChange={v => setData('layout', v)}>
                                        <SelectTrigger className={errors.layout ? 'border-red-400' : ''}><SelectValue placeholder="Choisir une mise en page" /></SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(layouts).map(([k, label]) => <SelectItem key={k} value={k}>{label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.layout && <p className="text-xs text-red-500">{errors.layout}</p>}
                                    <p className="text-xs text-gray-400">Mise en page fournie par l'application (logique, tableaux). En-tête, signature et filigrane de l'école restent appliqués.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-700">Contenu du document</label>
                                    <RichTextEditor value={data.content} onChange={v => setData('content', v)} onReady={handleEditorReady} />
                                    <p className="text-xs text-gray-400">Astuce : placez le curseur puis cliquez une variable à droite pour l'insérer.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Colonne latérale : variables + options */}
                    <div className="space-y-6">
                        {/* Variables */}
                        <div className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm p-5">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Variables disponibles</h3>
                            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                                {Object.entries(variables).map(([groupKey, group]) => (
                                    <div key={groupKey}>
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">{group.label}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {Object.entries(group.variables).map(([key, label]) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => insertVariable(key)}
                                                    title={`Insérer {{ ${key} }}`}
                                                    className="inline-flex items-center gap-1 text-xs bg-gray-50 hover:bg-blue-50 hover:text-blue-700 ring-1 ring-gray-200 rounded-md px-2 py-1 transition-colors"
                                                >
                                                    <Plus className="w-3 h-3" /> {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Options */}
                        <div className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm p-5 space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900">Mise en page</h3>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Orientation</label>
                                <Select value={data.orientation} onValueChange={v => setData('orientation', v as 'portrait' | 'landscape')}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="portrait">Portrait</SelectItem>
                                        <SelectItem value="landscape">Paysage</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Titre du signataire</label>
                                <Input value={data.signatory_title} onChange={e => setData('signatory_title', e.target.value)} placeholder="Le Directeur" />
                            </div>

                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <Checkbox checked={data.header_enabled} onCheckedChange={c => setData('header_enabled', c === true)} />
                                <span className="text-sm text-gray-700">En-tête officiel (logo, terme, devise)</span>
                            </label>
                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <Checkbox checked={data.show_signature} onCheckedChange={c => setData('show_signature', c === true)} />
                                <span className="text-sm text-gray-700">Bloc signature</span>
                            </label>
                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <Checkbox checked={data.is_default} onCheckedChange={c => setData('is_default', c === true)} />
                                <span className="text-sm text-gray-700">Modèle par défaut pour ce type</span>
                            </label>
                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <Checkbox checked={data.is_active} onCheckedChange={c => setData('is_active', c === true)} />
                                <span className="text-sm text-gray-700">Actif</span>
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                            <Button type="button" variant="outline" onClick={handlePreview} disabled={previewing} className="gap-2">
                                {previewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                                Prévisualiser
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 gap-2">
                                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Enregistrer
                            </Button>
                        </div>
                    </div>
                </form>

                {/* Prévisualisation */}
                {previewHtml && (
                    <div className="bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm p-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Eye className="w-4 h-4" /> Aperçu (données d'exemple)
                        </h3>
                        <iframe title="Aperçu" srcDoc={previewHtml} className="w-full h-[600px] rounded-lg ring-1 ring-gray-200 bg-white" />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
