import axios from 'axios';
import { Head, useForm } from '@inertiajs/react';
import { CloudUpload, HardDrive, Loader2, ServerCrash } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Settings {
    driver:      'local' | 's3';
    s3_key:      string;
    s3_secret:   string;
    s3_region:   string;
    s3_bucket:   string;
    s3_endpoint: string;
    s3_url:      string;
}

interface Props {
    settings:  Settings;
    hasKey:    boolean;
    hasSecret: boolean;
}

export default function FileStorage({ settings, hasKey, hasSecret }: Readonly<Props>) {
    // Les credentials arrivent masqués : on part de champs vides pour ne pas
    // renvoyer la valeur masquée au serveur (qui la conserverait telle quelle).
    const { data, setData, post, processing, errors } = useForm<Settings>({
        ...settings,
        s3_key:    '',
        s3_secret: '',
    });
    const { toast } = useToast();
    const [testing, setTesting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('file-storage.update'), {
            onSuccess: () => toast({ title: 'Configuration sauvegardée', description: 'Les paramètres de stockage ont été mis à jour.', variant: 'success' }),
            onError:   () => toast({ title: 'Erreur', description: 'Vérifiez les champs et réessayez.', variant: 'error' }),
        });
    };

    const handleTest = async () => {
        setTesting(true);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await axios.post(
                route('file-storage.test'),
                {},
                { headers: { 'X-CSRF-TOKEN': csrfToken, 'X-Requested-With': 'XMLHttpRequest' } },
            );
            if (res.data?.success) {
                toast({
                    title: 'Connexion réussie',
                    description: `Le disque "${res.data.driver}" est accessible et fonctionnel.`,
                    variant: 'success',
                });
            } else {
                toast({ title: 'Connexion échouée', description: res.data?.error ?? 'Erreur inconnue.', variant: 'error' });
            }
        } catch (err: any) {
            const message = err?.response?.data?.error ?? err?.message ?? 'Impossible de joindre le stockage.';
            toast({ title: 'Connexion échouée', description: message, variant: 'error' });
        } finally {
            setTesting(false);
        }
    };

    const isS3 = data.driver === 's3';

    return (
        <AppLayout>
            <Head title="Fichiers & Stockage" />
            <div className="w-full space-y-6">

                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 flex items-center gap-3"><HardDrive className="h-7 w-7 text-blue-600 shrink-0" />Fichiers & Stockage</h1>
                    <p className="mt-2 text-gray-500">Configurez où les fichiers uploadés (logos, documents) seront stockés.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Choix du driver */}
                    <div className="grid grid-cols-2 gap-4">
                        {([
                            { value: 'local', label: 'Stockage local',   desc: 'Fichiers sur le serveur Laravel (public/storage)',    Icon: HardDrive,   ring: 'ring-blue-500',   bg: 'bg-blue-50',   iconBg: 'bg-blue-100',   iconColor: 'text-blue-600' },
                            { value: 's3',    label: 'Stockage cloud S3', desc: 'AWS S3, Cloudflare R2, MinIO ou compatible S3',       Icon: CloudUpload, ring: 'ring-violet-500', bg: 'bg-violet-50', iconBg: 'bg-violet-100', iconColor: 'text-violet-600' },
                        ] as const).map(opt => {
                            const active = data.driver === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setData('driver', opt.value)}
                                    className={`rounded-2xl p-5 text-left ring-2 transition-all ${active ? `${opt.ring} ${opt.bg}` : 'ring-gray-200 bg-white hover:ring-gray-300'}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${active ? opt.iconBg : 'bg-gray-100'}`}>
                                        <opt.Icon className={`w-5 h-5 ${active ? opt.iconColor : 'text-gray-400'}`} />
                                    </div>
                                    <p className={`font-semibold text-sm ${active ? 'text-gray-900' : 'text-gray-600'}`}>{opt.label}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                                </button>
                            );
                        })}
                    </div>

                    {/* Config S3 */}
                    {isS3 && (
                        <div className="rounded-2xl bg-violet-50/60 ring-1 ring-violet-100 p-6 space-y-4">
                            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                <CloudUpload className="w-4 h-4 text-violet-600" />
                                Configuration S3 / Cloudflare R2
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">
                                        Access Key {hasKey ? <span className="text-gray-400 font-normal">(laisser vide pour conserver)</span> : '*'}
                                    </label>
                                    <Input value={data.s3_key} onChange={e => setData('s3_key', e.target.value)} placeholder={hasKey ? (settings.s3_key || '••••••••') : 'AKIAIOSFODNN7EXAMPLE'} className={errors.s3_key ? 'border-red-400' : ''} />
                                    {errors.s3_key && <p className="text-xs text-red-500">{errors.s3_key}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">
                                        Secret Key {hasSecret ? <span className="text-gray-400 font-normal">(laisser vide pour conserver)</span> : '*'}
                                    </label>
                                    <Input type="password" value={data.s3_secret} onChange={e => setData('s3_secret', e.target.value)} placeholder={hasSecret ? '••••••••' : 'wJalrXUtnFEMI...'} className={errors.s3_secret ? 'border-red-400' : ''} />
                                    {errors.s3_secret && <p className="text-xs text-red-500">{errors.s3_secret}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Bucket *</label>
                                    <Input value={data.s3_bucket} onChange={e => setData('s3_bucket', e.target.value)} placeholder="mon-bucket" className={errors.s3_bucket ? 'border-red-400' : ''} />
                                    {errors.s3_bucket && <p className="text-xs text-red-500">{errors.s3_bucket}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Région *</label>
                                    <Input value={data.s3_region} onChange={e => setData('s3_region', e.target.value)} placeholder="auto (R2) ou eu-west-1 (AWS)" className={errors.s3_region ? 'border-red-400' : ''} />
                                    {errors.s3_region && <p className="text-xs text-red-500">{errors.s3_region}</p>}
                                </div>

                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Endpoint <span className="text-gray-400 font-normal">(R2/MinIO — laisser vide pour AWS)</span>
                                    </label>
                                    <Input value={data.s3_endpoint} onChange={e => setData('s3_endpoint', e.target.value)} placeholder="https://<account_id>.r2.cloudflarestorage.com" />
                                </div>

                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        URL publique <span className="text-gray-400 font-normal">(CDN ou domaine custom)</span>
                                    </label>
                                    <Input value={data.s3_url} onChange={e => setData('s3_url', e.target.value)} placeholder="https://files.monecole.tg" />
                                </div>
                            </div>

                            <div className="rounded-xl bg-white/70 ring-1 ring-violet-100 p-4 text-xs text-gray-500 space-y-1">
                                <p className="font-semibold text-gray-700">Cloudflare R2 (recommandé)</p>
                                <p>• Région : <code className="bg-gray-100 px-1 rounded">auto</code></p>
                                <p>• Endpoint : <code className="bg-gray-100 px-1 rounded">https://{'<ACCOUNT_ID>'}.r2.cloudflarestorage.com</code></p>
                                <p>• Aucun frais de bande passante sortante (idéal Afrique)</p>
                            </div>
                        </div>
                    )}

                    {/* Note stockage local */}
                    {!isS3 && (
                        <div className="rounded-xl bg-blue-50 ring-1 ring-blue-100 p-4 flex gap-3 text-sm text-blue-700">
                            <ServerCrash className="w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold">Stockage local actif</p>
                                <p className="text-blue-600 mt-0.5">Les fichiers sont stockés dans <code className="bg-blue-100 px-1 rounded">storage/app/public/</code> et servis via <code className="bg-blue-100 px-1 rounded">/storage/</code>.</p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                        <Button type="button" variant="outline" onClick={handleTest} disabled={testing} className="gap-2">
                            {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <HardDrive className="w-4 h-4" />}
                            Tester la connexion
                        </Button>

                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 gap-2">
                            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            Enregistrer
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
