<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Student;
use App\Models\Lecture;
use App\Models\Course;
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
        $students = Student::with('courses')->get(); 
        $lectures = Lecture::all();
        $courses = Course::with('students')->get(); 
        $attendances = Attendance::all();

        $sessionId = uniqid('session_', true);
        return inertia('Attendance', [
            'message' => 'Scan the QR code to mark your attendance!',
            'sessionId' => $sessionId,
            'students' => $students,
            'lectures' => $lectures,
            'courses' => $courses,
            'attendance' => $attendances,
        ]);
    }
}