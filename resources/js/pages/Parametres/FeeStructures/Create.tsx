import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Banknote, CalendarDays, Layers, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface FeeCategory {
    id: string;
    name: string;
}

interface Classroom {
    id: string;
    name: string;
    code: string;
}

interface CreateProps {
    activeYear: { id: string; year: string } | null;
    feeCategories: FeeCategory[];
    classrooms: Classroom[];
}

export default function Create({ activeYear, feeCategories, classrooms }: Readonly<CreateProps>) {
    const { data, setData, post, processing, errors } = useForm({
        academic_year_id: activeYear?.id ?? '',
        fee_category_id: '',
        class_id: '',
        amount: '',
    });

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('fee-structures.store'));
    };

    return (
        <AppLayout>
            <Head title="Nouvelle structure de frais" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.visit(route('fee-structures.index'))}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour
                    </Button>
                </div>

                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                        Nouvelle structure de frais
                    </h1>
                    <p className="mt-3 text-base text-gray-600">
                        Créez une nouvelle structure de frais pour une année académique, catégorie et classe
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-2xl bg-linear-to-br from-indigo-50 to-white ring-1 ring-indigo-100 p-6 space-y-4">
                        <div className="flex items-center gap-2 text-indigo-700">
                            <CalendarDays className="h-4 w-4" />
                            <p className="text-sm font-semibold">Contexte académique</p>
                        </div>
                        <div className="space-y-2">
                        <Label>Année académique active</Label>
                        {activeYear ? (
                            <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white/90 px-3 py-2">
                                <span className="text-base font-semibold text-gray-900">{activeYear.year}</span>
                                <span className="text-xs rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5">active</span>
                            </div>
                        ) : (
                            <p className="text-sm text-red-600">Aucune année académique active. Activez-en une d'abord.</p>
                        )}
                        <p className="text-xs text-gray-500">La structure est automatiquement rattachée à l'année active.</p>
                        {errors.academic_year_id && (
                            <p className="text-sm text-red-600">{errors.academic_year_id}</p>
                        )}
                        </div>
                    </div>

                    <div className="rounded-2xl bg-linear-to-br from-amber-50 to-white ring-1 ring-amber-100 p-6 space-y-4">
                        <div className="flex items-center gap-2 text-amber-700">
                            <Layers className="h-4 w-4" />
                            <p className="text-sm font-semibold">Catégorie de frais</p>
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="fee_category_id">
                            Catégorie de frais <span className="text-red-600">*</span>
                        </Label>
                        <Select
                            value={data.fee_category_id}
                            onValueChange={(value) => setData('fee_category_id', value)}
                        >
                            <SelectTrigger id="fee_category_id" className="border-slate-200 bg-white/90">
                                <SelectValue placeholder="Sélectionner une catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                                {feeCategories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.fee_category_id && (
                            <p className="text-sm text-red-600">{errors.fee_category_id}</p>
                        )}
                        </div>
                    </div>

                    <div className="rounded-2xl bg-linear-to-br from-sky-50 to-white ring-1 ring-sky-100 p-6 space-y-4">
                        <div className="flex items-center gap-2 text-sky-700">
                            <School className="h-4 w-4" />
                            <p className="text-sm font-semibold">Classe concernée</p>
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="class_id">
                            Classe <span className="text-red-600">*</span>
                        </Label>
                        <Select
                            value={data.class_id}
                            onValueChange={(value) => setData('class_id', value)}
                        >
                            <SelectTrigger id="class_id" className="border-slate-200 bg-white/90">
                                <SelectValue placeholder="Sélectionner une classe" />
                            </SelectTrigger>
                            <SelectContent>
                                {classrooms.map((classroom) => (
                                    <SelectItem key={classroom.id} value={classroom.id}>
                                        {classroom.name} ({classroom.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.class_id && (
                            <p className="text-sm text-red-600">{errors.class_id}</p>
                        )}
                        </div>
                    </div>

                    <div className="rounded-2xl bg-linear-to-br from-emerald-50 to-white ring-1 ring-emerald-100 p-6 space-y-4">
                        <div className="flex items-center gap-2 text-emerald-700">
                            <Banknote className="h-4 w-4" />
                            <p className="text-sm font-semibold">Montant</p>
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="amount">
                            Montant (FCFA) <span className="text-red-600">*</span>
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Ex: 50000"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            className="border-slate-200 bg-white/90"
                        />
                        {errors.amount && (
                            <p className="text-sm text-red-600">{errors.amount}</p>
                        )}
                        </div>
                    </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit(route('fee-structures.index'))}
                            disabled={processing}
                            className="border-slate-200"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !activeYear}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {processing ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
