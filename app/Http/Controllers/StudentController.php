<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class StudentController extends Controller
{
    public function getStats(Request $request)
    {
        try {
            $studentId = $request->query('studentId');

            $student = DB::table('students')->where('user_id', $studentId)->first();

            if (!$student) {
                return response()->json(['error' => 'Student not found'], 404);
            }

            $studentPrimaryId = $student->id;

           //get all the courses that the student is enrolled in
            $enrolledCourseIds = DB::table('student_course')
                ->where('student_id',$studentPrimaryId)
                ->pluck('course_id');

            // get the total number of class days for the courses the student is enrolled in
            $totalClassDays = DB::table('attendances')
                ->whereIn('course_id', $enrolledCourseIds)
                ->distinct('qr_code_hash')
                ->count('qr_code_hash');

            //get the number of attended sessions
            $attendedSessions = DB::table('attendances')
                ->whereIn('course_id', $enrolledCourseIds)
                ->where('student_id', $studentPrimaryId)
                ->distinct('qr_code_hash')
                ->count('qr_code_hash');

            // compute the attendance rate
            $attendanceRate = $totalClassDays > 0
                ? round(($attendedSessions / $totalClassDays) * 100, 2)
                : 0;

            Log::info('Attendance Query Debug:', [
                'studentId' =>$studentPrimaryId,
                'attended_sessions' => $attendedSessions,
                'total_sessions' => $totalClassDays,
            ]);

            return response()->json([
                'enrolledClassesCount' => count($enrolledCourseIds),
                'totalClassDays' => $totalClassDays,
                'attendanceRate' => $attendanceRate,
            ]);
        } catch (\Exception $e) {
            Log::error('Error calculating student stats: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch student stats'], 500);
        }
    }
}
