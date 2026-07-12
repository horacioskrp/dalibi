<?php

use App\Http\Controllers\Parametres\AcademicPeriodController;
use App\Http\Controllers\Parametres\DocumentTemplateController;
use App\Http\Controllers\Parametres\FileStorageController;
use App\Http\Controllers\Examens\OfficialExamController;
use App\Http\Controllers\Eleves\PromotionController;
use App\Http\Controllers\Eleves\RosterController;
use App\Http\Controllers\Eleves\TimetableController;
use App\Http\Controllers\Parametres\AcademicYearController;
use App\Http\Controllers\Parametres\ClassroomController;
use App\Http\Controllers\Parametres\ClassroomSubjectAssignmentController;
use App\Http\Controllers\Parametres\ClassroomTypeController;
use App\Http\Controllers\Eleves\EnrollmentController;
use App\Http\Controllers\Comptabilite\AccountingController;
use App\Http\Controllers\Comptabilite\CashAccountController;
use App\Http\Controllers\Comptabilite\InvoiceController;
use App\Http\Controllers\Comptabilite\SituationController;
use App\Http\Controllers\Comptabilite\TransactionController;
use App\Http\Controllers\Presences\AbsencePermissionController;
use App\Http\Controllers\Presences\AttendanceController;
use App\Http\Controllers\Examens\EvaluationController;
use App\Http\Controllers\Examens\EvaluationTemplateController;
use App\Http\Controllers\Parametres\EvaluationTypeController;
use App\Http\Controllers\Parametres\GradingConfigController;
use App\Http\Controllers\Examens\MarkController;
use App\Http\Controllers\Notes\NoteReclamationController;
use App\Http\Controllers\Parametres\FeeCategorieController;
use App\Http\Controllers\Parametres\FeeStructureController;
use App\Http\Controllers\Parametres\LevelController;
use App\Http\Controllers\Administration\PermissionController;
use App\Http\Controllers\Administration\RoleController;
use App\Http\Controllers\Parametres\SchoolController;
use App\Http\Controllers\Parametres\ScholarshipController;
use App\Http\Controllers\Eleves\StudentController;
use App\Http\Controllers\Eleves\StudentScholarshipController;
use App\Http\Controllers\Comptabilite\ExpenseController;
use App\Http\Controllers\Notes\GradeController;
use App\Http\Controllers\Notes\BulletinController;
use App\Http\Controllers\Administration\SubjectAssignmentController;
use App\Http\Controllers\Parametres\SubjectController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Administration\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Prévisualisation des pages d'erreur en développement uniquement (ex. /_error/404).
if (app()->environment('local')) {
    Route::get('_error/{status}', fn (string $status) => Inertia::render('Error', ['status' => (int) $status]));
}

// Documentation API (Redoc) — gardée par l'environnement : 404 en production.
Route::get('docs/api', [\App\Http\Controllers\ApiDocsController::class, 'index'])->name('api-docs');
Route::get('docs/api/openapi.yaml', [\App\Http\Controllers\ApiDocsController::class, 'spec'])->name('api-docs.spec');

