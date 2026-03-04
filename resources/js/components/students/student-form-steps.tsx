import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

export interface StudentFormPayload {
    matricule: string;
    firstname: string;
    lastname: string;
    gender: 'male' | 'female' | '';
    birth_date: string;
    place_of_birth: string;
    nationality: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    profile_photo: string;
    active: boolean;
    information: {
        birth_certificate_number: string;
        birth_certificate_issue_date: string;
        birth_certificate_issue_place: string;
        admission_type: 'new' | 'transfer' | 're_admission';
    };
    parent: {
        father_firstname: string;
        father_lastname: string;
        father_profession: string;
        father_phone: string;
        mother_firstname: string;
        mother_lastname: string;
        mother_profession: string;
        mother_phone: string;
        email: string;
    };
    medical: {
        blood_group: string;
        allergies: string;
        vaccinations: string;
        emergency_contact_name: string;
        emergency_contact_phone: string;
    };
}

interface StudentFormStepsProps {
    mode: 'create' | 'edit';
    initialValues: StudentFormPayload;
    errors: Record<string, string>;
    isSubmitting: boolean;
    onCancel: () => void;
    onSubmit: (data: StudentFormPayload) => void;
}

const stepLabels = [
    "Informations de l'élève",
    'Dossier administratif',
    'Parents',
    'Santé',
];

