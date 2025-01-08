<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\Student;
use Illuminate\Support\Facades\Log;

class ProfileController extends Controller
{
    /**
     * Update user profile information
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function updateProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . Auth::id(),
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        try {
            $user = User::findOrFail(Auth::id());
            
            // Use update method instead of save
            $updated = $user->update([
                'name' => $request->name,
                'email' => $request->email
            ]);

            if (!$updated) {
                return response()->json(['message' => 'Failed to update profile'], 500);
            }

            return response()->json([
                'message' => 'Profile updated successfully',
                'user' => $user->fresh()
            ]);
        } catch (\Exception $e) {
            Log::error('Profile update error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to update profile'], 500);
        }
    }

    /**
     * Update user password
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function updatePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'new_password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $user = User::findOrFail(Auth::id());

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        try {
            $updated = $user->update([
                'password' => Hash::make($request->new_password)
            ]);

            if (!$updated) {
                return response()->json(['message' => 'Failed to update password'], 500);
            }

            return response()->json(['message' => 'Password updated successfully']);
        } catch (\Exception $e) {
            Log::error('Password update error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to update password'], 500);
        }
    }

    /**
     * Get student data
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function getStudentData($id)
    {
        try {
            $student = Student::where('user_id', $id)->first();
            
            if (!$student) {
                return response()->json(['message' => 'Student not found'], 404);
            }

            return response()->json($student);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch student data'], 500);
        }
    }
}