<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\CheckStatusController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/
Route::get('/', [CheckStatusController::class, 'checkStatus'])->name('home');

Route::post('/new', [App\Http\Controllers\Auth\RegisterController::class, 'register'])->name('register');

Route::middleware('auth')->group(function () {
    Route::get('/student', function () {
        return  Inertia::render('Student');
    })->name('student')->middleware('CheckRole:student');

    Route::get('/admin', function () {
        return  Inertia::render('Admin');
    })->name('admin')->middleware('CheckRole:admin');

    Route::get('/lecture', function () {
        return  Inertia::render('Lecture');
    })->name('lecture')->middleware('CheckRole:lecture');
});

Route::post('/login', [App\Http\Controllers\Auth\LoginController::class, 'redirectTo'])->name('login');

Route::post('/new', [App\Http\Controllers\Auth\RegisterController::class, 'register'])->name('new');

Route::get('/register', function () {
    return Inertia::render('Register');
});