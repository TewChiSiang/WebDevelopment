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
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);
    
        if (Auth::attempt($request->only('email', 'password'))) {
            // Check the user's role after login
            $roleName = Auth::user()->role->name;
    
            if ($roleName === 'admin') {
                // Directly go to Voyager admin dashboard for admin role
                return redirect('/admin');
            } elseif ($roleName === 'student') {
                return redirect()->route('student');
            } else {
                return redirect()->route('lecture');
            }
        }
    
        return response()->json([
            'errors' => [
                'email' => ['Invalid credentials.'],
            ]
        ], 422);
    }
    
}