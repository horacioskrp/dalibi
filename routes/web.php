<?php

use App\Http\Controllers\AcademicPeriodController;
use App\Http\Controllers\AcademicYearController;
use App\Http\Controllers\ClassroomController;
use App\Http\Controllers\ClassroomTypeController;
use App\Http\Controllers\ClassSubjectController;
use App\Http\Controllers\EnrollmentController;
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
    Route::resource('schools', SchoolController::class);
    Route::resource('classrooms', ClassroomController::class);
    Route::resource('classroom-types', ClassroomTypeController::class);
    Route::resource('levels', LevelController::class);
    Route::resource('subjects', SubjectController::class);
    Route::resource('class-subjects', ClassSubjectController::class);
    Route::resource('academic-years', AcademicYearController::class);
    Route::resource('academic-periods', AcademicPeriodController::class);
    Route::resource('schoolings', SchoolingController::class);
    Route::resource('fee-categories', FeeCategorieController::class);
    Route::resource('fee-structures', FeeStructureController::class);
    Route::resource('scholarships', ScholarshipController::class);
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
