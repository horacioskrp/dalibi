import { Head, router } from '@inertiajs/react';
import { BookOpen, CheckCircle2, Save, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { route } from '@/helpers/route';
import AppLayout from '@/layouts/app-layout';

interface Student {
    id: string;
    firstname: string;
    lastname: string;
    matricule: string;
}

interface StudentGrade {
    student_id: string;
    student: Student;
    grade_id: string | null;
    score: number | null;
    comments: string | null;
}

interface ClassSubject {
    id: string;
    coefficient: number;
    subject: { id: string; name: string; code: string };
}

interface Classroom {
    id: string;
    name: string;
    code: string;
}

interface IndexProps {
    classrooms: Classroom[];
    classSubjects: ClassSubject[];
    studentsWithGrades: StudentGrade[];
    activeYear: { id: string; name: string } | null;
    stats: { total: number; graded: number; average: number | null };
    filters: { class_id: string; class_subject_id: string; term: string };
}

const TERMS = [
    { value: 'term1', label: 'Trimestre 1' },
    { value: 'term2', label: 'Trimestre 2' },
    { value: 'term3', label: 'Trimestre 3' },
];

export default function Index({
    classrooms,
    classSubjects,
    studentsWithGrades,
    activeYear,
    stats,
    filters,
}: Readonly<IndexProps>) {
    const [classId, setClassId] = useState(filters.class_id || 'none');
    const [classSubjectId, setClassSubjectId] = useState(filters.class_subject_id || 'none');
    const [term, setTerm] = useState(filters.term || 'none');
    const [grades, setGrades] = useState<Record<string, { score: string; comments: string }>>({});
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const initial: Record<string, { score: string; comments: string }> = {};
        for (const sg of studentsWithGrades) {
            initial[sg.student_id] = {
                score: sg.score !== null ? String(sg.score) : '',
                comments: sg.comments ?? '',
            };
        }
        setGrades(initial);
        setSaved(false);
    }, [studentsWithGrades]);

    const onClassChange = (value: string) => {
        setClassId(value);
        setClassSubjectId('none');
        router.get(route('grades.index'), { class_id: value }, { preserveScroll: true, replace: true });
    };

    const onSubjectOrTermChange = (newSubjectId: string, newTerm: string) => {
        if (newSubjectId !== 'none' && newTerm !== 'none') {
            router.get(
                route('grades.index'),
                { class_id: classId, class_subject_id: newSubjectId, term: newTerm },
                { preserveScroll: true, replace: true },
            );
        }
    };

    const onSubjectChange = (value: string) => {
        setClassSubjectId(value);
        onSubjectOrTermChange(value, term);
    };

    const onTermChange = (value: string) => {
        setTerm(value);
        onSubjectOrTermChange(classSubjectId, value);
    };

    const onScoreChange = (studentId: string, value: string) => {
        setGrades((prev) => ({ ...prev, [studentId]: { ...prev[studentId], score: value } }));
        setSaved(false);
    };

    const onCommentsChange = (studentId: string, value: string) => {
        setGrades((prev) => ({ ...prev, [studentId]: { ...prev[studentId], comments: value } }));
        setSaved(false);
    };

    const onSave = () => {
        const payload = studentsWithGrades.map((sg) => ({
            student_id: sg.student_id,
            score: grades[sg.student_id]?.score !== '' ? grades[sg.student_id]?.score : null,
            comments: grades[sg.student_id]?.comments || null,
        }));

        setSaving(true);
        router.post(
            route('grades.store'),
            { class_subject_id: classSubjectId, term, grades: payload },
            {
                preserveScroll: true,
                onSuccess: () => { setSaved(true); setSaving(false); },
                onError: () => setSaving(false),
            },
        );
    };

    const canSave = classSubjectId !== 'none' && term !== 'none' && studentsWithGrades.length > 0;
    const selectedSubject = classSubjects.find((cs) => cs.id === classSubjectId);

    const statsCards = [
        {
            title: 'Élèves inscrits',
            value: stats.total,
            icon: Users,
            cardClass: 'bg-linear-to-br from-blue-50/70 to-white ring-1 ring-blue-100',
            iconWrapClass: 'bg-blue-100',
            textColor: 'text-blue-600',
        },
        {
            title: 'Notes saisies',
            value: stats.graded,
            icon: CheckCircle2,
            cardClass: 'bg-linear-to-br from-emerald-50/70 to-white ring-1 ring-emerald-100',
            iconWrapClass: 'bg-emerald-100',
            textColor: 'text-emerald-600',
        },
        {
            title: 'Moyenne de classe',
            value: stats.average !== null ? `${stats.average}/20` : '—',
            icon: TrendingUp,
            cardClass: 'bg-linear-to-br from-violet-50/70 to-white ring-1 ring-violet-100',
            iconWrapClass: 'bg-violet-100',
            textColor: 'text-violet-600',
        },
        {
            title: 'Taux de saisie',
            value: stats.total > 0 ? `${Math.round((stats.graded / stats.total) * 100)}%` : '—',
            icon: BookOpen,
            cardClass: 'bg-linear-to-br from-amber-50/70 to-white ring-1 ring-amber-100',
            iconWrapClass: 'bg-amber-100',
            textColor: 'text-amber-600',
        },
    ];

    const termLabel = TERMS.find((t) => t.value === term)?.label ?? '';

    return (
        <AppLayout>
            <Head title="Saisie des Notes" />

            <div className="max-w-7xl space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Saisie des Notes</h1>
                        <p className="mt-2 text-lg text-gray-600">
                            {activeYear ? `Année scolaire : ${activeYear.name}` : 'Aucune année scolaire active'}
                        </p>
                    </div>
                    {canSave && (
                        <Button
                            className={`gap-2 ${saved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                            onClick={onSave}
                            disabled={saving}
                        >
                            {saved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                            {saving ? 'Enregistrement...' : saved ? 'Enregistré !' : 'Enregistrer les notes'}
                        </Button>
                    )}
                </div>

                {/* Filters */}
                <div className="rounded-2xl bg-linear-to-br from-slate-50/70 to-white ring-1 ring-slate-200 shadow-sm p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Select value={classId} onValueChange={onClassChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une classe" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none" disabled>Sélectionner une classe</SelectItem>
                                {classrooms.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.name} ({c.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={classSubjectId}
                            onValueChange={onSubjectChange}
                            disabled={classId === 'none' || classSubjects.length === 0}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une matière" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none" disabled>Sélectionner une matière</SelectItem>
                                {classSubjects.map((cs) => (
                                    <SelectItem key={cs.id} value={cs.id}>
                                        {cs.subject.name} (coef. {cs.coefficient})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={term}
                            onValueChange={onTermChange}
                            disabled={classSubjectId === 'none'}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un trimestre" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none" disabled>Sélectionner un trimestre</SelectItem>
                                {TERMS.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {classId !== 'none' && classSubjects.length === 0 && (
                        <p className="mt-2 text-sm text-amber-600">
                            Aucune matière assignée à cette classe pour l'année en cours.
                        </p>
                    )}
                </div>

                {/* Stats */}
                {studentsWithGrades.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {statsCards.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div key={stat.title} className={`${stat.cardClass} rounded-2xl p-6 shadow-sm transition-all hover:shadow-md`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                            <p className={`text-3xl font-bold mt-2 ${stat.textColor}`}>{stat.value}</p>
                                        </div>
                                        <div className={`w-12 h-12 rounded-full ${stat.iconWrapClass} flex items-center justify-center`}>
                                            <Icon className={`w-6 h-6 ${stat.textColor}`} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Grade table */}
                {studentsWithGrades.length > 0 && selectedSubject && (
                    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {selectedSubject.subject.name}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {termLabel} — Coefficient {selectedSubject.coefficient} — Notes sur 20
                                </p>
                            </div>
                        </div>
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow className="border-b border-gray-200">
                                    <TableHead className="w-14">#</TableHead>
                                    <TableHead>Matricule</TableHead>
                                    <TableHead>Nom & Prénom</TableHead>
                                    <TableHead className="w-36">Note /20</TableHead>
                                    <TableHead>Appréciation</TableHead>
                                    <TableHead className="w-28 text-center">Bulletin</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {studentsWithGrades.map((sg, index) => {
                                    const score = parseFloat(grades[sg.student_id]?.score ?? '');
                                    const scoreColor = isNaN(score)
                                        ? ''
                                        : score >= 14
                                        ? 'text-emerald-600 font-bold'
                                        : score >= 10
                                        ? 'text-blue-600 font-semibold'
                                        : 'text-red-600 font-semibold';

                                    return (
                                        <TableRow key={sg.student_id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                                            <TableCell className="text-gray-400 text-sm">{index + 1}</TableCell>
                                            <TableCell className="font-mono text-sm text-gray-600">{sg.student.matricule}</TableCell>
                                            <TableCell className="font-medium text-gray-900">
                                                {sg.student.lastname} {sg.student.firstname}
                                            </TableCell>
                                            <TableCell>
                                                <div className="relative w-28">
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        max={20}
                                                        step={0.25}
                                                        value={grades[sg.student_id]?.score ?? ''}
                                                        onChange={(e) => onScoreChange(sg.student_id, e.target.value)}
                                                        className={`pr-8 text-right ${scoreColor}`}
                                                        placeholder="—"
                                                    />
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">/20</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    value={grades[sg.student_id]?.comments ?? ''}
                                                    onChange={(e) => onCommentsChange(sg.student_id, e.target.value)}
                                                    placeholder="Appréciation..."
                                                    className="max-w-xs"
                                                />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-gray-300 text-xs"
                                                    onClick={() => router.get(route('grades.student', sg.student_id), { term })}
                                                >
                                                    Bulletin
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        <div className="px-6 py-3 bg-gray-50 flex justify-end border-t border-gray-100">
                            <Button
                                className={`gap-2 ${saved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                onClick={onSave}
                                disabled={saving}
                            >
                                {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                {saving ? 'Enregistrement...' : saved ? 'Enregistré !' : 'Enregistrer les notes'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {classId !== 'none' && classSubjectId !== 'none' && term !== 'none' && studentsWithGrades.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 py-16 text-center text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-lg font-medium">Aucun élève inscrit dans cette classe</p>
                        <p className="text-sm mt-1">Inscrivez des élèves pour saisir leurs notes.</p>
                    </div>
                )}

                {/* Initial state */}
                {classId === 'none' && (
                    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 py-16 text-center text-gray-500">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-lg font-medium">Sélectionnez une classe pour commencer</p>
                        <p className="text-sm mt-1">Choisissez ensuite la matière et le trimestre.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
