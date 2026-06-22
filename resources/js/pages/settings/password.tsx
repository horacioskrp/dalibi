import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { Lock, KeyRound, ShieldCheck } from 'lucide-react';
import { useRef } from 'react';
import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/user-password';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Mot de passe',
        href: edit().url,
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mot de passe" />

            <h1 className="sr-only flex items-center gap-3"><KeyRound className="h-7 w-7 text-blue-600 shrink-0" />Mot de passe</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-amber-50 rounded-lg">
                            <Lock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Modifier le mot de passe</h2>
                            <p className="text-sm text-gray-600">Assurez-vous d'utiliser un mot de passe long et sécurisé</p>
                        </div>
                    </div>

                    <Form
                        {...PasswordController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnError={[
                            'password',
                            'password_confirmation',
                            'current_password',
                        ]}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                        className="space-y-6"
                    >
                        {({ errors, processing, recentlySuccessful }) => (
                            <>
                                {/* Mot de passe actuel - Fond gris */}
                                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                    <div className="flex items-center gap-2 mb-4">
                                        <KeyRound className="w-4 h-4 text-gray-600" />
                                        <Label htmlFor="current_password" className="text-sm font-semibold text-gray-900 mb-0">
                                            Mot de passe actuel
                                        </Label>
                                    </div>
                                    <Input
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        name="current_password"
                                        type="password"
                                        className="bg-white border-gray-300"
                                        autoComplete="current-password"
                                        placeholder="Entrez votre mot de passe actuel"
                                    />
                                    <InputError message={errors.current_password} />
                                </div>

                                {/* Nouveau mot de passe - Fond vert */}
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border-2 border-green-200">
                                    <div className="flex items-center gap-2 mb-4">
                                        <ShieldCheck className="w-5 h-5 text-green-600" />
                                        <span className="text-sm font-semibold text-green-900">
                                            Nouveau mot de passe
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="password" className="text-sm font-medium text-gray-900">
                                                Nouveau mot de passe
                                            </Label>
                                            <Input
                                                id="password"
                                                ref={passwordInput}
                                                name="password"
                                                type="password"
                                                className="mt-2 bg-white border-green-300 focus:ring-green-500"
                                                autoComplete="new-password"
                                                placeholder="Entrez un nouveau mot de passe"
                                            />
                                            <InputError message={errors.password} />
                                        </div>

                                        <div>
                                            <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-900">
                                                Confirmer le mot de passe
                                            </Label>
                                            <Input
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                type="password"
                                                className="mt-2 bg-white border-green-300 focus:ring-green-500"
                                                autoComplete="new-password"
                                                placeholder="Confirmez le nouveau mot de passe"
                                            />
                                            <InputError message={errors.password_confirmation} />
                                        </div>
                                    </div>

                                    <div className="mt-4 p-3 bg-green-100 rounded-md">
                                        <p className="text-xs text-green-800">
                                            💡 <strong>Conseil :</strong> Utilisez au moins 8 caractères avec des lettres, chiffres et symboles.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-2">
                                    <Button
                                        disabled={processing}
                                        className="bg-blue-600 hover:bg-blue-700"
                                        data-test="update-password-button"
                                    >
                                        {processing ? 'Modification...' : 'Modifier le mot de passe'}
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out duration-300"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out duration-300"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-green-600 font-medium">
                                            ✓ Mot de passe modifié
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
