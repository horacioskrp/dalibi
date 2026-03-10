import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Building2, CalendarClock, CheckCircle2, Mail, MapPin, Pencil, Phone, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface School {
    id: string;
    name: string;
    code: string;
    logo: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    region: string | null;
    city: string | null;
    po_box: string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
}

interface ShowProps {
    school: School;
}

export default function Show({ school }: Readonly<ShowProps>) {
    return (
        <AppLayout>
            <Head title={school.name} />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href={route('schools.index')}>
                            <Button variant="ghost" size="sm" className="p-2">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {school.name}
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Code: <span className="font-semibold">{school.code}</span>
                            </p>
                            <div className="mt-3">
                                {school.active ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                                        <XCircle className="w-3.5 h-3.5" />
                                        Inactive
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <Link href={route('schools.edit', school.id)}>
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm">
                            <Pencil className="w-4 h-4" />
                            Éditer
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* General Info */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            Informations générales
                        </h2>
                        {school.logo && (
                            <div className="mb-4">
                                <img
                                    src={school.logo}
                                    alt={`Logo ${school.name}`}
                                    className="h-20 w-20 rounded-xl object-cover ring-1 ring-gray-100"
                                />
                            </div>
                        )}
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600">Code</p>
                                <p className="text-lg font-medium text-gray-900">
                                    {school.code}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 flex items-center gap-2"><Mail className="w-4 h-4" />E-mail</p>
                                <p className="text-lg font-medium text-gray-900">
                                    {school.email || '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 flex items-center gap-2"><Phone className="w-4 h-4" />Téléphone</p>
                                <p className="text-lg font-medium text-gray-900">
                                    {school.phone || '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Address & Timeline */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-emerald-600" />
                                Localisation
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600 flex items-center gap-2"><MapPin className="w-4 h-4" />Région</p>
                                    <p className="text-sm font-medium text-gray-900">{school.region || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 flex items-center gap-2"><MapPin className="w-4 h-4" />Ville</p>
                                    <p className="text-sm font-medium text-gray-900">{school.city || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Boîte postale</p>
                                    <p className="text-sm font-medium text-gray-900">{school.po_box || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Adresse</p>
                                    <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap">{school.address || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <CalendarClock className="w-5 h-5 text-violet-600" />
                                Événements
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Créée le
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {new Date(
                                            school.created_at
                                        ).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Modifiée le
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {new Date(
                                            school.updated_at
                                        ).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
