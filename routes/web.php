<?php

use App\Http\Controllers\AcademicPeriodController;
use App\Http\Controllers\DocumentTemplateController;
use App\Http\Controllers\FileStorageController;
use App\Http\Controllers\OfficialExamController;
use App\Http\Controllers\TimetableController;
use App\Http\Controllers\AcademicYearController;
use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\ClassroomSubjectAssignmentController;
use App\Http\Controllers\ClassroomTypeController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\AccountingController;
use App\Http\Controllers\CashAccountController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\SituationController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\AbsencePermissionController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\EvaluationTemplateController;
use App\Http\Controllers\EvaluationTypeController;
use App\Http\Controllers\GradingConfigController;
use App\Http\Controllers\MarkController;
use App\Http\Controllers\NoteReclamationController;
use App\Http\Controllers\FeeCategorieController;
use App\Http\Controllers\FeeStructureController;
use App\Http\Controllers\LevelController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\ScholarshipController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\StudentScholarshipController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\SubjectAssignmentController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
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
    Route::resource('schools', SchoolController::class);
    Route::resource('classrooms', ClassroomController::class);
    Route::get('classrooms/{classroom}/subject-assignments', [ClassroomSubjectAssignmentController::class, 'create'])
        ->name('classrooms.subject-assignments.create');
    Route::post('classrooms/{classroom}/subject-assignments', [ClassroomSubjectAssignmentController::class, 'store'])
        ->name('classrooms.subject-assignments.store');
    Route::resource('classroom-types', ClassroomTypeController::class);
    Route::resource('levels', LevelController::class);
    Route::resource('subjects', SubjectController::class);
    Route::resource('evaluation-types', EvaluationTypeController::class);

    // Modèles d'évaluation (global)
    Route::resource('evaluation-templates', EvaluationTemplateController::class);
    Route::post('evaluation-templates/{evaluationTemplate}/generate', [EvaluationTemplateController::class, 'generate'])
        ->name('evaluation-templates.generate');

    // Évaluations par classe/matière
    Route::resource('evaluations', EvaluationController::class)->only(['index', 'show', 'destroy']);
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
    Route::resource('note-reclamations', NoteReclamationController::class)->only(['index', 'create', 'store', 'show']);
    Route::patch('note-reclamations/{noteReclamation}/review', [NoteReclamationController::class, 'review'])
        ->name('note-reclamations.review');

    // Configurations de calcul des moyennes
    Route::resource('grading-configs', GradingConfigController::class)->except(['show']);
    Route::patch('grading-configs/{gradingConfig}/activate', [GradingConfigController::class, 'activate'])
        ->name('grading-configs.activate');
    Route::resource('academic-years', AcademicYearController::class);
    Route::resource('academic-periods', AcademicPeriodController::class);
    Route::resource('fee-categories', FeeCategorieController::class);
    Route::resource('fee-structures', FeeStructureController::class);
    Route::post('fee-structures/{feeStructure}/installments', [\App\Http\Controllers\InstallmentController::class, 'storeMultiple'])
        ->name('fee-structures.installments.store-multiple');
    Route::resource('scholarships', ScholarshipController::class);
    Route::resource('student-scholarships', StudentScholarshipController::class);
    Route::post('students/bulk-status', [StudentController::class, 'bulkStatus'])
        ->name('students.bulk-status');
    Route::get('students/{student}/history', [StudentController::class, 'history'])
        ->name('students.history');
    Route::resource('students', StudentController::class);
    Route::get('accounting', [AccountingController::class, 'index'])->name('accounting.index');
    Route::get('accounting/transactions', [TransactionController::class, 'index'])->name('accounting.transactions');
    Route::get('accounting/situation', [SituationController::class, 'index'])->name('accounting.situation');
    Route::get('accounting/situation/export', [SituationController::class, 'export'])->name('accounting.situation.export');
    Route::post('accounting/expenses', [ExpenseController::class, 'store'])->name('expenses.store');
    Route::delete('accounting/expenses/{transaction}', [ExpenseController::class, 'destroy'])->name('expenses.destroy');
    Route::get('cash-accounts', [CashAccountController::class, 'index'])->name('cash-accounts.index');
    Route::post('cash-accounts', [CashAccountController::class, 'store'])->name('cash-accounts.store');
    Route::put('cash-accounts/{cashAccount}', [CashAccountController::class, 'update'])->name('cash-accounts.update');
    Route::delete('cash-accounts/{cashAccount}', [CashAccountController::class, 'destroy'])->name('cash-accounts.destroy');
    Route::resource('enrollments', EnrollmentController::class);
    Route::get('enrollments/{enrollment}/invoice', [InvoiceController::class, 'show'])->name('enrollments.invoice');
    Route::post('enrollments/{enrollment}/payments', [InvoiceController::class, 'storePayment'])->name('enrollments.payments.store');
    Route::get('payments/{payment}/receipt', [InvoiceController::class, 'receipt'])->name('payments.receipt');
    Route::resource('subject-assignments', SubjectAssignmentController::class);

    // Présences & Permissions
    Route::get('attendances', [AttendanceController::class, 'index'])->name('attendances.index');
    Route::post('attendances', [AttendanceController::class, 'store'])->name('attendances.store');
    Route::get('attendances/stats', [AttendanceController::class, 'stats'])->name('attendances.stats');
    Route::resource('absence-permissions', AbsencePermissionController::class)->only(['index', 'create', 'store', 'show', 'destroy']);
    Route::patch('absence-permissions/{absencePermission}/review', [AbsencePermissionController::class, 'review'])
        ->name('absence-permissions.review');

    // Grades Routes
    Route::get('grades', [GradeController::class, 'index'])->name('grades.index');
    Route::post('grades', [GradeController::class, 'store'])->name('grades.store');
    Route::get('grades/student/{student}', [GradeController::class, 'student'])->name('grades.student');

    // Administration Routes
    Route::resource('roles', RoleController::class);
    Route::resource('permissions', PermissionController::class);
    Route::resource('users', UserController::class);

    // File Storage Settings
    Route::get('settings/file-storage', [FileStorageController::class, 'index'])->name('file-storage.index');
    Route::post('settings/file-storage', [FileStorageController::class, 'update'])->name('file-storage.update');
    Route::post('settings/file-storage/test', [FileStorageController::class, 'test'])->name('file-storage.test');

    // Timetable (emploi du temps)
    Route::get('timetable', [TimetableController::class, 'index'])->name('timetable.index');
    Route::post('timetable', [TimetableController::class, 'store'])->name('timetable.store');
    Route::put('timetable/{timetableSlot}', [TimetableController::class, 'update'])->name('timetable.update');
    Route::delete('timetable/{timetableSlot}', [TimetableController::class, 'destroy'])->name('timetable.destroy');

    // Official Exams (CEPD, BEPC, BAC)
    Route::get('official-exams', [OfficialExamController::class, 'index'])->name('official-exams.index');
    Route::post('official-exams', [OfficialExamController::class, 'store'])->name('official-exams.store');
    Route::get('official-exams/{officialExam}', [OfficialExamController::class, 'show'])->name('official-exams.show');
    Route::put('official-exams/{officialExam}', [OfficialExamController::class, 'update'])->name('official-exams.update');
    Route::delete('official-exams/{officialExam}', [OfficialExamController::class, 'destroy'])->name('official-exams.destroy');
    Route::post('official-exams/{officialExam}/register', [OfficialExamController::class, 'registerStudents'])->name('official-exams.register');
    Route::put('official-exams/{officialExam}/results', [OfficialExamController::class, 'updateResults'])->name('official-exams.results');
    Route::delete('official-exams/{officialExam}/registrations/{registration}', [OfficialExamController::class, 'removeRegistration'])->name('official-exams.registrations.destroy');

    // Document Templates (Settings)
    Route::get('settings/documents-registry', [DocumentTemplateController::class, 'registry'])->name('document-templates.registry');
    Route::get('settings/documents', [DocumentTemplateController::class, 'index'])->name('document-templates.index');
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
