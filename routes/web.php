<?php

use App\Http\Controllers\AcademicPeriodController;
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
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\EvaluationTypeController;
use App\Http\Controllers\FeeCategorieController;
use App\Http\Controllers\FeeStructureController;
use App\Http\Controllers\LevelController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\SchoolingController;
use App\Http\Controllers\ScholarshipController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\StudentScholarshipController;
use App\Http\Controllers\SubjectAssignmentController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

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
    Route::resource('evaluations', EvaluationController::class);
    Route::get('evaluations/bulk/schedule', [EvaluationController::class, 'bulkScheduleForm'])
        ->name('evaluations.bulk-schedule');
    Route::post('evaluations/bulk/store', [EvaluationController::class, 'bulkStore'])
        ->name('evaluations.bulk-store');
    Route::resource('academic-years', AcademicYearController::class);
    Route::resource('academic-periods', AcademicPeriodController::class);
    Route::resource('schoolings', SchoolingController::class);
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
    Route::get('cash-accounts', [CashAccountController::class, 'index'])->name('cash-accounts.index');
    Route::post('cash-accounts', [CashAccountController::class, 'store'])->name('cash-accounts.store');
    Route::put('cash-accounts/{cashAccount}', [CashAccountController::class, 'update'])->name('cash-accounts.update');
    Route::delete('cash-accounts/{cashAccount}', [CashAccountController::class, 'destroy'])->name('cash-accounts.destroy');
    Route::resource('enrollments', EnrollmentController::class);
    Route::get('enrollments/{enrollment}/invoice', [InvoiceController::class, 'show'])->name('enrollments.invoice');
    Route::post('enrollments/{enrollment}/payments', [InvoiceController::class, 'storePayment'])->name('enrollments.payments.store');
    Route::get('payments/{payment}/receipt', [InvoiceController::class, 'receipt'])->name('payments.receipt');
    Route::resource('subject-assignments', SubjectAssignmentController::class);

    // Administration Routes
    Route::resource('roles', RoleController::class);
    Route::resource('permissions', PermissionController::class);
    Route::resource('users', UserController::class);
});

require __DIR__.'/settings.php';
