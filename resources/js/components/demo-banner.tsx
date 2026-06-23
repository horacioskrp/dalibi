import { usePage } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';

/**
 * Bannière affichée lorsqu'un compte de DÉMONSTRATION (is_demo) est connecté.
 * Rappelle de changer le mot de passe / désactiver ces comptes en production.
 */
export function DemoBanner() {
    const user = (usePage().props as { auth?: { user?: { is_demo?: boolean } } }).auth?.user;

    if (!user?.is_demo) {
        return null;
    }

    return (
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 px-4 py-2 text-sm text-amber-800 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
                <strong>Compte de démonstration.</strong> En production, changez le mot de passe et
                désactivez (ou supprimez) ces comptes de test.
            </span>
        </div>
    );
}
