import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface School { id: string; name: string }
export interface ClassroomType { id: string; name: string; period_system: string }
export interface MentionRow { label: string; min: string }

export interface GradingConfigForm {
    school_id: string;
    classroom_type_id: string;
    name: string;
    passing_score: string;
    default_max_score: string;
    class_weight: string;
    comp_weight: string;
    round_precision: string;
    mentions: MentionRow[];
}

const PRECISION_OPTIONS = [
    { value: '0', label: 'Entier (ex : 12)' },
    { value: '1', label: '1 décimale (ex : 12,5)' },
    { value: '2', label: '2 décimales (ex : 12,50)' },
    { value: '3', label: '3 décimales (ex : 12,500)' },
];

const ALL = '__all__';

interface Props {
    data: GradingConfigForm;
    setData: (key: keyof GradingConfigForm, value: GradingConfigForm[keyof GradingConfigForm]) => void;
    errors: Partial<Record<string, string>>;
    schools: School[];
    classroomTypes: ClassroomType[];
}

export default function GradingConfigFields({ data, setData, errors, schools, classroomTypes }: Readonly<Props>) {
    const classTotal = (parseFloat(data.class_weight) || 0) + (parseFloat(data.comp_weight) || 0);
    const pct = (w: string) => (classTotal > 0 ? Math.round(((parseFloat(w) || 0) / classTotal) * 100) : 0);

    const setMention = (i: number, patch: Partial<MentionRow>) => {
        const next = data.mentions.map((m, j) => (j === i ? { ...m, ...patch } : m));
        setData('mentions', next);
    };
    const addMention = () => setData('mentions', [...data.mentions, { label: '', min: '' }]);
    const removeMention = (i: number) => setData('mentions', data.mentions.filter((_, j) => j !== i));

    return (
        <>
            {/* École + type de classe */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Établissement *</label>
                    <Select value={data.school_id} onValueChange={(v) => setData('school_id', v)}>
                        <SelectTrigger className={errors.school_id ? 'border-red-400' : ''}>
                            <SelectValue placeholder="Sélectionner un établissement" />
                        </SelectTrigger>
                        <SelectContent>
                            {schools.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {errors.school_id && <p className="text-xs text-red-500">{errors.school_id}</p>}
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Type de classe</label>
                    <Select
                        value={data.classroom_type_id || ALL}
                        onValueChange={(v) => setData('classroom_type_id', v === ALL ? '' : v)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>Toutes les classes (défaut école)</SelectItem>
                            {classroomTypes.map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                    {t.name} ({t.period_system})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-400">Laissez « Toutes les classes » pour une formule par défaut de l'école.</p>
                </div>
            </div>

            {/* Nom */}
            <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Nom *</label>
                <Input
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="ex : Formule standard 2025"
                    className={errors.name ? 'border-red-400' : ''}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Seuil de passage</label>
                    <div className="relative">
                        <Input
                            type="number" min={0} max={100} step={0.5}
                            value={data.passing_score}
                            onChange={(e) => setData('passing_score', e.target.value)}
                            className={`pr-12 ${errors.passing_score ? 'border-red-400' : ''}`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">/ {data.default_max_score}</span>
                    </div>
                    {errors.passing_score && <p className="text-xs text-red-500">{errors.passing_score}</p>}
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Note maximale par défaut</label>
                    <Input
                        type="number" min={1} max={100} step={1}
                        value={data.default_max_score}
                        onChange={(e) => setData('default_max_score', e.target.value)}
                        className={errors.default_max_score ? 'border-red-400' : ''}
                    />
                </div>
            </div>

            {/* Pondération Classe / Composition */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Pondération Note de classe / Composition</label>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <span className="text-xs text-gray-500">Note de classe (contrôle continu)</span>
                        <Input type="number" min={0} max={10} step={0.5} value={data.class_weight}
                            onChange={(e) => setData('class_weight', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs text-gray-500">Composition</span>
                        <Input type="number" min={0} max={10} step={0.5} value={data.comp_weight}
                            onChange={(e) => setData('comp_weight', e.target.value)} />
                    </div>
                </div>
                {classTotal > 0 && (
                    <div className="flex gap-2 mt-1">
                        <div className="flex-1 text-center">
                            <div className="text-lg font-bold text-blue-600">{pct(data.class_weight)}%</div>
                            <div className="text-xs text-gray-400">Classe</div>
                        </div>
                        <div className="flex-1 text-center">
                            <div className="text-lg font-bold text-blue-600">{pct(data.comp_weight)}%</div>
                            <div className="text-xs text-gray-400">Composition</div>
                        </div>
                    </div>
                )}
                <p className="text-xs text-gray-400">Moyenne matière = (Classe × {data.class_weight || 0} + Composition × {data.comp_weight || 0}) / {classTotal || 1}.</p>
            </div>

            {/* Arrondi */}
            <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Précision d'arrondi</label>
                <Select value={data.round_precision} onValueChange={(v) => setData('round_precision', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {PRECISION_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {/* Mentions */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Mentions (seuils)</label>
                    <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addMention}>
                        <Plus className="w-3.5 h-3.5" /> Ajouter
                    </Button>
                </div>
                <div className="space-y-2">
                    {data.mentions.length === 0 && <p className="text-xs text-gray-400">Aucune mention configurée.</p>}
                    {data.mentions.map((m, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <Input value={m.label} placeholder="Libellé (ex : Félicitations)"
                                onChange={(e) => setMention(i, { label: e.target.value })} className="flex-1" />
                            <span className="text-xs text-gray-400">≥</span>
                            <Input type="number" min={0} max={20} step={0.5} value={m.min}
                                onChange={(e) => setMention(i, { min: e.target.value })} className="w-24" />
                            <Button type="button" variant="outline" size="sm"
                                className="border-red-200 text-red-500 hover:bg-red-50" onClick={() => removeMention(i)}>
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-gray-400">La mention retenue est celle dont le seuil est le plus élevé et inférieur ou égal à la moyenne.</p>
            </div>
        </>
    );
}
