<?php

use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BulletinController;
use App\Http\Controllers\Api\V1\CalendarController;
use App\Http\Controllers\Api\V1\ChildrenController;
use App\Http\Controllers\Api\V1\FeeController;
use App\Http\Controllers\Api\V1\GradeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API du portail (parents & élèves) — v1
|--------------------------------------------------------------------------
| Authentification par token (Laravel Sanctum). Deux principaux possibles :
| Guardian (tuteur → ses enfants) et Student (→ ses propres données).
*/

Route::prefix('v1')->group(function () {
    // Connexion + réinitialisation (throttlées)
    Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:6,1');
    Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:6,1');
    Route::post('auth/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:6,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::post('auth/logout', [AuthController::class, 'logout']);

        // Enfants accessibles (tuteur → ses enfants ; élève → lui-même)
        Route::get('children', [ChildrenController::class, 'index']);

        // Données scopées par enfant (résolution stricte dans ApiController::resolveStudent)
        Route::get('children/{student}/grades', [GradeController::class, 'index']);
        Route::get('children/{student}/bulletins', [BulletinController::class, 'index']);
        Route::get('children/{student}/bulletins/{reportCard}/pdf', [BulletinController::class, 'pdf']);
        Route::get('children/{student}/attendance', [AttendanceController::class, 'index']);
        Route::get('children/{student}/fees', [FeeController::class, 'index']);

        // Calendrier (commun)
        Route::get('calendar', [CalendarController::class, 'index']);
    });
});
