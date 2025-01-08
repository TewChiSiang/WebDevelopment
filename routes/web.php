<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

// Controllers
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\CheckStatusController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\StudentListController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use TCG\Voyager\Facades\Voyager;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StudentController;

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

// Forgot password routes
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLinkEmail'])->name('password.email');
Route::get('/reset-password/{token}', function ($token) {
    return Inertia::render('ResetPassword', ['token' => $token, 'email' => request()->query('email')]);
})->middleware('guest')->name('password.reset');
Route::post('/reset-password', [ForgotPasswordController::class, 'reset'])->middleware('guest')->name('password.update');

// Protected routes (requires authentication)
Route::middleware('auth')->group(function () {

    // Student routes
    Route::get('/student', function () {
        return Inertia::render('Student/Student');
    })->name('student')
        ->middleware('CheckRole:student');

    Route::get('/student-profile', function () {
        return Inertia::render('Student/StudentProfile');
    })->name('student-profile')
        ->middleware('CheckRole:student');

    Route::get('/student-enrollcourse', function () {
        return Inertia::render('Student/StudentEnrollCourse');
    })->name('student-enrollcourse')
        ->middleware('CheckRole:student');

    Route::get('/student-course-details', function () {
        return Inertia::render('Student/StudentCourseDetails');
    })->name('student-course-details')
        ->middleware('CheckRole:student');

    Route::get('/student-enrolled-courses', [CourseController::class, 'studentCourseDetails'])
        ->name('student-enrolled-courses')
        ->middleware('CheckRole:student');

    Route::get('/courses', [CourseController::class, 'index'])
        ->name('courses.index')
        ->middleware('CheckRole:student');

    Route::post('/student-enroll', [CourseController::class, 'studentEnroll'])
        ->name('courses.studentEnroll')
        ->middleware('CheckRole:student');

    Route::delete('/student-unenroll/{courseId}', [CourseController::class, 'studentUnenroll'])
        ->name('courses.studentUnenroll')
        ->middleware('CheckRole:student');

    Route::get('/my-attendance', function () {
        return Inertia::render('Student/MyAttendanceRecord');
    })->name('my-attendance')
        ->middleware('CheckRole:student');

    Route::get('/students/{student}/daily-attendance', [AttendanceController::class, 'getDailyAttendance'])
        ->name('students.daily-attendance')
        ->middleware('CheckRole:student');

    Route::get('/students/{student}/attendance-stats', [AttendanceController::class, 'getAttendanceStats'])
        ->name('students.attendance-stats')
        ->middleware('CheckRole:student');

    Route::get('/student-time-table', function () {
        return Inertia::render('Student/StudentTimeTable');
    })->name('student-time-table')
        ->middleware('CheckRole:student');

    Route::get('/api/student-stats', [StudentController::class, 'getStats'])
        ->name('student.stats')
        ->middleware('CheckRole:student');


    // Lecture routes
    Route::get('/lecture', function () {
        return Inertia::render('Lecture/Lecture');
    })->name('lecture')
        ->middleware('CheckRole:lecture');

    Route::get('/student-attendance', function () {
        return Inertia::render('Lecture/StudentAttendanceRecord');
    })->name('student-attendance')
        ->middleware('CheckRole:lecture');

    // Student List (only accessible by lectures)
    Route::get('/qr-attendance', [StudentListController::class, 'index'])
        ->name('qr-attendance')
        ->middleware('CheckRole:lecture');

    Route::get('/lecture-addcourse', function () {
        return Inertia::render('Lecture/LectureAddCourse');
    })->name('addcourse')
        ->middleware('CheckRole:lecture');

    Route::get('/lecture-enrolled-courses', [CourseController::class, 'lectureCourseDetails'])
        ->name('lecture-enrolled-courses')
        ->middleware('CheckRole:lecture');

    Route::get('/lecture-course-details', function () {
        return Inertia::render('Lecture/LectureCourseDetails');
    })->name('lecture-course-details')
        ->middleware('CheckRole:lecture');

    Route::get('/api/courses/{courseId}/students', [CourseController::class, 'getCourseStudents'])
        ->name('courses.students')
        ->middleware('CheckRole:lecture');

    Route::get('/courses/lecturer/{userId}', [CourseController::class, 'getLecturerCourses'])
        ->name('courses.lecturer')
        ->middleware('CheckRole:lecture');

    // Handle the form submission
    Route::post('/courses', [CourseController::class, 'store'])
        ->name('courses.store')
        ->middleware('CheckRole:lecture');

    Route::get('/lecture-time-table', function () {
        return Inertia::render('Lecture/LectureTimeTable');
    })->name('lecture-time-table')
        ->middleware('CheckRole:lecture');

    Route::get('/course/{courseId}/attendance-stats', [AttendanceController::class, 'getStudentAttendanceStats'])
        ->name('course.attendance-stats')
        ->middleware('CheckRole:lecture');

    Route::get('/lecture-profile', function () {
        return Inertia::render('Lecture/LectureProfile');
    })->name('lecture-profile')
        ->middleware('CheckRole:lecture');
});

// TimeTable route
Route::get('/get-timetable', [CourseController::class, 'getTimeTable'])
    ->name('get-timetable');

// Profile routes
Route::put('/update-profile', [ProfileController::class, 'updateProfile'])
    ->name('profile.update');
Route::put('/update-password', [ProfileController::class, 'updatePassword'])
    ->name('profile.password');
Route::get('/students/{id}', [ProfileController::class, 'getStudentData'])
    ->name('student.data');

// Attendance route
Route::post('/attendance', [AttendanceController::class, 'markAttendance']);
Route::get('/api/attendance-status/course/{courseId}', [AttendanceController::class, 'getAttendanceStatusByCourse']);
Route::post('/manual-attendance/{courseId}', [AttendanceController::class, 'markManualAttendance']);
Route::delete('/attendance/{courseId}/{studentId}', [AttendanceController::class, 'cancelAttendance']);

// Admin routes
Route::group(['prefix' => 'admin'], function () {
    Voyager::routes();
});
