import { BookOpen, Calendar, Clock, ClipboardList, GraduationCap, LayoutGrid, Layers, Settings, Tag, Users, Shield, Lock, Wallet, Percent, DollarSign } from 'lucide-react';
import { route } from '@/helpers/route';
import type { NavItem } from '@/types';

export const mainNavItems: NavItem[] = [
    {
        title: 'Tableau de bord',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Élèves',
        href: '#',
        icon: Users,
        items: [
            {
                title: 'Élèves',
                href: route('students.index'),
                icon: Users,
            },
            {
                title: 'Inscriptions',
                href: route('enrollments.index'),
                icon: ClipboardList,
            },
        ],
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
                title: 'Attribution matière-classe',
                href: route('class-subjects.index'),
                icon: ClipboardList,
            },
            {
                title: 'Années académiques',
                href: route('academic-years.index'),
                icon: Calendar,
            },
            {
                title: 'Périodes académiques',
                href: route('academic-periods.index'),
                icon: Clock,
            },
            {
                title: 'Niveaux',
                href: route('levels.index'),
                icon: GraduationCap,
            },
            {
                title: 'Ecolage',
                href: route('schoolings.index'),
                icon: Wallet,
            },
            {
                title: 'Catégories de frais',
                href: route('fee-categories.index'),
                icon: Percent,
            },
            {
                title: 'Structures de frais',
                href: route('fee-structures.index'),
                icon: DollarSign,
            },
            {
                title: 'Bourses',
                href: route('scholarships.index'),
                icon: Percent,
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
            {
                title: 'Affectations',
                href: route('subject-assignments.index'),
                icon: ClipboardList,
            },
        ],
    },
];