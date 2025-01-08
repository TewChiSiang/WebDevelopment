<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Student;
use Illuminate\Foundation\Auth\RegistersUsers;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use TCG\Voyager\Models\Role;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RegisterController extends Controller
{
    public function register(Request $request)
    {
        $this->validator($request->all())->validate();

        try {
            DB::beginTransaction();

            // Create user and related records
            $user = $this->create($request->all());

            // Login the new user
            auth()->login($user);

            DB::commit();

            Log::info("User registered successfully with ID: " . $user->id);
            return redirect('/');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Registration failed: " . $e->getMessage());
            return back()->withErrors(['error' => 'Registration failed. Please try again.']);
        }
    }

    protected function validator(array $data)
    {
        return Validator::make($data, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'student_id' => ['required', 'string', 'max:255', 'unique:students'],
        ]);
    }

    protected function create(array $data)
    {
        DB::beginTransaction();
        try {
            // Create the user
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);

            // Set default role as student
            $studentRole = Role::where('name', 'student')->first();
            if ($studentRole) {
                $user->role_id = $studentRole->id;
                $user->save();
            }

            // Create associated student record using user-provided student_id
            $student = Student::create([
                'student_id' => $data['student_id'],
                'name' => $data['name'],
                'user_id' => $user->id,
            ]);

            Log::info("Created user and student records", [
                'user_id' => $user->id,
                'student_id' => $student->student_id
            ]);

            DB::commit();
            return $user;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to create user and student records: " . $e->getMessage());
            throw $e;
        }
    }
}
