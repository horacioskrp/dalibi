import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { User, Mail, Phone, MapPin, Calendar, IdCard } from 'lucide-react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Paramètres du compte',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: Readonly<{
    mustVerifyEmail: boolean;
    status?: string;
}>) {
    const { auth } = usePage().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mon profil" />

            <h1 className="sr-only">Mon profil</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Informations personnelles</h2>
                            <p className="text-sm text-gray-600">Gérez vos informations de profil</p>
                        </div>
                    </div>

                        <Form
                            {...ProfileController.update.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            className="space-y-5"
                        >
                            {({ processing, recentlySuccessful, errors }) => (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstname" className="text-sm font-medium text-gray-900">
                                                Prénom *
                                            </Label>
                                            <Input
                                                id="firstname"
                                                className="border-gray-300"
                                                defaultValue={auth.user.firstname}
                                                name="firstname"
                                                required
                                                autoComplete="given-name"
                                                placeholder="Votre prénom"
                                            />
                                            <InputError message={errors.firstname} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="lastname" className="text-sm font-medium text-gray-900">
                                                Nom de famille *
                                            </Label>
                                            <Input
                                                id="lastname"
                                                className="border-gray-300"
                                                defaultValue={auth.user.lastname}
                                                name="lastname"
                                                required
                                                autoComplete="family-name"
                                                placeholder="Votre nom"
                                            />
                                            <InputError message={errors.lastname} />
                                        </div>
                                    </div>

                                    {auth.user.matricule && (
                                        <div className="space-y-2">
                                            <Label htmlFor="matricule" className="text-sm font-medium text-gray-900">
                                                <IdCard className="w-4 h-4 inline mr-2" />
                                                Matricule
                                            </Label>
                                            <Input
                                                id="matricule"
                                                className="bg-gray-50 border-gray-200"
                                                defaultValue={auth.user.matricule || ''}
                                                disabled
                                                placeholder="Non attribué"
                                            />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="gender" className="text-sm font-medium text-gray-900">
                                                Genre
                                            </Label>
                                            <Select name="gender" defaultValue={auth.user.gender || ''}>
                                                <SelectTrigger id="gender" className="border-gray-300">
                                                    <SelectValue placeholder="Sélectionner" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">Masculin</SelectItem>
                                                    <SelectItem value="female">Féminin</SelectItem>
                                                    <SelectItem value="other">Autre</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.gender} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="birth_date" className="text-sm font-medium text-gray-900">
                                                <Calendar className="w-4 h-4 inline mr-2" />
                                                Date de naissance
                                            </Label>
                                            <Input
                                                id="birth_date"
                                                type="date"
                                                className="border-gray-300"
                                                defaultValue={auth.user.birth_date || ''}
                                                name="birth_date"
                                            />
                                            <InputError message={errors.birth_date} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-medium text-gray-900">
                                                <Mail className="w-4 h-4 inline mr-2" />
                                                Adresse email *
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                className="border-gray-300"
                                                defaultValue={auth.user.email}
                                                name="email"
                                                required
                                                autoComplete="username"
                                                placeholder="exemple@email.com"
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="telephone" className="text-sm font-medium text-gray-900">
                                                <Phone className="w-4 h-4 inline mr-2" />
                                                Téléphone
                                            </Label>
                                            <Input
                                                id="telephone"
                                                type="tel"
                                                className="border-gray-300"
                                                defaultValue={auth.user.telephone || ''}
                                                name="telephone"
                                                autoComplete="tel"
                                                placeholder="+243 XXX XXX XXX"
                                            />
                                            <InputError message={errors.telephone} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="text-sm font-medium text-gray-900">
                                            <MapPin className="w-4 h-4 inline mr-2" />
                                            Adresse
                                        </Label>
                                        <Input
                                            id="address"
                                            className="border-gray-300"
                                            defaultValue={auth.user.address || ''}
                                            name="address"
                                            placeholder="Votre adresse complète"
                                        />
                                        <InputError message={errors.address} />
                                    </div>

                                    {mustVerifyEmail &&
                                        auth.user.email_verified_at === null && (
                                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                                <p className="text-sm text-amber-800">
                                                    Votre adresse email n'est pas vérifiée.{' '}
                                                    <Link
                                                        href={send()}
                                                        as="button"
                                                        className="font-medium underline underline-offset-4 hover:text-amber-900"
                                                    >
                                                        Cliquez ici pour renvoyer l'email de vérification.
                                                    </Link>
                                                </p>

                                                {status === 'verification-link-sent' && (
                                                    <div className="mt-2 text-sm font-medium text-green-700">
                                                        Un nouveau lien de vérification a été envoyé à votre adresse email.
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                    <div className="flex items-center gap-4 pt-2">
                                        <Button
                                            disabled={processing}
                                            className="bg-blue-600 hover:bg-blue-700"
                                            data-test="update-profile-button"
                                        >
                                            {processing ? 'Enregistrement...' : 'Enregistrer'}
                                        </Button>

                                        <Transition
                                            show={recentlySuccessful}
                                            enter="transition ease-in-out duration-300"
                                            enterFrom="opacity-0"
                                            leave="transition ease-in-out duration-300"
                                            leaveTo="opacity-0"
                                        >
                                            <p className="text-sm text-green-600 font-medium">
                                                ✓ Modifications enregistrées
                                            </p>
                                        </Transition>
                                    </div>
                                </>
                            )}
                        </Form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
