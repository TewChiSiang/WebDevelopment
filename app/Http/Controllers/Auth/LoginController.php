<?php
namespace App\Http\Controllers\Auth;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use TCG\Voyager\Models\Role;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function redirectTo(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);
            
            $user = \App\Models\User::where('email', $request->email)->first();
            
            if (!$user) {
                return back()->withErrors([
                    'email' => 'No account found with this email address.'
                ]);
            }

            // Then attempt authentication
            if (Auth::attempt($request->only('email', 'password'))) {
                $roleName = Auth::user()->role->name;

                if ($roleName === 'admin') {
                    return redirect('/admin');
                } elseif ($roleName === 'student') {
                    return redirect()->route('student');
                } else {
                    return redirect()->route('lecture');
                }
            }

            return back()->withErrors([
                'password' => 'Incorrect password. Please try again.'
            ]);

        } catch (\Exception $e) {
            return back()->withErrors([
                'email' => 'An error occurred. Please try again later.'
            ]);
        }
    }
}