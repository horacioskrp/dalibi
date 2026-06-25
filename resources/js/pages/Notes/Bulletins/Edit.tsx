import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Line { index: number; subject: string; moyenne: number | null; appreciation: string }
interface Card {
    id: string;
    student: { name?: string; matricule?: string };
    period: { name?: string };
    observations: string;
    decision: string;
    retards: number;
    absences: number;
    punitions: number;
    exclusions: number;
    lines: Line[];
}

export default function Edit({ card }: Readonly<{ card: Card }>) {
    const [appreciations, setAppreciations] = useState<Record<number, string>>(
        Object.fromEntries(card.lines.map((l) => [l.index, l.appreciation])),
    );
    const [observations, setObservations] = useState(card.observations);
    const [decision, setDecision] = useState(card.decision);
    const [punitions, setPunitions] = useState(String(card.punitions));
    const [exclusions, setExclusions] = useState(String(card.exclusions));
    const [saving, setSaving] = useState(false);

    const save = () => {
        setSaving(true);
        router.put(route('bulletins.update', card.id), {
            appreciations,
            observations,
            decision,
            punitions: Number(punitions) || 0,
            exclusions: Number(exclusions) || 0,
        }, { onFinish: () => setSaving(false) });
    };

    return (
        <AppLayout>
            <Head title="Éditer le bulletin" />
            <div className="w-full space-y-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={() => router.get(route('bulletins.index'))}>
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{card.student.name}</h1>
                            <p className="mt-1 text-gray-500">{card.period.name} · Matricule <span className="font-mono">{card.student.matricule}</span></p>
                        </div>
                    </div>
                    <Button onClick={save} disabled={saving} className="bg-blue-600 hover:bg-blue-700 gap-2">
                        <Save className="w-4 h-4" /> {saving ? 'Enregistrement…' : 'Enregistrer'}
                    </Button>
                </div>

                {/* Appréciations par matière */}
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">Appréciations par matière</h2>
                    </div>
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead>Matière</TableHead>
                                <TableHead className="w-24 text-center">Moyenne</TableHead>
                                <TableHead>Appréciation</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {card.lines.map((l) => (
                                <TableRow key={l.index} className="border-b border-slate-100">
                                    <TableCell className="font-medium text-gray-900">{l.subject}</TableCell>
                                    <TableCell className="text-center text-gray-700">{l.moyenne !== null ? l.moyenne : '—'}</TableCell>
                                    <TableCell>
                                        <Input
                                            value={appreciations[l.index] ?? ''}
                                            onChange={(e) => setAppreciations((a) => ({ ...a, [l.index]: e.target.value }))}
                                            placeholder="Appréciation du professeur"
                                            className="h-9"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Discipline + observations */}
                <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Discipline & décision</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-500">Retards (auto)</Label>
                            <Input value={card.retards} disabled className="bg-gray-50" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-500">Absences (auto)</Label>
                            <Input value={card.absences} disabled className="bg-gray-50" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-500">Punitions</Label>
                            <Input type="number" min={0} value={punitions} onChange={(e) => setPunitions(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-gray-500">Exclusions</Label>
                            <Input type="number" min={0} value={exclusions} onChange={(e) => setExclusions(e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Décision du conseil</Label>
                        <Input value={decision} onChange={(e) => setDecision(e.target.value)} placeholder="Ex : Tableau d'honneur, Félicitations, Avertissement…" />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-gray-700">Observations du Chef d'Établissement</Label>
                        <Input value={observations} onChange={(e) => setObservations(e.target.value)} placeholder="Observations" />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
