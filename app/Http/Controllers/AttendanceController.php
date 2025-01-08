<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\Course;
use App\Models\Student;
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

            $student = auth()->user()->student;
            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'Student record not found for the current user.'
                ], 404);
            }

            // if ($student->id !== $validated['studentId']) {
            //     return response()->json([
            //         'success' => false,
            //         'message' => 'Student ID does not match the current user.'
            //     ], 403); // Forbidden
            // }

            $validated['studentId'] = $student->id;

            // Set timezone to Malaysia
            Carbon::setLocale('en');
            date_default_timezone_set('Asia/Kuala_Lumpur');

            // Check if QR code has expired
            $expirationTime = Carbon::parse($validated['expiresAt']);
            $currentTime = Carbon::now();

            if ($currentTime->gt($expirationTime)) {
                return response()->json([
                    'success' => false,
                    'message' => 'QR code has expired. Please scan a new QR code.'
                ], 400);
            }

            $course = Course::find($validated['courseId']);
            if (!$course) {
                return response()->json([
                    'success' => false,
                    'message' => 'Course not found'
                ], 404);
            }

            if (empty($course->course_start_time) || empty($course->course_end_time)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Course start or end time not set'
                ], 400);
            }

            $currentDate = Carbon::today()->toDateString();
            $courseStartTime = Carbon::parse($currentDate . ' ' . $course->course_start_time);
            $courseEndTime = Carbon::parse($currentDate . ' ' . $course->course_end_time);

            // Check for existing attendance with this session ID
            $existingAttendance = Attendance::where([
                'student_id' => $validated['studentId'],
                'course_id' => $validated['courseId'],
            ])
                ->whereBetween('check_in_time', [$courseStartTime, $courseEndTime])
                ->first();

            if ($existingAttendance) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have already marked attendance for this session'
                ], 200);
            }

            $isEnrolled = $course->students()
                ->where('student_course.student_id', $student->id)
                ->exists();

            if (!$isEnrolled) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please enroll in the course first'
                ]);
            }

            $courseStartTimeString = $currentDate . ' ' . $course->course_start_time;

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

    public function getAttendanceStatusByCourse($courseId, Request $request)
    {
        $course = Course::find($courseId);
        if (!$course) {
            return response()->json(['error' => 'Course not found'], 404);
        }

        $date = $request->get('date')
            ? Carbon::parse($request->get('date'))->setTimezone('Asia/Kuala_Lumpur')
            : Carbon::now()->setTimezone('Asia/Kuala_Lumpur');

        $attendances = Attendance::where('course_id', $courseId)
            ->whereDate('check_in_time', $date)
            ->with('student')
            ->get()
            ->mapWithKeys(function ($attendance) use ($course) {
                $checkInTime = Carbon::parse($attendance->check_in_time);
                $courseStartTime = Carbon::parse($course->course_start_time);
                $minutesDiff = $checkInTime->diffInMinutes($courseStartTime, false);

                $status = ($minutesDiff <= 15 && $minutesDiff >= -10) ? 'present' : 'late';

                return [$attendance->student_id => [
                    'status' => $status,
                    'check_in_time' => $checkInTime->format('Y-m-d H:i:s'),
                    'student_name' => $attendance->student->name,
                    'student_id' => $attendance->student->student_id
                ]];
            });



        return response()->json($attendances);
    }

    public function markManualAttendance(Request $request, $courseId)
    {
        try {
            $validated = $request->validate([
                'studentId' => 'required|integer',
                'timestamp' => 'required|date', 
            ]);

            // Set timezone to Malaysia
            Carbon::setLocale('en');
            date_default_timezone_set('Asia/Kuala_Lumpur');

            $course = Course::findOrFail($courseId);

            // Check if student is enrolled
            $isEnrolled = $course->students()
                ->where('student_course.student_id', $validated['studentId'])
                ->exists();

            if (!$isEnrolled) {
                return response()->json([
                    'success' => false,
                    'message' => 'Student is not enrolled in this course'
                ], 400);
            }

            // Check for existing attendance
            $existingAttendance = Attendance::where([
                'student_id' => $validated['studentId'],
                'course_id' => $courseId,
            ])->whereDate('check_in_time', Carbon::today())->first();

            if ($existingAttendance) {
                return response()->json([
                    'success' => false,
                    'message' => 'Attendance already marked for today'
                ], 400);
            }

            $currentDate = Carbon::today()->toDateString();
            $courseStartTimeString = $currentDate . ' ' . $course->course_start_time;
            $courseStartTime = Carbon::parse($courseStartTimeString);

            $checkInTime = Carbon::parse($validated['timestamp'])->setTimezone('Asia/Kuala_Lumpur');

            $minutesDiff = $checkInTime->diffInMinutes($courseStartTime, false);
            $status = $minutesDiff <= 15 && $minutesDiff >= -10 ? 'present' : 'late';

            $attendance = new Attendance([
                'student_id' => $validated['studentId'],
                'course_id' => $courseId,
                'check_in_time' => $checkInTime,
                'status' => $status,
                // 'is_manual' => true  // Add this field to your attendance table
            ]);

            $attendance->save();

            return response()->json([
                'success' => true,
                'message' => 'Attendance marked successfully',
                'status' => $status,
                'check_in_time' => $checkInTime->format('Y-m-d H:i:s')
            ]);
        } catch (\Exception $e) {
            Log::error('Manual attendance marking error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark attendance: ' . $e->getMessage()
            ], 500);
        }
    }

    public function cancelAttendance($courseId, $studentId)
    {
        try {
            // Set timezone Malaysia
            date_default_timezone_set('Asia/Kuala_Lumpur');

            Log::info('Start canceling attendance', [
                'courseId' => $courseId,
                'studentId' => $studentId,
                'current_time' => Carbon::now()->toDateTimeString(),
                'today_date' => Carbon::today()->toDateString()
            ]);

            $attendance = Attendance::where([
                'student_id' => $studentId,
                'course_id' => $courseId,
            ])->whereDate('check_in_time', Carbon::today())->first();

            if (!$attendance) {
                Log::warning('No attendance found', [
                    'student_id' => $studentId,
                    'course_id' => $courseId,
                    'date' => Carbon::today()->toDateString()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'No attendance record found for today'
                ], 404);
            }

            Log::info('Found attendance to delete', ['attendance' => $attendance]);

            $attendance->delete();

            return response()->json([
                'success' => true,
                'message' => 'Attendance record cancelled successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Detailed error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getDailyAttendance(Request $request, $userId)
    {
        try {
            $date = $request->get('date')
                ? Carbon::parse($request->get('date'))->setTimezone('Asia/Kuala_Lumpur')
                : Carbon::now()->setTimezone('Asia/Kuala_Lumpur');

            $student = Student::where('user_id', $userId)->firstOrFail();
            $dayOfWeek = $date->format('l'); // Gets day name (Monday, Tuesday, etc.)

            $enrolledCourses = $student->courses()
                ->where('weekday', $dayOfWeek)
                ->get();

            $attendanceRecords = [];
            foreach ($enrolledCourses as $course) {
                $attendance = Attendance::where([
                    'student_id' => $student->id,
                    'course_id' => $course->id,
                ])->whereDate('check_in_time', $date)->first();

                $attendanceRecords[] = [
                    'course_id' => $course->id,
                    'course_code' => $course->course_id,
                    'course_name' => $course->course_name,
                    'weekday' => $course->weekday,
                    'status' => $attendance ? $attendance->status : 'absent',
                    'check_in_time' => $attendance ? $attendance->check_in_time : null,
                ];
            }

            return response()->json($attendanceRecords);
        } catch (\Exception $e) {
            Log::error('Error fetching daily attendance: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch attendance records'
            ], 500);
        }
    }

    public function getAttendanceStats(Request $request, $userId)
    {
        try {
            $student = Student::where('user_id', $userId)->firstOrFail();
            $startMonth = $request->get('startMonth', Carbon::now()->month);
            $endMonth = $request->get('endMonth', $startMonth);

            $startDate = Carbon::now()->setMonth($startMonth)->startOfMonth();
            $endDate = Carbon::now()->setMonth($endMonth)->endOfMonth();

            $enrolledCourses = $student->courses;
            $totalClasses = 0;
            $attendanceStats = [
                'present' => 0,
                'late' => 0,
                'absent' => 0,
                'courseStats' => []
            ];

            foreach ($enrolledCourses as $course) {
                $courseAttendance = Attendance::where([
                    'student_id' => $student->id,
                    'course_id' => $course->id,
                ])
                    ->whereBetween('check_in_time', [$startDate, $endDate])
                    ->get();

                $courseDays = Attendance::where([
                    'course_id' => $course->id,
                ])
                    ->whereBetween('check_in_time', [$startDate, $endDate])
                    ->distinct('check_in_time')
                    ->count();

                $courseStats = [
                    'course_code' => $course->course_id,
                    'course_name' => $course->course_name,
                    'total_classes' => $courseDays,
                    'present' => $courseAttendance->where('status', 'present')->count(),
                    'late' => $courseAttendance->where('status', 'late')->count(),
                    'absent' => $courseDays - $courseAttendance->count(),
                    'attendance_rate' => $courseDays > 0
                        ? round(($courseAttendance->whereIn('status', ['present', 'late'])->count() / $courseDays) * 100, 2)
                        : 0
                ];

                $attendanceStats['present'] += $courseStats['present'];
                $attendanceStats['late'] += $courseStats['late'];
                $attendanceStats['absent'] += $courseStats['absent'];
                $attendanceStats['courseStats'][] = $courseStats;
                $totalClasses += $courseDays;
            }

            $attendanceStats['total_classes'] = $totalClasses;
            $attendanceStats['overall_attendance_rate'] = $totalClasses > 0
                ? round((($attendanceStats['present'] + $attendanceStats['late']) / $totalClasses) * 100, 2)
                : 0;
            $attendanceStats['period'] = [
                'start' => $startDate->toDateString(),
                'end' => $endDate->toDateString()
            ];

            return response()->json($attendanceStats);
        } catch (\Exception $e) {
            Log::error('Error fetching attendance statistics: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch attendance statistics'
            ], 500);
        }
    }

    public function getStudentAttendanceStats(Request $request, $courseId)
    {
        try {
            $startMonth = $request->get('startMonth', Carbon::now()->month);
            $endMonth = $request->get('endMonth', $startMonth);

            $startDate = Carbon::now()->setMonth($startMonth)->startOfMonth();
            $endDate = Carbon::now()->setMonth($endMonth)->endOfMonth();

            $course = Course::findOrFail($courseId);
            $students = $course->students;

            $totalClassDays = Attendance::where('course_id', $courseId)
                ->whereBetween('check_in_time', [$startDate, $endDate])
                ->distinct('check_in_time')
                ->count();

            $studentStats = [];
            $totalPresent = 0;
            $totalLate = 0;
            $totalAbsent = 0;

            foreach ($students as $student) {
                $attendance = Attendance::where([
                    'student_id' => $student->id,
                    'course_id' => $courseId,
                ])
                    ->whereBetween('check_in_time', [$startDate, $endDate])
                    ->get();

                $present = $attendance->where('status', 'present')->count();
                $late = $attendance->where('status', 'late')->count();
                $absent = $totalClassDays - $present - $late;

                $studentStats[] = [
                    'student_id' => $student->student_id,
                    'name' => $student->name,
                    'total_classes' => $totalClassDays,
                    'present' => $present,
                    'late' => $late,
                    'absent' => $absent,
                    'attendance_rate' => $totalClassDays > 0
                        ? round((($present + $late) / $totalClassDays) * 100, 2)
                        : 0
                ];

                $totalPresent += $present;
                $totalLate += $late;
                $totalAbsent += $absent;
            }

            $totalStudents = count($students);
            $totalPossibleAttendances = $totalClassDays * $totalStudents;

            $stats = [
                'total_classes' => $totalClassDays,
                'overall_attendance_rate' => $totalPossibleAttendances > 0
                    ? round((($totalPresent + $totalLate) / $totalPossibleAttendances) * 100, 2)
                    : 0,
                'period' => [
                    'start' => $startDate->toDateString(),
                    'end' => $endDate->toDateString()
                ],
                'studentStats' => $studentStats
            ];

            return response()->json($stats);
        } catch (\Exception $e) {
            Log::error('Error fetching course attendance statistics: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch course attendance statistics'
            ], 500);
        }
    }
}
