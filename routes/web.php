<?php

use App\Http\Controllers\AcademicPeriodController;
use App\Http\Controllers\AcademicYearController;
use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\ClassroomSubjectAssignmentController;
use App\Http\Controllers\ClassroomTypeController;
use App\Http\Controllers\EnrollmentController;
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
    Route::post('students/bulk-status', [StudentController::class, 'bulkStatus'])
        ->name('students.bulk-status');
    Route::resource('students', StudentController::class);
    Route::resource('enrollments', EnrollmentController::class);
    Route::get('enrollments/{enrollment}/receipt', [EnrollmentController::class, 'receipt'])->name('enrollments.receipt');
    Route::resource('subject-assignments', SubjectAssignmentController::class);

    // Administration Routes
    Route::resource('roles', RoleController::class);
    Route::resource('permissions', PermissionController::class);
    Route::resource('users', UserController::class);
});

require __DIR__.'/settings.php';
