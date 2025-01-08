<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Student;
use App\Models\Lecture;
use App\Models\Course;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Http\Request;

class StudentListController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        $user = Auth::user();
        $lecture = Lecture::where('user_id', $user->id)->first();

        $courses = Course::query();
        if ($lecture) {
            // Filter courses for the specific lecture based on their enrollment
            $courses = $courses->whereHas('lecture', function ($query) use ($lecture) {
                $query->where('lecture_id', $lecture->id);
            });
        }
        $courses = $courses->with('students')->get();

        $students = Student::with('courses')->get();
        $lectures = Lecture::all();
        $attendances = Attendance::all();

        $sessionId = uniqid('session_', true);
        return inertia('Lecture/Attendance', [
            'message' => 'Scan the QR code to mark your attendance!',
            'sessionId' => $sessionId,
            'students' => $students,
            'lectures' => $lectures,
            'courses' => $courses,
            'attendance' => $attendances,
        ]);
    }
}