Route::get('dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Schools Routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Statistiques
    Route::middleware('can:view_statistics')->prefix('statistiques')->name('statistics.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Statistics\StatisticsController::class, 'index'])->name('index');
        Route::get('/{section}/export/{format}', [\App\Http\Controllers\Statistics\StatisticsController::class, 'export'])->name('export');
    });

    Route::post('schools/bulk-activate', [SchoolController::class, 'bulkActivate'])
        ->middleware('can:edit_schools')->name('schools.bulk-activate');
    Route::post('schools/bulk-deactivate', [SchoolController::class, 'bulkDeactivate'])
        ->middleware('can:edit_schools')->name('schools.bulk-deactivate');
    Route::patch('schools/{school}/toggle-active', [SchoolController::class, 'toggleActive'])
        ->middleware('can:edit_schools')->name('schools.toggle-active');
    Route::resource('schools', SchoolController::class)->middleware('can:view_schools');
    Route::resource('classrooms', ClassroomController::class)->middleware('can:view_classes');
    Route::get('classrooms/{classroom}/subject-assignments', [ClassroomSubjectAssignmentController::class, 'create'])
        ->middleware('can:view_subject_assignments')->name('classrooms.subject-assignments.create');
    Route::post('classrooms/{classroom}/subject-assignments', [ClassroomSubjectAssignmentController::class, 'store'])
        ->middleware('can:create_subject_assignments')->name('classrooms.subject-assignments.store');
    Route::resource('classroom-types', ClassroomTypeController::class)->middleware('can:view_classroom_types');
    Route::resource('levels', LevelController::class)->middleware('can:view_levels');
    Route::resource('subjects', SubjectController::class)->middleware('can:view_subjects');
    Route::resource('evaluation-types', EvaluationTypeController::class)->middleware('can:view_evaluation_types');

    // Modèles d'évaluation (global)
    Route::resource('evaluation-templates', EvaluationTemplateController::class)->middleware('can:view_evaluation_templates');
    Route::post('evaluation-templates/{evaluationTemplate}/generate', [EvaluationTemplateController::class, 'generate'])
        ->middleware('can:generate_evaluation_templates')->name('evaluation-templates.generate');

    // Évaluations par classe/matière
    Route::resource('evaluations', EvaluationController::class)->only(['index', 'show', 'destroy'])->middleware('can:view_evaluations');
    Route::patch('evaluations/{evaluation}/status', [EvaluationController::class, 'updateStatus'])
        ->name('evaluations.update-status');
    Route::patch('evaluations/{evaluation}/lock', [EvaluationController::class, 'toggleLock'])
        ->name('evaluations.toggle-lock');
    Route::patch('evaluations/{evaluation}/date', [EvaluationController::class, 'updateDate'])
        ->name('evaluations.update-date');

    // Planning des examens
    Route::get('evaluations-planning', [EvaluationController::class, 'planning'])
        ->middleware('can:view_evaluations')->name('evaluations.planning');
    Route::get('evaluations-planning/{classroomId}/export', [EvaluationController::class, 'exportPlanning'])
        ->middleware('can:view_evaluations')->name('evaluations.export-planning');

    // Saisie des notes
    Route::get('evaluations/{evaluation}/marks', [MarkController::class, 'index'])->middleware('can:view_marks')->name('marks.index');
    Route::post('evaluations/{evaluation}/marks', [MarkController::class, 'store'])->middleware('can:create_marks')->name('marks.store');

    // Réclamations de notes
    Route::resource('note-reclamations', NoteReclamationController::class)->only(['index', 'create', 'store', 'show'])->middleware('can:view_note_reclamations');
    Route::patch('note-reclamations/{noteReclamation}/review', [NoteReclamationController::class, 'review'])
        ->name('note-reclamations.review');

    // Configurations de calcul des moyennes
    Route::resource('grading-configs', GradingConfigController::class)->except(['show'])->middleware('can:view_grading_configs');
    Route::patch('grading-configs/{gradingConfig}/activate', [GradingConfigController::class, 'activate'])
        ->name('grading-configs.activate');
    Route::resource('academic-years', AcademicYearController::class)->middleware('can:view_academic_years');
    Route::resource('academic-periods', AcademicPeriodController::class)->middleware('can:view_academic_periods');
    Route::resource('fee-categories', FeeCategorieController::class)->middleware('can:view_fee_categories');
    Route::post('fee-structures/replicate', [FeeStructureController::class, 'replicate'])
        ->name('fee-structures.replicate');
    Route::resource('fee-structures', FeeStructureController::class)->middleware('can:view_fee_structures');
    Route::post('fee-structures/{feeStructure}/installments', [\App\Http\Controllers\Parametres\InstallmentController::class, 'storeMultiple'])
        ->name('fee-structures.installments.store-multiple');
    Route::resource('scholarships', ScholarshipController::class)->middleware('can:view_scholarships');
    Route::resource('student-scholarships', StudentScholarshipController::class)->middleware('can:view_student_scholarships');
    Route::post('students/bulk-status', [StudentController::class, 'bulkStatus'])
        ->name('students.bulk-status');
    // Statistiques élèves
    Route::get('students-stats', [\App\Http\Controllers\Eleves\StudentStatsController::class, 'index'])->middleware('can:view_students')->name('students.stats');

    // Import d'élèves (CSV)
    Route::get('students-import', [\App\Http\Controllers\Eleves\StudentImportController::class, 'index'])->middleware('can:view_students')->name('students.import');
    Route::get('students-import/template', [\App\Http\Controllers\Eleves\StudentImportController::class, 'template'])->name('students.import.template');
    Route::post('students-import', [\App\Http\Controllers\Eleves\StudentImportController::class, 'store'])->name('students.import.store');

    Route::get('students/{student}/history', [StudentController::class, 'history'])
        ->name('students.history');
    Route::post('students/{student}/change-class', [StudentController::class, 'changeClass'])
        ->name('students.change-class');
    // Documents (pièces justificatives) — dossier privé students/{id}
    Route::post('students/{student}/documents', [\App\Http\Controllers\Eleves\StudentDocumentController::class, 'store'])->name('students.documents.store');
    Route::get('students/{student}/documents/{document}', [\App\Http\Controllers\Eleves\StudentDocumentController::class, 'download'])->name('students.documents.download');
    Route::delete('students/{student}/documents/{document}', [\App\Http\Controllers\Eleves\StudentDocumentController::class, 'destroy'])->name('students.documents.destroy');

    // Accès portail de l'élève (espace élève)
    Route::post('students/{student}/portal/activate', [\App\Http\Controllers\Eleves\StudentPortalController::class, 'activate'])->middleware('can:edit_students')->name('students.portal.activate');
    Route::post('students/{student}/portal/deactivate', [\App\Http\Controllers\Eleves\StudentPortalController::class, 'deactivate'])->middleware('can:edit_students')->name('students.portal.deactivate');

    Route::get('students/{student}/photo', [StudentController::class, 'photo'])
        ->name('students.photo.view');
    Route::post('students/{student}/photo', [StudentController::class, 'uploadPhoto'])
        ->name('students.photo.upload');
    Route::delete('students/{student}/photo', [StudentController::class, 'deletePhoto'])
        ->name('students.photo.delete');
    Route::resource('students', StudentController::class)->middleware('can:view_students');
    Route::get('accounting', [AccountingController::class, 'index'])->middleware('can:view_finances')->name('accounting.index');
    Route::get('accounting/transactions', [TransactionController::class, 'index'])->middleware('can:view_transactions')->name('accounting.transactions');
    Route::get('accounting/situation', [SituationController::class, 'index'])->middleware('can:view_finances')->name('accounting.situation');
    Route::get('accounting/situation/export', [SituationController::class, 'export'])->middleware('can:view_finances')->name('accounting.situation.export');
    Route::post('accounting/expenses', [ExpenseController::class, 'store'])->middleware('can:create_expenses')->name('expenses.store');
    Route::delete('accounting/expenses/{transaction}', [ExpenseController::class, 'destroy'])->middleware('can:delete_expenses')->name('expenses.destroy');
    Route::get('cash-accounts', [CashAccountController::class, 'index'])->middleware('can:view_cash_accounts')->name('cash-accounts.index');
    Route::post('cash-accounts', [CashAccountController::class, 'store'])->middleware('can:create_cash_accounts')->name('cash-accounts.store');
    Route::put('cash-accounts/{cashAccount}', [CashAccountController::class, 'update'])->middleware('can:edit_cash_accounts')->name('cash-accounts.update');
    Route::delete('cash-accounts/{cashAccount}', [CashAccountController::class, 'destroy'])->middleware('can:delete_cash_accounts')->name('cash-accounts.destroy');
    Route::resource('enrollments', EnrollmentController::class)->middleware('can:view_enrollments');
    Route::get('enrollments/{enrollment}/invoice', [InvoiceController::class, 'show'])->middleware('can:view_invoices')->name('enrollments.invoice');
    Route::post('enrollments/{enrollment}/payments', [InvoiceController::class, 'storePayment'])->name('enrollments.payments.store');
    Route::get('payments/{payment}/receipt', [InvoiceController::class, 'receipt'])->middleware('can:view_invoices')->name('payments.receipt');
    Route::get('receipts/verify', [InvoiceController::class, 'verifyReceipt'])
        ->middleware('throttle:30,1')
        ->name('receipts.verify');
    Route::resource('subject-assignments', SubjectAssignmentController::class)->middleware('can:view_subject_assignments');

    // Présences & Permissions
    Route::get('attendances', [AttendanceController::class, 'index'])->middleware('can:view_attendances')->name('attendances.index');
    Route::post('attendances', [AttendanceController::class, 'store'])->middleware('can:create_attendances')->name('attendances.store');
    Route::get('attendances/stats', [AttendanceController::class, 'stats'])->middleware('can:view_attendances')->name('attendances.stats');
    Route::resource('absence-permissions', AbsencePermissionController::class)->only(['index', 'create', 'store', 'show', 'destroy'])->middleware('can:view_absence_permissions');
    Route::patch('absence-permissions/{absencePermission}/review', [AbsencePermissionController::class, 'review'])
        ->name('absence-permissions.review');

    // Grades Routes
    Route::get('grades', [GradeController::class, 'index'])->middleware('can:view_grades')->name('grades.index');
    Route::post('grades', [GradeController::class, 'store'])->middleware('can:create_grades')->name('grades.store');
    Route::get('grades/student/{student}', [GradeController::class, 'student'])->middleware('can:view_grades')->name('grades.student');

    // Bulletins (préparation, validation/snapshot, téléchargement PDF)
    Route::get('bulletins', [BulletinController::class, 'index'])->middleware('can:view_bulletins')->name('bulletins.index');
    Route::post('bulletins/validate', [BulletinController::class, 'validateClass'])->middleware('can:validate_bulletins')->name('bulletins.validate');
    Route::get('bulletins/{student}/download', [BulletinController::class, 'download'])->middleware('can:download_bulletins')->name('bulletins.download');
    Route::get('bulletins/{reportCard}/edit', [BulletinController::class, 'editCard'])->middleware('can:validate_bulletins')->name('bulletins.edit');
    Route::put('bulletins/{reportCard}', [BulletinController::class, 'updateCard'])->middleware('can:validate_bulletins')->name('bulletins.update');

    // Journal d'audit (Administration)
    Route::get('audit-logs', [\App\Http\Controllers\Administration\AuditLogController::class, 'index'])->middleware('can:view_audit_logs')->name('audit-logs.index');

    // Accès portail (comptes tuteurs)
    Route::get('portal-accounts', [\App\Http\Controllers\Administration\GuardianController::class, 'index'])->middleware('can:view_portal_accounts')->name('guardians.index');
    Route::post('portal-accounts', [\App\Http\Controllers\Administration\GuardianController::class, 'store'])->middleware('can:create_portal_accounts')->name('guardians.store');
    Route::put('portal-accounts/{guardian}', [\App\Http\Controllers\Administration\GuardianController::class, 'update'])->middleware('can:edit_portal_accounts')->name('guardians.update');
    Route::delete('portal-accounts/{guardian}', [\App\Http\Controllers\Administration\GuardianController::class, 'destroy'])->middleware('can:delete_portal_accounts')->name('guardians.destroy');
    Route::post('portal-accounts/{guardian}/invite', [\App\Http\Controllers\Administration\GuardianController::class, 'invite'])->middleware('can:edit_portal_accounts')->name('guardians.invite');

    // Calendrier académique
    Route::get('calendar', [\App\Http\Controllers\CalendarEventController::class, 'index'])->middleware('can:view_calendar')->name('calendar.index');
    Route::post('calendar', [\App\Http\Controllers\CalendarEventController::class, 'store'])->middleware('can:create_calendar')->name('calendar.store');
    Route::put('calendar/{calendarEvent}', [\App\Http\Controllers\CalendarEventController::class, 'update'])->middleware('can:edit_calendar')->name('calendar.update');
    Route::delete('calendar/{calendarEvent}', [\App\Http\Controllers\CalendarEventController::class, 'destroy'])->middleware('can:delete_calendar')->name('calendar.destroy');

    // Modèle de bulletin (colonnes configurables)
    Route::get('settings/bulletin-template', [\App\Http\Controllers\Parametres\BulletinTemplateController::class, 'edit'])->middleware('can:view_bulletin_templates')->name('bulletin-templates.edit');
    Route::post('settings/bulletin-template', [\App\Http\Controllers\Parametres\BulletinTemplateController::class, 'update'])->middleware('can:edit_bulletin_templates')->name('bulletin-templates.update');

    // Administration Routes
    Route::resource('roles', RoleController::class)->middleware('can:manage_roles_permissions');
    Route::resource('permissions', PermissionController::class)->middleware('can:manage_roles_permissions');
    Route::resource('users', UserController::class)->middleware('can:view_users');

    // File Storage Settings
    Route::get('settings/file-storage', [FileStorageController::class, 'index'])->middleware('can:manage_file_storage')->name('file-storage.index');
    Route::post('settings/file-storage', [FileStorageController::class, 'update'])->name('file-storage.update');
    Route::post('settings/file-storage/test', [FileStorageController::class, 'test'])->name('file-storage.test');

    // Archives documentaires
    Route::get('archives', [\App\Http\Controllers\Archives\ArchiveController::class, 'index'])->middleware('can:view_archives')->name('archives.index');
    Route::post('archives', [\App\Http\Controllers\Archives\ArchiveController::class, 'store'])->middleware('can:create_archives')->name('archives.store');
    Route::post('archives/{archive}', [\App\Http\Controllers\Archives\ArchiveController::class, 'update'])->middleware('can:edit_archives')->name('archives.update');
    Route::get('archives/{archive}/download', [\App\Http\Controllers\Archives\ArchiveController::class, 'download'])->middleware('can:view_archives')->name('archives.download');
    Route::delete('archives/{archive}', [\App\Http\Controllers\Archives\ArchiveController::class, 'destroy'])->middleware('can:delete_archives')->name('archives.destroy');
    Route::post('archives/{archive}/restore', [\App\Http\Controllers\Archives\ArchiveController::class, 'restore'])->middleware('can:delete_archives')->name('archives.restore');
    Route::delete('archives/{archive}/force', [\App\Http\Controllers\Archives\ArchiveController::class, 'forceDelete'])->middleware('can:delete_archives')->name('archives.force-delete');

    Route::get('archives-tags', [\App\Http\Controllers\Archives\DocumentTagController::class, 'index'])->middleware('can:view_archives')->name('archives.tags.index');
    Route::post('archives-tags', [\App\Http\Controllers\Archives\DocumentTagController::class, 'store'])->middleware('can:create_archives')->name('archives.tags.store');
    Route::put('archives-tags/{documentTag}', [\App\Http\Controllers\Archives\DocumentTagController::class, 'update'])->middleware('can:edit_archives')->name('archives.tags.update');
    Route::delete('archives-tags/{documentTag}', [\App\Http\Controllers\Archives\DocumentTagController::class, 'destroy'])->middleware('can:delete_archives')->name('archives.tags.destroy');

    // Sauvegardes de la base de données
    Route::get('settings/backups', [\App\Http\Controllers\Parametres\BackupController::class, 'index'])->middleware('can:view_backups')->name('backups.index');
    Route::post('settings/backups', [\App\Http\Controllers\Parametres\BackupController::class, 'store'])->middleware('can:create_backups')->name('backups.store');
    Route::post('settings/backups/schedule', [\App\Http\Controllers\Parametres\BackupController::class, 'updateSchedule'])->middleware('can:create_backups')->name('backups.schedule');
    Route::post('settings/backups/restore', [\App\Http\Controllers\Parametres\BackupController::class, 'restore'])->middleware('can:restore_backups')->name('backups.restore');
    Route::get('settings/backups/{backup}/download', [\App\Http\Controllers\Parametres\BackupController::class, 'download'])->middleware('can:view_backups')->name('backups.download');
    Route::delete('settings/backups/{backup}', [\App\Http\Controllers\Parametres\BackupController::class, 'destroy'])->middleware('can:delete_backups')->name('backups.destroy');

    // Passage de classe / réinscription en masse
    Route::get('promotion', [PromotionController::class, 'index'])->middleware('can:execute_promotion')->name('promotion.index');
    Route::post('promotion', [PromotionController::class, 'store'])->name('promotion.store');

    // Effectifs / Listes de classe
    Route::get('roster', [RosterController::class, 'index'])->middleware('can:view_roster')->name('roster.index');
    Route::get('roster/export', [RosterController::class, 'export'])->name('roster.export');
    Route::patch('roster/{enrollment}/status', [RosterController::class, 'updateStatus'])->name('roster.update-status');
    Route::post('roster/bulk-status', [RosterController::class, 'bulkStatus'])->name('roster.bulk-status');

    // Timetable (emploi du temps)
    Route::get('timetable', [TimetableController::class, 'index'])->middleware('can:view_timetable')->name('timetable.index');
    Route::get('timetable/{classId}/export', [TimetableController::class, 'export'])->name('timetable.export');
    Route::post('timetable', [TimetableController::class, 'store'])->name('timetable.store');
    Route::put('timetable/{timetableSlot}', [TimetableController::class, 'update'])->name('timetable.update');
    Route::delete('timetable/{timetableSlot}', [TimetableController::class, 'destroy'])->name('timetable.destroy');

    // Official Exams (CEPD, BEPC, BAC)
    Route::get('official-exams', [OfficialExamController::class, 'index'])->middleware('can:view_official_exams')->name('official-exams.index');
    Route::post('official-exams', [OfficialExamController::class, 'store'])->name('official-exams.store');
    Route::get('official-exams/{officialExam}', [OfficialExamController::class, 'show'])->name('official-exams.show');
    Route::put('official-exams/{officialExam}', [OfficialExamController::class, 'update'])->name('official-exams.update');
    Route::delete('official-exams/{officialExam}', [OfficialExamController::class, 'destroy'])->name('official-exams.destroy');
    Route::post('official-exams/{officialExam}/register', [OfficialExamController::class, 'registerStudents'])->name('official-exams.register');
    Route::put('official-exams/{officialExam}/results', [OfficialExamController::class, 'updateResults'])->name('official-exams.results');
    Route::delete('official-exams/{officialExam}/registrations/{registration}', [OfficialExamController::class, 'removeRegistration'])->name('official-exams.registrations.destroy');

    // Document Templates (Settings)
    Route::get('settings/document-header', [\App\Http\Controllers\Parametres\DocumentHeaderController::class, 'edit'])->middleware('can:view_document_headers')->name('document-header.edit');
    Route::post('settings/document-header', [\App\Http\Controllers\Parametres\DocumentHeaderController::class, 'update'])->middleware('can:edit_document_headers')->name('document-header.update');
    Route::get('settings/documents-registry', [DocumentTemplateController::class, 'registry'])->name('document-templates.registry');
    Route::get('settings/documents', [DocumentTemplateController::class, 'index'])->middleware('can:view_documents')->name('document-templates.index');
    Route::get('settings/documents/create', [DocumentTemplateController::class, 'create'])->name('document-templates.create');
    Route::get('settings/documents/{documentTemplate}', [DocumentTemplateController::class, 'show'])->name('document-templates.show');
    Route::post('settings/documents', [DocumentTemplateController::class, 'store'])->name('document-templates.store');
    Route::get('settings/documents/{documentTemplate}/edit', [DocumentTemplateController::class, 'edit'])->name('document-templates.edit');
    Route::put('settings/documents/{documentTemplate}', [DocumentTemplateController::class, 'update'])->name('document-templates.update');
    Route::delete('settings/documents/{documentTemplate}', [DocumentTemplateController::class, 'destroy'])->name('document-templates.destroy');
    Route::post('settings/documents/preview', [DocumentTemplateController::class, 'preview'])->name('document-templates.preview');
    Route::post('settings/documents/{documentTemplate}/generate', [DocumentTemplateController::class, 'generate'])->name('document-templates.generate');
});

require __DIR__.'/settings.php';
