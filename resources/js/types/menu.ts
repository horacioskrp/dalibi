import { BookOpen, Calendar, GraduationCap, LayoutGrid, Layers, Settings, Tag, Users, Shield, Lock } from 'lucide-react';
import { route } from '@/helpers/route';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

export const mainNavItems: NavItem[] = [
    {
        title: 'Tableau de bord',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Paramètres',
        href: '#',
        icon: Settings,
        items: [
            {
                title: 'Écoles',
                href: route('schools.index'),
                icon: BookOpen,
            },
            {
                title: 'Classes',
                href: route('classrooms.index'),
                icon: Layers,
            },
            {
                title: 'Types de classes',
                href: route('classroom-types.index'),
                icon: Tag,
            },
            {
                title: 'Matières',
                href: route('subjects.index'),
                icon: BookOpen,
            },
            {
                title: 'Années académiques',
                href: route('academic-years.index'),
                icon: Calendar,
            },
            {
                title: 'Niveaux',
                href: route('levels.index'),
                icon: GraduationCap,
            },
        ],
    },
    {
        title: 'Administration',
        href: '#',
        icon: Shield,
        items: [
            {
                title: 'Utilisateurs',
                href: route('users.index'),
                icon: Users,
            },
            {
                title: 'Rôles',
                href: route('roles.index'),
                icon: Shield,
            },
            {
                title: 'Permissions',
                href: route('permissions.index'),
                icon: Lock,
            },
        ],
    },
];