import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface AcademicYear {
    id: string;
    year: string;
}

interface FeeCategory {
    id: string;
    name: string;
}

interface Classroom {
    id: string;
    name: string;
    code: string;
}

interface FeeStructure {
    id: string;
    academic_year_id: string;
    fee_category_id: string;
    class_id: string;
    amount: number;
}

interface EditProps {
    feeStructure: FeeStructure;
    academicYears: AcademicYear[];
    feeCategories: FeeCategory[];
    classrooms: Classroom[];
}

export default function Edit({ feeStructure, academicYears, feeCategories, classrooms }: Readonly<EditProps>) {
    const { data, setData, put, processing, errors } = useForm({
        academic_year_id: feeStructure.academic_year_id,
        fee_category_id: feeStructure.fee_category_id,
        class_id: feeStructure.class_id,
        amount: feeStructure.amount.toString(),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('fee-structures.update', feeStructure.id));
    };

    return (
        <AppLayout>
            <Head title="Modifier la structure de frais" />

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
                        Modifier la structure de frais
                    </h1>
                    <p className="mt-3 text-base text-gray-600">
                        Modifiez les informations de cette structure de frais
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-300 shadow-sm p-6 space-y-6">
                    {/* Année académique */}
                    <div className="space-y-2">
                        <Label htmlFor="academic_year_id">
                            Année académique <span className="text-red-600">*</span>
                        </Label>
                        <Select
                            value={data.academic_year_id}
                            onValueChange={(value) => setData('academic_year_id', value)}
                        >
                            <SelectTrigger id="academic_year_id" className="border-gray-300">
                                <SelectValue placeholder="Sélectionner une année académique" />
                            </SelectTrigger>
                            <SelectContent>
                                {academicYears.map((year) => (
                                    <SelectItem key={year.id} value={year.id}>
                                        {year.year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.academic_year_id && (
                            <p className="text-sm text-red-600">{errors.academic_year_id}</p>
                        )}
                    </div>

                    {/* Catégorie de frais */}
                    <div className="space-y-2">
                        <Label htmlFor="fee_category_id">
                            Catégorie de frais <span className="text-red-600">*</span>
                        </Label>
                        <Select
                            value={data.fee_category_id}
                            onValueChange={(value) => setData('fee_category_id', value)}
                        >
                            <SelectTrigger id="fee_category_id" className="border-gray-300">
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

                    {/* Classe */}
                    <div className="space-y-2">
                        <Label htmlFor="class_id">
                            Classe <span className="text-red-600">*</span>
                        </Label>
                        <Select
                            value={data.class_id}
                            onValueChange={(value) => setData('class_id', value)}
                        >
                            <SelectTrigger id="class_id" className="border-gray-300">
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

                    {/* Montant */}
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
                            className="border-gray-300"
                        />
                        {errors.amount && (
                            <p className="text-sm text-red-600">{errors.amount}</p>
                        )}
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-300">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit(route('fee-structures.index'))}
                            disabled={processing}
                            className="border-gray-300"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {processing ? 'Mise à jour...' : 'Mettre à jour'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
