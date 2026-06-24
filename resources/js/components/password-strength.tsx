import { Check, X } from 'lucide-react';

interface Rule {
    label: string;
    test: (v: string) => boolean;
}

export const PASSWORD_RULES: Rule[] = [
    { label: 'Au moins 12 caractères', test: (v) => v.length >= 12 },
    { label: 'Une lettre minuscule', test: (v) => /[a-z]/.test(v) },
    { label: 'Une lettre majuscule', test: (v) => /[A-Z]/.test(v) },
    { label: 'Un chiffre', test: (v) => /\d/.test(v) },
    { label: 'Un symbole (!@#$…)', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const STRENGTH = [
    { label: 'Très faible', color: 'bg-red-500', text: 'text-red-600' },
    { label: 'Faible', color: 'bg-orange-500', text: 'text-orange-600' },
    { label: 'Moyen', color: 'bg-amber-500', text: 'text-amber-600' },
    { label: 'Bon', color: 'bg-lime-500', text: 'text-lime-600' },
    { label: 'Fort', color: 'bg-green-600', text: 'text-green-600' },
];

export default function PasswordStrength({ value }: Readonly<{ value: string }>) {
    if (!value) return null;

    const passed = PASSWORD_RULES.filter((r) => r.test(value)).length;
    const level = STRENGTH[Math.max(0, passed - 1)];

    return (
        <div className="mt-3 space-y-3">
            <div>
                <div className="flex h-1.5 gap-1">
                    {PASSWORD_RULES.map((r, i) => (
                        <div
                            key={r.label}
                            className={`flex-1 rounded-full transition-colors ${i < passed ? level.color : 'bg-gray-200'}`}
                        />
                    ))}
                </div>
                <p className={`mt-1.5 text-xs font-medium ${level.text}`}>Robustesse : {level.label}</p>
            </div>
            <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {PASSWORD_RULES.map((r) => {
                    const ok = r.test(value);
                    return (
                        <li key={r.label} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-green-700' : 'text-gray-500'}`}>
                            {ok ? <Check className="h-3.5 w-3.5 shrink-0" /> : <X className="h-3.5 w-3.5 shrink-0 text-gray-300" />}
                            {r.label}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
