<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\Course;
use Illuminate\Support\Facades\Log;

class AttendanceController extends Controller
{
    public function markAttendance(Request $request)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'sessionId' => 'required|string',
                'courseId' => 'required|integer',
                'studentId' => 'required|integer',
                'timestamp' => 'required|date',
                'expiresAt' => 'required|date'
            ]);

            // Set timezone to Malaysia
            Carbon::setLocale('en');
            date_default_timezone_set('Asia/Kuala_Lumpur');

            // Check if QR code has expired
            $expirationTime = Carbon::parse($validated['expiresAt']);
            $currentTime = Carbon::now();

            if ($currentTime->gt($expirationTime)) {
                return response()->json([
                    'success' => false,
                    'message' => 'QR code has expired. Please scan a new code.'
                ], 400);
            }

            // Check for existing attendance with this session ID
            $existingAttendance = Attendance::where([
                'student_id' => $validated['studentId'],
                'course_id' => $validated['courseId'],
                'qr_code_hash' => $validated['sessionId'],
            ])->first();

            if ($existingAttendance) {
                return response()->json([
                    'success' => false,
                    'message' => 'Attendance already marked for this session'
                ], 200);
            }

            $course = Course::find($validated['courseId']);
            if (!$course) {
                return response()->json([
                    'success' => false,
                    'message' => 'Course not found'
                ], 404);
            }

            if (empty($course->course_time)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Course start time not set'
                ], 400);
            }

            $student = auth()->user()->student;
            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'Student record not found for the current user.'
                ], 404);
            }

            $validated['studentId'] = $student->id;


            $currentDate = Carbon::today()->toDateString();
            $courseStartTimeString = $currentDate . ' ' . $course->course_time;

            try {
                $courseStartTime = Carbon::parse($courseStartTimeString);
            } catch (\Exception $e) {
                Log::error('Invalid course_time format: ' . $courseStartTimeString);
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid course start time format'
                ], 400);
            }

            $checkInTime = Carbon::parse($validated['timestamp'])->setTimezone('Asia/Kuala_Lumpur');

            $minutesDiff = $checkInTime->diffInMinutes($courseStartTime, false);
            $status = $minutesDiff <= 15 && $minutesDiff >= -10 ? 'present' : 'late';

            $attendance = new Attendance([
                'student_id' => $validated['studentId'],
                'course_id' => $validated['courseId'],
                'check_in_time' => $checkInTime,
                'qr_code_hash' => $validated['sessionId'],
                'status' => $status
            ]);

            $attendance->save();

            return response()->json([
                'success' => true,
                'message' => 'Attendance marked successfully',
                'status' => $status,
                'check_in_time' => $checkInTime->format('Y-m-d H:i:s')
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Attendance marking error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark attendance: ' . $e->getMessage()
            ], 500);
        }
    }
}
