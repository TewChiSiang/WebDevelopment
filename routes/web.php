<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

// Controllers
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\CheckStatusController;
use App\Http\Controllers\StudentListController;
use TCG\Voyager\Facades\Voyager;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
| Here is where you can register web routes for your application.
| These routes are loaded by the RouteServiceProvider within a group
| that contains the "web" middleware group.
|--------------------------------------------------------------------------
*/

// Home route
Route::get('/', [CheckStatusController::class, 'checkStatus'])->name('home');

// Authentication routes
Route::post('/login', [LoginController::class, 'redirectTo'])->name('login');
Route::post('/register', [RegisterController::class, 'register'])->name('register');
Route::post('/logout', function () {
    Auth::logout();
    return Inertia::location('/');
})->name('logout');

// Protected routes (requires authentication)
Route::middleware('auth')->group(function () {

    // Student routes
    Route::get('/student', function () {
        return Inertia::render('Student');
    })->name('student')->middleware('CheckRole:student');

    // Lecture routes
    Route::get('/lecture', function () {
        return Inertia::render('Lecture');
    })->name('lecture')->middleware('CheckRole:lecture');

    // Student List (only accessible by lectures)
    Route::get('/studentlist', [StudentListController::class, 'index'])
        ->name('studentlist')
        ->middleware('CheckRole:lecture');
});

// Attendance route
Route::post('/attendance', [AttendanceController::class, 'markAttendance']);

// Admin routes
Route::group(['prefix' => 'admin'], function () {
    Voyager::routes();
});
