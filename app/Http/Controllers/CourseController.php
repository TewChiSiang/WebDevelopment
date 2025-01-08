<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Lecture;

class CourseController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
{
    $courses = Course::with('lecture:id,name')
        ->select(
            'courses.id',
            'courses.course_id',
            'courses.course_name',
            'courses.course_start_time', 
            'courses.course_end_time',
            'courses.weekday',
            'courses.lecture_id'
        )
        ->get();
    return response()->json($courses);
}

    public function getCourseStudents($courseId)
    {
        $students = Course::findOrFail($courseId)
            ->students()
            ->join('users', 'students.id', '=', 'users.id')
            ->select('students.student_id', 'students.name')
            ->get();

        return response()->json($students);
    }

    public function getLecturerCourses($userId)
    {
        // Find the lecture record for this user
        $lecture = Lecture::where('user_id', $userId)->first();

        if (!$lecture) {
            return response()->json([
                'message' => 'No lecture profile found for this user'
            ], 404);
        }

        // Get courses for this lecture
        $courses = Course::where('lecture_id', $lecture->id)
            ->orderBy('created_at')
            ->get();

        return response()->json($courses);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'required|string|unique:courses,course_id',
            'course_name' => 'required|string|max:255',
            'course_start_time' => 'required|date_format:H:i',
            'course_end_time' => 'required|date_format:H:i',
            'weekday' => 'required|integer|min:1|max:7',
            'lecture_id' => 'required|exists:lectures,id',
        ]);

        $lecture = auth()->user()->lecture;
        if (!$lecture) {
            return response()->json([
                'success' => false,
                'message' => 'Lecture record not found for the current user.'
            ], 404);
        }

        $validated['lecture_id'] = $lecture->id;

        $course = Course::create($validated);

        return response()->json($course, 201);
    }

    public function studentEnroll(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,course_id',
        ]);

        $course = Course::where('course_id', $validated['course_id'])
            ->with('lecture:id,name')
            ->first();

        if (!$course->lecture_id) {
            return response()->json([
                'success' => false,
                'message' => 'This course does not have an assigned lecture yet.',
            ], 400);
        }

        $student = auth()->user()->student;

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student record not found for the current user.',
            ], 404);
        }

        if ($student->courses()->where('student_course.course_id', $course->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'You are already enrolled in this course.',
            ], 400);
        }

        $student->courses()->attach($course->id);

        return response()->json([
            'success' => true,
            'message' => 'You have successfully enrolled in the course.',
            'course' => [
                'course_id' => $course->course_id,
                'course_name' => $course->course_name,
                'course_start_time' => $course->course_start_time,
                'course_end_time' => $course->course_end_time,
                'weekday' => $course->weekday,
                'lecture_name' => $course->lecture->name
            ]
        ], 201);
    }

    public function studentCourseDetails()
    {
        $student = auth()->user()->student;

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student record not found for the current user.',
            ], 404);
        }


        $enrolledCourses = $student->courses()
            ->join('lectures', 'courses.lecture_id', '=', 'lectures.id')
            ->select(
                'courses.course_id',
                'courses.course_name',
                'courses.course_start_time',
                'courses.course_end_time',
                'courses.weekday',
                'lectures.name as lecture_name'
            )->get();

        return response()->json($enrolledCourses);
    }

    public function studentUnenroll($courseId)
    {
        $student = auth()->user()->student;

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student record not found for the current user.',
            ], 404);
        }

        $course = Course::where('course_id', $courseId)->first();

        if (!$course) {
            return response()->json([
                'success' => false,
                'message' => 'Course not found.',
            ], 404);
        }

        if (!$student->courses()->where('student_course.course_id', $course->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'You are not enrolled in this course.',
            ], 400);
        }

        $student->courses()->detach($course->id);

        return response()->json([
            'success' => true,
            'message' => 'Successfully unenrolled from the course.',
        ], 200);
    }

    public function lectureCourseDetails()
    {
        $lecture = auth()->user()->lecture;

        if (!$lecture) {
            return response()->json([
                'success' => false,
                'message' => 'Lecture record not found for the current user.',
            ], 404);
        }

        $enrolledCourses = $lecture->courses()->select(
            'courses.course_id',
            'courses.course_name',
            'courses.course_start_time',
            'courses.course_end_time',
            'courses.weekday'
        )->get();

        return response()->json($enrolledCourses);
    }

    public function getTimeTable()
    {
        Log::info('getTimeTable method called');
        $user = auth()->user();
        Log::info('Authenticated user:', ['user_id' => $user->id]);

        $courses = [];

        if ($user->student) {
            Log::info('User is a student');
            $courses = $user->student->courses()
                ->select(
                    'courses.course_id',
                    'courses.course_name',
                    'courses.course_start_time',
                    'courses.course_end_time',
                    'courses.weekday',
                    'lectures.name as lecture_name'
                )
                ->join('lectures', 'courses.lecture_id', '=', 'lectures.id')
                ->get();
            Log::info('Student courses:', ['courses' => $courses->toArray()]);
        } elseif ($user->lecture) {
            Log::info('User is a lecturer');
            $courses = $user->lecture->courses()
                ->select(
                    'courses.course_id',
                    'courses.course_name',
                    'courses.course_start_time',
                    'courses.course_end_time',
                    'courses.weekday'
                )
                ->get();
            Log::info('Lecturer courses:', ['courses' => $courses->toArray()]);
        } else {
            Log::warning('User has no student or lecture profile');
        }

        // Log the final sorted courses
        $sortedCourses = $courses->sortBy([
            ['course_start_time', 'asc'],
            ['weekday', 'asc'],
        ]);

        Log::info('Final sorted courses:', ['sorted_courses' => $sortedCourses->values()->toArray()]);

        return response()->json($sortedCourses->values());
    }
}
