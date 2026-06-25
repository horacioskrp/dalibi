import { route as ziggyRoute } from 'ziggy-js';

/**
 * Generate a route URL
 * @param name - The route name (e.g., 'schools.index', 'schools.store')
 * @param params - Optional parameters for the route
 * @returns The generated route URL
 */
export function route(name: string, params?: any): string {
    const baseUrl = globalThis.location.origin;
    const routeMap: Record<string, string> = {
        'dashboard': '/dashboard',

        // Schools routes
        'schools.index': '/schools',
        'schools.create': '/schools/create',
        'schools.store': '/schools',
        'schools.show': `/schools/${params}`,
        'schools.edit': `/schools/${params}/edit`,
        'schools.update': `/schools/${params}`,
        'schools.destroy': `/schools/${params}`,
        'schools.bulk-activate': '/schools/bulk-activate',
        'schools.bulk-deactivate': '/schools/bulk-deactivate',
        'schools.toggle-active': `/schools/${params}/toggle-active`,

        // Classrooms routes
        'classrooms.index': '/classrooms',
        'classrooms.create': '/classrooms/create',
        'classrooms.store': '/classrooms',
        'classrooms.show': `/classrooms/${params}`,
        'classrooms.edit': `/classrooms/${params}/edit`,
        'classrooms.update': `/classrooms/${params}`,
        'classrooms.destroy': `/classrooms/${params}`,
        'classrooms.subject-assignments.create': `/classrooms/${params}/subject-assignments`,
        'classrooms.subject-assignments.store': `/classrooms/${params}/subject-assignments`,

        // Classroom Types routes
        'classroom-types.index': '/classroom-types',
        'classroom-types.create': '/classroom-types/create',
        'classroom-types.store': '/classroom-types',
        'classroom-types.show': `/classroom-types/${params}`,
        'classroom-types.edit': `/classroom-types/${params}/edit`,
        'classroom-types.update': `/classroom-types/${params}`,
        'classroom-types.destroy': `/classroom-types/${params}`,

        // Roles routes
        'roles.index': '/roles',
        'roles.create': '/roles/create',
        'roles.store': '/roles',
        'roles.show': `/roles/${params}`,
        'roles.edit': `/roles/${params}/edit`,
        'roles.update': `/roles/${params}`,
        'roles.destroy': `/roles/${params}`,

        // Permissions routes
        'permissions.index': '/permissions',
        'permissions.create': '/permissions/create',
        'permissions.store': '/permissions',
        'permissions.show': `/permissions/${params}`,
        'permissions.edit': `/permissions/${params}/edit`,
        'permissions.update': `/permissions/${params}`,
        'permissions.destroy': `/permissions/${params}`,

        // Users routes
        'users.index': '/users',
        'users.create': '/users/create',
        'users.store': '/users',
        'users.show': `/users/${params}`,
        'users.edit': `/users/${params}/edit`,
        'users.update': `/users/${params}`,
        'users.destroy': `/users/${params}`,

        // Subjects routes
        'subjects.index': '/subjects',
        'subjects.create': '/subjects/create',
        'subjects.store': '/subjects',
        'subjects.show': `/subjects/${params}`,
        'subjects.edit': `/subjects/${params}/edit`,
        'subjects.update': `/subjects/${params}`,
        'subjects.destroy': `/subjects/${params}`,

        // Evaluation Types routes
        'evaluation-types.index': '/evaluation-types',
        'evaluation-types.create': '/evaluation-types/create',
        'evaluation-types.store': '/evaluation-types',
        'evaluation-types.show': `/evaluation-types/${params}`,
        'evaluation-types.edit': `/evaluation-types/${params}/edit`,
        'evaluation-types.update': `/evaluation-types/${params}`,
        'evaluation-types.destroy': `/evaluation-types/${params}`,

        // Evaluations routes
        'evaluations.index':         '/evaluations',
        'evaluations.show':          `/evaluations/${params}`,
        'evaluations.destroy':       `/evaluations/${params}`,
        'evaluations.update-status': `/evaluations/${params}/status`,

        // Academic Years routes
        'academic-years.index': '/academic-years',
        'academic-years.create': '/academic-years/create',
        'academic-years.store': '/academic-years',
        'academic-years.show': `/academic-years/${params}`,
        'academic-years.edit': `/academic-years/${params}/edit`,
        'academic-years.update': `/academic-years/${params}`,
        'academic-years.destroy': `/academic-years/${params}`,

        // Levels routes
        'levels.index': '/levels',
        'levels.create': '/levels/create',
        'levels.store': '/levels',
        'levels.show': `/levels/${params}`,
        'levels.edit': `/levels/${params}/edit`,
        'levels.update': `/levels/${params}`,
        'levels.destroy': `/levels/${params}`,

        // Academic Periods routes
        'academic-periods.index': '/academic-periods',
        'academic-periods.create': '/academic-periods/create',
        'academic-periods.store': '/academic-periods',
        'academic-periods.show': `/academic-periods/${params}`,
        'academic-periods.edit': `/academic-periods/${params}/edit`,
        'academic-periods.update': `/academic-periods/${params}`,
        'academic-periods.destroy': `/academic-periods/${params}`,

        // Subject Assignments routes
        'subject-assignments.index': '/subject-assignments',
        'subject-assignments.create': '/subject-assignments/create',
        'subject-assignments.store': '/subject-assignments',
        'subject-assignments.show': `/subject-assignments/${params}`,
        'subject-assignments.edit': `/subject-assignments/${params}/edit`,
        'subject-assignments.update': `/subject-assignments/${params}`,
        'subject-assignments.destroy': `/subject-assignments/${params}`,

        // Fee Categories routes
        'fee-categories.index': '/fee-categories',
        'fee-categories.create': '/fee-categories/create',
        'fee-categories.store': '/fee-categories',
        'fee-categories.show': `/fee-categories/${params}`,
        'fee-categories.edit': `/fee-categories/${params}/edit`,
        'fee-categories.update': `/fee-categories/${params}`,
        'fee-categories.destroy': `/fee-categories/${params}`,

        // Fee Structures routes
        'archives.index': '/archives',
        'archives.store': '/archives',
        'archives.update': `/archives/${params}`,
        'archives.download': `/archives/${params}/download`,
        'archives.destroy': `/archives/${params}`,
        'archives.restore': `/archives/${params}/restore`,
        'archives.force-delete': `/archives/${params}/force`,
        'archives.tags.index': '/archives-tags',
        'archives.tags.store': '/archives-tags',
        'archives.tags.update': `/archives-tags/${params}`,
        'archives.tags.destroy': `/archives-tags/${params}`,

        'backups.index': '/settings/backups',
        'backups.store': '/settings/backups',
        'backups.schedule': '/settings/backups/schedule',
        'backups.restore': '/settings/backups/restore',
        'backups.download': `/settings/backups/${params}/download`,
        'backups.destroy': `/settings/backups/${params}`,

        'fee-structures.index': '/fee-structures',
        'fee-structures.replicate': '/fee-structures/replicate',
        'fee-structures.create': '/fee-structures/create',
        'fee-structures.store': '/fee-structures',
        'fee-structures.show': `/fee-structures/${params}`,
        'fee-structures.edit': `/fee-structures/${params}/edit`,
        'fee-structures.update': `/fee-structures/${params}`,
        'fee-structures.destroy': `/fee-structures/${params}`,
        'fee-structures.installments.store-multiple': `/fee-structures/${params}/installments`,

        // Scholarships routes
        'scholarships.index': '/scholarships',
        'scholarships.create': '/scholarships/create',
        'scholarships.store': '/scholarships',
        'scholarships.show': `/scholarships/${params}`,
        'scholarships.edit': `/scholarships/${params}/edit`,
        'scholarships.update': `/scholarships/${params}`,
        'scholarships.destroy': `/scholarships/${params}`,

        // Student Scholarships routes
        'student-scholarships.index': '/student-scholarships',
        'student-scholarships.create': '/student-scholarships/create',
        'student-scholarships.store': '/student-scholarships',
        'student-scholarships.show': `/student-scholarships/${params}`,
        'student-scholarships.edit': `/student-scholarships/${params}/edit`,
        'student-scholarships.update': `/student-scholarships/${params}`,
        'student-scholarships.destroy': `/student-scholarships/${params}`,

        // Students routes
        'students.index': '/students',
        'students.create': '/students/create',
        'students.store': '/students',
        'students.show': `/students/${params}`,
        'students.edit': `/students/${params}/edit`,
        'students.history': `/students/${params}/history`,
        'students.update': `/students/${params}`,
        'students.destroy': `/students/${params}`,
        'students.bulk-status': '/students/bulk-status',

        // Enrollments routes
        'enrollments.index': '/enrollments',
        'enrollments.create': '/enrollments/create',
        'enrollments.store': '/enrollments',
        'enrollments.show': `/enrollments/${params}`,
        'enrollments.receipt': `/enrollments/${params}/receipt`,
        'enrollments.edit': `/enrollments/${params}/edit`,
        'enrollments.update': `/enrollments/${params}`,
        'enrollments.destroy': `/enrollments/${params}`,
        'enrollments.invoice': `/enrollments/${params}/invoice`,
        'enrollments.payments.store': `/enrollments/${params}/payments`,

        // Payments routes
        'payments.receipt': `/payments/${params}/receipt`,
        'receipts.verify':  '/receipts/verify',

        // Accounting routes
        'accounting.index':        '/accounting',
        'accounting.transactions': '/accounting/transactions',
        'accounting.situation':        '/accounting/situation',
        'accounting.situation.export': '/accounting/situation/export',

        // Cash accounts routes
        'cash-accounts.index':   '/cash-accounts',
        'cash-accounts.store':   '/cash-accounts',
        'cash-accounts.update':  `/cash-accounts/${params}`,
        'cash-accounts.destroy': `/cash-accounts/${params}`,

        // Evaluation templates routes
        'evaluation-templates.index':    '/evaluation-templates',
        'evaluation-templates.create':   '/evaluation-templates/create',
        'evaluation-templates.store':    '/evaluation-templates',
        'evaluation-templates.show':     `/evaluation-templates/${params}`,
        'evaluation-templates.edit':     `/evaluation-templates/${params}/edit`,
        'evaluation-templates.update':   `/evaluation-templates/${params}`,
        'evaluation-templates.destroy':  `/evaluation-templates/${params}`,
        'evaluation-templates.generate': `/evaluation-templates/${params}/generate`,

        // Marks routes
        'marks.index': `/evaluations/${params}/marks`,
        'marks.store': `/evaluations/${params}/marks`,

        // Grades routes
        'grades.index':   '/grades',
        'grades.store':   '/grades',
        'grades.student': `/grades/student/${params}`,

        // Bulletins routes
        'bulletins.index':    '/bulletins',
        'bulletins.validate': '/bulletins/validate',
        'bulletins.download': `/bulletins/${params}/download`,
        'bulletins.edit':     `/bulletins/${params}/edit`,
        'bulletins.update':   `/bulletins/${params}`,
        'bulletin-templates.edit':   '/settings/bulletin-template',
        'bulletin-templates.update': '/settings/bulletin-template',

        // Evaluations lock / date / planning
        'evaluations.toggle-lock':    `/evaluations/${params}/lock`,
        'evaluations.update-date':    `/evaluations/${params}/date`,
        'evaluations.planning':       '/evaluations-planning',
        'evaluations.export-planning': `/evaluations-planning/${params}/export`,

        // Note Reclamations routes
        'note-reclamations.index':  '/note-reclamations',
        'note-reclamations.create': '/note-reclamations/create',
        'note-reclamations.store':  '/note-reclamations',
        'note-reclamations.show':   `/note-reclamations/${params}`,
        'note-reclamations.review': `/note-reclamations/${params}/review`,

        // Grading Configs routes
        'grading-configs.index':    '/grading-configs',
        'grading-configs.create':   '/grading-configs/create',
        'grading-configs.store':    '/grading-configs',
        'grading-configs.edit':     `/grading-configs/${params}/edit`,
        'grading-configs.update':   `/grading-configs/${params}`,
        'grading-configs.destroy':  `/grading-configs/${params}`,
        'grading-configs.activate': `/grading-configs/${params}/activate`,

        // Attendances routes
        'attendances.index': '/attendances',
        'attendances.store': '/attendances',
        'attendances.stats': '/attendances/stats',

        // Absence Permissions routes
        'absence-permissions.index':   '/absence-permissions',
        'absence-permissions.create':  '/absence-permissions/create',
        'absence-permissions.store':   '/absence-permissions',
        'absence-permissions.show':    `/absence-permissions/${params}`,
        'absence-permissions.destroy': `/absence-permissions/${params}`,
        'absence-permissions.review':  `/absence-permissions/${params}/review`,

        // File Storage Settings
        'file-storage.index':  '/settings/file-storage',
        'file-storage.update': '/settings/file-storage',
        'file-storage.test':   '/settings/file-storage/test',

        // Student stats
        'students.stats': '/students-stats',

        // Student import
        'students.import':          '/students-import',
        'students.import.template': '/students-import/template',
        'students.import.store':    '/students-import',

        // Student class change
        'students.change-class': `/students/${params}/change-class`,

        // Student documents
        'students.documents.store': `/students/${params}/documents`,

        // Student photo
        'students.photo.view':   `/students/${params}/photo`,
        'students.photo.upload': `/students/${params}/photo`,
        'students.photo.delete': `/students/${params}/photo`,

        // Promotion / Passage de classe
        'promotion.index': '/promotion',
        'promotion.store': '/promotion',

        // Roster / Effectifs
        'roster.index':         '/roster',
        'roster.export':        '/roster/export',
        'roster.update-status': `/roster/${params}/status`,
        'roster.bulk-status':   '/roster/bulk-status',

        // Timetable
        'timetable.index':   '/timetable',
        'timetable.export':  `/timetable/${params}/export`,
        'timetable.store':   '/timetable',
        'timetable.update':  `/timetable/${params}`,
        'timetable.destroy': `/timetable/${params}`,

        // Official Exams
        'official-exams.index':   '/official-exams',
        'official-exams.store':   '/official-exams',
        'official-exams.show':    `/official-exams/${params}`,
        'official-exams.update':  `/official-exams/${params}`,
        'official-exams.destroy': `/official-exams/${params}`,
        'official-exams.register': `/official-exams/${params}/register`,
        'official-exams.results':  `/official-exams/${params}/results`,

        // Document header designer
        'document-header.edit':   '/settings/document-header',
        'document-header.update': '/settings/document-header',

        // Document Templates
        'document-templates.index':    '/settings/documents',
        'document-templates.registry': '/settings/documents-registry',
        'document-templates.create':   '/settings/documents/create',
        'document-templates.show':     `/settings/documents/${params}`,
        'document-templates.store':    '/settings/documents',
        'document-templates.edit':     `/settings/documents/${params}/edit`,
        'document-templates.update':   `/settings/documents/${params}`,
        'document-templates.destroy':  `/settings/documents/${params}`,
        'document-templates.preview':  '/settings/documents/preview',
        'document-templates.generate': `/settings/documents/${params}/generate`,

        // Expenses routes
        'expenses.store':   '/accounting/expenses',
        'expenses.destroy': `/accounting/expenses/${params}`,
    };

    try {
        return ziggyRoute(name, params);
    } catch (error) {
        const routePath = routeMap[name];
        if (routePath) {
            return baseUrl + routePath;
        }

        const reason = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`Route "${name}" not found. Using fallback. Reason: ${reason}`);
        throw new Error(`Unknown route: ${name}`);
    }
}
