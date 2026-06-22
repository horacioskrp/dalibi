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
use App\Http\Controllers\Administration\SubjectAssignmentController;
use App\Http\Controllers\Parametres\SubjectController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Administration\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Schools Routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('schools/bulk-activate', [SchoolController::class, 'bulkActivate'])
        ->name('schools.bulk-activate');
    Route::post('schools/bulk-deactivate', [SchoolController::class, 'bulkDeactivate'])
        ->name('schools.bulk-deactivate');
    Route::patch('schools/{school}/toggle-active', [SchoolController::class, 'toggleActive'])
        ->name('schools.toggle-active');
    Route::resource('schools', SchoolController::class)->middleware('can:view_schools');
    Route::resource('classrooms', ClassroomController::class)->middleware('can:view_classes');
    Route::get('classrooms/{classroom}/subject-assignments', [ClassroomSubjectAssignmentController::class, 'create'])
        ->name('classrooms.subject-assignments.create');
    Route::post('classrooms/{classroom}/subject-assignments', [ClassroomSubjectAssignmentController::class, 'store'])
        ->name('classrooms.subject-assignments.store');
    Route::resource('classroom-types', ClassroomTypeController::class)->middleware('can:view_classroom_types');
    Route::resource('levels', LevelController::class)->middleware('can:view_levels');
    Route::resource('subjects', SubjectController::class)->middleware('can:view_subjects');
    Route::resource('evaluation-types', EvaluationTypeController::class)->middleware('can:view_evaluation_types');

    // Modèles d'évaluation (global)
    Route::resource('evaluation-templates', EvaluationTemplateController::class)->middleware('can:view_evaluation_templates');
    Route::post('evaluation-templates/{evaluationTemplate}/generate', [EvaluationTemplateController::class, 'generate'])
        ->name('evaluation-templates.generate');

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
        ->name('evaluations.planning');
    Route::get('evaluations-planning/{classroomId}/export', [EvaluationController::class, 'exportPlanning'])
        ->name('evaluations.export-planning');

    // Saisie des notes
    Route::get('evaluations/{evaluation}/marks', [MarkController::class, 'index'])->name('marks.index');
    Route::post('evaluations/{evaluation}/marks', [MarkController::class, 'store'])->name('marks.store');

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
    Route::get('accounting/situation/export', [SituationController::class, 'export'])->name('accounting.situation.export');
    Route::post('accounting/expenses', [ExpenseController::class, 'store'])->name('expenses.store');
    Route::delete('accounting/expenses/{transaction}', [ExpenseController::class, 'destroy'])->name('expenses.destroy');
    Route::get('cash-accounts', [CashAccountController::class, 'index'])->middleware('can:view_cash_accounts')->name('cash-accounts.index');
    Route::post('cash-accounts', [CashAccountController::class, 'store'])->name('cash-accounts.store');
    Route::put('cash-accounts/{cashAccount}', [CashAccountController::class, 'update'])->name('cash-accounts.update');
    Route::delete('cash-accounts/{cashAccount}', [CashAccountController::class, 'destroy'])->name('cash-accounts.destroy');
    Route::resource('enrollments', EnrollmentController::class)->middleware('can:view_enrollments');
    Route::get('enrollments/{enrollment}/invoice', [InvoiceController::class, 'show'])->name('enrollments.invoice');
    Route::post('enrollments/{enrollment}/payments', [InvoiceController::class, 'storePayment'])->name('enrollments.payments.store');
    Route::get('payments/{payment}/receipt', [InvoiceController::class, 'receipt'])->name('payments.receipt');
    Route::get('receipts/verify', [InvoiceController::class, 'verifyReceipt'])
        ->middleware('throttle:30,1')
        ->name('receipts.verify');
    Route::resource('subject-assignments', SubjectAssignmentController::class)->middleware('can:view_subject_assignments');

    // Présences & Permissions
    Route::get('attendances', [AttendanceController::class, 'index'])->middleware('can:view_attendances')->name('attendances.index');
    Route::post('attendances', [AttendanceController::class, 'store'])->name('attendances.store');
    Route::get('attendances/stats', [AttendanceController::class, 'stats'])->middleware('can:view_attendances')->name('attendances.stats');
    Route::resource('absence-permissions', AbsencePermissionController::class)->only(['index', 'create', 'store', 'show', 'destroy'])->middleware('can:view_absence_permissions');
    Route::patch('absence-permissions/{absencePermission}/review', [AbsencePermissionController::class, 'review'])
        ->name('absence-permissions.review');

    // Grades Routes
    Route::get('grades', [GradeController::class, 'index'])->middleware('can:view_grades')->name('grades.index');
    Route::post('grades', [GradeController::class, 'store'])->name('grades.store');
    Route::get('grades/student/{student}', [GradeController::class, 'student'])->name('grades.student');

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
    Route::post('archives', [\App\Http\Controllers\Archives\ArchiveController::class, 'store'])->name('archives.store');
    Route::post('archives/{archive}', [\App\Http\Controllers\Archives\ArchiveController::class, 'update'])->name('archives.update');
    Route::get('archives/{archive}/download', [\App\Http\Controllers\Archives\ArchiveController::class, 'download'])->name('archives.download');
    Route::delete('archives/{archive}', [\App\Http\Controllers\Archives\ArchiveController::class, 'destroy'])->name('archives.destroy');
    Route::post('archives/{archive}/restore', [\App\Http\Controllers\Archives\ArchiveController::class, 'restore'])->name('archives.restore');
    Route::delete('archives/{archive}/force', [\App\Http\Controllers\Archives\ArchiveController::class, 'forceDelete'])->name('archives.force-delete');

    Route::get('archives-tags', [\App\Http\Controllers\Archives\DocumentTagController::class, 'index'])->middleware('can:view_archives')->name('archives.tags.index');
    Route::post('archives-tags', [\App\Http\Controllers\Archives\DocumentTagController::class, 'store'])->name('archives.tags.store');
    Route::put('archives-tags/{documentTag}', [\App\Http\Controllers\Archives\DocumentTagController::class, 'update'])->name('archives.tags.update');
    Route::delete('archives-tags/{documentTag}', [\App\Http\Controllers\Archives\DocumentTagController::class, 'destroy'])->name('archives.tags.destroy');

    // Sauvegardes de la base de données
    Route::get('settings/backups', [\App\Http\Controllers\Parametres\BackupController::class, 'index'])->middleware('can:view_backups')->name('backups.index');
    Route::post('settings/backups', [\App\Http\Controllers\Parametres\BackupController::class, 'store'])->name('backups.store');
    Route::post('settings/backups/schedule', [\App\Http\Controllers\Parametres\BackupController::class, 'updateSchedule'])->name('backups.schedule');
    Route::post('settings/backups/restore', [\App\Http\Controllers\Parametres\BackupController::class, 'restore'])->name('backups.restore');
    Route::get('settings/backups/{backup}/download', [\App\Http\Controllers\Parametres\BackupController::class, 'download'])->name('backups.download');
    Route::delete('settings/backups/{backup}', [\App\Http\Controllers\Parametres\BackupController::class, 'destroy'])->name('backups.destroy');

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
