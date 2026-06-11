import { BookOpen, Calendar, Clock, ClipboardList, GraduationCap, LayoutGrid, Layers, Settings, Tag, Users, Shield, Lock, Wallet, Percent, DollarSign, UserCircle, TrendingUp, ArrowLeftRight, PieChart, FileText, ListChecks, NotebookPen } from 'lucide-react';
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
            {
                title: 'Bourses d\'étudiants',
                href: route('student-scholarships.index'),
                icon: Percent,
            },
        ],
    },
    {
        title: 'Comptabilité',
        href: '#',
        icon: TrendingUp,
        items: [
            {
                title: 'Vue d\'ensemble',
                href: route('accounting.index'),
                icon: TrendingUp,
            },
            {
                title: 'Journal des transactions',
                href: route('accounting.transactions'),
                icon: ArrowLeftRight,
            },
            {
                title: 'Situation par classe',
                href: route('accounting.situation'),
                icon: PieChart,
            },
            {
                title: 'Caisses',
                href: route('cash-accounts.index'),
                icon: Wallet,
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
                title: 'Types d\'évaluation',
                href: route('evaluation-types.index'),
                icon: Tag,
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
        title: 'Examens',
        href: '#',
        icon: NotebookPen,
        items: [
            {
                title: 'Modèles d\'évaluation',
                href: route('evaluation-templates.index'),
                icon: FileText,
            },
            {
                title: 'Évaluations par classe',
                href: route('evaluations.index'),
                icon: ListChecks,
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
    {
        title: 'Mon compte',
        href: '/settings/profile',
        icon: UserCircle,
    },
];