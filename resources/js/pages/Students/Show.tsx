import { Head, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Pencil,
    UserCircle2,
    BadgeCheck,
    CalendarDays,
    Building2,
    Phone,
    Mail,
    MapPin,
    Globe,
    FileText,
    Users,
    HeartPulse,
    ShieldAlert,
    Clock3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Student {
    id: string;
    matricule?: string | null;
    firstname: string;
    lastname: string;
    gender: 'male' | 'female';
    birth_date: string;
    place_of_birth?: string | null;
    nationality?: string | null;
    address?: string | null;
    city?: string | null;
    phone?: string | null;
    email?: string | null;
    profile_photo?: string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
    user?: {
        id: string;
        firstname?: string | null;
        lastname?: string | null;
        name?: string | null;
        email?: string | null;
    } | null;
    information?: {
        birth_certificate_number?: string | null;
        birth_certificate_issue_date?: string | null;
        birth_certificate_issue_place?: string | null;
        admission_type?: 'new' | 'transfer' | 're_admission';
    } | null;
    parent_info?: {
        father_firstname?: string | null;
        father_lastname?: string | null;
        father_profession?: string | null;
        father_phone?: string | null;
        mother_firstname?: string | null;
        mother_lastname?: string | null;
        mother_profession?: string | null;
        mother_phone?: string | null;
        email?: string | null;
    } | null;
    medical_info?: {
        blood_group?: string | null;
        allergies?: string | null;
        vaccinations?: string | null;
        emergency_contact_name?: string | null;
        emergency_contact_phone?: string | null;
    } | null;
}

interface ShowProps {
    student: Student;
}

const formatDate = (value?: string | null): string => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('fr-FR');
};

const admissionTypeLabel: Record<string, string> = {
    new: 'Nouvelle inscription',
    transfer: 'Transfert',
    re_admission: 'Ré-admission',
};