export function StudentFormSteps({
    mode,
    initialValues,
    errors,
    isSubmitting,
    onCancel,
    onSubmit,
}: Readonly<StudentFormStepsProps>) {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<StudentFormPayload>(initialValues);

    const buttonLabel = useMemo(() => {
        if (mode === 'create') {
            return isSubmitting ? 'Création...' : 'Créer';
        }

        return isSubmitting ? 'Enregistrement...' : 'Enregistrer';
    }, [mode, isSubmitting]);

    const setField = <K extends keyof StudentFormPayload>(field: K, value: StudentFormPayload[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const setSectionField = <K extends keyof StudentFormPayload, S extends keyof StudentFormPayload[K] & string>(
        section: K,
        field: S,
        value: StudentFormPayload[K][S],
    ) => {
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...(prev[section] as object),
                [field]: value,
            },
        }));
    };

    const getError = (path: string) => errors[path];

    const canGoNext = () => {
        if (currentStep === 0) {
            return Boolean(formData.firstname && formData.lastname && formData.gender && formData.birth_date);
        }

        if (currentStep === 1) {
            return Boolean(formData.information.admission_type);
        }

        if (currentStep === 2) {
            return Boolean(
                formData.parent.father_firstname &&
                formData.parent.father_lastname &&
                formData.parent.mother_firstname &&
                formData.parent.mother_lastname
            );
        }

        return true;
    };

    const handleSubmit = (event: { preventDefault: () => void }) => {
        event.preventDefault();

        if (currentStep < stepLabels.length - 1) {
            if (canGoNext()) {
                setCurrentStep((prev) => prev + 1);
            }
            return;
        }

        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {stepLabels.map((label, index) => {
                        const isActive = currentStep === index;
                        const isCompleted = currentStep > index;
                        let buttonClasses = 'bg-gray-50 text-gray-600 hover:bg-gray-100';

                        if (isActive) {
                            buttonClasses = 'bg-blue-600 text-white';
                        } else if (isCompleted) {
                            buttonClasses = 'bg-blue-50 text-blue-700';
                        }

                        return (
                            <button
                                key={label}
                                type="button"
                                onClick={() => setCurrentStep(index)}
                                className={`rounded-lg px-4 py-3 text-left transition-colors ${buttonClasses}`}
                            >
                                <p className="text-xs font-semibold uppercase tracking-wide">Étape {index + 1}</p>
                                <p className="text-sm font-medium mt-1">{label}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm space-y-5">
                {currentStep === 0 && (
                    <>
                        <h2 className="text-xl font-semibold text-gray-900">Informations de l'élève</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="matricule" className="block text-sm font-medium text-gray-900 mb-2">Matricule</label>
                                <Input
                                    id="matricule"
                                    value={formData.matricule}
                                    onChange={(event) => setField('matricule', event.target.value)}
                                    className={getError('matricule') ? 'border-red-500' : ''}
                                />
                                {getError('matricule') && <p className="text-sm text-red-600 mt-1">{getError('matricule')}</p>}
                            </div>

                            <div>
                                <label htmlFor="gender" className="block text-sm font-medium text-gray-900 mb-2">Genre *</label>
                                <select
                                    id="gender"
                                    value={formData.gender}
                                    onChange={(event) => setField('gender', event.target.value as 'male' | 'female' | '')}
                                    className={`w-full px-3 py-2 rounded-lg border bg-white ${getError('gender') ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <option value="">Sélectionner</option>
                                    <option value="male">Masculin</option>
                                    <option value="female">Féminin</option>
                                </select>
                                {getError('gender') && <p className="text-sm text-red-600 mt-1">{getError('gender')}</p>}
                            </div>

                            <div>
                                <label htmlFor="firstname" className="block text-sm font-medium text-gray-900 mb-2">Prénom *</label>
                                <Input
                                    id="firstname"
                                    value={formData.firstname}
                                    onChange={(event) => setField('firstname', event.target.value)}
                                    className={getError('firstname') ? 'border-red-500' : ''}
                                />
                                {getError('firstname') && <p className="text-sm text-red-600 mt-1">{getError('firstname')}</p>}
                            </div>

                            <div>
                                <label htmlFor="lastname" className="block text-sm font-medium text-gray-900 mb-2">Nom *</label>
                                <Input
                                    id="lastname"
                                    value={formData.lastname}
                                    onChange={(event) => setField('lastname', event.target.value)}
                                    className={getError('lastname') ? 'border-red-500' : ''}
                                />
                                {getError('lastname') && <p className="text-sm text-red-600 mt-1">{getError('lastname')}</p>}
                            </div>

                            <div>
                                <label htmlFor="birth_date" className="block text-sm font-medium text-gray-900 mb-2">Date de naissance *</label>
                                <Input
                                    id="birth_date"
                                    type="date"
                                    value={formData.birth_date}
                                    onChange={(event) => setField('birth_date', event.target.value)}
                                    className={getError('birth_date') ? 'border-red-500' : ''}
                                />
                                {getError('birth_date') && <p className="text-sm text-red-600 mt-1">{getError('birth_date')}</p>}
                            </div>

                            <div>
                                <label htmlFor="place_of_birth" className="block text-sm font-medium text-gray-900 mb-2">Lieu de naissance</label>
                                <Input
                                    id="place_of_birth"
                                    value={formData.place_of_birth}
                                    onChange={(event) => setField('place_of_birth', event.target.value)}
                                />
                            </div>

                            <div>
                                <label htmlFor="nationality" className="block text-sm font-medium text-gray-900 mb-2">Nationalité</label>
                                <Input
                                    id="nationality"
                                    value={formData.nationality}
                                    onChange={(event) => setField('nationality', event.target.value)}
                                />
                            </div>

                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-900 mb-2">Ville</label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(event) => setField('city', event.target.value)}
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">Téléphone</label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(event) => setField('phone', event.target.value)}
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(event) => setField('email', event.target.value)}
                                    className={getError('email') ? 'border-red-500' : ''}
                                />
                                {getError('email') && <p className="text-sm text-red-600 mt-1">{getError('email')}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="address" className="block text-sm font-medium text-gray-900 mb-2">Adresse</label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(event) => setField('address', event.target.value)}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="profile_photo" className="block text-sm font-medium text-gray-900 mb-2">Lien photo de profil</label>
                                <Input
                                    id="profile_photo"
                                    value={formData.profile_photo}
                                    onChange={(event) => setField('profile_photo', event.target.value)}
                                />
                            </div>

                            <div className="md:col-span-2 flex items-center space-x-3 pt-2">
                                <Checkbox
                                    id="active"
                                    checked={formData.active}
                                    onCheckedChange={(checked) => setField('active', checked === true)}
                                />
                                <label htmlFor="active" className="text-sm font-medium text-gray-700">Élève actif</label>
                            </div>
                        </div>
                    </>
                )}

                {currentStep === 1 && (
                    <>
                        <h2 className="text-xl font-semibold text-gray-900">Dossier administratif</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="admission_type" className="block text-sm font-medium text-gray-900 mb-2">Type d'admission *</label>
                                <select
                                    id="admission_type"
                                    value={formData.information.admission_type}
                                    onChange={(event) => setSectionField('information', 'admission_type', event.target.value as 'new' | 'transfer' | 're_admission')}
                                    className={`w-full px-3 py-2 rounded-lg border bg-white ${getError('information.admission_type') ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <option value="new">Nouvelle inscription</option>
                                    <option value="transfer">Transfert</option>
                                    <option value="re_admission">Ré-admission</option>
                                </select>
                                {getError('information.admission_type') && <p className="text-sm text-red-600 mt-1">{getError('information.admission_type')}</p>}
                            </div>

                            <div>
                                <label htmlFor="birth_certificate_number" className="block text-sm font-medium text-gray-900 mb-2">N° acte de naissance</label>
                                <Input
                                    id="birth_certificate_number"
                                    value={formData.information.birth_certificate_number}
                                    onChange={(event) => setSectionField('information', 'birth_certificate_number', event.target.value)}
                                />
                            </div>

                            <div>
                                <label htmlFor="birth_certificate_issue_date" className="block text-sm font-medium text-gray-900 mb-2">Date de délivrance</label>
                                <Input
                                    id="birth_certificate_issue_date"
                                    type="date"
                                    value={formData.information.birth_certificate_issue_date}
                                    onChange={(event) => setSectionField('information', 'birth_certificate_issue_date', event.target.value)}
                                />
                            </div>

                            <div>
                                <label htmlFor="birth_certificate_issue_place" className="block text-sm font-medium text-gray-900 mb-2">Lieu de délivrance</label>
                                <Input
                                    id="birth_certificate_issue_place"
                                    value={formData.information.birth_certificate_issue_place}
                                    onChange={(event) => setSectionField('information', 'birth_certificate_issue_place', event.target.value)}
                                />
                            </div>
                        </div>
                    </>
                )}

                {currentStep === 2 && (
                    <>
                        <h2 className="text-xl font-semibold text-gray-900">Informations parentales</h2>

                        <div className="space-y-8">
                            {/* Informations du père */}
                            <div className="pb-8 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0" />
                                    Informations du père
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="father_firstname" className="block text-sm font-medium text-gray-900 mb-2">Prénom du père *</label>
                                        <Input
                                            id="father_firstname"
                                            value={formData.parent.father_firstname}
                                            onChange={(event) => setSectionField('parent', 'father_firstname', event.target.value)}
                                            className={getError('parent.father_firstname') ? 'border-red-500' : ''}
                                        />
                                        {getError('parent.father_firstname') && <p className="text-sm text-red-600 mt-1">{getError('parent.father_firstname')}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="father_lastname" className="block text-sm font-medium text-gray-900 mb-2">Nom du père *</label>
                                        <Input
                                            id="father_lastname"
                                            value={formData.parent.father_lastname}
                                            onChange={(event) => setSectionField('parent', 'father_lastname', event.target.value)}
                                            className={getError('parent.father_lastname') ? 'border-red-500' : ''}
                                        />
                                        {getError('parent.father_lastname') && <p className="text-sm text-red-600 mt-1">{getError('parent.father_lastname')}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="father_profession" className="block text-sm font-medium text-gray-900 mb-2">Profession du père</label>
                                        <Input
                                            id="father_profession"
                                            value={formData.parent.father_profession}
                                            onChange={(event) => setSectionField('parent', 'father_profession', event.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="father_phone" className="block text-sm font-medium text-gray-900 mb-2">Téléphone du père</label>
                                        <Input
                                            id="father_phone"
                                            value={formData.parent.father_phone}
                                            onChange={(event) => setSectionField('parent', 'father_phone', event.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Informations de la mère */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-pink-600 rounded-full shrink-0" />
                                    Informations de la mère
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="mother_firstname" className="block text-sm font-medium text-gray-900 mb-2">Prénom de la mère *</label>
                                        <Input
                                            id="mother_firstname"
                                            value={formData.parent.mother_firstname}
                                            onChange={(event) => setSectionField('parent', 'mother_firstname', event.target.value)}
                                            className={getError('parent.mother_firstname') ? 'border-red-500' : ''}
                                        />
                                        {getError('parent.mother_firstname') && <p className="text-sm text-red-600 mt-1">{getError('parent.mother_firstname')}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="mother_lastname" className="block text-sm font-medium text-gray-900 mb-2">Nom de la mère *</label>
                                        <Input
                                            id="mother_lastname"
                                            value={formData.parent.mother_lastname}
                                            onChange={(event) => setSectionField('parent', 'mother_lastname', event.target.value)}
                                            className={getError('parent.mother_lastname') ? 'border-red-500' : ''}
                                        />
                                        {getError('parent.mother_lastname') && <p className="text-sm text-red-600 mt-1">{getError('parent.mother_lastname')}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="mother_profession" className="block text-sm font-medium text-gray-900 mb-2">Profession de la mère</label>
                                        <Input
                                            id="mother_profession"
                                            value={formData.parent.mother_profession}
                                            onChange={(event) => setSectionField('parent', 'mother_profession', event.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="mother_phone" className="block text-sm font-medium text-gray-900 mb-2">Téléphone de la mère</label>
                                        <Input
                                            id="mother_phone"
                                            value={formData.parent.mother_phone}
                                            onChange={(event) => setSectionField('parent', 'mother_phone', event.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Email parent/tuteur */}
                            <div>
                                <label htmlFor="parent_email" className="block text-sm font-medium text-gray-900 mb-2">Email parent/tuteur</label>
                                <Input
                                    id="parent_email"
                                    type="email"
                                    value={formData.parent.email}
                                    onChange={(event) => setSectionField('parent', 'email', event.target.value)}
                                />
                            </div>
                        </div>
                    </>
                )}

                {currentStep === 3 && (
                    <>
                        <h2 className="text-xl font-semibold text-gray-900">Informations médicales</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="blood_group" className="block text-sm font-medium text-gray-900 mb-2">Groupe sanguin</label>
                                <Input
                                    id="blood_group"
                                    value={formData.medical.blood_group}
                                    onChange={(event) => setSectionField('medical', 'blood_group', event.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="emergency_contact_name" className="block text-sm font-medium text-gray-900 mb-2">Contact d'urgence</label>
                                <Input
                                    id="emergency_contact_name"
                                    value={formData.medical.emergency_contact_name}
                                    onChange={(event) => setSectionField('medical', 'emergency_contact_name', event.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="emergency_contact_phone" className="block text-sm font-medium text-gray-900 mb-2">Téléphone d'urgence</label>
                                <Input
                                    id="emergency_contact_phone"
                                    value={formData.medical.emergency_contact_phone}
                                    onChange={(event) => setSectionField('medical', 'emergency_contact_phone', event.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="vaccinations" className="block text-sm font-medium text-gray-900 mb-2">Vaccinations</label>
                                <Input
                                    id="vaccinations"
                                    value={formData.medical.vaccinations}
                                    onChange={(event) => setSectionField('medical', 'vaccinations', event.target.value)}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="allergies" className="block text-sm font-medium text-gray-900 mb-2">Allergies</label>
                                <textarea
                                    id="allergies"
                                    value={formData.medical.allergies}
                                    onChange={(event) => setSectionField('medical', 'allergies', event.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="flex items-center justify-between gap-3">
                <div>
                    {currentStep > 0 && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCurrentStep((prev) => prev - 1)}
                            className="border-gray-300 text-gray-700"
                        >
                            Retour
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" onClick={onCancel} className="border-gray-300 text-gray-700">
                        Annuler
                    </Button>

                    {currentStep < stepLabels.length - 1 ? (
                        <Button type="submit" disabled={!canGoNext()} className="bg-blue-600 hover:bg-blue-700">
                            Suivant
                        </Button>
                    ) : (
                        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                            {buttonLabel}
                        </Button>
                    )}
                </div>
            </div>
        </form>
    );
}
