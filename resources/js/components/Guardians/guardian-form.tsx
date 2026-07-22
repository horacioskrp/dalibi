import { X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface GuardianFormData {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    student_matricules: string[];
    send_invitation: boolean;
}

interface Props {
    data: GuardianFormData;
    setData: <K extends keyof GuardianFormData>(key: K, value: GuardianFormData[K]) => void;
    errors: Partial<Record<string, string>>;
    processing: boolean;
    mode: 'create' | 'edit';
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
}

export function GuardianForm({ data, setData, errors, processing, mode, onSubmit, onCancel }: Readonly<Props>) {
    const [matInput, setMatInput] = useState('');

    const addMat = () => {
        const m = matInput.trim();
        if (m && !data.student_matricules.includes(m)) {
            setData('student_matricules', [...data.student_matricules, m]);
        }
        setMatInput('');
    };

    const removeMat = (m: string) =>
        setData('student_matricules', data.student_matricules.filter((x) => x !== m));

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-sm">Prénom *</Label>
                        <Input value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} className={errors.first_name ? 'border-red-400' : ''} />
                        {errors.first_name && <p className="text-xs text-red-500">{errors.first_name}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm">Nom *</Label>
                        <Input value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} className={errors.last_name ? 'border-red-400' : ''} />
                        {errors.last_name && <p className="text-xs text-red-500">{errors.last_name}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-sm">E-mail *</Label>
                        <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className={errors.email ? 'border-red-400' : ''} />
                        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm">Téléphone</Label>
                        <Input value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-sm">Élèves liés (matricule)</Label>
                    <div className="flex gap-2">
                        <Input
                            value={matInput}
                            onChange={(e) => setMatInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMat(); } }}
                            placeholder="Saisir un matricule + Entrée"
                        />
                        <Button type="button" variant="outline" onClick={addMat}>Ajouter</Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        {data.student_matricules.map((m) => (
                            <span key={m} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                                {m}
                                <button type="button" onClick={() => removeMat(m)}><X className="w-3 h-3" /></button>
                            </span>
                        ))}
                    </div>
                    {errors['student_matricules.0'] && <p className="text-xs text-red-500">Un matricule est introuvable.</p>}
                </div>

                {mode === 'create' && (
                    <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={data.send_invitation} onCheckedChange={(v) => setData('send_invitation', Boolean(v))} />
                        Envoyer l'invitation par e-mail
                    </label>
                )}
            </div>

            <div className="flex gap-2">
                <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                    {mode === 'edit' ? 'Enregistrer' : 'Créer le tuteur'}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
            </div>
        </form>
    );
}
