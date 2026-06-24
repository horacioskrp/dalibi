import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { Lock, KeyRound, ShieldCheck } from 'lucide-react';
import { useRef, useState } from 'react';
import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import InputError from '@/components/input-error';
import PasswordStrength from '@/components/password-strength';
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
    const [password, setPassword] = useState('');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mot de passe" />

            <h1 className="sr-only flex items-center gap-3"><KeyRound className="h-7 w-7 text-blue-600 shrink-0" />Mot de passe</h1>

            <SettingsLayout bare>
                <div className="space-y-6">
                    {/* En-tête */}
                    <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-blue-50 to-cyan-50 p-6 ring-1 ring-blue-100 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                                <KeyRound className="h-7 w-7" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Mot de passe</h2>
                                <p className="text-sm text-gray-600">Assurez-vous d'utiliser un mot de passe long et sécurisé.</p>
                            </div>
                        </div>
                        <Lock className="pointer-events-none absolute -right-4 -bottom-6 h-32 w-32 text-blue-600 opacity-[0.07]" />
                    </div>

                    {/* Formulaire */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
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
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                            <InputError message={errors.password} />
                                            <PasswordStrength value={password} />
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
                                            💡 <strong>Conseil :</strong> Au moins 12 caractères mêlant majuscules, minuscules, chiffres et symboles. Évitez les mots de passe déjà utilisés ailleurs.
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
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
