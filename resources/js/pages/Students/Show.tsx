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
    FileBadge,
    Download,
    Users,
    HeartPulse,
    ShieldAlert,
    Clock3,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface DocTemplate { id: string; name: string; type_label: string; category: string; }
interface IssuedDoc { id: string; reference_number: string; template_name: string | null; issued_by: string | null; issued_at: string | null; }

interface ClassroomOption { id: string; name: string; code: string; }
interface CurrentEnrollment { id: string; class_id: string; class_name: string | null; class_code: string | null; year: string | null; }

interface ShowProps {
    student: Student;
    documentContext: {
        templates: DocTemplate[];
        classe: string | null;
        annee_scolaire: string | null;
    };
    issuedDocuments: IssuedDoc[];
    currentEnrollment: CurrentEnrollment | null;
    classrooms: ClassroomOption[];
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

export default function Show({ student, documentContext, issuedDocuments, currentEnrollment, classrooms }: Readonly<ShowProps>) {
    const userLabel = `${student.user?.firstname ?? ''} ${student.user?.lastname ?? ''}`.trim() || student.user?.name || '—';
    const hasEmergencyContact = Boolean(student.medical_info?.emergency_contact_name || student.medical_info?.emergency_contact_phone);

    const [deliverOpen, setDeliverOpen] = useState(false);
    const [templateId, setTemplateId] = useState('');
    const [classe, setClasse] = useState(documentContext?.classe ?? '');
    const [annee, setAnnee] = useState(documentContext?.annee_scolaire ?? '');

    const photoRef = useRef<HTMLInputElement>(null);
    const photoUrl = student.profile_photo ? route('students.photo.view', student.id) : null;
    const initials = `${student.firstname?.[0] ?? ''}${student.lastname?.[0] ?? ''}`.toUpperCase();

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        router.post(route('students.photo.upload', student.id), { photo: file }, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => { if (photoRef.current) photoRef.current.value = ''; },
        });
    };

    const handlePhotoDelete = () => {
        router.delete(route('students.photo.delete', student.id), { preserveScroll: true });
    };

    const [classOpen, setClassOpen] = useState(false);
    const [targetClass, setTargetClass] = useState(currentEnrollment?.class_id ?? '');

    const handleChangeClass = () => {
        if (!targetClass) return;
        router.post(route('students.change-class', student.id), { class_id: targetClass }, {
            preserveScroll: true,
            onSuccess: () => setClassOpen(false),
        });
    };

    // Génère et télécharge le PDF via une soumission de formulaire native (download).
    const handleGenerate = () => {
        if (!templateId) return;
        const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = route('document-templates.generate', templateId);
        form.target = '_blank';
        const fields: Record<string, string> = {
            _token: csrf,
            student_id: student.id,
            classe,
            annee_scolaire: annee,
        };
        Object.entries(fields).forEach(([name, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            input.value = value;
            form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
        form.remove();
        setDeliverOpen(false);
        // Recharge pour rafraîchir la traçabilité
        setTimeout(() => router.reload({ only: ['issuedDocuments'] }), 800);
    };

    return (
        <AppLayout>
            <Head title="Détail élève" />

            <div className="space-y-6 w-full">
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
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => setDeliverOpen(true)} className="gap-2" disabled={!documentContext?.templates?.length}>
                            <FileBadge className="w-4 h-4" />
                            Délivrer un document
                        </Button>
                        <Button onClick={() => router.get(route('students.edit', student.id))} className="bg-blue-600 hover:bg-blue-700 gap-2">
                            <Pencil className="w-4 h-4" />
                            Modifier
                        </Button>
                    </div>
                </div>

                {/* Photo + identité */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex items-center gap-5">
                    <div className="relative group shrink-0">
                        {photoUrl ? (
                            <img src={photoUrl} alt={`${student.firstname} ${student.lastname}`} className="w-24 h-24 rounded-2xl object-cover ring-1 ring-gray-200" />
                        ) : (
                            <div className="w-24 h-24 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600 ring-1 ring-blue-200">
                                {initials || <UserCircle2 className="w-10 h-10" />}
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => photoRef.current?.click()}
                            className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md ring-2 ring-white"
                            title="Changer la photo"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                        <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold text-gray-900 truncate">{student.firstname} {student.lastname}</h2>
                        <p className="text-sm text-gray-500 font-mono mt-0.5">{student.matricule ?? '—'}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => photoRef.current?.click()}>
                                <Camera className="w-3.5 h-3.5" /> {photoUrl ? 'Changer' : 'Ajouter une photo'}
                            </Button>
                            {photoUrl && (
                                <Button variant="outline" size="sm" className="gap-1.5 border-red-200 text-red-500 hover:bg-red-50" onClick={handlePhotoDelete}>
                                    <Trash2 className="w-3.5 h-3.5" /> Retirer
                                </Button>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG ou WebP — max 2 Mo</p>
                    </div>
                </div>

                {/* Scolarité actuelle + réaffectation */}
                {currentEnrollment && (
                    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 shadow-sm flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-indigo-700 font-semibold">Scolarité actuelle ({currentEnrollment.year})</p>
                            <p className="mt-1 text-lg font-bold text-indigo-900">
                                {currentEnrollment.class_name ?? '—'}
                                {currentEnrollment.class_code && <span className="ml-2 text-sm font-normal text-indigo-500">({currentEnrollment.class_code})</span>}
                            </p>
                        </div>
                        <Button variant="outline" className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-100" onClick={() => { setTargetClass(currentEnrollment.class_id); setClassOpen(true); }}>
                            <Building2 className="w-4 h-4" /> Changer de classe
                        </Button>
                    </div>
                )}

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

                {/* Traçabilité des documents délivrés */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                        <FileBadge className="w-4 h-4 text-blue-600" />
                        Documents délivrés
                        <span className="text-gray-400 font-normal">({issuedDocuments.length})</span>
                    </h2>
                    {issuedDocuments.length === 0 ? (
                        <p className="text-sm text-gray-400 py-4 text-center">Aucun document délivré pour cet élève.</p>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {issuedDocuments.map(doc => (
                                <div key={doc.id} className="flex items-center justify-between py-2.5 text-sm">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                                        <div>
                                            <p className="font-medium text-gray-900">{doc.template_name ?? '—'}</p>
                                            <p className="text-xs text-gray-400 font-mono">{doc.reference_number}</p>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs text-gray-500">
                                        <p>{doc.issued_at}</p>
                                        {doc.issued_by && <p className="text-gray-400">par {doc.issued_by}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm text-sm text-slate-600 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2"><Clock3 className="w-4 h-4" />Créé le {new Date(student.created_at).toLocaleString('fr-FR')}</span>
                    <span className="inline-flex items-center gap-2"><Clock3 className="w-4 h-4" />Mis à jour le {new Date(student.updated_at).toLocaleString('fr-FR')}</span>
                </div>
            </div>

            {/* Dialog : délivrer un document */}
            <Dialog open={deliverOpen} onOpenChange={setDeliverOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Délivrer un document</DialogTitle>
                        <DialogDescription>
                            Générez un certificat ou une attestation pour {student.firstname} {student.lastname}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Type de document *</label>
                            <Select value={templateId} onValueChange={setTemplateId}>
                                <SelectTrigger><SelectValue placeholder="Choisir un modèle" /></SelectTrigger>
                                <SelectContent>
                                    {documentContext?.templates?.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Classe</label>
                                <Input value={classe} onChange={e => setClasse(e.target.value)} placeholder="Ex: 3ème A" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Année scolaire</label>
                                <Input value={annee} onChange={e => setAnnee(e.target.value)} placeholder="2025-2026" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDeliverOpen(false)}>Annuler</Button>
                        <Button onClick={handleGenerate} disabled={!templateId} className="bg-blue-600 hover:bg-blue-700 gap-2">
                            <Download className="w-4 h-4" /> Générer le PDF
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog : changement de classe */}
            <Dialog open={classOpen} onOpenChange={setClassOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Changer de classe</DialogTitle>
                        <DialogDescription>
                            Réaffecter {student.firstname} {student.lastname} pour l'année {currentEnrollment?.year}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Nouvelle classe</label>
                            <Select value={targetClass} onValueChange={setTargetClass}>
                                <SelectTrigger><SelectValue placeholder="Choisir une classe" /></SelectTrigger>
                                <SelectContent>
                                    {classrooms.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name} ({c.code})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <p className="text-xs text-gray-400">Les frais déjà facturés ne sont pas recalculés automatiquement.</p>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setClassOpen(false)}>Annuler</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" disabled={!targetClass || targetClass === currentEnrollment?.class_id} onClick={handleChangeClass}>
                            Réaffecter
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