export default function Show({ student }: Readonly<ShowProps>) {
    const userLabel = `${student.user?.firstname ?? ''} ${student.user?.lastname ?? ''}`.trim() || student.user?.name || '—';
    const hasEmergencyContact = Boolean(student.medical_info?.emergency_contact_name || student.medical_info?.emergency_contact_phone);

    return (
        <AppLayout>
            <Head title="Détail élève" />

            <div className="space-y-6 max-w-6xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => router.get(route('students.index'))}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Détail élève</h1>
                            <p className="mt-2 text-gray-600">Consultez toutes les informations de l'élève</p>
                        </div>
                    </div>
                    <Button onClick={() => router.get(route('students.edit', student.id))} className="bg-blue-600 hover:bg-blue-700 gap-2">
                        <Pencil className="w-4 h-4" />
                        Modifier
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-wide text-blue-700 font-semibold">Identité</p>
                        <p className="mt-2 text-lg font-bold text-blue-900">{student.firstname} {student.lastname}</p>
                        <p className="text-sm text-blue-700 mt-1">Matricule: {student.matricule ?? '—'}</p>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">Statut</p>
                        <div className="mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold bg-white border border-emerald-200 text-emerald-800">
                            <BadgeCheck className="w-4 h-4" />
                            {student.active ? 'Élève actif' : 'Élève inactif'}
                        </div>
                        <p className="text-sm text-emerald-700 mt-2">Compte: {userLabel}</p>
                    </div>
                    <div className={`rounded-xl border p-4 shadow-sm ${hasEmergencyContact ? 'border-rose-200 bg-rose-50' : 'border-amber-200 bg-amber-50'}`}>
                        <p className={`text-xs uppercase tracking-wide font-semibold ${hasEmergencyContact ? 'text-rose-700' : 'text-amber-700'}`}>Urgence médicale</p>
                        <p className={`mt-2 text-sm ${hasEmergencyContact ? 'text-rose-800' : 'text-amber-800'}`}>
                            {hasEmergencyContact
                                ? `${student.medical_info?.emergency_contact_name ?? 'Contact'} - ${student.medical_info?.emergency_contact_phone ?? 'Téléphone non renseigné'}`
                                : 'Aucun contact d\'urgence renseigné'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-xl border border-blue-100 bg-linear-to-br from-blue-50 to-white p-6 shadow-sm space-y-4">
                        <h2 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                            <UserCircle2 className="w-5 h-5" />
                            Identité
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500">Nom complet</p>
                                <p className="font-medium text-gray-900 mt-1">{student.firstname} {student.lastname}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Matricule</p>
                                <p className="font-medium text-gray-900 mt-1">{student.matricule ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Genre</p>
                                <p className="font-medium text-gray-900 mt-1">{student.gender === 'male' ? 'Masculin' : 'Féminin'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Statut</p>
                                <p className="font-medium mt-1">
                                    <span className={`px-2 py-1 rounded text-sm ${student.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {student.active ? 'Actif' : 'Inactif'}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500">Date de naissance</p>
                                <p className="font-medium text-gray-900 mt-1 inline-flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-blue-600" />{formatDate(student.birth_date)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Lieu de naissance</p>
                                <p className="font-medium text-gray-900 mt-1 inline-flex items-center gap-1.5"><Building2 className="w-4 h-4 text-blue-600" />{student.place_of_birth ?? '—'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-cyan-100 bg-linear-to-br from-cyan-50 to-white p-6 shadow-sm space-y-4">
                        <h2 className="text-lg font-semibold text-cyan-900 flex items-center gap-2">
                            <BadgeCheck className="w-5 h-5" />
                            Contact & compte
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500">Compte utilisateur</p>
                                <p className="font-medium text-gray-900 mt-1">{userLabel}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Email compte</p>
                                <p className="font-medium text-gray-900 mt-1 inline-flex items-center gap-1.5"><Mail className="w-4 h-4 text-cyan-600" />{student.user?.email ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Téléphone</p>
                                <p className="font-medium text-gray-900 mt-1 inline-flex items-center gap-1.5"><Phone className="w-4 h-4 text-cyan-600" />{student.phone ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Email élève</p>
                                <p className="font-medium text-gray-900 mt-1 inline-flex items-center gap-1.5"><Mail className="w-4 h-4 text-cyan-600" />{student.email ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Ville</p>
                                <p className="font-medium text-gray-900 mt-1 inline-flex items-center gap-1.5"><MapPin className="w-4 h-4 text-cyan-600" />{student.city ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Nationalité</p>
                                <p className="font-medium text-gray-900 mt-1 inline-flex items-center gap-1.5"><Globe className="w-4 h-4 text-cyan-600" />{student.nationality ?? '—'}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-gray-500">Adresse</p>
                                <p className="font-medium text-gray-900 mt-1">{student.address ?? '—'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-violet-100 bg-linear-to-br from-violet-50 to-white p-6 shadow-sm space-y-4">
                        <h2 className="text-lg font-semibold text-violet-900 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Dossier administratif
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500">Type d'admission</p>
                                <p className="font-medium text-gray-900 mt-1">{admissionTypeLabel[student.information?.admission_type ?? 'new']}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">N° acte de naissance</p>
                                <p className="font-medium text-gray-900 mt-1">{student.information?.birth_certificate_number ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Date de délivrance</p>
                                <p className="font-medium text-gray-900 mt-1 inline-flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-violet-600" />{formatDate(student.information?.birth_certificate_issue_date)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Lieu de délivrance</p>
                                <p className="font-medium text-gray-900 mt-1">{student.information?.birth_certificate_issue_place ?? '—'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-rose-100 bg-linear-to-br from-rose-50 to-white p-6 shadow-sm space-y-4">
                        <h2 className="text-lg font-semibold text-rose-900 flex items-center gap-2">
                            <HeartPulse className="w-5 h-5" />
                            Parents & médical
                        </h2>
                        {hasEmergencyContact && (
                            <div className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm text-rose-800 inline-flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4" />
                                Contact d'urgence disponible
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500">Père</p>
                                <p className="font-medium text-gray-900 mt-1 inline-flex items-center gap-1.5"><Users className="w-4 h-4 text-rose-600" />{student.parent_info?.father_firstname ?? '—'} {student.parent_info?.father_lastname ?? ''}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Mère</p>
                                <p className="font-medium text-gray-900 mt-1 inline-flex items-center gap-1.5"><Users className="w-4 h-4 text-rose-600" />{student.parent_info?.mother_firstname ?? '—'} {student.parent_info?.mother_lastname ?? ''}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Téléphone père</p>
                                <p className="font-medium text-gray-900 mt-1 inline-flex items-center gap-1.5"><Phone className="w-4 h-4 text-rose-600" />{student.parent_info?.father_phone ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Téléphone mère</p>
                                <p className="font-medium text-gray-900 mt-1 inline-flex items-center gap-1.5"><Phone className="w-4 h-4 text-rose-600" />{student.parent_info?.mother_phone ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Email parent</p>
                                <p className="font-medium text-gray-900 mt-1 inline-flex items-center gap-1.5"><Mail className="w-4 h-4 text-rose-600" />{student.parent_info?.email ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Groupe sanguin</p>
                                <p className="font-medium text-gray-900 mt-1">{student.medical_info?.blood_group ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Contact d'urgence</p>
                                <p className="font-medium text-gray-900 mt-1">{student.medical_info?.emergency_contact_name ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Téléphone d'urgence</p>
                                <p className="font-medium text-gray-900 mt-1">{student.medical_info?.emergency_contact_phone ?? '—'}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-gray-500">Allergies</p>
                                <p className="font-medium text-gray-900 mt-1">{student.medical_info?.allergies ?? '—'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm text-sm text-slate-600 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2"><Clock3 className="w-4 h-4" />Créé le {new Date(student.created_at).toLocaleString('fr-FR')}</span>
                    <span className="inline-flex items-center gap-2"><Clock3 className="w-4 h-4" />Mis à jour le {new Date(student.updated_at).toLocaleString('fr-FR')}</span>
                </div>
            </div>
        </AppLayout>
    );
}
