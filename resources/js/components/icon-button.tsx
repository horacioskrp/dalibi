import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * Bouton d'action « icône seule » : infobulle au survol + libellé accessible
 * (`aria-label`). À utiliser dans les colonnes d'actions des listes.
 *
 * Le composant `Tooltip` du design system embarque déjà son `TooltipProvider`.
 */
export function IconButton({
    label,
    icon,
    onClick,
    className,
    variant = 'outline',
    size = 'sm',
    disabled,
    type = 'button',
}: Readonly<{
    label: string;
    icon: React.ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: React.ComponentProps<typeof Button>['variant'];
    size?: React.ComponentProps<typeof Button>['size'];
    disabled?: boolean;
    type?: 'button' | 'submit';
}>) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button type={type} variant={variant} size={size} className={className} onClick={onClick} disabled={disabled} aria-label={label}>
                    {icon}
                </Button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}
