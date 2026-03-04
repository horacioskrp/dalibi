import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Classroom {
    id: string;
    name: string;
    code: string;
}

interface Schooling {
    id: string;
    class_id: string;
    inscription_fee: number;
    school_fee: number;
    created_at: string;
    updated_at: string;
    classroom: Classroom;
}

interface ShowProps {
    schooling: Schooling;
}

const formatMoney = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(value);

export default function Show({ schooling }: Readonly<ShowProps>) {
    return (
        <AppLayout>
            <Head title="Détail écolage" />

            <div className="space-y-6 max-w-4xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => router.get(route('schoolings.index'))}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Détail de l'écolage</h1>
                        </div>
                    </div>
                    <Button onClick={() => router.get(route('schoolings.edit', schooling.id))} className="bg-blue-600 hover:bg-blue-700">
                        Modifier
                    </Button>
                </div>

                <div className="bg-white border rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Classe</p>
                        <p className="font-medium text-gray-900 mt-1">{schooling.classroom?.name ?? '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Code</p>
                        <p className="font-medium text-gray-900 mt-1">{schooling.classroom?.code ?? '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Frais d'inscription</p>
                        <p className="font-medium text-blue-700 mt-1">{formatMoney(schooling.inscription_fee)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Frais de scolarité</p>
                        <p className="font-medium text-green-700 mt-1">{formatMoney(schooling.school_fee)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Créé le</p>
                        <p className="font-medium text-gray-900 mt-1">{new Date(schooling.created_at).toLocaleString('fr-FR')}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Modifié le</p>
                        <p className="font-medium text-gray-900 mt-1">{new Date(schooling.updated_at).toLocaleString('fr-FR')}</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
