<?php
namespace App\Http\Controllers;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CheckStatusController extends Controller
{
    public function checkStatus()
    {
        // Check if the user is logged in
        if (Auth::check()) {
            // Get user role name
            $roleName = Auth::user()->role->name; // Assuming you have a 'role' relationship

            // Redirect based on role name
            switch ($roleName) {
                case 'student':
                    return redirect()->route('student');
                case 'lecture':
                    return redirect()->route('lecture');
                default:
                    abort(403, 'Unauthorized action.');
            }
        }
        
        return Inertia::render('Home');
    }
}
