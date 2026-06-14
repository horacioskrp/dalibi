import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface School { id: string; name: string; }

interface Props {
    schools: School[];
    preselectedSchoolId: string | null;
}

const PRECISION_OPTIONS = [
    { value: '0', label: 'Entier (ex : 12)' },
    { value: '1', label: '1 décimale (ex : 12,5)' },
    { value: '2', label: '2 décimales (ex : 12,50)' },
    { value: '3', label: '3 décimales (ex : 12,500)' },
];

export default function Create({ schools, preselectedSchoolId }: Readonly<Props>) {
    const { data, setData, post, processing, errors } = useForm({
        school_id:         preselectedSchoolId ?? '',
        name:              '',
        passing_score:     '10',
        default_max_score: '20',
        term1_weight:      '1',
        term2_weight:      '1',
        term3_weight:      '1',
        round_precision:   '2',
    });

    const total = (parseFloat(data.term1_weight) || 0) + (parseFloat(data.term2_weight) || 0) + (parseFloat(data.term3_weight) || 0);
    const pct   = (w: string) => total > 0 ? Math.round(((parseFloat(w) || 0) / total) * 100) : 0;

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('grading-configs.store'));
    };

    return (
        <AppLayout>
            <Head title="Nouvelle configuration de calcul" />

            <div className="max-w-2xl space-y-6">

                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.get(route('grading-configs.index'))}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Nouvelle configuration</h1>
                        <p className="text-gray-500 mt-0.5">Définissez la formule de calcul des moyennes</p>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 space-y-5">

                    {/* École */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Établissement *</label>
                        <Select value={data.school_id} onValueChange={v => setData('school_id', v)}>
                            <SelectTrigger className={errors.school_id ? 'border-red-400' : ''}>
                                <SelectValue placeholder="Sélectionner un établissement" />
                            </SelectTrigger>
                            <SelectContent>
                                {schools.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {errors.school_id && <p className="text-xs text-red-500">{errors.school_id}</p>}
                    </div>

                    {/* Nom */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Nom *</label>
                        <Input
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            placeholder="ex : Formule standard 2025"
                            className={errors.name ? 'border-red-400' : ''}
                        />
                        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Seuil de passage */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Seuil de passage</label>
                            <div className="relative">
                                <Input
                                    type="number" min={0} max={100} step={0.5}
                                    value={data.passing_score}
                                    onChange={e => setData('passing_score', e.target.value)}
                                    className={`pr-12 ${errors.passing_score ? 'border-red-400' : ''}`}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">/ {data.default_max_score}</span>
                            </div>
                            {errors.passing_score && <p className="text-xs text-red-500">{errors.passing_score}</p>}
                        </div>

                        {/* Note maximale */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Note maximale par défaut</label>
                            <Input
                                type="number" min={1} max={100} step={1}
                                value={data.default_max_score}
                                onChange={e => setData('default_max_score', e.target.value)}
                                className={errors.default_max_score ? 'border-red-400' : ''}
                            />
                            {errors.default_max_score && <p className="text-xs text-red-500">{errors.default_max_score}</p>}
                        </div>
                    </div>

                    {/* Poids des trimestres */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Poids des trimestres</label>
                        <div className="grid grid-cols-3 gap-3">
                            {(['term1_weight', 'term2_weight', 'term3_weight'] as const).map((key, i) => (
                                <div key={key} className="space-y-1">
                                    <span className="text-xs text-gray-500">Trimestre {i + 1}</span>
                                    <Input
                                        type="number" min={0} max={10} step={0.5}
                                        value={data[key]}
                                        onChange={e => setData(key, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                        {total > 0 && (
                            <div className="flex gap-2 mt-1">
                                {[data.term1_weight, data.term2_weight, data.term3_weight].map((w, i) => (
                                    <div key={i} className="flex-1 text-center">
                                        <div className="text-lg font-bold text-blue-600">{pct(w)}%</div>
                                        <div className="text-xs text-gray-400">T{i + 1}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Arrondi */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Précision d'arrondi</label>
                        <Select value={data.round_precision} onValueChange={v => setData('round_precision', v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PRECISION_OPTIONS.map(o => (
                                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                        <Button type="button" variant="outline" onClick={() => router.get(route('grading-configs.index'))}>
                            Annuler
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={processing}>
                            {processing ? 'Création...' : 'Créer la configuration'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
